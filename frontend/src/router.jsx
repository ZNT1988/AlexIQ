import { Routes, Route, Navigate } from 'react-router-dom';
import AlexChat from './pages/AlexChat';

/**
 * Router ultra-simplifié - AlexIQ partout
 */
const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<AlexChat />} />
      <Route path='/AlexChat' element={<AlexChat />} />
      <Route path='/alexchat' element={<AlexChat />} />
      <Route path='/chat' element={<AlexChat />} />
      {/* Toutes les autres routes mènent à AlexIQ */}
      <Route path='*' element={<AlexChat />} />
    </Routes>
  );
};

export default AppRouter;
