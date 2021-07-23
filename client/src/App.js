import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import About from './About';
import Access from './Access';
import Dashboard from './Dashboard';
import Login from './Login';
import Playlist from './Playlist';
import Profile from './Profile';
import useAuth from './useAuth';
import logo from './logo.jpg';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';

const code = new URLSearchParams(window.location.search).get('code');

function App() {
  const accessToken = useAuth(code);

  // Navbar allows navigation across app
  // Can go to most pages as long as logged in
  return (
    <Router>
      <div>
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
          <Container>
            <Navbar.Brand as={Link} to="/">
              <img 
                alt="Spotify"
                src={logo}
                className="d-inline-block logo"
              />{' '}
              Personality
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Item>
                  <Nav.Link as={Link} to="/">Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/about">About</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/playlists">Dashboard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Switch>
          <Route path="/playlists/:playlistId">
            {accessToken ? <Playlist accessToken={accessToken} /> : <Redirect to="/login" />}
          </Route>
          <Route path="/playlists">
            {accessToken ? <Dashboard accessToken={accessToken} /> : <Redirect to="/login" />}
          </Route>
          <Route path="/profile">
            {accessToken ? <Profile accessToken={accessToken} /> : <Redirect to="/login" />}
          </Route>
          <Route path="/login">
            {accessToken ? <Redirect to="/" /> : <Login />}
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/">
            {accessToken ? <Access accessToken={accessToken} /> : <Redirect to="/login" />}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
