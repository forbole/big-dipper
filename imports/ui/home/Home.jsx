  
import React, { Component } from 'react';
import {Row, Col } from 'reactstrap';
import ChainStatus from './ChainStatusContainer.js';
import ChainInfo from '../components/ChainInfo.jsx'
import Consensus from './ConsensusContainer.js';
import TopValidators from './TopValidatorsContainer.js';
import Chart from './ChartContainer.js';
import { Helmet } from "react-helmet";
import BlocksTable from '/imports/ui/blocks/BlocksTable.jsx'
import Transactions from '/imports/ui/transactions/TransactionsList.jsx'

import queryString from 'querystring';

export default class Home extends Component{
    constructor(props){
        super(props);
       
        this.state = {
            app_install: false, 
        }
        const querys = queryString.parse(props.location.search);
    }

    componentDidMount(prevState){
        const querys = queryString.parse(this.props.location.search); 
        if(querys['?action'] == "purchase_nft" && querys['recipe_id'] != null && querys['nft_amount'] == 1){
            this.setState({app_install: true}); 
            console.log('querys = ', querys);
        } 
        else{
            this.setState({app_install: false}); 
        }
    } 
 

    render() {
        if(this.state.app_install){
            return <div id="home">
                <Col style={{marginTop: '200px'}}>
                    <Row>
                        <a href='https://play.google.com/store/apps/details?id=tech.pylons.easel&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1' style={{margin: 'auto'}}><img alt='Easel on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png' style={{width: '200px'}}/></a>
                    </Row>
                    <Row>
                        <div style={{margin: 'auto'}}>Easel on Google Play</div>
                    </Row>
                    <Row style={{marginTop: '30px'}}> 
                        <a href='https://play.google.com/store/apps/details?id=tech.pylons.wallet&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1' style={{margin: 'auto'}}><img alt='Wallet on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png' style={{width: '200px'}}/></a>
                    </Row>
                    <Row>
                        <div style={{margin: 'auto'}}>Wallet on Google Play</div>
                    </Row>
                </Col>
            </div>
        }
        else{
            return <div id="home">
            <Helmet>
                <title>Big Dipper | Cosmos Explorer presented by Forbole</title>
                <meta name="description" content="Cosmos is a decentralized network of independent parallel blockchains, each powered by BFT consensus algorithms like Tendermint consensus." />
            </Helmet>
            <ChainInfo/>
            <Consensus />
            <ChainStatus />
            <Row>
                <Col md={6} className="mb-2">
                    <BlocksTable homepage={true} />
                </Col>
                <Col md={6} className="mb-2">
                    <Transactions homepage={true}/>
                </Col>
            </Row>
        </div>
        }
        
    }

}