import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Analytics } from '/imports/api/records/records.js';
import Chart from './Chart.jsx';

export default ChartContainer = withTracker((curr) => {
    let chartHandle
    let loading = true;
    let history;
    if (Meteor.isClient){
        chartHandle = Meteor.subscribe('analytics.history');
        loading = !chartHandle.ready();    
    }
    
    if (Meteor.isServer || !loading){
        history = Analytics.find({}, {sort:{height:1}});
        loading = false;
    }

    const historyExist = !loading && !!history;

    return {
        loading,
        historyExist,
        history: historyExist ? history.fetch() : {}
    };
})(Chart);

