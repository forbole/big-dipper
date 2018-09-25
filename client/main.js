import '/imports/startup/client';
import '/imports/ui/stylesheets/bootstrap.min.css';
import './styles.css';
import App from '/imports/ui/App.jsx';
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

Meteor.startup(() => {
    render(<App />, document.getElementById('app'));
    // render(<Header />, document.getElementById('header'));
});