import React from 'react';
import logo from './spotify.png';
import Access from './Access';
import Dashboard from './Dashboard';
import Login from './Login';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import { Nav } from "react-bootstrap";

export default function Navbar({ accessToken }) {
    return (
        <Nav>

        </Nav>
    );
}

{/* <div style={{textAlign: 'center'}}>
            <img src={logo} alt='Spotify' style={{width: '64px', height: 'auto', float: 'left'}} />
            <h1>Spotify Personality Test</h1>
            <Router>
                <div>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/dashboard">Playlists</Link>
                            </li>
                        </ul>
                    </nav>

                    <Switch>
                        <Route path="/dashboard">
                            {accessToken ? <Dashboard accessToken={accessToken} /> : <Login />}
                        </Route>
                        <Route path="/">
                            {accessToken ? <Access accessToken={accessToken} /> : <Login />}
                        </Route>
                    </Switch>
                </div>
            </Router>
        </div> */}