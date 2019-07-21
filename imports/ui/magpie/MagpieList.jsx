import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardFooter, Spinner, Button } from 'reactstrap';

export default class MagpieList extends Component{
    constructor(props){
        super(props);
        this.state = {
            magpies: ""
        }
    }

    componentDidUpdate(prevState){
        if (this.props.magpies != prevState.magpies){
            if (this.props.magpies.length > 0){
                this.setState({
                    magpies: this.props.magpies.map((magpie, i) => {
                        return <Card key={i}><CardBody index={i} >
                                <div>{magpie.message}</div> 
                            </CardBody>
                            <CardFooter>
                                <Row>
                                    <Col><i className="material-icons">thumb_up</i> <span>{magpie.likes}</span></Col>
                                    <Col className="text-right"><i className="material-icons">reply</i></Col>
                                </Row>
                            </CardFooter>
                        </Card>
                    })
                })
            }
        }
    }

    render () {
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            return this.state.magpies
        }
    }
}