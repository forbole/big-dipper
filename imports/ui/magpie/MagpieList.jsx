import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardFooter, Spinner, Button, Input } from 'reactstrap';

Magpie = (props) => {
    return <Card><CardBody>
            <div>{props.message}</div>
            {props.expanded?<div>
                <Input name="replyMessage" onChange={props.handleInputChange}
                    placeholder="Reply..." type="textarea" value={props.replyMessage}/>
                <Button onClick={props.onReply}> Reply </Button>
            </div>:null}
        </CardBody>
        <CardFooter>
            <Row>
                <Col><Button disabled={props.isActive}  onClick={props.onLike} data-postid={props.id} color='outline'>
                    <i className="material-icons">thumb_up</i> <span>{props.likes}</span>
                </Button></Col>
                <Col className="text-right"><Button disabled={props.isActive}  onClick={() => {props.replyto(props.id)}} color='outline'>
                    <i className="material-icons">reply</i>
                </Button></Col>

            </Row>
        </CardFooter>
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
                    <Magpie message={magpie.message} likes={magpie.likes}
                        id={magpie.id} expanded={magpie.id === this.state.expandedID}
                        isActive={this.props.hasActiveSession}
                        handleInputChange={this.handleInputChange}
                        replyMessage={this.state.replyMessage}
                        onReply={this.onReply} onLike={this.onLike}
                        replyto={(id)=>this.setState({expandedID:id})}/>
                        {magpie.replies().length>0?<Row>
                            <Col sm={{size:10, offset:2}}>
                                {magpie.replies().map((magChild, j) => {
                                    return <Magpie key={j} message={magChild.message} likes={magChild.likes} id={magChild.id}/>
                                })}
                            </Col>
                        </Row>:""}
                    </div>
                })
        }
    }
}