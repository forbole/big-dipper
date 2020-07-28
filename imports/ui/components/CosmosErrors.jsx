import React, {Component} from 'react';
import { Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class CosmosErrors extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        return <div>{this.props.codespace}: <Badge color="dark">{this.props.log}</Badge></div>
    }
}

CosmosErrors.propTypes = {
    codespace: PropTypes.string.isRequired,
    log: PropTypes.string.isRequired
}