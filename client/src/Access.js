import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Playlist from './Playlist';
import axios from 'axios';
import {
    Switch,
    Route,
    Link,
    Redirect,
    useRouteMatch
  } from "react-router-dom";

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
        <Container className="d-flex flex-column py-2 custom-container">
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