import React from 'react';

export const LoadMore = (props) => {
    if (props.show){
        return <div id="loading" className="show" />
    }
    else{
        return <div id="loading" />
    }
}
