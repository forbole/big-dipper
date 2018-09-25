import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Table } from 'reactstrap';
import HeaderRecord from '/imports/ui/components/HeaderRecord.jsx';
import Blocks from '/imports/ui/blocks/List.jsx'

class BlocksTable extends Component {
    constructor(props){
        super(props);
        this.state = {
            limit: 30,
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.addLimit);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.addLimit);
    }

    addLimit = () => {
        // Fetch variables
        var scrollTop = $(document).scrollTop();
        var windowHeight = $(window).height();
        var bodyHeight = $(document).height() - windowHeight;
        var scrollPercentage = (scrollTop / bodyHeight);

        // if the scroll is more than 90% from the top, load more content.
        if(scrollPercentage > 0.9) {
            // Load content
        
            // show more rows
            Meteor.call('addLimit', this.state.limit, (error, result) => {
                this.setState({
                    limit: result,
                })
                console.log(result);
            })
            // show loader
            var ele = document.getElementById("loading");
            // console.log()
            ele.style.visibility = "visible";
            console.log("loading hereeee")
            Meteor.setTimeout(() => {
                ele.style.visibility = "hidden";
            }, 2000);
        }
    }

    render(){
        return <div>
            <Table id="table">
                <HeaderRecord />
                {/* <Button onClick={this.addLimit.bind(this)}>Load more</Button> */}
                <tbody onScroll={this.addLimit} id="myblocks" ref={c => this._container = c}>
                    <Blocks limit={this.state.limit} />
                </tbody>
                
            </Table>
            <div id="loading" className="loader"></div>
        </div>
    }
}

export default BlocksTable;