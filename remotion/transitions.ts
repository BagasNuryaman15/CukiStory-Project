import {interpolate} from "remotion";
import type {TransitionType} from "../lib/types";

export function getTransitionStyle(transition: TransitionType, frame: number, durationInFrames: number, hasNextScene: boolean, transitionFrames = 10): React.CSSProperties {
  const frames = Math.max(1, Math.min(transitionFrames, Math.floor(durationInFrames / 2)));
  const exitProgress = clamp((durationInFrames - 1 - frame) / frames);
  if (!hasNextScene) {
    return {};
  }

  switch (transition) {
    case "fade":
      return {opacity: exitProgress};
    case "slideLeft":
      return {transform: `translateX(${interpolate(exitProgress, [0, 1], [-100, 0])}%)`};
    case "slideRight":
      return {transform: `translateX(${interpolate(exitProgress, [0, 1], [100, 0])}%)`};
    case "zoomPop": {
      const scale = interpolate(exitProgress, [0, 0.72, 1], [1.08, 0.96, 1]);
      return {opacity: exitProgress, transform: `scale(${scale})`};
    }
    case "blurSmash":
      return {
        opacity: exitProgress,
        filter: `blur(${interpolate(exitProgress, [0, 1], [18, 0])}px)`,
        transform: `scale(${interpolate(exitProgress, [0, 1], [1.12, 1])})`,
      };
    case "hardCut":
    case "none":
    case "dipToBlack":
    case "flashCut":
    default:
      return {};
  }
}

export function getTransitionOverlay(transition: TransitionType, frame: number, durationInFrames: number, hasNextScene: boolean, transitionFrames = 10): React.CSSProperties | null {
  const frames = Math.max(1, Math.min(transitionFrames, Math.floor(durationInFrames / 2)));
  if (!hasNextScene) {
    return null;
  }
  const exit = 1 - clamp((durationInFrames - 1 - frame) / frames);

  if (transition === "dipToBlack") {
    return {
      backgroundColor: "black",
      opacity: exit,
    };
  }

  if (transition === "flashCut") {
    return {
      backgroundColor: "white",
      opacity: Math.max(0, exit - 0.25) * 1.3,
      mixBlendMode: "screen",
    };
  }

  return null;
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}
