import React, { Component } from 'react';
import List from './ListContainer.js';
import { LoadMore } from '../components/LoadMore.jsx';
import { Meteor } from 'meteor/meteor';

export default class Transactions extends Component{
    constructor(props){
        super(props);
        this.state = {
            limit: Meteor.settings.public.initialPageSize,
            monikerDir: 1,
            votingPowerDir: -1,
            uptimeDir: -1,
            proposerDir: -1,
            priority: 2,
            loadmore: false
        }
    }

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= window.innerHeight;
    }
      
    componentDidMount() {
        document.addEventListener('scroll', this.trackScrolling);
    }
    
    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }
    
    trackScrolling = () => {
        const wrappedElement = document.getElementById('transactions');
        if (this.isBottom(wrappedElement)) {
            // console.log('header bottom reached');
            document.removeEventListener('scroll', this.trackScrolling);
            this.setState({loadmore:true});
            this.setState({
                limit: this.state.limit+10
            }, (err, result) => {
                if (!err){
                    document.addEventListener('scroll', this.trackScrolling);
                }
                if (result){
                    this.setState({loadmore:false});
                }
            })
        }
    };

    render(){
        return <div id="transactions">
            <h1 className="d-none d-lg-block">Transactions</h1>
            <List limit={this.state.limit} />
            <LoadMore show={this.state.loadmore} />
        </div>
    }
}