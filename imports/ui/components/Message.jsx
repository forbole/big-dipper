import React, { Component } from 'react';
import TimeAgo from './TimeAgo.jsx';
import { Markdown } from 'react-showdown';
import { UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';

const T = i18n.createComponent();

export default class Message extends Component {
    constructor(props) {
        super(props)
        let showdown = require('showdown');
        showdown.setFlavor('github');

        this.state = {
            likes: [],
            allowsComments: false,
            comments: []
        }
    }


    componentDidMount(){
        Meteor.call('messages.get', this.props.id, (err, message) => {
            this.setState({
                likes: message.likes,
                comments: message.children,
                allowsComments: message.allows_comments
            })
        });
    }

    componentDidUpdate(prevProps){
        if (this.props.id != prevProps.id){
            Meteor.call('messages.get', this.props.id, (err, message) => {
                this.setState({
                    likes: message.likes,
                    comments: message.children,
                    allowsComments: message.allows_comments
                })
            });
        }
    }

    render(){
        return <blockquote className="message blockquote border-bottom pb-1">
            <small className="mb-0 text-muted"><span className="mr-2">ID</span>{this.props.id}</small>
            <span className="mb-0"><Markdown markup={this.props.message} /></span>
            <p className="info text-muted mb-0">
                <span id={"likes-"+this.props.id} className="like-trigger"><span className="mr-1">{this.state.likes.length}</span><span className={(this.state.likes.length>0)?"text-danger":"text-muted"}><i className={"fa"+(this.state.likes.length>0?"s":"r")+" fa-heart mr-2"}></i></span></span>
                <span className="mr-1">{this.state.allowsComments?<span className="mr-1">{this.state.comments.length}</span>:""}{this.state.allowsComments?<i className="fas fa-comment"></i>:<i className="fas fa-comment-slash" title={i18n.__('desmos','commentNotAllowed')}></i>}</span>
                {(this.state.likes.length>0)?<UncontrolledPopover trigger="legacy" placement="top" target={"likes-"+this.props.id}>
                    <PopoverHeader><T>desmos.likesList</T></PopoverHeader>
                    <PopoverBody><ul className="likes-list">{this.state.likes.map((like,i) => <li key={i} className="text-nowrap text-monospace">{like.owner}</li>)}</ul></PopoverBody>
                </UncontrolledPopover>:""}
            </p>
            <TimeAgo time={this.props.time} />
            <footer className="blockquote-footer text-monospace">{this.props.creator}</footer>
        </blockquote>
    }
}