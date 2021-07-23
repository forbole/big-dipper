import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col, Progress, Card, CardHeader, CardBody, Spinner,
    TabContent, TabPane, Nav, NavLink, NavItem, Table } from 'reactstrap';
import { Link } from 'react-router-dom'; 
import Account from '../components/Account.jsx';
import PChart from '../components/Chart.jsx';
import numbro from 'numbro';
import { Markdown } from 'react-showdown';
import { Helmet } from 'react-helmet';
import posed from 'react-pose';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import { ProposalStatusIcon } from '../components/Icons';

const T = i18n.createComponent();

const CookbookeRow = (props) => {  
    return <tr> 
        <td className="d-none d-sm-table-cell counter">{props.cookbook.ID}</td>
        {/* <td className="title">{props.cookbook.Name}</td> */}
        <td className="title">{props.recipe.Description}</td>  
        <td className="title">{props.recipe.Developer}</td> 
        <td className="title">{props.recipe.Sender}</td> 
        <td className="title">{props.recipe.SupportEmail}</td>  
    </tr>
}

const Result = posed.div({
    closed: { height: 0},
    open: { height: 'auto'}
});

function setTitleString() {
    global.Recipe = "snipshots";
}

export default class Recipe extends Component{
    constructor(props){
        super(props);  
        var copies = 0;
        var price = "No Price"
        if(this.props.recipe != null){
            if (this.props.recipe.CoinInputs.length > 0) {
                price = this.props.recipe.CoinInputs[0].Count + ' ' + this.props.recipe.CoinInputs[0].Coin
            }
            
            const entries = this.props.recipe.Entries;
            if(entries != null){
                const itemOutputs = entries.ItemOutputs;
                if(itemOutputs != null && itemOutputs[0] != null){
                    const longs = itemOutputs[0].Longs;
                    if(longs != null && longs[0] != null){
                        const quantity = longs[0].WeightRanges;
                        if(quantity != null && quantity[0] != null){ 
                            copies = quantity[0].Lower * quantity[0].Weight
                        }
                    }
                }
            } 
        }
        
        this.state = {
            recipe: null, 
            content: "Reipe Detail",
            copies: copies,
            price: price,
        }

        if (Meteor.isServer){
            this.state.recipe = this.props.recipe;
        } 
    }  

    static getDerivedStateFromProps(props, state) {
        if (state.user !== localStorage.getItem(CURRENTUSERADDR)) {
            return {user: localStorage.getItem(CURRENTUSERADDR)};
        }
        return null;
    } 

    componentDidUpdate(prevState){
        global.Recipe = "snipshots";
        if (this.props.recipe != prevState.recipe){ 
            if (this.props.recipe != null){ 
                var copies = 0;
                var price = "No Price" 
                if (this.props.recipe.CoinInputs.length > 0) {
                    price = this.props.recipe.CoinInputs[0].Count + ' ' + this.props.recipe.CoinInputs[0].Coin
                }
                
                const entries = this.props.recipe.Entries;
                if(entries != null){
                    const itemOutputs = entries.ItemOutputs;
                    if(itemOutputs != null && itemOutputs[0] != null){
                        const longs = itemOutputs[0].Longs;
                        if(longs != null && longs[0] != null){
                            const quantity = longs[0].WeightRanges;
                            if(quantity != null && quantity[0] != null){ 
                                copies = quantity[0].Lower * quantity[0].Weight
                            }
                        }
                    }
                }  
                this.setState({
                    recipe: this.props.recipe,
                    price: price,
                    copies: copies,
                })  
            }
        }
    }
 
    handleClick = (i,e) => {
        e.preventDefault();

        this.setState({
            open: this.state.open === i ? false : i
        });
    }

    toggleDir(e) {
        e.preventDefault();
        this.setState({
            orderDir: this.state.orderDir * -1
        });
    }
  

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            if (this.props.recipe != null){ 
                return<div>
                    <Helmet>
                        <title>{this.state.content} | Big Dipper</title>
                        <meta name="description" content={this.state.content} />
                    </Helmet>

                    <div className="proposal bg-light">
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.no</T></Col>
                            <Col md={9} className="value">{this.props.recipe.NO}</Col> 
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.recipeID</T></Col>
                            <Col md={9} className="value">{this.props.recipe.ID}</Col> 
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.name</T></Col>
                            <Col md={9} className="value">{this.props.recipe.Name}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.description</T></Col>
                            <Col md={9} className="value" style={{paddingRight:'15px'}}><Markdown markup={this.props.recipe.Description} /></Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.price</T></Col>
                            <Col md={9} className="value">{this.state.price}</Col>
                        </Row> 
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.status</T></Col> 
                            <Col md={9} className="value"><ProposalStatusIcon status={this.props.recipe.Disabled ? 'PROPOSAL_STATUS_REJECTED' : 'PROPOSAL_STATUS_PASSED'}/> {this.props.recipe.Disabled ? "Disalbed" : "Enabled"}</Col>

                        </Row> 
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.sender</T></Col>
                            <Col md={9} className="value">{this.props.recipe.Sender}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.cookbookID</T></Col>
                            <Col md={9} className="value">{this.props.recipe.CookbookID}</Col>
                        </Row>
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.cookbookowner</T></Col>
                            <Col md={9} className="value">{this.props.recipe.cookbook_owner}</Col>
                        </Row> 
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.deeplinks</T></Col>
                            <Col md={9} className="value"><a href={""+this.props.recipe.deeplink+""} target="_blank">{this.props.recipe.deeplink}</a></Col>
                        </Row> 
                        <Row className="mb-2 border-top">
                            <Col md={3} className="label"><T>recipes.total_copies</T></Col>
                            <Col md={9} className="value">{this.state.copies}</Col>
                        </Row>
                    </div>
                    <Row className='clearfix'>
                        <Link to="/easel_transactions" className="btn btn-primary" onClick={setTitleString} style={{margin: 'auto'}}><i className="fas fa-caret-up"></i> <T>common.backToList</T></Link>
                    </Row>
                </div>
            }
            else{
                return <div><T>recipes.notFound</T></div>
            }
        }
    }
}
