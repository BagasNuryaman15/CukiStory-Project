import {interpolate, useCurrentFrame} from "remotion";
import {getSubtitleWords, getTimedIndex, splitSubtitleIntoChunks} from "../lib/subtitles";
import type {SubtitleMode, SubtitlePosition, SubtitleSize, SubtitleStyle} from "../lib/types";

type VisibleSubtitle = {
  text: string;
  words?: string[];
  activeWordIndex?: number;
};

export function Subtitle({
  text,
  stylePreset,
  mode,
  size,
  position,
  durationInFrames,
}: {
  text: string;
  stylePreset: SubtitleStyle;
  mode: SubtitleMode;
  size: SubtitleSize;
  position: SubtitlePosition;
  durationInFrames: number;
}) {
  const frame = useCurrentFrame();
  const pop = interpolate(Math.min(frame, 12), [0, 8, 12], [0.92, 1.06, 1]);
  const visible = getVisibleSubtitle(text, mode, frame, durationInFrames);
  const visibleText = visible.text;
  const fontScale = getSubtitleScale(visibleText, mode, size);
  if (!visibleText) return null;
  const karaokeWords = mode === "karaoke" ? visible.words : undefined;

  const container: React.CSSProperties = {
    position: "absolute",
    left: "8%",
    right: "8%",
    zIndex: 5,
    textAlign: "center",
    pointerEvents: "none",
    ...getPositionStyle(position, mode),
  };
  const base: React.CSSProperties = {
    boxSizing: "border-box",
    display: mode === "wordByWord" ? "inline-block" : "-webkit-box",
    WebkitBoxOrient: mode === "wordByWord" ? undefined : "vertical",
    WebkitLineClamp: mode === "wordByWord" ? undefined : 2,
    maxWidth: "100%",
    maxHeight: mode === "wordByWord" ? 170 : 184,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 900,
    lineHeight: mode === "wordByWord" ? 1.08 : 1.16,
    letterSpacing: 0,
    overflow: "hidden",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    whiteSpace: "normal",
    textWrap: "balance",
  };

  return (
    <div style={container}>
      <div style={{...base, ...subtitleStyle(stylePreset, mode, pop, fontScale)}}>
        {karaokeWords ? (
          karaokeWords.map((word, index) => (
            <span key={`${word}-${index}`} style={index === visible.activeWordIndex ? karaokeActiveStyle(stylePreset) : undefined}>
              {word}
              {index < karaokeWords.length - 1 ? " " : ""}
            </span>
          ))
        ) : (
          visibleText
        )}
      </div>
    </div>
  );
}

function getVisibleSubtitle(text: string, mode: SubtitleMode, frame: number, durationInFrames: number): VisibleSubtitle {
  if (mode === "wordByWord") {
    const words = getSubtitleWords(text);
    return {text: words[getTimedIndex(words.length, frame, durationInFrames)] ?? ""};
  }

  const chunks = splitSubtitleIntoChunks(text);
  const activeChunkIndex = getTimedIndex(chunks.length, frame, durationInFrames);
  const activeChunk = chunks[activeChunkIndex];
  if (!activeChunk) return {text: ""};

  if (mode === "karaoke") {
    const chunkStart = Math.floor((activeChunkIndex / Math.max(1, chunks.length)) * durationInFrames);
    const chunkEnd = Math.floor(((activeChunkIndex + 1) / Math.max(1, chunks.length)) * durationInFrames);
    const chunkFrames = Math.max(1, chunkEnd - chunkStart);
    const chunkFrame = Math.max(0, frame - chunkStart);
    return {
      text: activeChunk.text,
      words: activeChunk.words,
      activeWordIndex: getTimedIndex(activeChunk.words.length, chunkFrame, chunkFrames),
    };
  }

  return {text: activeChunk.text};
}

function getSubtitleScale(text: string, mode: SubtitleMode, size: SubtitleSize) {
  const sizeScale = {
    small: 0.88,
    normal: 1,
    large: 1.12,
  }[size];

  if (mode === "wordByWord") {
    if (text.length > 18) return 0.72 * sizeScale;
    if (text.length > 13) return 0.84 * sizeScale;
    if (text.length > 9) return 0.94 * sizeScale;
    return sizeScale;
  }

  const length = text.trim().length;
  if (length > 64) return 0.76 * sizeScale;
  if (length > 48) return 0.84 * sizeScale;
  if (length > 32) return 0.93 * sizeScale;
  return sizeScale;
}

function getPositionStyle(position: SubtitlePosition, mode: SubtitleMode): React.CSSProperties {
  if (position === "top") {
    return {top: mode === "wordByWord" ? 220 : 240};
  }

  if (position === "center") {
    return {top: "50%", transform: "translateY(-50%)"};
  }

  return {bottom: mode === "wordByWord" ? 210 : 190};
}

function scaled(size: number, scale: number) {
  return Math.round(size * scale);
}

function subtitleStyle(stylePreset: SubtitleStyle, mode: SubtitleMode, pop: number, fontScale: number): React.CSSProperties {
  const size = (full: number, word: number) => scaled(mode === "wordByWord" ? word : full, fontScale);

  switch (stylePreset) {
    case "cukiBoldMeme":
      return {
        color: "white",
        fontSize: size(74, 104),
        WebkitTextStroke: `${Math.max(5, scaled(mode === "wordByWord" ? 10 : 8, fontScale))}px black`,
        paintOrder: "stroke fill",
        textShadow: "0 12px 0 rgba(0,0,0,0.55), 0 22px 45px rgba(0,0,0,0.8)",
        textTransform: "uppercase",
      };
    case "yellowViralCaption":
      return {
        color: "#ffd51d",
        fontSize: size(68, 98),
        WebkitTextStroke: `${Math.max(5, scaled(mode === "wordByWord" ? 9 : 7, fontScale))}px black`,
        paintOrder: "stroke fill",
        textShadow: "0 10px 32px rgba(0,0,0,0.85)",
        textTransform: "uppercase",
      };
    case "darkComicCaption":
      return {
        color: "white",
        padding: mode === "wordByWord" ? "22px 34px" : "24px 34px",
        borderRadius: 18,
        background: "rgba(0,0,0,0.68)",
        fontSize: size(56, 84),
        letterSpacing: 0,
        boxShadow: "0 20px 55px rgba(0,0,0,0.55)",
      };
    case "cinematicWhiteStroke":
      return {
        color: "white",
        fontSize: size(62, 90),
        fontWeight: 800,
        WebkitTextStroke: `${Math.max(2, scaled(3, fontScale))}px black`,
        paintOrder: "stroke fill",
        textShadow: "0 10px 32px rgba(0,0,0,0.7)",
      };
    case "horrorWhisper":
      return {
        color: "rgba(255,255,255,0.88)",
        fontSize: size(52, 76),
        fontWeight: 700,
        letterSpacing: "0.04em",
        textShadow: "0 0 14px rgba(255,255,255,0.45), 0 12px 35px rgba(0,0,0,0.9)",
      };
    case "punchlinePop":
      return {
        color: "white",
        fontSize: size(74, 108),
        transform: `scale(${pop})`,
        WebkitTextStroke: `${Math.max(5, scaled(mode === "wordByWord" ? 10 : 8, fontScale))}px black`,
        paintOrder: "stroke fill",
        textShadow: "0 12px 0 rgba(255,79,216,0.55), 0 24px 45px rgba(0,0,0,0.75)",
        textTransform: "uppercase",
      };
    case "comicBubble":
      return {
        color: "#111",
        padding: mode === "wordByWord" ? "22px 34px" : "24px 34px",
        border: "7px solid #111",
        borderRadius: 24,
        background: "white",
        fontSize: size(54, 84),
        boxShadow: "0 18px 0 rgba(0,0,0,0.35)",
      };
    case "cleanShorts":
    default:
      return {
        color: "white",
        fontSize: size(62, 88),
        fontWeight: 800,
        textShadow: "0 8px 28px rgba(0,0,0,0.85)",
      };
  }
}

function karaokeActiveStyle(stylePreset: SubtitleStyle): React.CSSProperties {
  if (stylePreset === "comicBubble") return {color: "#e11d48"};
  if (stylePreset === "yellowViralCaption") return {color: "white"};
  return {color: "#ffd51d"};
}
