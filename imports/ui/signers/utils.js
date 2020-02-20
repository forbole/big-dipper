
getValidatorInfo = (validator) => {
    const result = {
        moniker: (validator.description !== undefined) ? validator.description.moniker : '',
        operatorAddress: validator.operator_address,
        address: validator.address,
        website: (validator.description !== undefined) ? validator.description.website: '',
        lastSeen: validator.lastSeen,
        numSigned: 0,
        lastSigned: 0,
    }
    return result
}

processValidators = (validators) => {
    let valObj = {}
    for(let i = 0; i < validators.length; i++) {
        valObj[validators[i].address] = getValidatorInfo(validators[i])
    }
    return valObj
}

processBlocks = (valObj, blocks) => {
    for(let j = 0; j < blocks.length; j++) {
        let block = blocks[j]
        if(block.validators !== undefined) {
            for (let k = 0; k < block.validators.length; k++) {
                if (valObj[block.validators[k]] !== undefined) {
                    valObj[block.validators[k]].numSigned++
                    if (block.height > valObj[block.validators[k]].lastSigned) {
                        valObj[block.validators[k]].lastSigned = block.height
                    }
                }
            }
        }
    }
    return valObj
}

const SignerUtils = ({
    process: (validators, blocks) => {
        let valObj = processValidators(validators)
        valObj = processBlocks(valObj, blocks)
        return valObj
    },
});

export default SignerUtils
