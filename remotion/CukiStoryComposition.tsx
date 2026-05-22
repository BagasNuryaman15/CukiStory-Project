import {AbsoluteFill, Audio, Sequence} from "remotion";
import type {CukiProject} from "../lib/types";
import {getProjectTimelineDuration} from "../lib/timing";
import {getSceneVisualTimings} from "../lib/srt";
import {Scene} from "./Scene";
import {SrtSubtitleTrack} from "./Subtitle";

export function CukiStoryComposition({project}: {project: CukiProject}) {
  let currentFrame = 0;
  const isSrtMode = project.audioMode === "fullVoSrt" && Boolean(project.srtCues?.length);
  const visualTimings = isSrtMode ? getSceneVisualTimings(project.scenes, project.srtCues) : [];

  return (
    <AbsoluteFill style={{backgroundColor: "#050611"}}>
      {project.audioUrl ? <Audio src={project.audioUrl} /> : null}
      {project.scenes.map((scene, index) => {
        const srtTiming = isSrtMode ? visualTimings[index] : null;
        const durationInFrames = Math.max(1, Math.round((srtTiming?.duration ?? scene.duration) * project.fps));
        const from = srtTiming ? Math.round(srtTiming.start * project.fps) : currentFrame;
        currentFrame = Math.max(currentFrame, from + durationInFrames);
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <Scene
              scene={scene}
              durationInFrames={durationInFrames}
              hasNextScene={index < project.scenes.length - 1}
              effectSpeed={project.effectSpeed ?? "normal"}
              transitionDuration={scene.transitionDuration ?? project.transitionDuration ?? 0.25}
              subtitleMode={project.subtitleMode ?? "full"}
              subtitleSize={project.subtitleSize ?? "normal"}
              subtitlePosition={project.subtitlePosition ?? "lowerThird"}
              showSubtitle={!isSrtMode}
            />
          </Sequence>
        );
      })}
      {isSrtMode ? (
        <SrtSubtitleTrack
          cues={project.srtCues ?? []}
          stylePreset={project.globalSubtitleStyle ?? "cukiBoldMeme"}
          mode={project.subtitleMode ?? "full"}
          size={project.subtitleSize ?? "normal"}
          position={project.subtitlePosition ?? "lowerThird"}
        />
      ) : null}
      {project.scenes.length === 0 ? (
        <AbsoluteFill style={{alignItems: "center", justifyContent: "center", color: "white", fontSize: 64, fontWeight: 900}}>
          Add scenes to preview
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}

export function getProjectDurationInFrames(project: CukiProject) {
  return Math.max(1, Math.ceil(getProjectTimelineDuration(project) * project.fps));
}
