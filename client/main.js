import '/imports/startup/client';
import App from '/imports/ui/App.jsx';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'

import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';


Meteor.startup(() => {
    render(<Router><App /></Router>, document.getElementById('app'));
});
