import React, { Component } from 'react';
import { Table, Spinner, Row, Col, Alert} from 'reactstrap'; 
import { Link } from 'react-router-dom'; 
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n'; 
import { Meteor } from 'meteor/meteor';   
import PopupModal from '../popup/popup'; 
const T = i18n.createComponent();
  
export default class EaselBuy extends Component{
    constructor(props){
        super(props); 
        this.toggle = this.toggle.bind(this);
        this.state = {
            name: '',
            description: '',
            price: '',
            img: '',
            isPurchaseOpen: '',
        } 
    }

    toggle() {
        this.setState({
            isPurchaseOpen: !this.state.isPurchaseOpen
        }, ()=>{
            // console.log(this.state.isOpen);
        });
    }

    shouldLogin = () => {
        
    }

    handleLoginConfirmed = (success) => {
        if(success == true){
            window.location = 'https://play.google.com/store/apps/details?id=tech.pylons.wallet&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1';
        }     
    }

    goPurchaseAlert = () => {
       this.setState({isPurchaseOpen: true})
       console.log('test here')
       
        
       // href='https://play.google.com/store/apps/details?id=tech.pylons.wallet&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
    }
    
    componentDidUpdate(prevState){  
        if (this.props.name && this.props.name != prevState.name){ 
            this.setState({
                name: this.props.name,
                description: this.props.description,
                price: this.props.price,
                img: this.props.img,
            }); 

            DocHead.setTitle("Big-Dipper");
            var metaInfo = {name: "description", content: "Wallet deep link"};
            DocHead.addMeta(metaInfo);
            metaInfo = {property: "og:type", content: "article"};
            DocHead.addMeta(metaInfo);
            metaInfo = {property: "og:title", content: "Deep LInk"};
            DocHead.addMeta(metaInfo);
            metaInfo = {property: "og:description", content: "Wallet deep link"};
            DocHead.addMeta(metaInfo);
            metaInfo = {property: "og:url", content: this.props.url};
            DocHead.addMeta(metaInfo);
            metaInfo = {property: "og:site_name", content: "Deep Link"};
            DocHead.addMeta(metaInfo);
            metaInfo = {property: "og:image", content: this.props.img};
            DocHead.addMeta(metaInfo);
            metaInfo = {property: "og:image:width", content: 600};
            DocHead.addMeta(metaInfo);
            metaInfo = {property: "og:image:height", content: 330};
            DocHead.addMeta(metaInfo);
        }
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            return (
                <div id="home">
                <Col style={{marginTop: 'auto'}}>
                    <Col>
                        <Row style={{margin: 'auto', justifyContent:"center"}}>
                            <img alt='Easel on Google Play' src={this.state.img == '' ? '/img/buy_icon.png' : this.state.img} style={{width:"auto", height:"auto", maxWidth:"100%", maxHeight:"25%", minWidth:"80%"}}/>  
                        </Row>
                        <Col style={{alignSelf: 'center',  marginTop: '20px', width: '100%'}}>
                            <Row style={{justifyContent:"center"}}>
                                <a style={{fontSize: '1.5em'}}><b>{this.state.name}</b></a>
                            </Row> 
                            <Row style={{justifyContent:"center"}}>
                                <a style={{wordBreak: 'break-all'}}>{this.state.description}</a>
                            </Row> 
                            <Row style={{justifyContent:"center"}}>
                                <p style={{marginTop: '7px', fontWeight: '500'}}>{this.state.price}</p>
                            </Row>
                            
                        </Col> 
                    </Col> 
                    <Row style={{marginTop: '10px'}}> 
                    <PopupModal isOpen={this.state.isPurchaseOpen} toggle={this.toggle} handleLoginConfirmed={this.handleLoginConfirmed}/>
                     
                    <a className="btn btn-primary" onClick = {this.goPurchaseAlert} style={{margin: 'auto', width: '120px'}}><i className="fas"></i>{'    BUY    '}</a>
                    </Row> 
                    <Row style={{margin: 'auto', marginTop: '25px'}}>
                        <Row style={{margin: 'auto', alignSelf: 'center', marginRight: '20px'}}>
                            <img alt='Easel on Google Play' src='/img/easel.png'style={{width:'60px', height: '70px'}}/> 
                        </Row> 
                        <Row style={{margin: 'auto', alignSelf: 'center', marginLeft: '15px'}}>
                            <img alt='Easel on Google Play' src='/img/wallet.png'style={{width:'60px', height: '70px'}}/> 
                        </Row>
                    </Row>
                </Col>
                </div>
            )
        }
    }
}