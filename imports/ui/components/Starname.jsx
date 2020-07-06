import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Starname extends Component{
    constructor(props){
        super(props);

        this.state = {
            starname: this.props.starname,
        }
    }

    render(){
        return <span className="address overflow-auto d-inline" >
            <Link to={`/starname/${this.props.starname}`}>{this.state.starname}</Link>
        </span>
    }
}
