// Import server startup through a single index entry point

import './util.js';
import './register-api.js';
import './create-indexes.js';

import React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { onPageLoad } from 'meteor/server-render';
import { StaticRouter } from 'react-router-dom';

import App from '../../ui/App.jsx';

onPageLoad(sink => {
    const context = {};

    sink.renderIntoElementById('app', renderToNodeStream(
        <StaticRouter location={sink.request.url} context={context}>
            <App />
        </StaticRouter>
    ));
});