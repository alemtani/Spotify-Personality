import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Login from './Login';
import Access from './Access';
import Dashboard from './Dashboard';
import useAuth from './useAuth';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
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
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

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
  );
}

export default App;
