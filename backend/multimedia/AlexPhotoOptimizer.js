const sharp = require('sharp');
const fs = require('fs').promises;

class AlexPhotoOptimizer {
    constructor() {
        this.settings = {
            quality: 85
            maxWidth: 1920
            maxHeight: 1080
            format: 'jpeg'
        };
    }

    async optimizePhoto(inputPath, outputPath, options = {}) {
        const config = { ...this.settings, ...options };

        try {
            const image = sharp(inputPath);
            const metadata = await image.metadata();

            let pipeline = image;

            // Resize if needed
            if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
                pipeline = pipeline.resize(config.maxWidth, config.maxHeight, {
                    fit: 'inside'
                    withoutEnlargement: true
                });
            }

            // Enhance image
            pipeline = pipeline
                .sharpen()
                .normalize()
                .jpeg({ quality: config.quality });

            await pipeline.toFile(outputPath);

            return {
                success: true
                originalSize: metadata.size
                newSize: (await fs.stat(outputPath)).size
                dimensions: { width: metadata.width, height: metadata.height }
            };
        } catch (error) {
      // Logger fallback - ignore error
    };
        }
    }

    async batchOptimize(inputDir, outputDir, options = {}) {
        const files = await fs.readdir(inputDir);
        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png|webp)$/i.test(file)
        );

        const results = [];

        for (const _ of imageFiles) {
            const inputPath = `${inputDir}/${file}';
            const outputPath = '${outputDir}/${file}`;

            const result = await this.optimizePhoto(inputPath, outputPath, options);
            results.push({ file, ...result });
        }

        return results;
    }
}

module.exports = AlexPhotoOptimizer;