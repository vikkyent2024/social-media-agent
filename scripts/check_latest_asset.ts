import { db } from "../src/db/prisma.js";

async function main() {
    const asset = await db.socialAsset.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (asset) {
        console.log("Latest Asset:");
        console.log("ID:", asset.id);
        console.log("Provider:", asset.provider);
        console.log("Created At:", asset.createdAt);
        console.log("URL:", asset.imageUrl);

        // Check for OpenAI expiry
        if (asset.provider.includes("openai") || asset.imageUrl.includes("oaidalle")) {
            const createdTime = new Date(asset.createdAt).getTime();
            const now = new Date().getTime();
            const diffHours = (now - createdTime) / (1000 * 60 * 60);
            console.log(`Age: ${diffHours.toFixed(2)} hours`);
            if (diffHours > 1) {
                console.log("WARNING: OpenAI URLs typically expire after 1 hour.");
            }
        }
    } else {
        console.log("No assets found.");
    }
}

main().catch(console.error);
