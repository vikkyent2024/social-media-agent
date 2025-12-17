export interface ImageProviderResult {
    imageUrl: string;
    prompt: string;
    provider: "openai" | "pexels" | "unsplash";
    meta: any;
}

export interface ImagePipelineResult extends ImageProviderResult {
    altText?: string;
}

export interface ImageProvider {
    name: "openai" | "pexels" | "unsplash";
    generateImage(prompt: string): Promise<ImageProviderResult | null>;
}
