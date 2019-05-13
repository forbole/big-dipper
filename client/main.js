import '/imports/startup/client';
import '/imports/ui/stylesheets/bootstrap.min.css';
import '/imports/ui/stylesheets/pace-theme.css';
import '/imports/ui/stylesheets/flipclock.css';
import './styles.css';
// import App from '/imports/ui/App.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

import { Meteor } from 'meteor/meteor';
// import { render } from 'react-dom';

import { onPageLoad } from 'meteor/server-render';

Meteor.startup(() => {
    // render(<App />, document.getElementById('app'));
    // render(<Header />, document.getElementById('header'));

    onPageLoad(async sink => {
        const App = (await import('/imports/ui/App.jsx')).default;
        ReactDOM.hydrate(
            <App />, document.getElementById('app')
        );
    });
});