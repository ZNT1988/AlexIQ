const crypto = require('crypto');
class PhotoPromptGenerator {
    constructor() {
        this.themes = {
            portrait: ['natural lighting'
      'golden hour'
      'dramatic shadows'
      'soft focus']
      landscape: ['wide angle'
      'panoramic'
      'misty morning'
      'sunset colors']
      street: ['candid moments'
      'urban geometry'
      'life in motion'
      'contrasts']
      macro: ['extreme closeup'
      'shallow depth'
      'intricate details'
      'textures']
      abstract: ['geometric patterns'
      'color theory'
      'minimalist'
      'experimental']
        };

        this.moods = ['mysterious', 'energetic', 'serene', 'dramatic', 'nostalgic', 'futuristic'];
        this.techniques = ['long exposure', 'double exposure', 'bokeh', 'silhouette', 'reflection'];
    }

    generatePrompt(category, options = {}) {
        const config = {
            complexity: options.complexity || 'medium'
            includeCamera: options.includeCamera || false
            includeLighting: options.includeLighting || true
            style: options.style || null
        };

        const baseThemes = this.themes[category] || this.themes.portrait;
        const selectedTheme = baseThemes[Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * baseThemes.length)];
        const selectedMood = this.moods[Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * this.moods.length)];
        const selectedTechnique = this.techniques[Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * this.techniques.length)];

        let prompt = `${selectedMood} ${category} photo with ${selectedTheme}`;

        if (config.complexity === 'high') {
            prompt += `, using ${selectedTechnique} technique`;
        }

        if (config.includeLighting) {
            const lighting = ['natural light', 'studio lighting', 'ambient light', 'dramatic lighting'];
            const selectedLighting = lighting[Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * lighting.length)];
            prompt += `, ${selectedLighting}`;
        }

        if (config.includeCamera) {
            const cameras = ['DSLR', 'mirrorless', 'film camera', 'professional setup'];
            const selectedCamera = cameras[Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * cameras.length)];
            prompt += `, shot with ${selectedCamera}`;
        }

        if (config.style) {
            prompt += `, in ${config.style} style`;
        }

        return {
            prompt: prompt
            category: category
            mood: selectedMood
            technique: selectedTechnique
            metadata: {
                complexity: config.complexity
                includedElements: {
                    camera: config.includeCamera
                    lighting: config.includeLighting
                    style: !!config.style
                }
            }
        };
    }

    generateMultiplePrompts(category, count = 5, options = {}) {
        const prompts = [];

        for (let i = 0; i < count; i++) {
            const prompt = this.generatePrompt(category, {
                ...options
                complexity: ['simple', 'medium', 'high'][i % 3]
            });
            prompts.push(prompt);
        }

        return {
            prompts: prompts
            category: category
            totalCount: count
        };
    }

    getCategories() {
        return Object.keys(this.themes);
    }

    customPrompt(elements) {
        const { subject, mood, lighting, technique, camera, style } = elements;

        let prompt = subject || 'photo';

        if (mood) prompt = `${mood} ${prompt}';
        if (lighting) prompt += ' with ${lighting}';
        if (technique) prompt += ' using ${technique}';
        if (camera) prompt += ' shot on ${camera}';
        if (style) prompt += ' in ${style} style`;

        return {
            prompt: prompt
            elements: elements
            custom: true
        };
    }
}

module.exports = PhotoPromptGenerator;