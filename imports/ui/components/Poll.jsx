import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import PropTypes from 'prop-types';
import moment from 'moment'
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

const Poll = (props) => {
    return (
        <div className="mt-2">
            <ListGroup>
                <ListGroupItem color="info">{props.poll.question}</ListGroupItem>
                {props.poll.provided_answers.map((answer, i) => <ListGroupItem key={i}>{answer.id}. {answer.text}</ListGroupItem>)}
            </ListGroup>
            <p className="mt-2"><T date={moment.utc(props.poll.end_date).format("D MMM YYYY, h:mm:ssa z")}>desmos.pollEnd</T></p>
        </div>
    );
}

Poll.propTypes = {
    poll: PropTypes.object.isRequired
}

export default Poll;