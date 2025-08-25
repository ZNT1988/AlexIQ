const SharedDreamingEngine = {
  startDreamSession: (participants, dreamType = 'collaborative') => {
    return {
      sessionId: Date.now(),
      participants: participants,
      dreamType: dreamType,
      status: 'active',
      timestamp: Date.now()
    };
  },

  endDreamSession: (sessionId) => {
    return {
      sessionId: sessionId,
      status: 'ended',
      summary: 'Session terminée'
    };
  }
};

module.exports = SharedDreamingEngine;