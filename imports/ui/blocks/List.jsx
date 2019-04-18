import React, { Component } from 'react';
// another small block render
import Block from './block.js';
import { Spinner } from 'reactstrap';
export default class Blocks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blocks: ""
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.blocks != prevProps.blocks){
            if (this.props.blocks.length > 0){
                let blocks = this.props.blocks.map((block) => (<Block key={block.height} hash={block.hash} block={block}/>));
                this.setState(
                    {blocks: blocks}
                )
            }
        }
    }

    render() {
        if (this.props.loading) {
            return (
                <tr>
                    <th><Spinner type="grow" color="primary" /></th>
                </tr>
            )
        }
        else if (this.props.blocks.length > 0) {
            return this.state.blocks;
        }
        else{
            return <tr><td>No blocks.</td></tr>
        }
    }
}