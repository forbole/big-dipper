import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardFooter, Spinner, Button } from 'reactstrap';

Magpie = (props) => {
    return <Card><CardBody>
            <div>{props.message}</div> 
        </CardBody>
        <CardFooter>
            <Row>
                <Col><i className="material-icons">thumb_up</i> <span>{props.likes}</span></Col>
                <Col className="text-right"><i className="material-icons">reply</i></Col>
            </Row>
        </CardFooter>
        </Card>
}
export default class MagpieList extends Component{
    constructor(props){
        super(props);
        this.state = {
            magpies: {}
        }
    }

    componentDidUpdate(prevState){
        if (this.props.magpies != prevState.magpies){
            if (this.props.magpies.length > 0){
                this.setState({magpies: this.props.magpies})
            }
        }
    }

    render () {
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            return this.props.magpies.map((magpie, i) => {
                return <div key={i}>
                    <Magpie message={magpie.message} likes={magpie.likes} id={magpie.id} />
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