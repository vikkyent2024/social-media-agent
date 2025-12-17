# Image Pipeline Architecture Design

## Overview

This document outlines the design for the stand-alone Image Generation Pipeline for the Social Media Agent. The pipeline generates or fetches images for social media posts and stores them as assets in the database.

## 1. Asset Model (`SocialAsset`)

We introduce a new `SocialAsset` model in Prisma to store image metadata linked to a `SocialPost`.

- **Relationship**: One-to-Many (`SocialPost` -> `SocialAsset`).
- **Fields**:
  - `id`: UUID.
  - `postId`: Foreign Key to `SocialPost`.
  - `type`: 'image' (extensible to 'video' later).
  - `provider`: 'openai', 'pexels', 'unsplash'.
  - `prompt`: The prompt used for generation (if AI).
  - `imageUrl`: Public URL of the asset.
  - `altText`: Accessibility text (optional).
  - `meta`: JSON field for provider-specific data (e.g., Unsplash author attribution, raw API response IDs).

## 2. Provider Strategy

The pipeline uses a tiered fallback strategy defined by `IMAGE_PROVIDER_ORDER`.

1. **OpenAI (DALL-E 3)**: Primary AI generation. High quality, higher cost.
    - *Fallback*: If it fails (rate limit, error), proceed to next.
2. **Pexels**: Tier-1 Stock photos. Free, high quality.
    - *Query*: Derived from post content/summary.
3. **Unsplash**: Tier-2 Stock photos. Large library.

## 3. Error Handling

- **Graceful Failure**: If all providers fail, the post remains in 'draft' without an image. The script logs the error but does not crash.
- **Missing Keys**: If a provider is enabled but keys are missing, it is skipped with a warning.

## 4. Extensibility

- **Video**: `type` field allows future expansion to video generation providers (e.g., Runway, Sora).
- **Carousel**: The one-to-many relationship supports attaching multiple assets to a single post for carousels.

## 5. Multi-tenancy & Standalone

- **Design**: The pipeline functionality is encapsulated in `backend/imagePipeline` and strictly relies on inputs (post text, IDs), not global state.
- **Database**: Uses Prisma/Postgres (NeonDB) independently.
- **Auth**: N/A for now, but `SocialPost` could easily be extended with `userId` or `orgId`.

## 6. Alt Text

- If `ENABLE_ALT_TEXT` is true, a lightweight LLM call (OpenAI) generates descriptive alt text for accessibility and SEO.
