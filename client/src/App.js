import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Login from './Login';
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
                <Nav.Link as={Link} to="/playlists">Select</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/playlists/create">Create</Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          <Route path="/playlists/create">
            {accessToken ? <Playlist accessToken={accessToken} isCreated={true} /> : <Redirect to="/login" />}
          </Route>
          <Route path="/playlists/:playlistId">
            {accessToken ? <Playlist accessToken={accessToken} isCreated={false} /> : <Redirect to="/login" />}
          </Route>
          <Route path="/playlists">
            {accessToken ? <Dashboard accessToken={accessToken} /> : <Redirect to="/login" />}
          </Route>
          <Route path="/login">
            {accessToken ? <Redirect to="/" /> : <Login />}
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
