/* global grecaptcha */

import React from 'react';
import PropTypes from 'prop-types';

import '../stylesheets/captcha-wrapper.css';

export default class CaptchaWrapper extends React.Component {

    constructor(props) {
        super(props);
        
        this.ready = false;
        // this.captchaId = null;
        // this.executeCallback = null;

        // this.nodes = {
        //     'captcha': React.createRef(),
        // };

        // this.onData = this.onData.bind(this);
        // this.onError = this.onData.bind(this, null);
    }

    // onData(response) {
    //     const callback = this.executeCallback;
    //     if (callback === null) {
    //         return;
    //     }

    //     this.executeCallback = null;

    //     if (response === null) {
    //         // Alert.show('Wrong catpcha, please reload the page and try again', () => {
    //         //     window.location.reload();
    //         // });
    //         console.error('Wrong catpcha, please reload the page and try again');
    //         return;
    //     }

    //     callback(response);
    // }

    async execute(callback) {
        if (this.ready === false) {
            callback(null);
            return;
        }

        try {
            const token = await grecaptcha.enterprise.execute(Meteor.settings.public.CAPTCHA_FRONTEND_KEY, {action: 'login'});
            callback(token);
        } catch (er) {
            callback(null);
        }

        // grecaptcha.execute(this.captchaId);
        // this.executeCallback = callback;
    }

    // getResponse() {
    //     return grecaptcha.getResponse(this.captchaId);
    // }

    // reset() {
    //     grecaptcha.reset(this.captchaId);
    // }

    componentDidMount() {
        const scriptN = document.createElement('script');
        scriptN.async = true;
        scriptN.defer = true;
        scriptN.src = `https://www.google.com/recaptcha/enterprise.js?render=${Meteor.settings.public.CAPTCHA_FRONTEND_KEY}`;
        scriptN.addEventListener('load', () => {
            if (grecaptcha === undefined) {
                alert('Your browser is blocking Google\' recaptcha library. Please use different browser or enable Google\' recaptcha library');
                return;
            }

            grecaptcha.enterprise.ready(() => {
                this.ready = true;
            });

            // grecaptcha.ready(() => {
            //     window.captcha = this;
            //     this.captchaId = grecaptcha.render(this.nodes.captcha.current, {
            //         'sitekey': Meteor.settings.public.CAPTCHA_FRONTEND_KEY,
            //         'size': 'invisible',
            //         'theme': 'light',
            //         'callback': this.onData,
            //         'error-callback': this.onError,
            //         // 'callback': (data) => {
            //         //     console.log('1', data);
            //         //     if (this.props.onCheck !== null) {
            //         //         this.props.onCheck();
            //         //     }
            //         // },
            //     });
            // });
        });
        document.head.appendChild(scriptN);
    }

    render() {
        return null;
        // return (
        //     <div ref={ this.nodes.captcha } className={ `CaptchaWrapper ${this.props.className}` } />
        // )
    }

}

CaptchaWrapper.defaultProps = {
    'className': '',
    'onCheck': null,
};

// CaptchaWrapper.propTypes = {
//     'className': PropTypes.string,
//     'onCheck': PropTypes.func,
// };
