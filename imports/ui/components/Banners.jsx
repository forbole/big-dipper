import React from 'react';
import { HTTP } from 'meteor/http'
import { Container, Row, Col } from 'reactstrap';

export default class Banners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            banners: []
        }
    }
    componentDidMount(){
        const url = this.props.url;
        HTTP.get(url, (error, result) => {
            if (result.statusCode == 200){
                let banners = JSON.parse(result.content);
                if (banners.banners && (banners.banners.length > 0)){
                    this.setState({
                        banners: banners.banners
                    })
                }
            }
        })

    }

    render() {
        if (this.state.banners.length>0){
            const bannerIndex = Math.floor(Math.random()*this.state.banners.length);
            const banner = this.state.banners[bannerIndex];
            return (
                <Container fluid className="banner mb-3 text-center">
                    <Row>
                        <Col className="d-none d-xl-block"><a href={banner.url} rel="noreferrer" target="_blank"><img src={banner.images.lg} /></a></Col>
                        <Col className="d-none d-md-block d-xl-none"><a href={banner.url} rel="noreferrer" target="_blank"><img src={banner.images.md} /></a></Col>
                        <Col className="d-block d-md-none"><a href={banner.url} rel="noreferrer" target="_blank"><img src={banner.images.xs} /></a></Col>
                    </Row>
                </Container>
            );
    
        }
        else{
            return <div></div>
        }
    }
}