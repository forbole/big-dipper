import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import List from './ListContainer.js';
import { LoadMore } from '../components/LoadMore.jsx';
import { Meteor } from 'meteor/meteor';
import { Route, Switch } from 'react-router-dom';
import Transaction from './TransactionContainer.js';
import Sidebar from "react-sidebar";
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import StarnameContainer from './StarnameContainer.js';
import MsgContainer from './MsgContainer.js';

const T = i18n.createComponent();

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
            loadmore: false,
            sidebarOpen: (props.location.pathname.split("/transactions/").length == 2),
            sidebarOpenStarname: (props.location.pathname.split("/starname/").length == 2),
            sidebarOpenMsg: (props.location.pathname.split("/msg/").length == 2),
        }

        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
        this.onSetSidebarOpenStarname = this.onSetSidebarOpenStarname.bind(this);
        this.onSetSidebarOpenMsg = this.onSetSidebarOpenMsg.bind(this);
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

    componentDidUpdate(prevProps){
        if (this.props.location.pathname != prevProps.location.pathname){
            this.setState({
                sidebarOpen: (this.props.location.pathname.split("/transactions/").length == 2),
                sidebarOpenStarname: (this.props.location.pathname.split("/starname/").length == 2),
                sidebarOpenMsg: (this.props.location.pathname.split("/msg/").length == 2),
            })
        }
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

    onSetSidebarOpen(open) {
        // console.log(open);
        this.setState({ sidebarOpen: open }, (error, result) =>{
            let timer = Meteor.setTimeout(() => {
                if (!open){
                    this.props.history.push('/transactions');
                }
                Meteor.clearTimeout(timer);
            },500)
        });
    }

    onSetSidebarOpenStarname(open) {
        // console.log(open);
        this.setState({ sidebarOpenStarname: open }, (error, result) =>{
            let timer = Meteor.setTimeout(() => {
                if (!open){
                    this.props.history.push('/starname');
                }
                Meteor.clearTimeout(timer);
            },500)
        });
    }

    onSetSidebarOpenMsg(open) {
      // console.log(open);
      this.setState({ sidebarOpenMsg: open }, (error, result) =>{
          let timer = Meteor.setTimeout(() => {
              if (!open){
                  this.props.history.push('/msg');
              }
              Meteor.clearTimeout(timer);
          },500)
      });
  }

    render(){
        return <div id="transactions">
            <Helmet>
                <title>Latest Transactions The IOV Name Service</title>
                <meta name="description" content="See what's happening on the Starname Network" />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>transactions.transactions</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <Switch>
                <Route path="/transactions/:txId" render={(props)=> <Sidebar
                    sidebar={<Transaction {...props} />}
                    open={this.state.sidebarOpen}
                    onSetOpen={this.onSetSidebarOpen}
                    styles={{ sidebar: {
                        background: "white",
                        position: "fixed",
                        width: '85%',
                        zIndex: 4
                    },overlay: {
                        zIndex: 3
                    } }}
                >
                </Sidebar>}>
                </Route>
                <Route path="/starname/:starname" render={(props)=> <Sidebar
                    sidebar={<StarnameContainer {...props} />}
                    open={this.state.sidebarOpenStarname}
                    onSetOpen={this.onSetSidebarOpenStarname}
                    styles={{ sidebar: {
                        background: "white",
                        position: "fixed",
                        width: '85%',
                        zIndex: 4
                    },overlay: {
                        zIndex: 3
                    } }}
                >
                </Sidebar>}>
                </Route>
                <Route path="/msg/:msgJson" render={(props)=> <Sidebar
                    sidebar={<MsgContainer {...props} />}
                    open={this.state.sidebarOpenMsg}
                    onSetOpen={this.onSetSidebarOpenMsg}
                    styles={{ sidebar: {
                        background: "white",
                        position: "fixed",
                        width: '85%',
                        zIndex: 4
                    },overlay: {
                        zIndex: 3
                    } }}
                >
                </Sidebar>}>
                </Route>
            </Switch>
            <List limit={this.state.limit} />
            <LoadMore show={this.state.loadmore} />
        </div>
    }
}
