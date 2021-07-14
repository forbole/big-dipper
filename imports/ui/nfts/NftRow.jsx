/* eslint-disable camelcase */

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Alert, UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import { TxIcon } from '../components/Icons.jsx';
import Activities from '../components/Activities.jsx';
import CosmosErrors from '../components/CosmosErrors.jsx';
import TimeAgo from '../components/TimeAgo.jsx';
import numbro from 'numbro';
import Coin from '../../../both/utils/coins.js';
import SentryBoundary from '../components/SentryBoundary.jsx';
import { Markdown } from 'react-showdown';
import NftTool from '../components/NftTool.jsx';  



let showdown  = require('showdown');
showdown.setFlavor('github');

export const NftRow = (props) => {
    let tx = props.tx; 
    let homepage = window?.location?.pathname === '/' ? true : false;   
    let strings = tx.Strings;
    for(let i = 0; i < strings.length; i++){
        if(strings[i].Key == 'Name'){
            tx.Name = strings[i].Value;
        }
        else if(strings[i].Key == 'NFT_URL'){
            tx.NFT_URL = strings[i].Value;
        }
        else if(strings[i].Key == 'Description'){
            tx.Description = strings[i].Value;
        }
        else if(strings[i].Key == 'Currency'){
            tx.Currency = strings[i].Value;
        }
        else if(strings[i].Key == 'Price'){
            tx.Price = strings[i].Value;
        }
    }
    
    return <SentryBoundary><NftTool msg={tx} /></SentryBoundary>
}
