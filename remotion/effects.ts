import {interpolate, spring} from "remotion";
import type {ImageEffect, MotionSpeed} from "../lib/types";

export function getImageEffectStyle(effect: ImageEffect, frame: number, durationInFrames: number, fps: number, speed: MotionSpeed = "normal"): React.CSSProperties {
  const speedFactor = getSpeedFactor(speed);
  const adjustedFrame = frame * speedFactor;
  const progress = durationInFrames <= 1 ? 1 : clamp(adjustedFrame / Math.max(1, durationInFrames - 1));

  switch (effect) {
    case "slowZoomIn":
      return {transform: `scale(${interpolate(progress, [0, 1], [1, 1.12])})`};
    case "slowZoomOut":
      return {transform: `scale(${interpolate(progress, [0, 1], [1.12, 1])})`};
    case "panLeft":
      return {transform: `scale(1.08) translateX(${interpolate(progress, [0, 1], [3, -3])}%)`};
    case "panRight":
      return {transform: `scale(1.08) translateX(${interpolate(progress, [0, 1], [-3, 3])}%)`};
    case "panUp":
      return {transform: `scale(1.08) translateY(${interpolate(progress, [0, 1], [3, -3])}%)`};
    case "panDown":
      return {transform: `scale(1.08) translateY(${interpolate(progress, [0, 1], [-3, 3])}%)`};
    case "punchZoom": {
      const scale = 1 + spring({frame: adjustedFrame, fps, config: {damping: 14, stiffness: 180, mass: 0.7}}) * 0.1;
      return {transform: `scale(${Math.min(scale, 1.14)})`};
    }
    case "subtleShake": {
      const x = Math.sin(adjustedFrame * 0.9) * 4;
      const y = Math.cos(adjustedFrame * 0.7) * 3;
      return {transform: `scale(1.04) translate(${x}px, ${y}px)`};
    }
    case "dramaticShake": {
      const x = Math.sin(adjustedFrame * 1.7) * 12;
      const y = Math.cos(adjustedFrame * 1.3) * 10;
      const rotate = Math.sin(adjustedFrame * 0.8) * 0.8;
      return {transform: `scale(1.08) translate(${x}px, ${y}px) rotate(${rotate}deg)`};
    }
    case "revealZoom": {
      const scale = interpolate(progress, [0, 1], [1.05, 1.16]);
      const brightness = interpolate(progress, [0, 1], [0.78, 1.04]);
      return {transform: `scale(${scale})`, filter: `brightness(${brightness}) contrast(1.08)`};
    }
    case "breathingZoom": {
      const scale = 1.04 + Math.sin((adjustedFrame / fps) * Math.PI * 1.3) * 0.035;
      return {transform: `scale(${scale})`};
    }
    case "none":
    default:
      return {transform: "scale(1)"};
  }
}

function getSpeedFactor(speed: MotionSpeed) {
  if (speed === "slow") return 0.72;
  if (speed === "fast") return 1.45;
  return 1;
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}
