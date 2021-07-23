import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom'; 
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import Coin from '../../../both/utils/coins.js';
import TimeStamp from '../components/TimeStamp.jsx'; 
import voca from 'voca';
import { Meteor } from 'meteor/meteor';  
const T = i18n.createComponent();

const RecipeRow = (props) => { 
    return <tr>  
        <td className="title"><a href={""+props.recipe.deeplink+""} target="_blank">{props.recipe.Name}</a></td>   
        <td className="title"><Link to={"/easel_transactions/"+props.recipe.ID} onClick={setTitleString()}>{props.recipe.cookbook_owner}</Link></td>  
        <td className="title">{props.recipe.price}</td> 
        <td className="voting-start">{props.recipe.Description}</td>
        {window.orientation == undefined && <td className="title" style={{paddingLeft:'36px'}}>{props.recipe.copies}</td> }
        {window.orientation != undefined && <td className="title">{props.recipe.copies}</td> } 
        {/* <td className="voting-start text-right"><a href={""+props.recipe.deeplink+""} target="_blank">{props.recipe.deeplink}</a></td>  */}
    </tr>
}

function setTitleString() {
    global.Recipe = "detail";
}

export default class List extends Component{
    constructor(props){
        super(props); 
        if (Meteor.isServer){
            if (this.props.recipes.length > 0){
                this.state = {
                    recipes: this.props.recipes.map((recipe, i) => {
                        const coinInputs = recipe.CoinInputs;
                        var price = "No Price"
                        if (coinInputs.length > 0) {
                            price = coinInputs[0].Count + ' ' + coinInputs[0].Coin
                        }
                        var copies = 0;
                        const entries = recipe.Entries;
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
                        recipe.price = price;
                        recipe.copies = copies; 
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
                    recipes: this.props.recipes.map((recipe, i) => {
                        const coinInputs = recipe.CoinInputs;
                        var price = "No Price"
                        if (coinInputs.length > 0) {
                            price = coinInputs[0].Count + ' ' + coinInputs[0].Coin
                        }
                        var copies = 0;
                        const entries = recipe.Entries;
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
                        recipe.price = price;
                        recipe.copies = copies;  
                        return <RecipeRow key={i} index={i} recipe={recipe} />
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
                                <th className="submit-block"><i className="fas fa-gift"></i> <span className="d-none d-sm-inline"><T>recipes.title</T></span></th> 
                                <th className="submit-block"><i className="fas fa-box"></i> <span className="d-none d-sm-inline"><T>recipes.artist</T></span></th>
                                {window.orientation == undefined && <th className="submit-block col-4 col-md-2 col-lg-1"><i className="fas fa-box-open"></i> <span className="d-none d-sm-inline"><T>recipes.price</T></span></th>}
                                {window.orientation != undefined && <th className="submit-block"><i className="fas fa-box-open"></i> <span className="d-none d-sm-inline"><T>recipes.price</T></span></th>}
                                <th className="submit-block" ><i className="fas fa-box"></i> <span className="d-none d-sm-inline"><T>recipes.description</T></span></th>
                                {window.orientation == undefined && <th className="submit-block col-4 col-md-1 col-lg-1"><i className="fas fa-box-open"></i> <span className="d-none d-sm-inline"><T>recipes.copies</T></span></th>}
                                {window.orientation != undefined && <th className="submit-block"><i className="fas fa-box-open"></i> <span className="d-none d-sm-inline"><T>recipes.copies</T></span></th>}
                                {/* <th className="voting-start"><i className="fas fa-box-open"></i> <span className="d-none d-sm-inline"><T>recipes.deeplinks</T></span></th>  */}
                            </tr>
                        </thead>
                        <tbody>{this.state.recipes}</tbody>
                    </Table>
                </div>
            )
        }
    }
}