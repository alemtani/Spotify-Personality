import React from 'react';
import logo from './spotify.png';

export default function Header() {
    return (
        <div style={{textAlign: 'center'}}>
            <img src={logo} alt='Spotify' style={{width: '64px', height: 'auto', float: 'left'}} />
            <h1>Spotify Personality Test</h1>
        </div>
    );
}