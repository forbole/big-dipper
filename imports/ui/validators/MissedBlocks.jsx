import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Badge, Row, Col } from 'reactstrap';

export default class MissedBlocks extends Component{
    constructor(props){
        super(props);

        this.state = {
            missedBlocksList: ""
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.missedBlocks != prevProps.missedBlocks){
            if (this.props.missedBlocks.length > 0){
                this.setState({
                    missedBlocksList: this.props.missedBlocks.map((block,i) => {
                        return <tr key={i}>
                            <td>{i+1}</td>
                            <td><Link to={"/validator/"+block.proposer}>{block.proposerMoniker()}</Link></td>
                            <td>{block.count}</td>
                        </tr>
                    })
                })
            }
            
        }
    }

    render() {
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            if (this.props.validatorExist){
                return <div>
                    <Link to={"/validator/"+this.props.validator.address} className="btn btn-link"><i className="fas fa-caret-left"></i> Back to Validator</Link>
                    <h2>Missed blocks of {this.props.validator.description.moniker}</h2>
                    <Table striped>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Block Proposer</th>
                                <th>Miss Count</th>
                            </tr>
                        </thead>
                        <tbody>{this.state.missedBlocksList}</tbody>
                    </Table>
                            
                    
                </div>
            }
            else return <div>Validator doesn't exist.</div>
        }
        
    }
}