import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardFooter, Spinner, Button, Input } from 'reactstrap';
import Account from '../components/Account.jsx';
import moment from 'moment';

const displayTime = (time) => {
    return <span className='post-time'> {moment.utc(time).format("D MMM YYYY, h:mm:ssa")}</span>;
}

Magpie = (props) => {
    return <Card><CardBody>
            <div>
                <Account address={props.author} />{displayTime(props.time)}
            </div>
            <div>{props.message}</div>

        </CardBody>
        <CardFooter>
            <Row>
                <Col><Button disabled={!props.isActive}  onClick={props.onLike} data-postid={props.id} color='outline'>
                    <i className="material-icons">thumb_up</i> <span>{props.likes}</span>
                </Button></Col>
                <Col className="text-right"><Button disabled={!props.isActive}  onClick={() => {props.replyto(props.row)}} color='outline'>
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
            replyMessage: "",
            parentID: ""
        }
    }
    onLike = (e) => {
        let target = e.currentTarget;
        let dataset = target.dataset;
        let id = dataset.postid;
        this.props.onLike(id)
    }
    onReply = () => {
        this.props.onReply(this.state.replyMessage, this.state.parentID)
        this.setState({
            expandedID: "", replyMessage: "", parentID: ""
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
                    <Magpie row={i} author={magpie.external_owner} message={magpie.message} likes={magpie.likes}
                        id={magpie.id} expanded={i === this.state.expandedID}
                        isActive={this.props.hasActiveSession}
                        handleInputChange={this.handleInputChange}
                        replyMessage={this.state.replyMessage}
                        onReply={this.onReply} onLike={this.onLike}
                        time={magpie.created}
                        replyto={(row)=>this.setState({expandedID: row, parentID:magpie.id})}/>
                        {magpie.replies().length>0?<Row>
                            <Col sm={{size:10, offset:2}}>
                                {magpie.replies().map((magChild, j) => {
                                    return <Magpie key={j} row={10000+j} author={magpie.external_owner}  message={magChild.message} likes={magChild.likes} id={magChild.id}
                                        expanded={10000+j === this.state.expandedID}
                                        isActive={this.props.hasActiveSession}
                                        handleInputChange={this.handleInputChange}
                                        replyMessage={this.state.replyMessage}
                                        onReply={this.onReply} onLike={this.onLike}
                                        time={magpie.created}
                                        replyto={(row)=>this.setState({expandedID:row, parentID:magpie.id})}/>
                                })}
                            </Col>
                        </Row>:""}
                    </div>
                })
        }
    }
}