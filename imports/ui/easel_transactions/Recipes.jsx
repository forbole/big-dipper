import React, { Component } from 'react';
import { Badge, Row, Col } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import List from './ListContainer.js';
import Recipe from './RecipeContainer.js';
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

const RecipeList = (props) => { 
    return <div>
        <p className="lead"><T>recipes.listOfRecipes</T></p>
        <Row>
            <Col md={12}>
                <List {...props}/>
            </Col>
        </Row>
    </div>
}

export default class Recipes extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
            <Helmet>
                <title>Recipes on {Meteor.settings.public.chainName} | Big Dipper</title>
                <meta name="description" content="{Meteor.settings.public.chainName} incorporates on-chain governance. Come to see how on-chain governance can be achieved on Big Dipper." />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>recipes.recipes</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <Switch>
                <Route exact path="/easel_transactions" component={RecipeList} />
                <Route path="/easel_transactions/:id" component={Recipe} />
            </Switch>
        </div>
    }

}