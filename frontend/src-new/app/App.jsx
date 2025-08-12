/**
 * Application principale Alex Ultimate
 * Structure simplifiée et claire
 */
import { Routes, Route } from 'react-router-dom';
import Layout from '../shared/components/Layout';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import AlexChat from '../alex/components/AlexChat';
import '../alex/styles/alex.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/alex' element={<AlexChat />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
