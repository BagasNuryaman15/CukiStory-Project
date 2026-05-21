import {interpolate} from "remotion";
import type {TransitionType} from "../lib/types";

export function getTransitionStyle(transition: TransitionType, frame: number, durationInFrames: number, isFirst: boolean, transitionFrames = 10): React.CSSProperties {
  const frames = Math.max(1, Math.min(transitionFrames, Math.floor(durationInFrames / 2)));
  const enterProgress = isFirst ? 1 : clamp(frame / frames);
  const exitProgress = clamp((durationInFrames - frame) / frames);

  switch (transition) {
    case "fade":
      return {opacity: Math.min(enterProgress, exitProgress)};
    case "slideLeft":
      return {transform: `translateX(${interpolate(enterProgress, [0, 1], [100, 0])}%)`};
    case "slideRight":
      return {transform: `translateX(${interpolate(enterProgress, [0, 1], [-100, 0])}%)`};
    case "zoomPop": {
      const scale = interpolate(enterProgress, [0, 0.72, 1], [0.9, 1.06, 1]);
      return {opacity: enterProgress, transform: `scale(${scale})`};
    }
    case "blurSmash":
      return {
        opacity: enterProgress,
        filter: `blur(${interpolate(enterProgress, [0, 1], [18, 0])}px)`,
        transform: `scale(${interpolate(enterProgress, [0, 1], [1.12, 1])})`,
      };
    case "hardCut":
    case "none":
    case "dipToBlack":
    case "flashCut":
    default:
      return {};
  }
}

export function getTransitionOverlay(transition: TransitionType, frame: number, durationInFrames: number, isFirst: boolean, transitionFrames = 10): React.CSSProperties | null {
  const frames = Math.max(1, Math.min(transitionFrames, Math.floor(durationInFrames / 2)));
  const enter = isFirst ? 0 : 1 - clamp(frame / frames);
  const exit = 1 - clamp((durationInFrames - frame) / frames);

  if (transition === "dipToBlack") {
    return {
      backgroundColor: "black",
      opacity: Math.max(enter, exit),
    };
  }

  if (transition === "flashCut") {
    return {
      backgroundColor: "white",
      opacity: Math.max(0, Math.max(enter, exit) - 0.25) * 1.3,
      mixBlendMode: "screen",
    };
  }

  return null;
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}
