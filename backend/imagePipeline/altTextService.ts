import * as dotenv from "dotenv";

dotenv.config();

export async function generateAltText(imageUrl: string, context?: string): Promise<string | null> {
    if (process.env.ENABLE_ALT_TEXT !== "true") return null;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Use a cheaper model for this
                messages: [
                    {
                        role: "system",
                        content: "You are an accessibility expert. Generate a concise alt text (max 20 words) for the provided image, given the context.",
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `Context: ${context || "A social media post image"}` },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl,
                                    detail: "low"
                                }
                            }
                        ]
                    },
                ],
                max_tokens: 60,
            }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;

    } catch (e) {
        console.warn("Alt text generation failed:", e);
        return null;
    }
}
