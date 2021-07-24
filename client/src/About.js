import { Container } from 'react-bootstrap';

export default function About() {
    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <div className="info">
                <div className="header">Spotify Personality Test</div>
                <div className="group">
                    <div>
                        Give us your playlist and we'll try to guess your personality!
                    </div>
                    <div className="text-muted">
                        Disclaimer: Be prepared to wait a couple of minutes for results, especially if you use long playlists.
                    </div>
                </div>
            </div>
        </Container>
    )
}