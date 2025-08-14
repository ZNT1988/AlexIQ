import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import AlexChat from './pages/AlexChat';
import AISystemInterface from './components/AI/AISystemInterface';
import AlexModernChatPage from './pages/AlexModernChat';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/generator' element={<Generator />} />
      <Route path='/AlexChat' element={<AlexChat />} />
      <Route path='/ai-system' element={<AISystemInterface />} />
      <Route path='/alex' element={<AlexModernChatPage />} />
      <Route path='/chat' element={<AlexModernChatPage />} />
    </Routes>
  );
};

export default AppRouter;
