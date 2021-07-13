import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Playlist from './Playlist';
import axios from 'axios';
import {
    Switch,
    Route,
    Link,
    useRouteMatch
  } from "react-router-dom";

import { Container } from 'react-bootstrap';

export default function Access({ accessToken }) {
    const [select, setSelect] = useState(false);
    const [create, setCreate] = useState(false);
    const [playlist, setPlaylist] = useState(null);

    function handleSelect() {
        setSelect(true);
        setCreate(false);
    }

    function handleCreate() {
        setSelect(false);
        setCreate(true);
    }

    useEffect(() => {
        if (!create) return;
        axios.post('http://localhost:3001/playlists', {
            accessToken: accessToken,
            name: 'My Playlist'
        })
        .then(res => {
            setPlaylist(res.data);
        })
        .catch(err => {
            console.log(err);
        });
    }, [accessToken, create])

    if (select) {
        return <Dashboard accessToken={accessToken} />
    }
    
    if (playlist) {
        return <Playlist accessToken={accessToken} playlist={playlist} created={true} key={playlist.id} />
    }

    return (
        
        <Container className="d-flex flex-column py-2 custom-container">
            <p>Give us your playlist and we'll try to guess your personality!</p>
            <button className="btn btn-success btn-lg" onClick={handleSelect}>
                Select Playlist
            </button>
            <h2 className="option-separator">
                <span className="separatorText">
                    OR
                </span>
            </h2>
            <button className="btn btn-success btn-lg" onClick={handleCreate}>
                Create Playlist
            </button>
        </Container>
    )
}