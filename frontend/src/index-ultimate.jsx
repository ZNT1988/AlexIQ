import ReactDOM from 'react-dom/client';
import AlexUltimateInterface from './components/Alex/AlexUltimateInterface.jsx';
import './index.css';

// Page d'accueil pour Alex Ultimate 4.0
const AlexUltimatePage = () => {
  return (
    <div>
      <AlexUltimateInterface />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AlexUltimatePage />
);
