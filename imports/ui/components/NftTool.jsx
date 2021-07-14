import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import Nft from './Nft.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '../../../both/utils/coins.js';
import ReactJson from 'react-json-view' 
import { Row, Col, Card, Alert, UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';

import _ from 'lodash';

const T = i18n.createComponent();

// MultiSend = (props) => {
//     return <div>
//         <p><T>activities.single</T> <MsgType type={props.msg.type} /> <T>activities.happened</T></p>
//         <p><T>activities.senders</T>
//             <ul>
//                 {props.msg.inputs.map((data,i) =>{
//                     return <li key={i}><Nft address={data.address}/> <T>activities.sent</T> {data.coins.map((coin, j) =>{
//                         return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString(6)}</span>
//                     })}
//                     </li>
//                 })}
//             </ul>
//             <T>activities.receivers</T>
//             <ul>
//                 {props.msg.outputs.map((data,i) =>{
//                     return <li key={i}><Nft address={data.address}/> <T>activities.received</T> {data.coins.map((coin,j) =>{
//                         return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString(6)}</span>
//                     })}</li>
//                 })}
//             </ul>
//         </p>
//     </div>
// }

export default class NftTool extends Component {
    constructor(props){
        super(props);
    }
    
    render(){
        return<div style={{display:'flex', flexWrap:'wrap', marginBottom:'46px'}}>  
                <div style={{width:'100%', height:'1px', position:'relative', paddingBottom:'78%'}}>   
                    <img src={this.props.msg.NFT_URL == '' ? '/img/buy_icon.png' : this.props.msg.NFT_URL} style={{left:'0', width:'100%', height:'100%', position:'absolute', objectFit:'cover'}}/>  
                </div>
                <div style={{justifyContent:"center", alignSelf: 'center', width:'100%', border:'1px', borderStyle:'solid', padding:'0 21px 21px 21px', borderColor:'#E5E5E5', borderTop:0, borderBottomLeftRadius:10, borderBottomRightRadius:10}}>   
                    <span className="address overflow-auto d-inline-block" style={{paddingLeft:5, paddingRight:10, paddingTop:10, fontWeight:800, fontSize:"30px"}}>{ this.props.msg.Name } </span>
                    <br/> 
                    <span className="address overflow-auto d-inline-block" style={{color: '#FF00E5', textDecoration:'none', paddingLeft:5, paddingRight:10, height: '48px', wordBreak:'break-all'}}>{ this.props.msg.Description } </span>
                    <br/>
                    <span className="address overflow-auto d-inline-block" style={{paddingLeft:5, paddingRight:10, fontStyle:'italic', fontSize:'12px'}}>{ this.props.msg.Price == null ? 'No Price': this.props.msg.Price + ' ' + this.props.msg.Currency } </span> 

                </div>   
        </div>
        
    }
}
