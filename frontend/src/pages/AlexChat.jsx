import { AIAssistantProvider } from '../context/AIAssistantContext';
import AlexIQUltimateInterface from '../components/Assistant/AlexIQUltimateInterface';

/**
 * Page dédiée au chat avec AlexIQ - L'IA la plus avancée au monde
 */
function AlexChat() {
  return (
    <AIAssistantProvider>
      <AlexIQUltimateInterface />
    </AIAssistantProvider>
  );
}

export default AlexChat;