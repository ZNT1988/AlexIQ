import {
  AIAssistantProvider,
  useAIAssistant,
} from '../context/AIAssistantContext';
import MainApp from './MainApp';
import FloatingToggleButton from './FloatingToggleButton';
import AISidePanel from './AISidePanel';
import SimpleChatInterface from './Assistant/SimpleChatInterface';

const HFAlexRootContent = () => {
  const { preferences, setPreferences, clearMemory, isOpen } = useAIAssistant();
  return (
    <>
      {/* Main app content */}
      <MainApp />

      {/* Floating button to toggle chat */}
      <FloatingToggleButton />

      {/* Settings panel (separate from chat) */}
      <AISidePanel
        preferences={preferences}
        setPreferences={setPreferences}
        clearMemory={clearMemory}
      />

      {/* Chat interface overlay */}
      {isOpen && (
        <div className='fixed inset-0 z-50'>
          <SimpleChatInterface />
        </div>
      )}
    </>
  );
};

const HFAlexRoot = () => {
  return (
    <AIAssistantProvider>
      <HFAlexRootContent />
    </AIAssistantProvider>
  );
};

export default HFAlexRoot;
