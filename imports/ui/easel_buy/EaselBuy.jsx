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
            })
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
                    <Row>
                        <Row style={{margin: 'auto'}}>
                            <img alt='Easel on Google Play' src={this.state.img == '' ? '/img/buy_icon.png' : this.state.img} style={{width:'100px', height:'100px'}}/>  
                        </Row>
                        <Col style={{alignSelf: 'center', margin: 'auto', marginLeft: '15px'}}>
                            <Row>
                                <a style={{fontSize: '1.5em'}}><b>{this.state.name}</b></a>
                            </Row> 
                            <Row>
                                <a><i>{this.state.description}</i></a>
                            </Row>
                            <Row>
                                <a>Everyone</a>
                            </Row>
                        </Col>
                        <Row style={{margin: 'auto'}}>
                            <a href='https://play.google.com/store/apps/details?id=tech.pylons.wallet&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1' style={{margin: 'auto', marginRight: '25px', fontSize: '1.3em'}}>{this.state.price}</a>
                        </Row>
                    </Row> 
                    <Row style={{marginTop: '30px'}}> 
                    <PopupModal isOpen={this.state.isPurchaseOpen} toggle={this.toggle} handleLoginConfirmed={this.handleLoginConfirmed}/>
                     
                    <a className="btn btn-primary" onClick = {this.goPurchaseAlert} style={{margin: 'auto', width: '100px'}}><i className="fas"></i>{'    BUY    '}</a>
                        {/* <a href='https://play.google.com/store/apps/details?id=tech.pylons.wallet&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1' style={{margin: 'auto'}}><img alt='Wallet on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png' style={{width: '200px'}}/></a> */}
                    </Row> 
                    <Row>
                        <Row style={{margin: 'auto', marginTop: '30px'}}>
                            <img alt='Easel on Google Play' src='/img/easel.png'style={{width:'100px', height:'100px'}}/>  
                        </Row>
                        <Row style={{margin: 'auto', marginTop: '30px'}}>
                            <img alt='Easel on Google Play' src='/img/wallet.png'style={{width:'100px', height:'100px'}}/> 
                        </Row>
                    </Row>
                </Col>
                </div>
            )
        }
    }
}