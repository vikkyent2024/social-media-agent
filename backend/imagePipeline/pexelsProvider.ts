import { ImageProvider, ImageProviderResult } from "./types.js";
import * as dotenv from "dotenv";

dotenv.config();

export class PexelsProvider implements ImageProvider {
    name: "pexels" = "pexels";

    async generateImage(prompt: string): Promise<ImageProviderResult | null> {
        const apiKey = process.env.PEXELS_API_KEY;
        if (!apiKey) {
            console.warn("Pexels API key missing, skipping Pexels.");
            return null;
        }

        // Pexels works best with shorter keywords, so we might want to truncate or summarize the prompt
        // For now, we take the first 5-6 words as a naive search query if the prompt is long
        const query = prompt.split(" ").slice(0, 6).join(" ");

        try {
            const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
                headers: {
                    Authorization: apiKey,
                },
            });

            if (!response.ok) {
                console.warn(`Pexels search failed: ${response.status}`);
                return null;
            }

            const data = await response.json();
            if (!data.photos || data.photos.length === 0) {
                return null;
            }

            const photo = data.photos[0];
            return {
                imageUrl: photo.src.large2x || photo.src.large,
                prompt: query,
                provider: "pexels",
                meta: {
                    id: photo.id,
                    photographer: photo.photographer,
                    url: photo.url,
                },
            };

        } catch (e) {
            console.error("Pexels error:", e);
            return null;
        }
    }
}
