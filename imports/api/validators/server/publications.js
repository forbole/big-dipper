import { Meteor } from 'meteor/meteor';
import { Validators } from '../validators.js';
import { ValidatorRecords } from '../../records/records.js';

Meteor.publish('validators.all', function (sort = "description.moniker", direction = -1) {
    return Validators.find({});
});

publishComposite('validators.firstSeen',{
    find() {
        return Validators.find({});
    },
    children: [
        {
            find(val) {
                return ValidatorRecords.find(
                    { address: val.address },
                    { sort: {height: 1}, limit: 1}
                );
            }
        }
    ]
})