import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const VoiceStateContext = createContext();

export const useVoiceState = () => {
  const context = useContext(VoiceStateContext);
  if (!context) {
    throw new Error('useVoiceState must be used within a VoiceStateProvider');
  }
  return context;
};

export const VoiceStateProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Vérifier le support de l'API Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) { setIsSupported(true);

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          ; return; } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
        setInterimTranscript(interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        logger.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Actions mémorisées
  const actions = useMemo(() => ({
    startListening: useCallback(() => {
      if (recognitionRef.current && isSupported && !isListening) {
        setTranscript('');
        setInterimTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      }
    }, [isSupported, isListening])
    stopListening: useCallback(() => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }, [isListening])
    clearTranscript: useCallback(() => {
      setTranscript('');
      setInterimTranscript('');
    }, [])
    setTranscript: useCallback((value) => {
      if (typeof value === 'function') {
        setTranscript(value);
      } else {
        setTranscript(value);
      }
    }, [])
  }), [isSupported, isListening]);

  // État calculé mémorisé
  const computedState = useMemo(() => ({
    hasTranscript: transcript.length > 0
    currentTranscript: transcript + interimTranscript
    isActive: isListening && isSupported
  }), [transcript, interimTranscript, isListening, isSupported]);

  const value = useMemo(() => ({
    // État
    isListening
    isSupported
    transcript
    interimTranscript
    ...computedState
    // Actions
    ...actions
  }), [isListening, isSupported, transcript, interimTranscript, computedState, actions]);

  return (
    <VoiceStateContext.Provider value={value}>
      {children}
    </VoiceStateContext.Provider>
  );
};