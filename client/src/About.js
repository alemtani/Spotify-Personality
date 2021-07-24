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
                        Disclaimers 
                        <ul>
                            <li>This is a third party site in development mode and is not in any way associated with Spotify.</li>
                            <li>Because this is in development mode, email me at <a href="mailto: alemtani@gmail.com">alemtani@gmail.com</a> to use this site.</li>
                            <li>Be willing to wait at least a couple minutes for results (especially when dealing with long playlists).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Container>
    )
}