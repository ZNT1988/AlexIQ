import { AIAssistantProvider } from '../context/AIAssistantContext';
import ModernChatInterface from '../components/Assistant/ModernChatInterface';

/**
 * Page dédiée au chat avec AlexIQ - Interface moderne style OpenAI/Anthropic
 */
function AlexChat() {
  return (
    <AIAssistantProvider>
      <ModernChatInterface />
    </AIAssistantProvider>
  );
}

export default AlexChat;