import { ImageProvider, ImageProviderResult } from "./types.js";
import * as dotenv from "dotenv";

dotenv.config();

export class OpenAIImageProvider implements ImageProvider {
    name: "openai" = "openai";

    async generateImage(prompt: string): Promise<ImageProviderResult | null> {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("OpenAI API key missing, skipping OpenAI image generation.");
            return null;
        }

        try {
            const response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                    quality: "standard",
                    response_format: "url",
                }),
            });

            if (!response.ok) {
                console.warn(`OpenAI image generation failed: ${response.status} ${response.statusText}`);
                return null; // Fallback
            }

            const data = await response.json();
            const imageUrl = data.data?.[0]?.url;

            if (!imageUrl) return null;

            return {
                imageUrl,
                prompt,
                provider: "openai",
                meta: { revoked: data.data?.[0]?.revised_prompt },
            };
        } catch (e) {
            console.error("OpenAI image generation error:", e);
            return null;
        }
    }
}
