import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Blockscon } from '/imports/api/blocks/blocks.js';
import { Chain } from '/imports/api/chain/chain.js';
import { ValidatorSets } from '/imports/api/validator-sets/validator-sets.js';
import { Validators } from '/imports/api/validators/validators.js';
import { ValidatorRecords, Analytics, VPDistributions} from '/imports/api/records/records.js';
import { VotingPowerHistory } from '/imports/api/voting-power/history.js';
import { Transactions } from '../../transactions/transactions.js';
import { Evidences } from '../../evidences/evidences.js';
import { sha256 } from 'js-sha256';
import { getAddress } from 'tendermint/lib/pubkey';
import * as cheerio from 'cheerio';

getRemovedValidators = (prevValidators, validators) => {
    // let removeValidators = [];
    for (p in prevValidators){
        for (v in validators){
            if (prevValidators[p].address == validators[v].address){
                prevValidators.splice(p,1);
            }
        }
    }

    return prevValidators;
}

getValidatorProfileUrl = (identity) => {
    if (identity.length == 16){
        let response = HTTP.get(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`)
        if (response.statusCode == 200) {
            let them = response.data.them
            return them && them.length && them[0].pictures && them[0].pictures.primary && them[0].pictures.primary.url;
        } else {
            console.log(JSON.stringify(response))
        }
    } else if (identity.indexOf("keybase.io/team/")>0){
        let teamPage = HTTP.get(identity);
        if (teamPage.statusCode == 200){
            let page = cheerio.load(teamPage.content);
            return page(".kb-main-card img").attr('src');
        } else {
            console.log(JSON.stringify(teamPage))
        }
    }
}

getValidatorUptime = async (validatorSet) => {

    // get validator uptime
    let url = LCD+'/slashing/parameters';
    let response = HTTP.get(url);

    const slashingParams = JSON.parse(response.content).result;

    Chain.upsert({chainId:Meteor.settings.public.chainId}, {$set:{"slashing.params":slashingParams}});

    for(let key in validatorSet){
        try{
            try {
                let url = LCD+'/slashing/validators/'+validatorSet[key].consensus_pubkey+'/signing_info';
                let response = HTTP.get(url);
                let signingInfo = JSON.parse(response.content).result;
                if (signingInfo){
                    let valData = validatorSet[key]
                    valData.tombstoned = signingInfo.tombstoned
                    valData.jailed_until = signingInfo.jailed_until
                    valData.index_offset = signingInfo.index_offset
                    valData.start_height = signingInfo.start_height
                    valData.uptime = (slashingParams.signed_blocks_window - parseInt(signingInfo.missed_blocks_counter))/slashingParams.signed_blocks_window * 100;
                    Validators.upsert({consensus_pubkey:validatorSet[key].consensus_pubkey}, {$set:valData})
                }
            }
            catch(e){
                console.log("Getting signing info of %o: %o", validatorSet[key].consensus_pubkey, e.response.statusCode);
            }
        }
        catch(e){
            console.log(e);
        }
    }
}

calculateVPDist = async (analyticsData, blockData) => {
    console.log("===== calculate voting power distribution =====");
    let activeValidators = Validators.find({status:2,jailed:false},{sort:{voting_power:-1}}).fetch();
    let numTopTwenty = Math.ceil(activeValidators.length*0.2);
    let numBottomEighty = activeValidators.length - numTopTwenty;

    let topTwentyPower = 0;
    let bottomEightyPower = 0;

    let numTopThirtyFour = 0;
    let numBottomSixtySix = 0;
    let topThirtyFourPercent = 0;
    let bottomSixtySixPercent = 0;



    for (v in activeValidators){
        if (v < numTopTwenty){
            topTwentyPower += activeValidators[v].voting_power;
        }
        else{
            bottomEightyPower += activeValidators[v].voting_power;
        }


        if (topThirtyFourPercent < 0.34){
            topThirtyFourPercent += activeValidators[v].voting_power / analyticsData.voting_power;
            numTopThirtyFour++;
        }
    }

    bottomSixtySixPercent = 1 - topThirtyFourPercent;
    numBottomSixtySix = activeValidators.length - numTopThirtyFour;

    let vpDist = {
        height: blockData.height,
        numTopTwenty: numTopTwenty,
        topTwentyPower: topTwentyPower,
        numBottomEighty: numBottomEighty,
        bottomEightyPower: bottomEightyPower,
        numTopThirtyFour: numTopThirtyFour,
        topThirtyFourPercent: topThirtyFourPercent,
        numBottomSixtySix: numBottomSixtySix,
        bottomSixtySixPercent: bottomSixtySixPercent,
        numValidators: activeValidators.length,
        totalVotingPower: analyticsData.voting_power,
        blockTime: blockData.time,
        createAt: new Date()
    }

    console.log(vpDist);

    VPDistributions.insert(vpDist);
}

// var filtered = [1, 2, 3, 4, 5].filter(notContainedIn([1, 2, 3, 5]));
// console.log(filtered); // [4]

Meteor.methods({
    'blocks.averageBlockTime'(address){
        this.unblock();
        let blocks = Blockscon.find({proposerAddress:address}).fetch();
        let heights = blocks.map((block) => {
            return block.height;
        });
        let blocksStats = Analytics.find({height:{$in:heights}}).fetch();
        // console.log(blocksStats);

        let totalBlockDiff = 0;
        for (b in blocksStats){
            totalBlockDiff += blocksStats[b].timeDiff;
        }
        return totalBlockDiff/heights.length;
    },
    'blocks.getLatestHeight': function() {
        this.unblock();
        let url = RPC+'/status';
        try{
            let response = HTTP.get(url);
            let status = JSON.parse(response.content);
            return (status.result.sync_info.latest_block_height);
        }
        catch (e){
            return 0;
        }
    },
    'blocks.getCurrentHeight': function() {
        this.unblock();
        let currHeight = Blockscon.find({},{sort:{height:-1},limit:1}).fetch();
        // console.log("currentHeight:"+currHeight);
        let startHeight = Meteor.settings.params.startHeight;
        if (currHeight && currHeight.length == 1) {
            let height = currHeight[0].height;
            if (height > startHeight)
                return height
        }
        return startHeight
    },
    'blocks.blocksUpdate': function() {
        this.unblock();
        if (SYNCING)
            return "Syncing...";
        else console.log("start to sync");
        // Meteor.clearInterval(Meteor.timerHandle);
        // get the latest height
        let until = Meteor.call('blocks.getLatestHeight');
        // console.log(until);
        // get the current height in db
        let curr = Meteor.call('blocks.getCurrentHeight');
        console.log(curr);
        // loop if there's update in db
        if (until > curr) {
            SYNCING = true;

            let validatorSet = {}
            // get latest validator candidate information
            url = LCD+'/staking/validators';

            try{
                response = HTTP.get(url);
                JSON.parse(response.content).result.forEach((validator) => validatorSet[validator.consensus_pubkey] = validator);
            }
            catch(e){
                console.log(url);
                console.log(e);
            }

            url = LCD+'/staking/validators?status=unbonding';

            try{
                response = HTTP.get(url);
                JSON.parse(response.content).result.forEach((validator) => validatorSet[validator.consensus_pubkey] = validator)
            }
            catch(e){
                console.log(url);
                console.log(e);
            }

            url = LCD+'/staking/validators?status=unbonded';

            try{
                response = HTTP.get(url);
                JSON.parse(response.content).result.forEach((validator) => validatorSet[validator.consensus_pubkey] = validator)
            }
            catch(e){
                console.log(url);
                console.log(e);
            }

            let totalValidators = Object.keys(validatorSet).length;
            console.log("all validators: "+ totalValidators);
            Chain.update({chainId:Meteor.settings.public.chainId}, {$set:{totalValidators:totalValidators}});

            for (let height = curr+1 ; height <= until ; height++) {
                let startBlockTime = new Date();
                // add timeout here? and outside this loop (for catched up and keep fetching)?
                this.unblock();
                let url = RPC+'/block?height=' + height;
                let analyticsData = {};

                const bulkValidators = Validators.rawCollection().initializeUnorderedBulkOp();
                const bulkUpdateLastSeen = Validators.rawCollection().initializeUnorderedBulkOp();
                const bulkValidatorRecords = ValidatorRecords.rawCollection().initializeUnorderedBulkOp();
                const bulkVPHistory = VotingPowerHistory.rawCollection().initializeUnorderedBulkOp();
                const bulkTransactions = Transactions.rawCollection().initializeUnorderedBulkOp();

                console.log(url);
                try{
                    let startGetHeightTime = new Date();
                    let response = HTTP.get(url);
                    if (response.statusCode == 200){
                        let block = JSON.parse(response.content);
                        block = block.result;
                        // store height, hash, numtransaction and time in db
                        let blockData = {};
                        blockData.height = height;
                        blockData.hash = block.block_id.hash;
                        blockData.transNum = block.block.data.txs?block.block.data.txs.length:0;
                        blockData.time = new Date(block.block.header.time);
                        blockData.lastBlockHash = block.block.header.last_block_id.hash;
                        blockData.proposerAddress = block.block.header.proposer_address;
                        blockData.validators = [];

                        // Tendermint v0.33 start using "signatures" in last block instead of "precommits"
                        let precommits = block.block.last_commit.signatures; 
                        if (precommits != null){
                            // console.log(precommits.length);
                            for (let i=0; i<precommits.length; i++){
                                if (precommits[i] != null){
                                    blockData.validators.push(precommits[i].validator_address);
                                }
                            }

                            analyticsData.precommits = precommits.length;
                            // record for analytics
                            // PrecommitRecords.insert({height:height, precommits:precommits.length});
                        }

                        // save txs in database
                        if (block.block.data.txs && block.block.data.txs.length > 0){
                            for (t in block.block.data.txs){
                                bulkTransactions.insert({
                                    // hash has to be in uppercase
                                    txhash: sha256(Buffer.from(block.block.data.txs[t], 'base64')).toUpperCase(),
                                    height: height,
                                    processed: false
                                })
                            }

                            if (bulkTransactions.length > 0){
                                bulkTransactions.execute((err, result) => {
                                    if (err){
                                        console.log(err);
                                    }
                                    if (result){
                                        // console.log(result);
                                    }
                                });
                            }
                        }

                        // save double sign evidences
                        if (block.block.evidence.evidence){
                            Evidences.insert({
                                height: height,
                                evidence: block.block.evidence.evidence
                            });
                        }

                        blockData.precommitsCount = blockData.validators.length;

                        analyticsData.height = height;

                        let endGetHeightTime = new Date();
                        console.log("Get height time: "+((endGetHeightTime-startGetHeightTime)/1000)+"seconds.");


                        let startGetValidatorsTime = new Date();
                        // update chain status

                        let validators = []
                        let page = 0;
                        try {
                            let result = {}
                            do {
                                url = RPC+`/validators?height=${height}&page=${++page}&per_page=100`;
                                response = HTTP.get(url);
                                console.log(url);
                                result = JSON.parse(response.content);
                                validators = [...validators, ...result.result.validators];
                            }
                            while (result.result.count == 100 && (result.result.count*page < result.result.total) )
                        }
                        catch(e){
                            console.log("Getting validator set at height %o: %o", height, e)
                        }
                        
                        // temporarily add bech32 concensus keys to the validator set list
                        let tempValidators = [];
                        for (let v in validators){
                            validators[v].consensus_pubkey = Meteor.call('pubkeyToBech32', validators[v].pub_key, Meteor.settings.public.bech32PrefixConsPub);
                            tempValidators[validators[v].consensus_pubkey] = validators[v];
                        }
                        validators = tempValidators;

                        ValidatorSets.insert({
                            block_height: height,
                            validators: validators
                        })

                        blockData.validatorsCount = validators.length;
                        let startBlockInsertTime = new Date();
                        Blockscon.insert(blockData);
                        let endBlockInsertTime = new Date();
                        console.log("Block insert time: "+((endBlockInsertTime-startBlockInsertTime)/1000)+"seconds.");

                        let chainStatus = Chain.findOne({chainId:block.block.header.chain_id});
                        let lastSyncedTime = chainStatus?chainStatus.lastSyncedTime:0;
                        let timeDiff;
                        let blockTime = Meteor.settings.params.defaultBlockTime;
                        if (lastSyncedTime){
                            let dateLatest = blockData.time;
                            let dateLast = new Date(lastSyncedTime);
                            timeDiff = Math.abs(dateLatest.getTime() - dateLast.getTime());
                            blockTime = (chainStatus.blockTime * (blockData.height - 1) + timeDiff) / blockData.height;
                        }

                        let endGetValidatorsTime = new Date();
                        console.log("Get height validators time: "+((endGetValidatorsTime-startGetValidatorsTime)/1000)+"seconds.");

                        Chain.update({chainId:block.block.header.chain_id}, {$set:{lastSyncedTime:blockData.time, blockTime:blockTime}});

                        analyticsData.averageBlockTime = blockTime;
                        analyticsData.timeDiff = timeDiff;

                        analyticsData.time = blockData.time;

                        // initialize validator data at first block
                        // if (height == 1){
                        //     Validators.remove({});
                        // }

                        analyticsData.voting_power = 0;

                        let startFindValidatorsNameTime = new Date();
                        for (v in validatorSet){
                            let valData = validatorSet[v];
                            let valExist = Validators.findOne({consensus_pubkey:v});
                            

                            if (!valExist && valData.consensus_pubkey){

                                // get the validator hex address and other bech32 addresses.

                                valData.delegator_address = Meteor.call('getDelegator', valData.operator_address);

                                let pubkeyType = Meteor.settings.public.secp256k1?'tendermint/PubKeySecp256k1':'tendermint/PubKeyEd25519';

                                valData.pub_key = {
                                    type: pubkeyType,
                                    value: Meteor.call('bech32ToPubkey', valData.consensus_pubkey, pubkeyType)
                                }

                                valData.address = getAddress(valData.pub_key);
                                
                                // First time adding validator to the database.
                                // Fetch profile picture from Keybase

                                if (valData.description && valData.description.identity){
                                    try{
                                        valData.profile_url =  getValidatorProfileUrl(valData.description.identity)
                                    }
                                    catch (e){
                                        console.log("Error fetching keybase: %o", e)
                                    }
                                }
                                    

                                valData.accpub = Meteor.call('pubkeyToBech32', valData.pub_key, Meteor.settings.public.bech32PrefixAccPub);
                                valData.operator_pubkey = Meteor.call('pubkeyToBech32', valData.pub_key, Meteor.settings.public.bech32PrefixValPub);

                                // insert first power change history 

                                valData.voting_power = validators[valData.consensus_pubkey]?parseInt(validators[valData.consensus_pubkey].voting_power):0;
                                valData.proposer_priority = validators[valData.consensus_pubkey]?parseInt(validators[valData.consensus_pubkey].proposer_priority):0;
                                bulkVPHistory.insert({
                                    address: valData.address,
                                    prev_voting_power: 0,
                                    voting_power: valData.voting_power,
                                    type: 'add',
                                    height: blockData.height,
                                    block_time: blockData.time
                                });
                                // }
                            }
                            else{
                                valData.delegator_address = valExist.delegator_address;

                                if (validators[valData.consensus_pubkey]){
                                    // Validator exists and is in validator set, update voitng power.
                                    // If voting power is different from before, add voting power history
                                    valData.voting_power = parseInt(validators[valData.consensus_pubkey].voting_power);
                                    valData.proposer_priority = parseInt(validators[valData.consensus_pubkey].proposer_priority);
                                    let prevVotingPower = VotingPowerHistory.findOne({address:valExist.address}, {height:-1, limit:1});

                                    if (prevVotingPower){
                                        if (prevVotingPower.voting_power != valData.voting_power){
                                            let changeType = (prevVotingPower.voting_power > valData.voting_power)?'down':'up';
                                            let changeData = {
                                                address: valExist.address,
                                                prev_voting_power: prevVotingPower.voting_power,
                                                voting_power: valData.voting_power,
                                                type: changeType,
                                                height: blockData.height,
                                                block_time: blockData.time
                                            };
                                            // console.log('voting power changed.');
                                            // console.log(changeData);
                                            bulkVPHistory.insert(changeData);
                                        }
                                    }
                                }
                                else{
                                    // Validator is not in the set and it has been removed.
                                    // Set voting power to zero and add voting power history.

                                    valData.voting_power = 0;
                                    valData.proposer_priority = 0;

                                    let prevVotingPower = VotingPowerHistory.findOne({address:valExist.address}, {height:-1, limit:1});

                                    if (prevVotingPower && (prevVotingPower.voting_power > 0)){
                                        bulkVPHistory.insert({
                                            address: valExist.address,
                                            prev_voting_power: prevVotingPower,
                                            voting_power: 0,
                                            type: 'remove',
                                            height: blockData.height,
                                            block_time: blockData.time
                                        });
                                    }
                                }
                            }

                            // get self delegation every 30 blocks
                            if (height == curr+1){ //if (height % 50 == 2){
                                let url = LCD+`/staking/delegators/${valData.delegator_address}/delegations/${valData.operator_address}`
                                try{
                                    let response = HTTP.get(url);
                                    let selfDelegation = JSON.parse(response.content).result;
                                    valData.self_delegation = (selfDelegation && selfDelegation.shares)?parseFloat(selfDelegation.shares)/parseFloat(valData.delegator_shares):0;
                                }
                                catch(e){
                                    console.log("Getting self delegation: %o, \nurl: %o", e.response, url)
                                }
                            }

                            if ((height == curr+1) || (height == until) || (height % Meteor.settings.params.validatorUpdateWindow == 0)){
                                bulkValidators.find({consensus_pubkey: valData.consensus_pubkey}).upsert().updateOne({$set:valData});
                            }
                        }

                        // store valdiators exist records
                        // let existingValidators = Validators.find({address:{$exists:true}}).fetch();

                        if (height > 1){
                            // record precommits and calculate uptime
                            // only record from block 2
                            for (i in validators){
                                let address = validators[i].address;
                                let record = {
                                    height: height,
                                    address: address,
                                    exists: false,
                                    voting_power: parseInt(validators[i].voting_power)//getValidatorVotingPower(existingValidators, address)
                                }

                                for (j in precommits){
                                    if (precommits[j] != null){
                                        if (address == precommits[j].validator_address){
                                            record.exists = true;
                                            bulkUpdateLastSeen.find({address:precommits[j].validator_address}).upsert().updateOne({$set:{lastSeen:blockData.time}});
                                            precommits.splice(j,1);
                                            break;
                                        }
                                    }
                                }

                                bulkValidatorRecords.insert(record);
                                // ValidatorRecords.update({height:height,address:record.address},record);
                            }
                        }

                        // update uptime by the end of the crawl or update window
                        if ((height % Meteor.settings.params.validatorUpdateWindow == 0) || (height == until)){
                            getValidatorUptime(validatorSet)
                        }

                        // fetching keybase every base on keybaseFetchingInterval settings
                        // default to every 5 hours 

                        if (height == curr+1){

                            // check the last fetching time

                            let now = Date.now();
                            let lastKeybaseFetchTime = Date.parse(chainStatus.lastKeybaseFetchTime) || 0
                            console.log("Now: %o", now)
                            console.log("Last fetch time: %o", lastKeybaseFetchTime)

                            if (!lastKeybaseFetchTime || (now - lastKeybaseFetchTime) > Meteor.settings.params.keybaseFetchingInterval ){
                                console.log('Fetching keybase...')
                                // eslint-disable-next-line no-loop-func
                                Validators.find({}).forEach(async (validator) => {
                                    try {
                                        if (validator.description && validator.description.identity){
                                            let profileUrl = getValidatorProfileUrl(validator.description.identity)
                                            if (profileUrl) {
                                                bulkValidators.find({address: validator.address}).upsert().updateOne({$set:{'profile_url':profileUrl}});
                                            }    
                                        }
                                    } catch (e) {
                                        console.log("Error fetching Keybase for %o: %o", validator.address, e)
                                    }
                                })

                                Chain.update({chainId:block.block.header.chain_id}, {$set:{lastKeybaseFetchTime:new Date().toUTCString()}});
                            }

                        }

                        let endFindValidatorsNameTime = new Date();
                        console.log("Get validators name time: "+((endFindValidatorsNameTime-startFindValidatorsNameTime)/1000)+"seconds.");

                        // record for analytics
                        let startAnayticsInsertTime = new Date();
                        Analytics.insert(analyticsData);
                        let endAnalyticsInsertTime = new Date();
                        console.log("Analytics insert time: "+((endAnalyticsInsertTime-startAnayticsInsertTime)/1000)+"seconds.");

                        let startVUpTime = new Date();
                        if (bulkValidators.length > 0){
                            // console.log(bulkValidators.length);
                            bulkValidators.execute((err, result) => {
                                if (err){
                                    console.log("Error while bulk insert validators: %o",err);
                                }
                                if (result){
                                    // console.log(result);
                                    bulkUpdateLastSeen.execute((err, result) => {
                                        if (err){
                                            console.log("Error while bulk update validator last seen: %o",err);
                                        }
                                        if (result){
                                        }
                                    })
                                }
                            });
                        }

                        let endVUpTime = new Date();
                        console.log("Validator update time: "+((endVUpTime-startVUpTime)/1000)+"seconds.");

                        let startVRTime = new Date();
                        if (bulkValidatorRecords.length > 0){
                            bulkValidatorRecords.execute((err) => {
                                if (err){
                                    console.log(err);
                                }
                            });
                        }

                        let endVRTime = new Date();
                        console.log("Validator records update time: "+((endVRTime-startVRTime)/1000)+"seconds.");

                        if (bulkVPHistory.length > 0){
                            bulkVPHistory.execute((err) => {
                                if (err){
                                    console.log(err);
                                }
                            });
                        }

                        // calculate voting power distribution every 60 blocks ~ 5mins

                        if (height % 60 == 1){
                            calculateVPDist(analyticsData, blockData)
                        }
                    }
                }
                catch (e){
                    console.log(url);
                    console.log(e);
                    SYNCING = false;
                    return "Stopped";
                }
                let endBlockTime = new Date();
                console.log("This block used: "+((endBlockTime-startBlockTime)/1000)+"seconds.");
            }
            SYNCING = false;
            Chain.update({chainId:Meteor.settings.public.chainId}, {$set:{lastBlocksSyncedTime:new Date()}});
        }

        return until;
    },
    'addLimit': function(limit) {
        // console.log(limit+10)
        return (limit+10);
    },
    'hasMore': function(limit) {
        if (limit > Meteor.call('getCurrentHeight')) {
            return (false);
        } else {
            return (true);
        }
    }
});
