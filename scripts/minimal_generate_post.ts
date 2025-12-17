import * as dotenv from "dotenv";
import { imagePipeline } from "../backend/imagePipeline/index.js";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!OPENAI_API_KEY || !PERPLEXITY_API_KEY) {
    console.error(
        "Error: OPENAI_API_KEY and PERPLEXITY_API_KEY are required in .env",
    );
    process.exit(1);
}

const URL_TO_SUMMARIZE = "https://www.anthropic.com/news/claude-3-5-sonnet"; // Hardcoded safe URL

async function summarizeUrl(url: string) {
    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that summarizes web pages.",
                    },
                    {
                        role: "user",
                        content: `Please provide a concise summary of the following URL: ${url}. Focus on the key points provided in the content.`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Failed to summarize URL:", error);
        process.exit(1);
    }
}

async function generatePosts(summary: string) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a social media manager. Create engaging posts based on the provided summary.",
                    },
                    {
                        role: "user",
                        content: `Based on this summary:\n\n${summary}\n\nCreate two posts:\n1. A Twitter post (max 280 chars, engaging, hashtags).\n2. A LinkedIn post (professional, longer, hashtags).\n\nOutput format:\nTWITTER:\n<text>\n\nLINKEDIN:\n<text>`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(
                `OpenAI API error: ${response.status} ${response.statusText}`,
            );
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Failed to generate posts:", error);
        process.exit(1);
    }
}

import { db } from "../src/db/prisma.js";

// ... existing code ...

async function main() {
    console.log(`Summarizing URL: ${URL_TO_SUMMARIZE}...`);
    const summary = await summarizeUrl(URL_TO_SUMMARIZE);

    console.log("Generating posts...");
    const posts = await generatePosts(summary);

    console.log("\n---");
    console.log(posts);
    console.log("---\n");

    // Parse and save to DB
    try {
        const twitterMatch = posts.match(/TWITTER:\s*([\s\S]*?)(?=\n\nLINKEDIN:|$)/i);
        const linkedinMatch = posts.match(/LINKEDIN:\s*([\s\S]*)/i);

        if (twitterMatch && twitterMatch[1]) {
            const post = await db.socialPost.create({
                data: {
                    sourceUrl: URL_TO_SUMMARIZE,
                    platform: "twitter",
                    content: twitterMatch[1].trim(),
                    // Posts start as 'draft' to allow human review before publishing.
                    // Future Flow: draft -> approved (via UI) -> posted (via Cron Worker)
                    status: "draft"
                }
            });
            console.log("Saved Twitter draft to DB.");

            // Image Pipeline Integration
            if (process.env.ENABLE_IMAGE_GENERATION === "true") {
                const asset = await imagePipeline.generateImageForPost(post.content, "twitter", URL_TO_SUMMARIZE);
                if (asset) {
                    await db.socialAsset.create({
                        data: {
                            postId: post.id,
                            type: "image",
                            provider: asset.provider,
                            prompt: asset.prompt,
                            imageUrl: asset.imageUrl,
                            altText: asset.altText,
                            meta: asset.meta
                        }
                    });
                    console.log(`Image: ${asset.imageUrl}`);
                } else {
                    console.log("Image: skipped");
                }
            }
        }

        if (linkedinMatch && linkedinMatch[1]) {
            const post = await db.socialPost.create({
                data: {
                    sourceUrl: URL_TO_SUMMARIZE,
                    platform: "linkedin",
                    content: linkedinMatch[1].trim(),
                    // Posts start as 'draft' to allow human review before publishing.
                    // Future Flow: draft -> approved (via UI) -> posted (via Cron Worker)
                    status: "draft"
                }
            });
            console.log("Saved LinkedIn draft to DB.");

            // Image Pipeline Integration
            if (process.env.ENABLE_IMAGE_GENERATION === "true") {
                const asset = await imagePipeline.generateImageForPost(post.content, "linkedin", URL_TO_SUMMARIZE);
                if (asset) {
                    await db.socialAsset.create({
                        data: {
                            postId: post.id,
                            type: "image",
                            provider: asset.provider,
                            prompt: asset.prompt,
                            imageUrl: asset.imageUrl,
                            altText: asset.altText,
                            meta: asset.meta
                        }
                    });
                    console.log(`Image: ${asset.imageUrl}`);
                } else {
                    console.log("Image: skipped");
                }
            }
        }

    } catch (e) {
        console.error("Failed to save to DB (is DATABASE_URL set?):", e);
    }
}

main();
