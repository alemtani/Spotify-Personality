import { useState } from 'react';
import axios from 'axios';
import {
    Link,
    Redirect
} from 'react-router-dom';

import { Button, Container } from 'react-bootstrap';

export default function Access({ accessToken }) {
    const [playlistId, setPlaylistId] = useState('');

    function handleCreate() {
        axios.post('http://localhost:3001/playlists', {
            accessToken: accessToken,
            name: 'My Playlist'
        })
        .then(res => {
            setPlaylistId(res.data.id);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }

    if (playlistId) {
        return <Redirect to={`/playlists/${playlistId}`} />
    }

    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <Button variant="success" as={Link} to="/playlists">
                Select Playlist
            </Button>
            <h2 className="option-separator">
                <span className="separatorText">
                    OR
                </span>
            </h2>
            <Button variant="success" onClick={handleCreate}>
                Create Playlist
            </Button>
        </Container>
    )
}