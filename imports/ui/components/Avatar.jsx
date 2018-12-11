import React from 'react';

export default class Avatar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        avatar: ""
    }
  }

  componentDidMount(){
      if (this.props.identity == ""){
        this.setState({
            avatar: "https://ui-avatars.com/api/?rounded=true&size=128&name="+this.props.moniker
        })
      }
      else{
        fetch("https://keybase.io/_/api/1.0/user/lookup.json?key_suffix="+this.props.identity+"&fields=pictures")
        .then(response => response.json())
        .then(data => {
            if (data.them.length > 0){
                this.setState({avatar:data.them[0].pictures.primary.url});
            }
        });
      }
  }

  render() {
    return (
        <img src={this.state.avatar} className={this.props.list?'moniker-avatar-list img-fluid rounded-circle':'img-fluid rounded-circle'} />
    );
  }
}