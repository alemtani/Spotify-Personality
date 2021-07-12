import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import Login from './Login';
import Access from './Access';
import Header from './Header';

const code = new URLSearchParams(window.location.search).get('code');

function App() {
  return (
    <div>
      <Header />
      {code ? <Access code={code} /> : <Login />}
    </div>
  );
}

export default App;
