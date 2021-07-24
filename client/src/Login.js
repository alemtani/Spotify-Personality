import { useState } from 'react';
import Error from './Error';
import axios from 'axios';
import { Button, Container } from 'react-bootstrap';

export default function Login() {
    const [error, setError] = useState(null);

    function handleLogin() {
        axios.get('/api/login')
        .then(res => {
            window.location = res.data.authorizeURL;
        })
        .catch(err => {
            setError(err);
        })
    }

    if (error) {
        return <Error error={error}/>;
    }

    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <Button className="btn btn-success btn-lg" onClick={handleLogin}>
                Login With Spotify
            </Button>
        </Container>
    );
}