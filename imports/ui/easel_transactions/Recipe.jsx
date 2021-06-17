import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col, Progress, Card, CardHeader, CardBody, Spinner,
    TabContent, TabPane, Nav, NavLink, NavItem, Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import { RecipeStatusIcon, VoteIcon } from '../components/Icons';
import Account from '../components/Account.jsx';
import PChart from '../components/Chart.jsx';
import numbro from 'numbro';
import { Markdown } from 'react-showdown';
import { Helmet } from 'react-helmet';
import posed from 'react-pose';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import Coin from '/both/utils/coins.js';
import TimeStamp from '../components/TimeStamp.jsx';  

const T = i18n.createComponent();

const Result = posed.div({
    closed: { height: 0},
    open: { height: 'auto'}
});
export default class Recipe extends Component{
    constructor(props){
        super(props);
        let showdown  = require('showdown');
        showdown.setFlavor('github');
        this.state = {
            Recipe: '',
            ID: '', 
            Name: '',
            Description: '',
            Sender: ''
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

    componentDidUpdate(prevProps){
        if (this.props.recipe != prevProps.recipe){
            this.setState({
                recipe: this.props.recipe, 
            }); 

            this.setState({
                ID: this.props.recipe.ID, 
                Name: props.recipe.Name,
                Description: props.recipe.Description,
                Sender: props.recipe.Sender
            })
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
            if (this.props.recipeExist && this.state.recipe != ''){
                // // console.log(this.state.proposal);
                // const ID = Number(this.props.recipe.ID), maxID = Number(this.props.recipeCount);
                // //const powerReduction = Meteor.settings.public.powerReduction || Coin.StakingCoin.fraction; 
                // return <div>
                //     <Helmet>
                //         <title>{this.props.proposal.content.title} | Big Dipper</title>
                //         <meta name="description" content={this.props.proposal.content.description} />
                //     </Helmet>
 
                //     <Row className='clearfix'>
                //         <Link to={`/easel_transactions/${proposalId-1}`} className={`btn btn-outline-danger float-left ${proposalId-1<=0?"disabled":""}`}><i className="fas fa-caret-left"></i> Prev Proposal </Link>
                //         <Link to="/easel_transactions" className="btn btn-primary" style={{margin: 'auto'}}><i className="fas fa-caret-up"></i> <T>common.backToList</T></Link>
                //         <Link to={`/easel_transactions/${proposalId+1}`} className={`btn btn-outline-danger float-right ${proposalId>=maxProposalId?"disabled":""}`}><i className="fas fa-caret-right"></i> Next Proposal</Link>
                //     </Row>
                // </div>
                return <div></div>
            }
            else{
                return <div><T>recipes.notFound</T></div>
            }
        }
    }
}
