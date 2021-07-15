// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';
import _ from 'lodash';

SYNCING = false;
TXSYNCING = false;
COUNTMISSEDBLOCKS = false;
COUNTMISSEDBLOCKSSTATS = false;
RPC = Meteor.settings.remote.rpc;
LCD = Meteor.settings.remote.lcd;
timerBlocks = 0;
timerTransactions = 0;
timerChain = 0;
timerConsensus = 0;
timerProposal = 0;
timerProposalsResults = 0;
timerMissedBlock = 0;
timerDelegation = 0;
timerAggregate = 0;
timerCDP = 0;
timerHARD = 0;


const DEFAULTSETTINGS = '/default_settings.json';

updateChainStatus = () => {
    Meteor.call('chain.updateStatus', (error, result) => {
        if (error) {
            console.log("updateStatus error: " + error);
        }
        else {
            console.log("updateStatus ok: " + result);
        }
    })
}

updateBlock = () => {
    Meteor.call('blocks.blocksUpdate', (error, result) => {
        if (error) {
            console.log("updateBlocks error: " + error);
        }
        else {
            console.log("updateBlocks ok: " + result);
        }
    })
}

updateTransactions = () => {
    Meteor.call('Transactions.updateTransactions', (error, result) => {
        if (error) {
            console.log("updateTransactions error: " + error);
        }
        else {
            console.log("updateTransactions ok: " + result);
        }
    })
}

getConsensusState = () => {
    Meteor.call('chain.getConsensusState', (error, result) => {
        if (error) {
            console.log("get consensus error: " + error)
        }
    })
}

getProposals = () => {
    Meteor.call('proposals.getProposals', (error, result) => {
        if (error) {
            console.log("get proposal error: " + error);
        }
        if (result) {
            console.log("get proposal result: " + result);
        }
    });
}

getProposalsResults = () => {
    Meteor.call('proposals.getProposalResults', (error, result) => {
        if (error) {
            console.log("get proposals result error: " + error);
        }
        if (result) {
            console.log("get proposals result: ok " + result);
        }
    });
}

updateMissedBlocks = () => {
    Meteor.call('ValidatorRecords.calculateMissedBlocks', (error, result) => {
        if (error) {
            console.log("missed blocks error: " + error)
        }
        if (result) {
            console.log("missed blocks ok:" + result);
        }
    });
}

getDelegations = () => {
    Meteor.call('delegations.getDelegations', (error, result) => {
        if (error) {
            console.log("get delegations error: " + error)
        }
        else {
            console.log("get delegations ok: " + result)
        }
    });
}

getCDPList = () => {
    Meteor.call('cdp.list', (error, result) => {
        if (error) {
            console.log("get CDP list error: " + error)
        }
        else {
            console.log("get CDP list ok: " + result)
        }
    });
}

getAuctions = () => {
    Meteor.call('cdp.auctions', (error, result) => {
        if (error) {
            console.log("get CDP auctions error: " + error)
        }
        else {
            console.log("get CDP auctions ok: " + result)
        }
    });
}

getIncentive = () => {
    Meteor.call('hard.incentive', (error, result) => {
        if (error) {
            console.log("get incentive error: " + error)
        }
        else {
            console.log("get incentive ok: " + result)
        }
    });
}

getCDPParameters = () => {
    Meteor.call('cdp.parameters', (error, result) => {
        if (error) {
            console.log("get CDP parameters error: " + error)
        }
        else {
            console.log("get CDP parameters ok: " + result)
        }
    });
}

getHARDDeposits = () => {
    Meteor.call('hard.deposits', (error, result) => {
        if (error) {
            console.log("get HARD deposits error: " + error)
        }
        else {
            console.log("get HARD deposits ok: " + result)
        }
    });
}

getHARDBorrows = () => {
    Meteor.call('hard.borrows', (error, result) => {
        if (error) {
            console.log("get HARD borrows error: " + error)
        }
        else {
            console.log("get HARD borrows ok: " + result)
        }
    });
}

getHARDParameters = () => { 
    Meteor.call('hard.parameters', (error, result) => {
        if (error) {
            console.log("get HARD parameters error: " + error)
        }
        else {
            console.log("get HARD parameters ok: " + result)
        }
    });
    
}

aggregateMinutely = () => {
    // doing something every min
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "m", (error, result) => {
        if (error) {
            console.log("aggregate minutely block time error: " + error)
        }
        else {
            console.log("aggregate minutely block time ok: " + result)
        }
    });

    Meteor.call('coinStats.getCoinStats', (error, result) => {
        if (error) {
            console.log("get coin stats error: " + error);
        }
        else {
            console.log("get coin stats ok: " + result)
        }
    });
}

aggregateHourly = () => {
    // doing something every hour
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "h", (error, result) => {
        if (error) {
            console.log("aggregate hourly block time error: " + error)
        }
        else {
            console.log("aggregate hourly block time ok: " + result)
        }
    });
}

aggregateDaily = () => {
    // doing somthing every day
    Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', "d", (error, result) => {
        if (error) {
            console.log("aggregate daily block time error: " + error)
        }
        else {
            console.log("aggregate daily block time ok: " + result)
        }
    });

    Meteor.call('Analytics.aggregateValidatorDailyBlockTime', (error, result) => {
        if (error) {
            console.log("aggregate validators block time error:" + error)
        }
        else {
            console.log("aggregate validators block time ok:" + result);
        }
    })
}



Meteor.startup(function () {
    if (Meteor.isDevelopment) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        import DEFAULTSETTINGSJSON from '../default_settings.json'
        Object.keys(DEFAULTSETTINGSJSON).forEach((key) => {
            if (Meteor.settings[key] == undefined) {
                console.warn(`CHECK SETTINGS JSON: ${key} is missing from settings`)
                Meteor.settings[key] = {};
            }
            Object.keys(DEFAULTSETTINGSJSON[key]).forEach((param) => {
                if (Meteor.settings[key][param] == undefined) {
                    console.warn(`CHECK SETTINGS JSON: ${key}.${param} is missing from settings`)
                    Meteor.settings[key][param] = DEFAULTSETTINGSJSON[key][param]
                }
            })
        })
    }

    Meteor.call('chain.genesis', (err, result) => {
        if (err) {
            console.log(err);
        }
        if (result) {
            if (Meteor.settings.debug.startTimer) {
                timerConsensus = Meteor.setInterval(function () {
                    getConsensusState();
                }, Meteor.settings.params.consensusInterval);

                timerBlocks = Meteor.setInterval(function () {
                    updateBlock();
                }, Meteor.settings.params.blockInterval);

                timerTransactions = Meteor.setInterval(function () {
                    updateTransactions();
                }, Meteor.settings.params.transactionsInterval);

                timerChain = Meteor.setInterval(function () {
                    updateChainStatus();
                }, Meteor.settings.params.statusInterval);

                if (Meteor.settings.params.proposalInterval >= 0) {
                    timerProposal = Meteor.setInterval(function () {
                        getProposals();
                    }, Meteor.settings.params.proposalInterval);

                    timerProposalsResults = Meteor.setInterval(function () {
                        getProposalsResults();
                    }, Meteor.settings.params.proposalInterval);
                }

                timerMissedBlock = Meteor.setInterval(function () {
                    updateMissedBlocks();
                }, Meteor.settings.params.missedBlocksInterval);

                timerDelegation = Meteor.setInterval(function () {
                    getDelegations();
                }, Meteor.settings.params.delegationInterval);

                timerCDP = Meteor.setInterval(function () {
                    getCDPList();
                    getCDPParameters();
                    getAuctions();
                }, Meteor.settings.params.CDPInterval);

                timerHARD = Meteor.setInterval(function () {
                    getHARDDeposits();
                    getHARDBorrows();
                    getHARDParameters();
                    getIncentive();
                }, Meteor.settings.params.HARDInterval);

                timerAggregate = Meteor.setInterval(function () {
                    let now = new Date();
                    if ((now.getUTCSeconds() == 0)) {
                        aggregateMinutely();
                    }

                    if ((now.getUTCMinutes() == 0) && (now.getUTCSeconds() == 0)) {
                        aggregateHourly();
                    }

                    if ((now.getUTCHours() == 0) && (now.getUTCMinutes() == 0) && (now.getUTCSeconds() == 0)) {
                        aggregateDaily();
                    }
                }, 1000)
            }
        }
    })

});