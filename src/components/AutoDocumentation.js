const AutoDocumentation = {
  generateDocs: (componentName, props) => {
    return {
      title: `Documentation ${componentName}`,
      description: `Configuration et utilisation du composant ${componentName}`,
      props: props || [],
      examples: []
    };
  },

  exportDocs: (docs) => {
    return JSON.stringify(docs, null, 2);
  }
};

module.exports = AutoDocumentation;