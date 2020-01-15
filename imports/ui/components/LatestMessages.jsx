import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Spinner } from 'reactstrap';
import Message from '../components/Message.jsx'
import SentryBoundary from '../components/SentryBoundary.jsx'

const T = i18n.createComponent();

export default class LatestMessages extends Component {
    constructor(props){
        super(props);
        this.state = {
            messages: ""
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.messages != prevProps.messages){
            if (this.props.messages && this.props.messages.length > 0){
                this.setState({
                    messages: this.props.messages.map((message, i) => <Message 
                        key={i}
                        id={message.logs[0].events[1].attributes[0].value}
                        message={message.tx.value.msg[0].value.message} 
                        creator={message.tx.value.msg[0].value.creator}
                        time={message.timestamp} 
                    />)
                });
            }
        }
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            return <Card>
                <CardHeader><T>desmos.latestMessages</T></CardHeader>
                <CardBody>
                    <SentryBoundary>
                        {(this.props.messagesExist)?<div>{this.state.messages}</div>:<T>desmos.noMessage</T>}
                    </SentryBoundary>
                </CardBody>
            </Card>
        }
    }
}
