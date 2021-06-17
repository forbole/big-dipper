import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom'; 
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import TimeStamp from '../components/TimeStamp.jsx'; 
import voca from 'voca';
import { Meteor } from 'meteor/meteor';  
const T = i18n.createComponent();

const RecipeRow = (props) => { 
    return <tr>
        <td className="d-none d-sm-table-cell counter">{props.recipe.ID}</td>
        <td className="title">{props.recipe.Name}</td>
        <td className="title">{props.recipe.Description}</td>
        <td className="voting-start text-right"><a href={""+props.recipe.deeplink+""} target="_blank">{props.recipe.deeplink}</a></td> 
    </tr>
}

export default class List extends Component{
    constructor(props){
        super(props);
        if (Meteor.isServer){
            if (this.props.recipes.length > 0){
                this.state = {
                    recipes: this.props.recipes.map((recipe, i) => {
                        return <RecipeRow key={i} index={i} recipe={recipe}/>
                    })
                }
            }
        }
        else{
            this.state = {
                recipes: null
            }
        }
    }
    
    componentDidUpdate(prevState){  
        if (this.props.recipes && this.props.recipes != prevState.recipes){ 
            if (this.props.recipes.length > 0){
                this.setState({
                    recipes: this.props.recipes.map((recipes, i) => {
                        return <RecipeRow key={i} index={i} recipe={recipes} />
                    }),  
                }) 
            }
        }
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            return (
                <div>
                    {/* {this.state.user?<SubmitProposalButton history={this.props.history}/>:null} */}
                    <Table striped className="proposal-list">
                        <thead>
                            <tr>
                                <th className="d-none d-sm-table-cell counter"><i className="fas fa-hashtag"></i> <T>recipes.recipeID</T></th>  
                                <th className="submit-block"><i className="fas fa-gift"></i> <span className="d-none d-sm-inline"><T>recipes.name</T></span></th>
                                <th className="submit-block"><i className="fas fa-box"></i> <span className="d-none d-sm-inline"><T>recipes.description</T></span></th>
                                <th className="voting-start"><i className="fas fa-box-open"></i> <span className="d-none d-sm-inline"><T>recipes.deeplinks</T></span></th> 
                            </tr>
                        </thead>
                        <tbody>{this.state.recipes}</tbody>
                    </Table>
                </div>
            )
        }
    }
}