# Implemented Backend Features

## Core Generation Engine

- **URL Summarization**: Uses Perplexity (`sonar-pro`) to extract key insights from a given URL.
- **Post Generation**: Uses OpenAI (`gpt-4o`) to generate native posts for Twitter and LinkedIn.
- **Safety**: Hardcoded safe inputs and strict error handling to prevent crashes.

## Database Layer

- **Standalone Integration**: Uses Prisma ORM with a dedicated NeonDB PostgreSQL instance.
- **SocialPost Model**: Stores generated content with `sourceUrl`, `platform`, and timestamps.
- **Status Workflow**: Implements `PostStatus` enum (`draft`, `approved`, `posted`) for future-proof workflow management.

## Image Pipeline

- **Multi-Provider Architecture**: Supports OpenAI (DALL-E 3), Pexels, and Unsplash with tiered fallback.
- **SocialAsset Model**: Links images to posts via a one-to-many relationship (`SocialPost` -> `SocialAsset`).
- **Smart Metadata**: Stores provider credentials, original prompts, and technical metadata.
- **Accessibility**: Optional automatic Alt Text generation using `gpt-4o-mini`.

## Configuration & Control

- **Feature Flags**:
  - `ENABLE_IMAGE_GENERATION`: Toggle entire image pipeline.
  - `ENABLE_ALT_TEXT`: Toggle accessibility features.
- **Provider Ordering**: Configurable priority via `IMAGE_PROVIDER_ORDER`.
