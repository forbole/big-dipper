import React, { Component } from 'react';
import { Row, Col, Spinner } from 'reactstrap';
import { NftRow } from './NftRow.jsx';
import i18n from 'meteor/universe:i18n';
import { repeat } from 'lodash';

const T = i18n.createComponent();
export default class Nfts extends Component{
    constructor(props){
        super(props);
        this.state = {
            txs: "",
            homepage:  window?.location?.pathname === '/' ? true : false,
            page: -1,
            page_size: 5,
        }
    }

    componentDidUpdate(prevProps){
        if (this.props != prevProps){
            if (this.props.nfts.length > 0){ 
                this.state.page++; 
                let page_size = (this.state.page + this.state.page_size) > this.props.nfts.length ? this.props.nfts.length : (this.state.page + this.state.page_size);
                let nfts = this.props.nfts.slice(this.state.page, page_size)
                this.setState({
                    txs: nfts.map((tx, i) => {
                        return <NftRow 
                            key={i} 
                            index={i} 
                            tx={tx} 
                        />
                    })
                })    
            }
        }
    }

    onBack= () => {
        if (this.props.nfts.length > 0){ 
            this.state.page -= this.state.page_size; 
            if(this.state.page < 0){
                this.state.page = 0
            }
            let page_size = (this.state.page + this.state.page_size) > this.props.nfts.length ? this.props.nfts.length : (this.state.page + this.state.page_size);
            let nfts = this.props.nfts.slice(this.state.page, page_size)
            this.setState({
                txs: nfts.map((tx, i) => {
                    return <NftRow 
                        key={i} 
                        index={i} 
                        tx={tx} 
                    />
                })
            })    
        }
    }

    onNext= () => { 
        if (this.props.nfts.length > 0){ 
            this.state.page += this.state.page_size; 
            if(this.props.nfts.length < this.state.page){
                this.state.page -= this.state.page_size;
            }
            let page_size = (this.state.page + this.state.page_size) > this.props.nfts.length ? this.props.nfts.length : (this.state.page + this.state.page_size); 
            let nfts = this.props.nfts.slice(this.state.page, page_size) 

            this.setState({
                txs: nfts.map((tx, i) => {
                    return <NftRow 
                        key={i} 
                        index={i} 
                        tx={tx} 
                    />
                })
            })    
        }
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else if (!this.props.nftsExist){
            return <div><T>nfts.notFound</T></div>
        }
        else{
            return <div className="transactions-list">
                <Row className="header text-nowrap d-none d-lg-flex">
                    <Col xs={9} lg={this.state.homepage ? 7 : 7}><i className="material-icons">message</i> <span className="d-none d-md-inline-block"><T>nfts.purchase_nfts</T></span></Col>
                    {/* <Col xs={3} lg={!this.state.homepage ? { size: 1, order: "last" } : { size: 2, order: "last" }}><span className={this.state.homepage ? "ml-5" : null}><i className="fas fa-hashtag"></i> <span className="d-none d-md-inline-block"><T>transactions.txHash</T></span></span></Col>
                    <Col xs={4} md={2} lg={1}><i className="fas fa-database"></i> <span className="d-none d-md-inline-block"><T>common.height</T></span></Col>
                     */}

                    {/* <Col xs={3} lg={!this.state.homepage ? { size: 1, order: "last" } : { size: 2, order: "last" }}><span className={this.state.homepage ? "ml-5" : null}><i className="fas fa-hashtag"></i> <span className="d-none d-md-inline-block"><T>nfts.name</T></span></span></Col> */}
                </Row>
                <div style={{gap:'10px', display:'grid', gridTemplateColumns: window.orientation == undefined ? "repeat(5, 1fr)" : "repeat(1)"}}>
                    {this.state.txs}
                </div>
                <div style={{display:'flex', minWidth:'77vw'}}>
                     <ul class='jss123' style={{margin:'auto', borderWidth:'1px', borderStyle:'solid', borderColor:'#E5E5E5', display:'flex', padding:'0', borderRadius:'9px'}}>
                         <li>
                             <button type='button' title='first' style={{minWidth:'46px'}} onClick={this.onBack}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 14L4 9.5L9 5" stroke="#464255" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14 14L9 9.5L14 5" stroke="#B9BBBD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                             </button>
                         </li>
                         <li>
                             <button type='button' title='first' style={{minWidth:'46px'}}>
                                 {(this.state.page + this.state.page_size) / this.state.page_size}
                             </button>
                         </li>
                         <li>
                             <button type='button' title='last' style={{minWidth:'46px'}} onClick={this.onNext}>
                                 <svg style={{transform:'rotateZ(180deg)'}} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 14L4 9.5L9 5" stroke="#464255" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14 14L9 9.5L14 5" stroke="#B9BBBD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                            </button>
                         </li>
                     </ul>
                </div>
            </div>
        }
    }
}