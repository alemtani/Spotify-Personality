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
                            <li>This is a third party site and is not in any way associated with Spotify.</li>
                            <li>Because this website is in development mode, email me <a href="mailto: alemtani@gmail.com">alemtani@gmail.com</a> your Spotify profile email to use this application.</li>
                            <li>Most likely, the server will restart when you open the application and you will need to wait up to five minutes before you can get a personality type for a playlist.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Container>
    )
}