import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
// another small block render
import Block from './block.js';
// import { Button } from 'reactstrap';

import { Blockscon } from '/imports/api/blocks/connections.js';
import { withTracker } from 'meteor/react-meteor-data';
// import { Server } from 'https';

class Blocks extends Component {
    constructor(props) {
        super(props);
    }

    updateBlock = () => {
        Meteor.call('blocksUpdate', (error, result) => {
            console.log(result);
        })
    }

    render() {
        if (this.props.loading) {
            return (
                <tr>
                    <th>Loading...</th>
                </tr>
            )
        }
        else if (this.props.blocks.length > 0) {
            return this.props.blocks.map((block) => (
                <Block key={block.height} hash={block.hash} block={block}/>
            ));
        }
        else{
            return <tr><td>No blocks.</td></tr>
        }
        // } else {
        //     return(
        //         // <Button className="btn btn-primary" onClick={this.updateBlock}>Click me</Button>
        //     );
        // }
    }
}


export default BlocksContainer = withTracker((curr) => {
    const heightHandle = Meteor.subscribe('blocks.height');
    const loading = !heightHandle.ready();
    // console.log(loading)
    // console.log(curr.limit)
    // console.log(Blocks.getLimit)
    // const blocks = Blockscon.find({}).fetch();
    const blocks = Blockscon.find({}, {sort: {height:-1}, limit: curr.limit}).fetch();
    const blocksExist = !loading && !!blocks;
    // console.log(props.state.limit);
    return {
        loading,
        blocksExist,
        blocks: blocksExist ? blocks : {}
        // blocks: Blockscon.find({}, {sort: {height:-1}, limit: 10}).fetch(),
    };
})(Blocks);
