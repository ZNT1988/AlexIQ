import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AlexChat from './pages/AlexChat';
import ChatGPT from './pages/ChatGPT';

/**
 * Router simplifié pour AlexIQ
 */
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatGPT />} />
      <Route path="/home" element={<Home />} />
      <Route path="/AlexChat" element={<AlexChat />} />
      <Route path="/chat" element={<ChatGPT />} />
      <Route path="/chatgpt" element={<ChatGPT />} />
      <Route path="*" element={<ChatGPT />} />
    </Routes>
  );
};

export default AppRouter;
