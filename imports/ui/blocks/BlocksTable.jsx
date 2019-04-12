import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Table, Badge, Button, Container } from 'reactstrap';
import HeaderRecord from './HeaderRecord.jsx';
import Blocks from '/imports/ui/blocks/ListContainer.js'
import { LoadMore } from '../components/LoadMore.jsx';

class BlocksTable extends Component {
    constructor(props){
        super(props);
        this.state = {
            limit: Meteor.settings.public.initialPageSize,
        };

        // this.updateLimit.bind(this);
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
        const wrappedElement = document.getElementById('block-table');
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
        return <div>
            <h1 className="d-none d-lg-block">Lastest blocks</h1>
            <Container fluid id="block-table">
                <HeaderRecord />
                <Blocks limit={this.state.limit} />
            </Container>
            <LoadMore show={this.state.loadmore} />
        </div>
    }
}

export default BlocksTable;