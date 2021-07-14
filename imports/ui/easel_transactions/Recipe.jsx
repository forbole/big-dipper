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
import Coin from '../../../both/utils/coins.js';
import TimeStamp from '../components/TimeStamp.jsx';  

const T = i18n.createComponent();

const CookbookeRow = (props) => { 
    console.log('cookbookeRow = ', props)
    return <tr> 
        <td className="d-none d-sm-table-cell counter">{props.cookbook.ID}</td>
        {/* <td className="title">{props.cookbook.Name}</td> */}
        <td className="title">{props.cookbook.Description}</td>  
        <td className="title">{props.cookbook.Developer}</td> 
        <td className="title">{props.cookbook.Sender}</td> 
        <td className="title">{props.cookbook.SupportEmail}</td>  
    </tr>
}

const Result = posed.div({
    closed: { height: 0},
    open: { height: 'auto'}
});

export default class Recipe extends Component{
    constructor(props){
        super(props); 
          
        this.state = {
            cookbooks: null, 
        }

        if (Meteor.isServer){
            this.state.cookbooks = this.props.cookbooks;
        } 
    }  

    static getDerivedStateFromProps(props, state) {
        if (state.user !== localStorage.getItem(CURRENTUSERADDR)) {
            return {user: localStorage.getItem(CURRENTUSERADDR)};
        }
        return null;
    }

    componentDidUpdate(prevState){
        if (this.props.cookbooks != prevState.cookbooks){ 
            if (this.props.cookbooks.length > 0){
                this.setState({
                    cookbooks: this.props.cookbooks.map((cookbook, i) => { 
                        return <CookbookeRow key={i} index={i} cookbook={cookbook}/>
                    })
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
            if (this.props.cookbookExist && this.props.cookbookCount > 0){
                 
                //const ID = Number(this.props.recipe.ID), maxID = Number(this.props.recipeCount);
                //const powerReduction = Meteor.settings.public.powerReduction || Coin.StakingCoin.fraction; 
                return (
                    <div>
                        {/* {this.state.user?<SubmitProposalButton history={this.props.history}/>:null} */}
                        <Table striped className="proposal-list">
                            <thead>
                                <tr>
                                    <th className="d-none d-sm-table-cell counter"><i className="fas fa-hashtag"></i> <T>recipes.cookbookID</T></th>  
                                    {/* <th className="submit-block"><i className="fas fa-gift"></i> <span className="d-none d-sm-inline"><T>recipes.name</T></span></th> */}
                                    <th className="submit-block"><i className="fas fa-box"></i> <span className="d-none d-sm-inline"><T>recipes.description</T></span></th> 
                                    <th className="submit-block"><i className="fas fa-box"></i> <span className="d-none d-sm-inline"><T>recipes.developer</T></span></th>
                                    <th className="submit-block"><i className="fas fa-box"></i> <span className="d-none d-sm-inline"><T>recipes.sender</T></span></th>
                                    <th className="submit-block"><i className="fas fa-box"></i> <span className="d-none d-sm-inline"><T>recipes.email</T></span></th> 
                                </tr>
                            </thead>
                            <tbody>{this.state.cookbooks}</tbody>
                        </Table>
                    </div>
                )
            }
            else{
                return <div><T>recipes.notFound</T></div>
            }
        }
    }
}
