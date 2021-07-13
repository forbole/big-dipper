import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import Account from '../components/Account.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import ReactJson from 'react-json-view'
import _ from 'lodash';

const T = i18n.createComponent();

MultiSend = (props) => {
    return <div>
        <p><T>activities.single</T> <MsgType type={props.msg.type} /> <T>activities.happened</T></p>
        <p><T>activities.senders</T>
            <ul>
                {props.msg.inputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.sent</T> {data.coins.map((coin, j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString(6)}</span>
                    })}
                    </li>
                })}
            </ul>
            <T>activities.receivers</T>
            <ul>
                {props.msg.outputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.received</T> {data.coins.map((coin,j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString(6)}</span>
                    })}</li>
                })}
            </ul>
        </p>
    </div>
}

export default class RecentActivites extends Component {
    constructor(props){
        super(props); 
        var strName = '';
        var isSender = false;
        var imgName = '/img/ico_quest.png'
        if(props.msg['@type'] == '/pylons.MsgCreateRecipe'){
            strName = props.msg.Sender;
            isSender = true;
        }
        else if(props.msg['@type'] == '/pylons.MsgCreateCookbook'){
            isSender = true;
            strName = props.msg.Sender
            imgName = '/img/ico_artwork.png'
        }
        else if(props.msg['@type'] == '/pylons.MsgCreateAccount'){ 
            strName = props.msg.Requester
            imgName = '/img/ico_battleresult.png'
        }
        else if(props.msg['@type'] == '/pylons.MsgGetPylons'){ 
            strName = props.msg.Requester
            imgName = '/img/ico_sold.png'
        } 
        else{
            if(props.msg.Sender == null){
                strName = props.msg.Requester 
            }
            else{
                strName = props.msg.Sender
                isSender = true; 
            }
        }

        let eventName = this.props.msg.Name;
        if(eventName == null){
            eventName = props.msg['@type'];
            eventName = eventName.substr(11);
        }

        this.state = {
            strName: strName, 
            isSender: isSender,
            imgName: imgName,
            eventName: eventName,
        }
    }

    render(){
        return<div style={{display:'flex', paddingRight:'10px'}}>
        <div style={{alignSelf:'center', marginLeft:'10px', marginRight:'15px'}}>   
            <img src={this.state.imgName} style={{left:'0', width:'35px', height:'35px',}}/>  
        </div>
        <div>
            <div style={{display:'flex', marginLeft:'5px', marginRight:'15px'}}>  
                <span class="badge badge-secondary " style={{marginRight:'5px', marginBottom:'1px', alignSelf:'center', height:'20px'}}>Name</span>
                <span className="address " style={{color:'#ff564f', color:'black', wordBreak:'break-all'}}>{ this.state.eventName} </span>
            </div>
            <div style={{display:'flex', marginLeft:'5px', marginRight:'15px'}}>
                {this.state.isSender &&<span class="badge badge-success " style={{marginRight:'5px', marginBottom:'1px', alignSelf:'center', height:'20px'}}>Sender</span>}
                {!this.state.isSender &&<span class="badge badge-warning " style={{marginRight:'5px', marginBottom:'1px', alignSelf:'center', height:'20px'}}>Requester</span>}
                <span className="address " style={{color:'#ff564f', wordBreak:'break-all'}}>{ this.state.strName} </span>
            </div>
        </div>
        </div>
        
    } 
}
