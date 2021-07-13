import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Nfts } from '/imports/api/nfts/nfts.js';
import List from './List.jsx';

export default ValidatorDetailsContainer = withTracker((props) => {
    let nftsHandle, nfts, nftsExist;
    let loading = true;

    if (Meteor.isClient) {
        nftsHandle = Meteor.subscribe('nfts.list', 10);
        loading = !nftsHandle.ready();

        if (!loading) {
            nfts = Nfts.find({}, { sort: { ID: -1 } }).fetch();
            nftsExist = !loading && !!nfts;
        }
    }

    if (Meteor.isServer) {
        nfts = Nfts.find({}, { sort: { ID: -1 } }).fetch();
        nftsExist = !!nfts;
    }

    return {
        loading,
        nftsExist,
        nfts: nftsExist ? nfts : {},
    };
})(List);