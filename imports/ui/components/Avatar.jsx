import React from 'react';
import PropTypes from 'prop-types';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

export default class Avatar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.profileUrl){
            return (
                <img src={this.props.profileUrl} alt={this.props.moniker} className={this.props.list?'moniker-avatar-list img-fluid rounded-circle':'img-fluid rounded-circle'} />
            );    
        }
        else {
            return <div className={this.props.list?'moniker-avatar-list':''}><Jazzicon diameter={this.props.list?48:100} seed={jsNumberForAddress(this.props.address)} /></div>
        }
    }
}

Avatar.propTypes = {
    moniker: PropTypes.string.isRequired,
    list: PropTypes.bool,
    profileUrl: PropTypes.string,
    address: PropTypes.string.isRequired,
};