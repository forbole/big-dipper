import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

const MediaList = (props) => {
    return (
        <div className="mt-2">
            <ListGroup>
                {props.media.map((medium, i) => <ListGroupItem tag="a" key={i} href={medium.uri} target="_blank">{medium.uri}</ListGroupItem>)}
            </ListGroup>
        </div>
    );
}

MediaList.propTypes = {
    media: PropTypes.array.isRequired
}

export default MediaList;