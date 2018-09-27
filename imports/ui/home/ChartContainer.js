import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Analytics } from '/imports/api/records/records.js';
import Chart from './Chart.jsx';

export default ChartContainer = withTracker((curr) => {
    const chartHandle = Meteor.subscribe('analytics.history');
    const loading = !chartHandle.ready();
    const history = Analytics.find({}, {sort:{height:1}}).fetch();
    // const consensus = Analytics.findOne({chainId:Meteor.settings.public.chainId});
    const historyExist = !loading && !!history;
    // console.log(props.state.limit);
    return {
        loading,
        historyExist,
        history: historyExist ? history : {}
    };
})(Chart);

