import { ImageProvider, ImageProviderResult } from "./types.js";
import * as dotenv from "dotenv";

dotenv.config();

export class UnsplashProvider implements ImageProvider {
    name: "unsplash" = "unsplash";

    async generateImage(prompt: string): Promise<ImageProviderResult | null> {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;
        if (!accessKey) {
            console.warn("Unsplash Access Key missing, skipping Unsplash.");
            return null;
        }

        const query = prompt.split(" ").slice(0, 5).join(" ");

        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
                headers: {
                    Authorization: `Client-ID ${accessKey}`,
                },
            });

            if (!response.ok) {
                console.warn(`Unsplash search failed: ${response.status}`);
                return null;
            }

            const data = await response.json();
            if (!data.results || data.results.length === 0) {
                return null;
            }

            const photo = data.results[0];
            return {
                imageUrl: photo.urls.regular,
                prompt: query,
                provider: "unsplash",
                meta: {
                    id: photo.id,
                    user: photo.user?.name,
                    link: photo.links?.html
                },
            };
        } catch (e) {
            console.error("Unsplash error:", e);
            return null;
        }
    }
}
