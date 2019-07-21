import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardHeader, CardFooter, Spinner, Button, Input } from 'reactstrap';
import Account from '../components/Account.jsx';
import moment from 'moment';

const displayTime = (time) => {
    return <span className='post-time'> {moment.utc(time).fromNow()}</span>;
}

Magpie = (props) => {
    if (props.layers[props.magpie.id] != props.layer) return <div></div>
    return <Card className={props.layer>0?'mt-2 mr-1':''}>
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
                {props.isActive?
                <Col className="text-right"><Button onClick={() => {props.replyto(props.row, props.magpie.id)}} color="link" size="sm">
                    <i className="material-icons">reply</i>
                </Button></Col>:null}

            </Row>
        </CardFooter>

        {props.magpie && props.magpie.replies().length>0?<Row>
            <Col sm={{size:11, offset:1}}>
                {props.magpie.replies().map((magChild, j) => {
                    return <Magpie key={j} row={props.row*10000+j} author={magChild.external_owner}  message={magChild.message} likes={magChild.likes} id={magChild.id}
                        expanded={props.row*10000+j === props.expandedID}
                        expandedID={props.expandedID}
                        isActive={props.isActive}
                        handleInputChange={props.handleInputChange}
                        replyMessage={props.replyMessage}
                        onReply={props.onReply} onLike={props.onLike}
                        time={magChild.created}
                        layers={props.layers}
                        layer={props.layer+1}
                        replyto={props.replyto} magpie={magChild}/>
                })}
            </Col>
        </Row>:""}
        {props.expanded?<div className="p-2">
                <Input name="replyMessage" onChange={props.handleInputChange}
                    placeholder="Reply..." type="textarea" value={props.replyMessage}/>
                <Button onClick={props.onReply} color='link' size='sm'> Reply </Button>
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

    updateLayers = (displayed, list, layer) =>{
        list.forEach((m) => {
            let replies = m.replies()
            if (displayed[m.id] == undefined || displayed[m.id] < layer){
                displayed[m.id] = layer
            }
            if (replies.length>0) {
                displayed = {...displayed, ...this.updateLayers(displayed, replies, layer+1)}
            }

        })
        return displayed
    }
    /*componentDidUpdate(prevState){

    }*/

    render () {
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            let displayed = {};
            displayed = this.updateLayers(displayed, this.props.magpies, 0)
            console.log(JSON.stringify(displayed))
            return this.props.magpies.map((magpie, i) => {
                return <div key={i}>
                    <Magpie row={i} author={magpie.external_owner} message={magpie.message} likes={magpie.likes}
                        id={magpie.id} expanded={i === this.state.expandedID}
                        isActive={this.props.hasActiveSession}
                        handleInputChange={this.handleInputChange}
                        replyMessage={this.state.replyMessage}
                        onReply={this.onReply} onLike={this.onLike}
                        time={magpie.created}
                        expandedID={this.state.expandedID}
                        layers={displayed}
                        layer={0}
                        replyto={(row, id)=>this.setState({expandedID: row, parentID:id})} magpie={magpie}/>
                    </div>
                })
        }
    }
}