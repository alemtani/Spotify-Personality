import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Access from './Access';
import Dashboard from './Dashboard';
import Header from './Header';
import Footer from './Footer';

const code = new URLSearchParams(window.location.search).get('code');

function App() {
  return (
    <div>
      <Header />
      {code ? <Dashboard code={code} /> : <Login />}
      {/* {code ? <Access /> : <Login />} */}
      <Footer />
    </div>
  );
}

export default App;
