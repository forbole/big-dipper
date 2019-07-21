import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardHeader, CardFooter, Spinner, Button, Input } from 'reactstrap';
import Account from '../components/Account.jsx';
import moment from 'moment';

const displayTime = (time) => {
    return <span className='post-time'> {moment.utc(time).fromNow()}</span>;
}

Magpie = (props) => {
    return <Card>
            <CardHeader>
                <Row>
                    <Col sm={6}><Account address={props.author} /></Col>
                    <Col sm={6} className="text-right">{displayTime(props.time)}</Col>
                </Row>
                </CardHeader>
        <CardBody>
            
            {props.message}

        </CardBody>
        <CardFooter>
            <Row>
                <Col><Button disabled={!props.isActive}  onClick={props.onLike} data-postid={props.id} color="link" size="sm">
                    <i className="material-icons">thumb_up</i> <span>{props.likes}</span>
                </Button></Col>
                <Col className="text-right"><Button disabled={!props.isActive}  onClick={() => {props.replyto(props.key, props.id)}} color="link" size="sm">
                    <i className="material-icons">reply</i>
                </Button></Col>

            </Row>
        </CardFooter>
        {props.expanded?<div>
                <Input name="replyMessage" onChange={props.handleInputChange}
                    placeholder="Reply..." type="textarea" value={props.replyMessage}/>
                <Button onClick={props.onReply}> Reply </Button>
            </div>:null}
        </Card>
}
export default class MagpieList extends Component{
    constructor(props){
        super(props);
        this.state = {
            magpies: {},
            expandedID: "",
            replyMessage: ""
        }
    }
    onLike = (e) => {
        let target = e.currentTarget;
        let dataset = target.dataset;
        let id = dataset.postid;
        this.props.onLike(id)
    }
    onReply = () => {
        this.props.onReply(this.state.replyMessage, this.state.expandedID)
        this.setState({
            expandedID: "", replyMessage: ""
        })
    }

    handleInputChange = (e) => {
        let target = e.currentTarget;
        this.setState({[target.name]: target.value})
    }

    /*renderReplyInput(parentID) {

    }*/

    /*componentDidUpdate(prevState){
        if (this.props.magpies != prevState.magpies){
            if (this.props.magpies.length > 0){
                this.setState({magpies: this.props.magpies})
            }
        }
    }*/

    render () {
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            return this.props.magpies.map((magpie, i) => {
                return <div key={i}>
                    <Magpie author={magpie.external_owner} message={magpie.message} likes={magpie.likes}
                        id={magpie.id} expanded={`${i}-${magpie.id}` === this.state.expandedID}
                        isActive={this.props.hasActiveSession}
                        handleInputChange={this.handleInputChange}
                        replyMessage={this.state.replyMessage}
                        onReply={this.onReply} onLike={this.onLike}
                        time={magpie.created}
                        replyto={(key, id)=>this.setState({expandedID:`${key}-${id}`})}/>
                        {magpie.replies().length>0?<Row>
                            <Col sm={{size:11, offset:1}}>
                                {magpie.replies().map((magChild, j) => {
                                    return <Magpie key={j}  author={magpie.external_owner}  message={magChild.message} likes={magChild.likes} id={magChild.id}
                                        expanded={`${j}-${magpie.id}` === this.state.expandedID}
                                        isActive={this.props.hasActiveSession}
                                        handleInputChange={this.handleInputChange}
                                        replyMessage={this.state.replyMessage}
                                        onReply={this.onReply} onLike={this.onLike}
                                        time={magpie.created}
                                        replyto={(key, id)=>this.setState({expandedID:`${key}-${id}`})}/>
                                })}
                            </Col>
                        </Row>:""}
                    </div>
                })
        }
    }
}