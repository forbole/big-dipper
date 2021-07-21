/* global grecaptcha */

import React from 'react';
import PropTypes from 'prop-types';

import '../stylesheets/captcha-wrapper.css';
import { VersionParams } from '@cosmjs/stargate/build/codec/tendermint/types/params';

export default class CaptchaWrapper extends React.Component {

    constructor(props) {
        super(props);
        
        this.ready = false;
        this.captchaId = null;
        this.executeCallback = null;

        this.nodes = {
            'captcha': React.createRef(),
        };

        this.onData = this.onData.bind(this);
        this.onError = this.onData.bind(this, null);

        CaptchaWrapper.captchsMap.add(this);
        this.token = null;
        this.onChangeCaptchaStatus = props.onChangeStatus;
    }

    isCaptchaFilled() {
        return this.token !== null;
    }

    async execute() {
        if (this.ready === false) {
            return null;
        }

        return this.token;
    }

    onData(response) {
        this.token = response;
        this.onChangeCaptchaStatus(this.isCaptchaFilled());
    }

    getResponse() {
        return grecaptcha.enterprise.getResponse(this.captchaId);
    }

    reset() {
        grecaptcha.enterprise.reset(this.captchaId);
    }

    componentDidMount() {
        const scriptN = document.createElement('script');
        scriptN.async = true;
        scriptN.defer = true;
        scriptN.src = `https://www.google.com/recaptcha/enterprise.js?onload=captchaOnLoadCallback&render=explicit`;
        scriptN.addEventListener('load', () => {
            if (grecaptcha === undefined) {
                // eslint-disable-next-line no-alert
                alert('Your browser is blocking Google\' recaptcha library. Please use different browser or enable Google\' recaptcha library');
            }
        });
        document.head.appendChild(scriptN);
    }

    captchaFrameWorkLoaded() {
        if (grecaptcha === undefined) {
            return;
        }
        this.ready = true;
        grecaptcha.enterprise.ready(() => {
            this.captchaId = grecaptcha.enterprise.render(this.nodes.captcha.current, {
                'sitekey': Meteor.settings.public.CAPTCHA_FRONTEND_KEY,
                'theme': 'light',
                'callback': this.onData,
                'error-callback': this.onError,
            });
        });
    }

    render() {
        return (
            <div ref={ this.nodes.captcha } className={ `CaptchaWrapper ${this.props.className}` } />
        )
    }

    static captchaOnLoadCallback() {
        CaptchaWrapper.captchsMap.forEach(captchaWrapperEl => {
            captchaWrapperEl.captchaFrameWorkLoaded();
        });
    }
}

CaptchaWrapper.captchsMap = new Set();

window.captchaOnLoadCallback = CaptchaWrapper.captchaOnLoadCallback;

CaptchaWrapper.defaultProps = {
    'className': '',
    'onCheck': null,
};
