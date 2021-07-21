import { Container } from 'react-bootstrap';

export default function About() {
    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <div className="info">
                <div className="header">Spotify Personality Test</div>
                <div>Give us your playlist and we'll try to guess your personality!</div>
            </div>
        </Container>
    )
}