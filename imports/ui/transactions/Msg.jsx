import { Container, Card, CardBody } from 'reactstrap';
import { Helmet } from 'react-helmet';
import { MsgType } from '../components/MsgType.jsx';
import JSONPretty from 'react-json-pretty';
import React, { Component } from 'react';


export default class Msg extends Component {
    constructor( props ) {
        super( props );

        this.state = {
            msgJson: props.match.params.msgJson,
        }
    }


    componentDidUpdate( prevProps ) {
        if ( this.props.match.params.msgJson !== prevProps.match.params.msgJson ) {
            this.setState( {
                msgJson: this.props.match.params.msgJson,
            } );
        }
    }


    render() {
        const msg = JSON.parse( decodeURIComponent( this.state.msgJson ) );

        return <Container id="msg">
            <Helmet>
                <title>Message Details</title>
                <meta name="description" content={"Details of msg " + msg.type} />
            </Helmet>
            <Card>
                <div className="card-header"><h4><MsgType type={msg.type} /></h4></div>
                <CardBody>
                    <div><JSONPretty id="json-pretty" data={msg}></JSONPretty></div>
                </CardBody>
            </Card>
        </Container>
    }
}
