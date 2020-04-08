import React, { Component } from 'react';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, Form, FormGroup, FormText, FormFeedback } from 'reactstrap';
import moment from 'moment';
import numbro from 'numbro';
import Account from '../components/Account.jsx';
import Coin from '/both/utils/coins.js'
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';

const T = i18n.createComponent();
const collateralizationRatio = 2;

export default class CDP extends Component{
    constructor(props){
        super(props);
        this.state = {
            modal: false,
            ratio: 0,
            collateral: 0,
            debt: 0,
            price: 11.5928
        }

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    toggle = () =>{
        this.setState({
            modal: !this.state.modal
        })
    }

    handleChange = (e) => {
        const { target } = e;
        const value = target.value;
        const { name } = target;
        this.setState({
            [name]: value,
        }, () => {
            this.setState({
                ratio: this.state.collateral * this.state.price / this.state.debt
            })
        });
    }

    render(){
        if (this.props.id) {
            return <div className="cdp-content">
                <Table>
                    <tbody>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.id</T></th>
                            <td>{this.props.id}</td>
                        </tr>
                        {(this.props.owner)?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.owner</T></th>
                            <td><Account address={this.props.owner} /></td>
                        </tr>:''}
                        {(this.props.collateral&&(this.props.collateral.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralDeposited</T></th>
                            <td>{this.props.collateral.map((col, i) => <div key={i}>{new Coin(col.amount, col.denom).toString(6)}</div>)}</td>
                        </tr>:''}
                        {(this.props.principal&&(this.props.principal.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.principal</T></th>
                            <td>{this.props.principal.map((prin, i) => <div key={i}>{new Coin(prin.amount, prin.denom).toString(6)}</div>)}</td>
                        </tr>:''}
                        {(this.props.accumulatedFees&&(this.props.accumulatedFees.length>0))?<tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.accumulatedFees</T></th>
                            <td>{this.props.accumulatedFees.map((fee, i) => <div key={i}>{new Coin(fee.amount, fee.denom).toString(6)}<br/><small>(<T>common.lastUpdated</T> {moment.utc(this.props.feesUpdated).fromNow()})</small></div>)}</td>
                        </tr>:''}
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralValue</T></th>
                            <td>{new Coin(this.props.collateralValue.amount, this.props.collateralValue.denom).toString(6)}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="w-25 text-muted"><T>cdp.collateralizationRatio</T></th>
                            <td className={this.props.collateralizationRatio>1.5?"text-success":"text-danger"}>{numbro(this.props.collateralizationRatio).format({mantissa:4})}</td>
                        </tr>
                    </tbody>
                </Table>
                <div>
                    <Button color="success" size="sm"><T>cdp.deposit</T></Button> <Button color="warning" size="sm"><T>cdp.withdraw</T></Button> <Button color="danger" size="sm"><T>cdp.draw</T></Button> <Button color="info" size="sm"><T>cdp.repay</T></Button>
                </div>
                
            </div>
        }
        else{
            return <div>
                <Button color="success" size="sm" onClick={this.toggle}><T>cdp.create</T></Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}><T>cdp.create</T></ModalHeader>
                    <ModalBody>
                        <Form>
                            <h3>Create CDP with <img src="/img/bnb-symbol.svg" style={{width:"24px",height:"24px"}}/> BNB</h3>
                            <FormGroup>
                                <Label for="collateral"><T>cdp.collateral</T></Label>
                                <Input placeholder="Collateral Amount" name="collateral" onChange={this.handleChange} />
                                <FormText>The amount of BNB you would like to deposit</FormText>
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleEmail"><T>cdp.debt</T></Label>
                                <Input placeholder="Debt Amount" name="debt" onChange={this.handleChange} />
                                <FormText>The amount of debut in USDX you would like to draw</FormText>
                            </FormGroup>
                            <FormGroup>
                                <Label><T>cdp.collateralizationRatio</T></Label>
                                <Input invalid={!((this.state.ratio !== Infinity) && (this.state.ratio> collateralizationRatio))}
                                    className={((this.state.ratio !== Infinity) && (this.state.ratio> collateralizationRatio))?'text-success':'text-danger'}
                                    value={((this.state.ratio !== Infinity)&&(this.state.ratio>0))?numbro(this.state.ratio).format({mantissa:6}):'Not available'}
                                    disabled={true}
                                />
                                <FormFeedback invalid>Collateralization ratio is danger! It must be greater than {collateralizationRatio}</FormFeedback>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggle} disabled={!((this.state.ratio !== Infinity) && (this.state.ratio>1.5))}><T>cdp.create</T></Button>{' '}
                        <Button color="secondary" onClick={this.toggle}><T>common.cancel</T></Button>
                    </ModalFooter>
                </Modal>
            </div>
        }

    }
}

CDP.propTypes = {
    id: PropTypes.number,
    owner: PropTypes.string,
    collateral: PropTypes.array,
    principal: PropTypes.array,
    accumulatedFees: PropTypes.array,
    feesUpdated: PropTypes.string,
    collateralValue: PropTypes.object,
    collateralizationRatio: PropTypes.number
}