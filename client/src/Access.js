import { useState } from 'react';
import Error from './Error';
import axios from 'axios';
import {
    Link,
    Redirect
} from 'react-router-dom';

import { Button, Container } from 'react-bootstrap';

export default function Access({ accessToken }) {
    const [error, setError] = useState(null);
    const [playlistId, setPlaylistId] = useState('');

    // Creates new playlist to access
    function handleCreate() {
        axios.post('/api/playlists', {
            accessToken: accessToken,
            name: 'My Playlist'
        })
        .then(res => {
            setPlaylistId(res.data.id);
        })
        .catch(err => {
            setError(err);
        });
    }

    if (error) {
        return <Error error={error}/>;
    }

    if (playlistId) {
        return <Redirect to={`/playlists/${playlistId}`} />
    }

    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <div className="info">
                <Button variant="success" as={Link} to="/playlists" className="button">
                    Select Playlist
                </Button>
                <div className="header separator">
                    OR
                </div>
                <Button variant="success" as={Link} to="/" onClick={handleCreate} className="button">
                    Create Playlist
                </Button>
            </div>
        </Container>
    )
}