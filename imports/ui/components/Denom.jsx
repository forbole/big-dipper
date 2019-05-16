import React from 'react';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

export const Denom = (props) => {
    if (props.denom == Meteor.settings.public.denomUnit){
        return <span>{numbro(props.amount/Meteor.settings.public.stakingFraction).format("0,0.00")} {Meteor.settings.public.stakingDenom}</span>
    }
    else{
        return <span>{numbro(props.amount).format("0,0.00")} {props.denom}</span>
    }
}        