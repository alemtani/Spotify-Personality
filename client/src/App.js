import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Login from './Login';
import About from './About';
import Access from './Access';
import Dashboard from './Dashboard';
import Playlist from './Playlist';
import useAuth from './useAuth';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import { Navbar, Nav } from 'react-bootstrap';

const code = new URLSearchParams(window.location.search).get('code');

function App() {
  const accessToken = useAuth(code);

  return (
    <Router>
      <div>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand as={Link} to="/">Personality Test</Navbar.Brand>
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
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          <Route path="/playlists/:playlistId">
            {accessToken ? <Playlist accessToken={accessToken} /> : <Redirect to="/login" />}
          </Route>
          <Route path="/playlists">
            {accessToken ? <Dashboard accessToken={accessToken} /> : <Redirect to="/login" />}
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
