  
import React, { Component } from 'react';
import {Row, Col } from 'reactstrap';
import ChainStatus from './ChainStatusContainer.js';
import ChainInfo from '../components/ChainInfo.jsx'
import Consensus from './ConsensusContainer.js';  
import { Helmet } from "react-helmet";
import BlocksTable from '/imports/ui/blocks/BlocksTable.jsx'
import Transactions from '/imports/ui/transactions/TransactionsList.jsx' 
import EaselBuy from '../../ui/easel_buy/EaselBuyContainer.js' 

import queryString from 'querystring';

export default class Home extends Component{
    constructor(props){
        super(props); 
        this.state = {
            recipe_id: null,
            recipeExist: false,
        }
        
    } 

    componentDidMount(){  
        const querys = queryString.parse(this.props.location.search);
        if (querys['?action'] == "purchase_nft" && querys['recipe_id'] != null && querys['nft_amount'] == 1) {
            this.state.recipe_id = querys['recipe_id'];
            this.setState({recipeExist: true});
        }
        else{
            this.setState({recipeExist: false}); 
        }
    } 

    render() { 
        
        if(this.state.recipeExist){
            return  <EaselBuy recipe_id={this.state.recipe_id} url={'http:/wallet.pylons.tech/' + this.props.location.search}></EaselBuy>
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