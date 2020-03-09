import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import PropTypes from 'prop-types';

const AnswerPoll = (props) => {
    return (<div></div>
        // <ListGroup className="mt-2">
        //     <ListGroupItem color="info">{props.poll.question}</ListGroupItem>
        //     {props.poll.provided_answers.map((answer, i) => <ListGroupItem key={i}>{answer.id}. {answer.text}</ListGroupItem>)}
        // </ListGroup>
    );
}

AnswerPoll.propTypes = {
    poll: PropTypes.object.isRequired
}

export default AnswerPoll;