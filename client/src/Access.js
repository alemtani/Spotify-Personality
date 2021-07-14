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

import { Button, Container } from 'react-bootstrap';

export default function Access({ accessToken }) {
    return (
        <Container className="d-flex flex-column py-2 custom-container">
            <p>Give us your playlist and we'll try to guess your personality!</p>
            <Button variant="success" as={Link} to="/playlists">
                Select Playlist
            </Button>
            <h2 className="option-separator">
                <span className="separatorText">
                    OR
                </span>
            </h2>
            <Button variant="success" as={Link} to="/playlists/create">
                Create Playlist
            </Button>
        </Container>
    )
}