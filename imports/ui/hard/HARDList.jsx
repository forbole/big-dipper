import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import List from '/imports/ui/hard/List.jsx';
import ChainStates from '../components/ChainStatesContainer.js'
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import {
    TabContent, TabPane,
    Nav, NavItem, NavLink,

} from 'reactstrap';
import classnames from 'classnames';

const T = i18n.createComponent();


export default class HARDList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hardActiveTab: 'hard-deposits',
        }
    }


    toggleTab = (tab) => {
        if (this.state.hardActiveTab !== tab) {
            this.setState({
                hardActiveTab: tab
            });
        }
    }

    componentDidMount() {
        this.HARDList();
    }


    HARDList = () => {
        return <div>
            <Row>
                <Col md={12}>
                    <List activeTab={this.state.hardActiveTab} />
                </Col>
            </Row>
        </div>
    }

    render() {
        return <div>
            <Helmet>
                <title>List of HARD Deposits and Borrows on Cosmos Hub | The Big Dipper</title>
                <meta name="description" content="List of HARD Deposits and Borrows | The Big Dipper" />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>hard.hard</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <p className="lead"><T>hard.hardList</T></p>
            <Nav tabs className="mb-2">
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.hardActiveTab === 'hard-deposits' })}
                        onClick={() => { this.toggleTab('hard-deposits'); }}
                    >
                        <span className="cdp-logo"> <img src="/img/HARD-symbol.svg" className="symbol-img" /> Deposits</span>
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames({ active: this.state.hardActiveTab === 'hard-borrows' })}
                        onClick={() => { this.toggleTab('hard-borrows'); }}
                    >
                        <span className="cdp-logo"><img src="/img/HARD-symbol.svg" className="symbol-img" /> Borrows</span>

                    </NavLink>
                </NavItem>
               
            </Nav>
            <TabContent activeTab={this.state.hardActiveTab}>
                <TabPane tabId="hard-list-tab-pane">
                    {this.HARDList}
                </TabPane>
            </TabContent>
            <Switch>
                <Route exact path="/hard" component={this.HARDList} />
            </Switch>
        </div>
    }

}