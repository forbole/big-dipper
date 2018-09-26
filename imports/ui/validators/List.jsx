import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';

const ValidatorRow = (props) => {
    let moniker = (props.validator.description.moniker)?props.validator.description.moniker:props.validator.address;
    return <tr><th scope="row">{props.index+1}</th><td><Link to="#">{moniker}</Link></td><td>{props.validator.voting_power}</td><td></td><td></td></tr>
}

export default class List extends Component{
    constructor(props){
        super(props);
        this.state = {
            validators: ""
        }
    }

    componentDidUpdate(prevState){
        if (this.props.validators != prevState.validators){
            if (this.props.validators.length > 0){
                this.setState({
                    validators: this.props.validators.map((validator, i) => {
                        return <ValidatorRow key={i} index={i} validator={validator} />
                    })
                })    
            }
        }
    }

    render(){
        if (this.props.loading){
            return <div>Loading</div>
        }
        else{
            return (
                <Table striped className="validator-lsit">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Moniker</th>
                            <th>Voting Power</th>
                            <th>Uptime (last 100 blocks}</th>
                            <th>Last Seen</th>
                        </tr>
                    </thead>
                    <tbody>{this.state.validators}</tbody>
                </Table>
            )    
        }
    }
}