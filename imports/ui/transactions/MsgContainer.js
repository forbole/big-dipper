import { withTracker } from 'meteor/react-meteor-data';
import Msg from './Msg.jsx';


export default StarnameContainer = withTracker( props => {
    const msgJson = props.match.params.msgJson;

    return {
        msgJson,
    };
} )( Msg );
