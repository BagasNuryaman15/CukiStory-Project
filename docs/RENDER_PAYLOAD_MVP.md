# Render Payload MVP Note

CukiStory currently renders MP4 by posting the full project object from the browser to `/api/render`.

This keeps the MVP local-first and simple, but it means session media such as VO audio data URLs and scene image data URLs are included in the render request payload. Metadata still stays safe: large media is stripped from `localStorage`, and exported project JSON omits session-only audio/image data.

## Current tradeoff

- Good enough for personal MVP usage with normal short-form projects.
- Fragile for very large audio files or many high-resolution scene images.
- Render can fail before Remotion starts if the browser, local server, or deployment environment rejects a large JSON request.

## Current guardrail

The Render panel estimates the request payload size and shows a non-blocking warning when it is large. If the request fails or the API returns a payload-size style error, the UI explains that large audio/images may be the cause.

## Future direction

Do not solve this with cloud storage until the manual production workflow proves it needs it. If this becomes a real bottleneck, evaluate a local-first media handoff such as file handles or IndexedDB before introducing remote storage.
