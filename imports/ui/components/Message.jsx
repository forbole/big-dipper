import React, { Component } from 'react';
import TimeAgo from './TimeAgo.jsx';
import { Markdown } from 'react-showdown';
import { UncontrolledPopover, PopoverHeader, PopoverBody, Row, Col } from 'reactstrap';

const T = i18n.createComponent();

export default class Message extends Component {
    constructor(props) {
        super(props)
        let showdown = require('showdown');
        showdown.setFlavor('github');

        this.state = {
            likes: [],
            allowsComments: false,
            commentIDs: [],
            comments: []
        }
    }


    componentDidMount(){
        Meteor.call('messages.get', this.props.id, (err, message) => {
            this.setState({
                likes: message.likes,
                commentIDs: message.children,
                allowsComments: message.allows_comments
            });
            if (message.children.length > 0){
                let allComments = []
                message.children.map((commentID, i) => {
                    Meteor.call('messages.get', commentID, (err, msg) => {
                        if (err){
                            // console.log(err)
                        }
                        allComments[i] = msg;
                        // console.log(allComments);
                        if (allComments.length == message.children.length){
                            this.setState({
                                comments: allComments
                            })
                        }
                    })    
                })
            }
        });
    }

    componentDidUpdate(prevProps){
        if (this.props.id != prevProps.id){
            Meteor.call('messages.get', this.props.id, (err, message) => {
                this.setState({
                    likes: message.likes,
                    commentIDs: message.children,
                    allowsComments: message.allows_comments
                });
                if (message.children.length > 0){
                    let allComments = []
                    message.children.map((commentID, i) => {
                        Meteor.call('messages.get', commentID, (err, msg) => {
                            if (err){
                                // console.log(err)
                            }
                            allComments[i] = msg;
                            // console.log(allComments);
                            if (allComments.length == message.children.length){
                                this.setState({
                                    comments: allComments
                                })
                            }
                        })    
                    })
                }
            });
        }
    }

    render(){
        return <blockquote className="message blockquote border-bottom pb-1">
            <small className="mb-0 text-muted"><span className="mr-2">ID</span>{this.props.id}</small>
            <span className="mb-0"><Markdown markup={this.props.message} /></span>
            <p className="info text-muted mb-0">
                <span id={"likes-"+this.props.id} className="like-trigger"><span className="mr-1">{this.state.likes.length}</span><span className={(this.state.likes.length>0)?"text-danger":"text-muted"}><i className={"fa"+(this.state.likes.length>0?"s":"r")+" fa-heart mr-2"}></i></span></span>
                <span className="mr-1">{this.state.allowsComments?<span className="mr-1">{this.state.commentIDs.length}</span>:""}{this.state.allowsComments?<i className="fas fa-comment"></i>:<i className="fas fa-comment-slash" title={i18n.__('desmos','commentNotAllowed')}></i>}</span>
                {(this.state.likes.length>0)?<UncontrolledPopover trigger="legacy" placement="top" target={"likes-"+this.props.id}>
                    <PopoverHeader><T>desmos.likesList</T></PopoverHeader>
                    <PopoverBody><ul className="likes-list">{this.state.likes.map((like,i) => <li key={i} className="text-nowrap text-monospace">{like.owner}</li>)}</ul></PopoverBody>
                </UncontrolledPopover>:""}
            </p>
            <TimeAgo time={this.props.time} />
            <footer className="blockquote-footer text-monospace">{this.props.creator}</footer>
            {(this.state.comments.length > 0)?<Row>
                <Col sm="12" className="ml-3">
                    <h6 className="mt-2"><T>desmos.comments</T></h6>
                    {this.state.comments.map((comment, j) => <Message 
                        key={j}
                        id={comment.id}
                        message={comment.message} 
                        creator={comment.owner}
                    />)}
                </Col>
            </Row>:""}
        </blockquote>
    }
}