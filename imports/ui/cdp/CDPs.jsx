import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import List from '/imports/ui/cdp/List.jsx';
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import {
    TabContent, TabPane,
    Nav, NavItem, NavLink,
    
} from 'reactstrap';
import classnames from 'classnames';

const T = i18n.createComponent();


export default class CDPs extends Component{
    constructor(props){
        super(props);
        this.state = {
            cdpActiveTab: 'cdp-kava',
            collateralType: 'ukava-a'
        }
    }


    toggleTab = (tab, newCollateralType) => {
        if (this.state.cdpActiveTab !== tab) {
            this.setState({
                cdpActiveTab: tab,
                collateralType: newCollateralType
            });
        }
    }

    componentDidMount() {
        this.CDPList();
    }


    CDPList = () => {
        return <div>
            <Row>
                <Col md={12}>
                    <List collateralType={this.state.collateralType}/>
                </Col>
            </Row>
        </div>
    }

    render() {
        return <div>
            <Helmet>
                <title>List of CDPs | The Big Dipper</title>
                <meta name="description" content="List of CDPs | The Big Dipper" />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>cdp.cdps</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <p className="lead"><T>cdp.cdpList</T></p>
            <Nav tabs className="mb-2">
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.cdpActiveTab === 'cdp-kava' })}
                        onClick={() => { this.toggleTab('cdp-kava', 'ukava-a'); }}
                    >
                        <span className="cdp-logo"> <img src="/img/KAVA-symbol.svg" className="symbol-img" /> KAVA</span>
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.cdpActiveTab === 'cdp-bnb' })}
                        onClick={() => { this.toggleTab('cdp-bnb', 'bnb-a'); }}
                    >
                        <span className="cdp-logo"><img src="/img/BNB-symbol.svg" className="symbol-img" /> BNB</span>

                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.cdpActiveTab === 'cdp-hard' })}
                        onClick={() => { this.toggleTab('cdp-hard', 'hard-a'); }}
                    >
                        <span className="cdp-logo"><img src="/img/HARD-symbol.svg" className="symbol-img" /> HARD</span>
                    </NavLink>
                </NavItem> 
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.cdpActiveTab === 'cdp-btcb' })}
                        onClick={() => { this.toggleTab('cdp-btcb', 'btcb-a'); }}
                    >
                        <span className="cdp-logo"><img src="/img/BTCB-symbol.svg" className="symbol-img" /> BTCB</span>
                    </NavLink>
                </NavItem> 
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.cdpActiveTab === 'cdp-xrpb' })}
                        onClick={() => { this.toggleTab('cdp-xrpb', 'xrpb-a'); }}
                    >
                        <span className="cdp-logo"><img src="/img/XRP-symbol.svg" className="symbol-img" /> XRPB</span>
                    </NavLink>
                </NavItem>   
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.cdpActiveTab === 'cdp-busd-a' })}
                        onClick={() => { this.toggleTab('cdp-busd-a', 'busd-a'); }}
                    >
                        <span className="cdp-logo"><img src="/img/BUSD-symbol.svg" className="symbol-img" /> BUSD-A</span>
                    </NavLink>
                </NavItem>    
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.cdpActiveTab === 'cdp-busd-b' })}
                        onClick={() => { this.toggleTab('cdp-busd-b', 'busd-b'); }}
                    >
                        <span className="cdp-logo"><img src="/img/BUSD-symbol.svg" className="symbol-img" /> BUSD-B</span>
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={this.state.cdpActiveTab}>
                <TabPane tabId="cdp-list-tab-pane">
                    {this.CDPList}
                </TabPane>
            </TabContent>
            <Switch>
                <Route exact path="/cdps" component={this.CDPList} />
            </Switch>
        </div>
    }

}