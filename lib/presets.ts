import type {ImageEffect, MotionSpeed, SubtitleMode, SubtitlePosition, SubtitleSize, SubtitleStyle, TemplatePreset, TransitionType} from "./types";

export const subtitleStyles: Array<{value: SubtitleStyle; label: string; description: string}> = [
  {value: "cukiBoldMeme", label: "Cuki Bold Meme", description: "Big white text, thick outline, comedy punch."},
  {value: "storyCaption", label: "Story Caption", description: "Smaller capitalized caption for narrative videos."},
  {value: "yellowViralCaption", label: "Yellow Viral Caption", description: "Bold yellow Shorts/TikTok caption."},
  {value: "darkComicCaption", label: "Dark Comic Caption", description: "White text in a translucent story box."},
  {value: "cinematicWhiteStroke", label: "Cinematic White Stroke", description: "Clean dramatic text with thin stroke."},
  {value: "horrorWhisper", label: "Horror Whisper", description: "Small eerie text with soft glow."},
  {value: "punchlinePop", label: "Punchline Pop", description: "Oversized pop style for jokes and reveals."},
  {value: "comicBubble", label: "Comic Bubble", description: "Rounded white bubble with black text."},
  {value: "cleanShorts", label: "Clean Shorts", description: "Minimal readable mobile caption."},
];

export const imageEffects: Array<{value: ImageEffect; label: string}> = [
  {value: "none", label: "None"},
  {value: "slowZoomIn", label: "Slow Zoom In"},
  {value: "slowZoomOut", label: "Slow Zoom Out"},
  {value: "panLeft", label: "Pan Left"},
  {value: "panRight", label: "Pan Right"},
  {value: "panUp", label: "Pan Up"},
  {value: "panDown", label: "Pan Down"},
  {value: "punchZoom", label: "Punch Zoom"},
  {value: "subtleShake", label: "Subtle Shake"},
  {value: "dramaticShake", label: "Dramatic Shake"},
  {value: "revealZoom", label: "Reveal Zoom"},
  {value: "breathingZoom", label: "Breathing Zoom"},
];

export const transitions: Array<{value: TransitionType; label: string}> = [
  {value: "none", label: "None"},
  {value: "hardCut", label: "Hard Cut"},
  {value: "fade", label: "Fade"},
  {value: "dipToBlack", label: "Dip To Black"},
  {value: "flashCut", label: "Flash Cut"},
  {value: "slideLeft", label: "Slide Left"},
  {value: "slideRight", label: "Slide Right"},
  {value: "zoomPop", label: "Zoom Pop"},
  {value: "blurSmash", label: "Blur Smash"},
];

export const motionSpeeds: Array<{value: MotionSpeed; label: string; description: string}> = [
  {value: "slow", label: "Slow", description: "Calmer movement for dramatic stories."},
  {value: "normal", label: "Normal", description: "Balanced motion for most videos."},
  {value: "fast", label: "Fast", description: "Punchier motion for meme pacing."},
];

export const transitionDurations: Array<{value: number; label: string}> = [
  {value: 0.15, label: "0.15s"},
  {value: 0.25, label: "0.25s"},
  {value: 0.5, label: "0.5s"},
  {value: 0.75, label: "0.75s"},
  {value: 1, label: "1.0s"},
];

export const subtitleModes: Array<{value: SubtitleMode; label: string; description: string}> = [
  {value: "full", label: "Full subtitle", description: "Show timed subtitle chunks with a compact lower-third layout."},
  {value: "wordByWord", label: "Word-by-word reveal", description: "Show only one active word at a time."},
  {value: "karaoke", label: "Karaoke highlight", description: "Show the current chunk and highlight the active word."},
];

export const subtitleSizes: Array<{value: SubtitleSize; label: string}> = [
  {value: "small", label: "Small"},
  {value: "normal", label: "Normal"},
  {value: "large", label: "Large"},
];

export const subtitlePositions: Array<{value: SubtitlePosition; label: string}> = [
  {value: "lowerThird", label: "Lower third"},
  {value: "center", label: "Center"},
  {value: "top", label: "Top"},
];

export const templates: TemplatePreset[] = [
  {
    id: "cukiAbsurdComedy",
    name: "Cuki Absurd Comedy",
    description: "Punchy meme pacing with bold comedy captions.",
    subtitleStyle: "cukiBoldMeme",
    effects: ["slowZoomIn", "punchZoom", "subtleShake", "breathingZoom"],
    transitions: ["hardCut", "flashCut", "zoomPop"],
  },
  {
    id: "storyNarration",
    name: "Story Narration",
    description: "Readable capitalized captions with calm panel motion.",
    subtitleStyle: "storyCaption",
    effects: ["slowZoomOut", "panLeft", "panRight", "slowZoomIn"],
    transitions: ["hardCut", "fade"],
  },
  {
    id: "darkComicStory",
    name: "Dark Comic Story",
    description: "Moody panel movement for dramatic storytelling.",
    subtitleStyle: "darkComicCaption",
    effects: ["slowZoomIn", "slowZoomOut", "panLeft", "panRight"],
    transitions: ["fade", "dipToBlack"],
  },
  {
    id: "horrorMystery",
    name: "Horror Mystery",
    description: "Slow reveals, unsettling captions, darker transitions.",
    subtitleStyle: "horrorWhisper",
    effects: ["slowZoomIn", "revealZoom", "subtleShake"],
    transitions: ["dipToBlack", "fade", "blurSmash"],
  },
  {
    id: "fastMemeStoryboard",
    name: "Fast Meme Storyboard",
    description: "Fast cuts and viral captions for Shorts pacing.",
    subtitleStyle: "yellowViralCaption",
    effects: ["punchZoom", "subtleShake", "breathingZoom"],
    transitions: ["hardCut", "flashCut", "zoomPop"],
  },
  {
    id: "cleanShorts",
    name: "Clean Shorts",
    description: "Simple readable style for broad storytelling.",
    subtitleStyle: "cleanShorts",
    effects: ["slowZoomIn", "slowZoomOut"],
    transitions: ["hardCut", "fade"],
  },
];
