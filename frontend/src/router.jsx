import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AlexChat from './pages/AlexChat';

/**
 * Router simplifié - Focus sur AlexIQ Ultimate
 */
const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/AlexChat' element={<AlexChat />} />
      {/* Toutes les autres routes redirigent vers AlexChat */}
      <Route path='*' element={<Navigate to="/AlexChat" replace />} />
    </Routes>
  );
};

export default AppRouter;
