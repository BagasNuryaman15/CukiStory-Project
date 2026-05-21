import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from "remotion";
import type {CukiScene, MotionSpeed, SubtitleMode, SubtitlePosition, SubtitleSize} from "../lib/types";
import {getImageEffectStyle} from "./effects";
import {Subtitle} from "./Subtitle";
import {getTransitionOverlay, getTransitionStyle} from "./transitions";

export function Scene({
  scene,
  durationInFrames,
  isFirst,
  effectSpeed,
  transitionDuration,
  subtitleMode,
  subtitleSize,
  subtitlePosition,
}: {
  scene: CukiScene;
  durationInFrames: number;
  isFirst: boolean;
  effectSpeed: MotionSpeed;
  transitionDuration: number;
  subtitleMode: SubtitleMode;
  subtitleSize: SubtitleSize;
  subtitlePosition: SubtitlePosition;
}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const transitionFrames = Math.max(1, Math.round(transitionDuration * fps));
  const effectStyle = getImageEffectStyle(scene.effect, frame, durationInFrames, fps, effectSpeed);
  const transitionStyle = getTransitionStyle(scene.transition, frame, durationInFrames, isFirst, transitionFrames);
  const overlay = getTransitionOverlay(scene.transition, frame, durationInFrames, isFirst, transitionFrames);

  return (
    <AbsoluteFill style={{backgroundColor: "#050611", overflow: "hidden", ...transitionStyle}}>
      {scene.imageUrl ? (
        <Img
          src={scene.imageUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...effectStyle,
          }}
        />
      ) : (
        <AbsoluteFill style={{alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #101326, #050611)"}}>
          <div style={{color: "rgba(255,255,255,0.6)", fontSize: 52, fontWeight: 800}}>Missing Image</div>
        </AbsoluteFill>
      )}
      {scene.subtitle.trim() ? (
        <Subtitle
          text={scene.subtitle}
          stylePreset={scene.subtitleStyle}
          mode={subtitleMode}
          size={subtitleSize}
          position={subtitlePosition}
          durationInFrames={durationInFrames}
        />
      ) : null}
      {overlay ? <AbsoluteFill style={{zIndex: 10, pointerEvents: "none", ...overlay}} /> : null}
    </AbsoluteFill>
  );
}
