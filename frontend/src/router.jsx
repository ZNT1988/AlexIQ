import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AlexChat from './pages/AlexChat';

/**
 * Router simplifié pour AlexIQ
 */
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/AlexChat" element={<AlexChat />} />
      <Route path="/chat" element={<AlexChat />} />
      <Route path="*" element={<AlexChat />} />
    </Routes>
  );
};

export default AppRouter;
