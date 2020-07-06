import { withTracker } from 'meteor/react-meteor-data';
import Starname from './Starname.jsx';


export default StarnameContainer = withTracker( props => {
    let starname = props.match.params.starname;

    return {
        starname,
    };
} )( Starname );
