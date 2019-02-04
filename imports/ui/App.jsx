
import React, { Component } from 'react'; 
import GoogleTagManager from '/imports/ui/components/GoogleTagManager.jsx';
// import { Meteor } from 'meteor/meteor';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
// import { render } from 'react-dom';
import { Container } from 'reactstrap';
import Header from '/imports/ui/components/Header.jsx';
import Footer from '/imports/ui/components/Footer.jsx';
import Home from '/imports/ui/home/Home.jsx';
// import Blocks from '/imports/ui/pages/Blocks.jsx';
import Validators from '/imports/ui/validators/ValidatorsList.jsx';
// import ValidatorCandidates from '/imports/ui/validators/ValidatorCandidates.jsx';
// import ValidatorRevoked from '/imports/ui/validators/ValidatorRevoked.jsx';
import ValidatorFirstSeen from '/imports/ui/validators/ValidatorFirstSeen.jsx';
import BlocksTable from '/imports/ui/blocks/BlocksTable.jsx';
import Proposals from '/imports/ui/proposals/Proposals.jsx';
import ValidatorDetails from '/imports/ui/validators/ValidatorDetails.jsx';
import moment from 'moment';


import NotFound from '/imports/ui/pages/NotFound.jsx';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

// import './App.js'


class App extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){
        let lastDay = moment("2019-02-10");
        let now = moment();
        if (now.diff(lastDay) < 0 ){
            toast.error("🐷 Gung Hei Fat Choi! 恭喜發財！");
        }
    }

    render() {
        return(
            <Router>
                <div>
                    {(Meteor.settings.public.gtm)?<GoogleTagManager gtmId={Meteor.settings.public.gtm} />:''}
                    <Header />
                    <Container fluid id="main">
                        <ToastContainer />
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route path="/blocks" component={BlocksTable} />
                            <Route exact path="/validators" component={Validators} />
                            <Route path="/validators/active" render={(props) => <Validators {...props} jailed={false} />} />
                            <Route path="/validators/jailed" render={(props) => <Validators {...props} jailed={true} />} />
                            <Route path="/validators/firstseen" component={ValidatorFirstSeen} />
                            <Route path="/validator" component={ValidatorDetails} />
                            <Route path="/proposals" component={Proposals} />
                            <Route component={NotFound} />
                        </Switch>
                    </Container>
                    <Footer />
                </div>
            </Router>
        );
    }
}

export default App