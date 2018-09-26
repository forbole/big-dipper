import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Table, Badge, Button } from 'reactstrap';
import HeaderRecord from '/imports/ui/components/HeaderRecord.jsx';
import Blocks from '/imports/ui/blocks/ListContainer.js'

class BlocksTable extends Component {
    constructor(props){
        super(props);
        this.state = {
            limit: 30,
        };

        this.updateLimit.bind(this);
    }

    // TODO: update list
    updateLimit = () => {
        this.setState({
            limit: this.state.limit+10
        })
    }
 

    render(){
        return <div>
            <h1>Last 30 blocks <Badge color="primary">{Meteor.settings.public.chainId}</Badge></h1>
            <Table id="block-table">
                <HeaderRecord />
                <tbody id="blocks"><Blocks limit={this.state.limit} /></tbody>
                
            </Table>
            {/* <Button color="primary" onClick={this.updateLimit}>Load more</Button>{' '} */}
            {/* <div id="loading" className="loader"></div> */}
        </div>
    }
}

export default BlocksTable;