import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Generator from '../pages/Generator';
import Calculator from '../pages/Calculator';
import TestIntegration from '../pages/TestIntegration';
import DemoShowcase from './Demo/DemoShowcase';

const MainApp = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className='min-h-screen bg-gray-50'>
      {!isHomePage && <Navigation />}
      <div className={isHomePage ? '' : 'pt-16'}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/generator' element={<Generator />} />
          <Route path='/calculator' element={<Calculator />} />
          <Route path='/test' element={<TestIntegration />} />
          <Route path='/demo' element={<DemoShowcase />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainApp;
