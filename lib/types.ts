export type ImageEffect =
  | "slowZoomIn"
  | "slowZoomOut"
  | "panLeft"
  | "panRight"
  | "panUp"
  | "panDown"
  | "punchZoom"
  | "subtleShake"
  | "dramaticShake"
  | "revealZoom"
  | "breathingZoom"
  | "none";

export type TransitionType =
  | "hardCut"
  | "fade"
  | "dipToBlack"
  | "flashCut"
  | "slideLeft"
  | "slideRight"
  | "zoomPop"
  | "blurSmash"
  | "none";

export type SubtitleStyle =
  | "cukiBoldMeme"
  | "yellowViralCaption"
  | "darkComicCaption"
  | "cinematicWhiteStroke"
  | "horrorWhisper"
  | "punchlinePop"
  | "comicBubble"
  | "cleanShorts";

export type MotionSpeed = "slow" | "normal" | "fast";

export type SubtitleMode = "full" | "wordByWord" | "karaoke";

export type SubtitleSize = "small" | "normal" | "large";

export type SubtitlePosition = "lowerThird" | "center" | "top";

export type TimingSource = "estimated" | "synced" | "manual";

export type CukiScene = {
  id: string;
  order: number;
  imageUrl: string | null;
  subtitle: string;
  duration: number;
  timingSource?: TimingSource;
  effect: ImageEffect;
  transition: TransitionType;
  subtitleStyle: SubtitleStyle;
};

export type CukiProject = {
  id: string;
  title: string;
  aspectRatio: "9:16";
  fps: 30;
  width: 1080;
  height: 1920;
  audioUrl: string | null;
  audioDuration: number | null;
  globalSubtitleStyle: SubtitleStyle;
  globalImageEffect: ImageEffect;
  globalTransition: TransitionType;
  effectSpeed: MotionSpeed;
  transitionDuration: number;
  subtitleMode: SubtitleMode;
  subtitleSize: SubtitleSize;
  subtitlePosition: SubtitlePosition;
  scenes: CukiScene[];
  createdAt: string;
  updatedAt: string;
};

export type TemplatePreset = {
  id: string;
  name: string;
  description: string;
  subtitleStyle: SubtitleStyle;
  effects: ImageEffect[];
  transitions: TransitionType[];
};
