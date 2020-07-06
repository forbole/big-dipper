import { Link } from 'react-router-dom';
import { MsgType } from './MsgType.jsx';
import React, { Component } from 'react';


export default class Msg extends Component {
    constructor( props ) {
        super( props );
    }

    render() {
        const msg = JSON.parse( decodeURIComponent( this.props.msgJson ) );

        return <span className="address overflow-auto d-inline" >
            <Link to={`/msg/${this.props.msgJson}`}><MsgType type={msg.type} /></Link>
        </span>
    }
}
