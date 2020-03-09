import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import PropTypes from 'prop-types';

const Poll = (props) => {
    return (
        <ListGroup className="mt-2">
            <ListGroupItem color="info">{props.poll.question}</ListGroupItem>
            {props.poll.provided_answers.map((answer, i) => <ListGroupItem key={i}>{answer.id}. {answer.text}</ListGroupItem>)}
        </ListGroup>
    );
}

Poll.propTypes = {
    poll: PropTypes.object.isRequired
}

export default Poll;