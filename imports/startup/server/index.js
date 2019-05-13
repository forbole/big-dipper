// Import server startup through a single index entry point

import './util.js';
import './register-api.js';
import './create-indexes.js';

import React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { onPageLoad } from 'meteor/server-render';

import App from '../../ui/App.jsx';

onPageLoad(sink => {
    sink.renderIntoElementById('app', renderToNodeStream(
        <App location={sink.request.url} />
    ));
});