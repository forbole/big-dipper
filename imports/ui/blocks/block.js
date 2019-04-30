import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Avatar from '../components/Avatar.jsx';

export default class Block extends Component {
    constructor(props){
        super(props);
    }

    render() {
        let proposer = this.props.block.proposer();
        if (proposer){
            let moniker = (proposer.description&&proposer.description.moniker)?proposer.description.moniker:proposer.address;
            let identity = (proposer.description&&proposer.description.identity)?proposer.description.identity:"";
            return <Row className="block-info">
                    <Col xs={8} sm={4} lg={3}><i className="far fa-clock d-sm-none"></i> {moment.utc(this.props.block.time).format("D MMM YYYY, h:mm:ssa")}</Col>
                    <Col xs={4} sm={2} className="text-truncate"><i className="fas fa-hashtag d-sm-none"></i> { this.props.block.hash}</Col>
                    <Col xs={8}sm={3} md={2} lg={3} className="text-truncate"><Link to={"/validator/"+this.props.block.proposerAddress}><Avatar moniker={moniker} identity={identity} address={this.props.block.proposerAddress} list={true} /> {moniker}</Link></Col>
                    <Col xs={4} sm={1} md={2}><i className="fas fa-sync d-sm-none"></i> {numbro(this.props.block.transNum).format('0,0')}</Col>
                    <Col xs={{size:4, offset:8}} sm={{size:2, offset:0}}><i className="fas fa-database d-sm-none"></i> <Link to={"/blocks/"+this.props.block.height}>{numbro(this.props.block.height).format('0,0')}</Link></Col>
                </Row>    
        }
        else{
            return <div className="blockrow"></div>
        }
    }
}