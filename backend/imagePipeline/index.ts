import { ImagePipelineResult, ImageProviderResult } from "./types.js";
import { OpenAIImageProvider } from "./openaiImageProvider.js";
import { PexelsProvider } from "./pexelsProvider.js";
import { UnsplashProvider } from "./unsplashProvider.js";
import { generateAltText } from "./altTextService.js";
import * as dotenv from "dotenv";

dotenv.config();

export class ImagePipeline {
    private providers: any[] = [];

    constructor() {
        const order = (process.env.IMAGE_PROVIDER_ORDER || "openai,pexels,unsplash").split(",");

        for (const name of order) {
            if (name.trim() === "openai") this.providers.push(new OpenAIImageProvider());
            if (name.trim() === "pexels") this.providers.push(new PexelsProvider());
            if (name.trim() === "unsplash") this.providers.push(new UnsplashProvider());
        }
    }

    async generateImageForPost(postContent: string, platform: string, sourceUrl?: string): Promise<ImagePipelineResult | null> {
        if (process.env.ENABLE_IMAGE_GENERATION !== "true") {
            return null; // Disabled by feature flag
        }

        // Determine prompt: use post content or summary of it
        // For simplicity, we use the first 20 words of the post content as a visual prompt base
        const prompt = postContent.split(" ").slice(0, 20).join(" ") + " high quality, professional";

        let result: ImageProviderResult | null = null;

        for (const provider of this.providers) {
            // console.log(`Trying image provider: ${provider.name}`);
            try {
                result = await provider.generateImage(prompt);
                if (result) break; // Success
            } catch (e) {
                console.warn(`Provider ${provider.name} threw error:`, e);
            }
        }

        if (!result) return null; // All providers failed

        // Generate Alt Text if enabled
        let altText: string | undefined;
        if (process.env.ENABLE_ALT_TEXT === "true") {
            const alt = await generateAltText(result.imageUrl, `Social media post for ${platform}: ${postContent}`);
            if (alt) altText = alt;
        }

        return {
            ...result,
            altText
        };
    }
}

export const imagePipeline = new ImagePipeline();
