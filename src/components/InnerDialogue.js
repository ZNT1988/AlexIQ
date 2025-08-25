const InnerDialogue = {
  startDialogue: (topic, context = {}) => {
    return {
      id: Date.now(),
      topic: topic,
      thoughts: [],
      context: context,
      status: 'active'
    };
  },

  addThought: (dialogue, thought) => {
    dialogue.thoughts.push({
      timestamp: Date.now(),
      content: thought
    });
    return dialogue;
  }
};

module.exports = InnerDialogue;