import {AbsoluteFill, Audio, Sequence} from "remotion";
import type {CukiProject} from "../lib/types";
import {getTotalSceneDuration} from "../lib/timing";
import {getSceneSrtTiming, getSrtDuration} from "../lib/srt";
import {Scene} from "./Scene";
import {SrtSubtitleTrack} from "./Subtitle";

export function CukiStoryComposition({project}: {project: CukiProject}) {
  let currentFrame = 0;
  const isSrtMode = project.audioMode === "fullVoSrt" && Boolean(project.srtCues?.length);

  return (
    <AbsoluteFill style={{backgroundColor: "#050611"}}>
      {project.audioUrl ? <Audio src={project.audioUrl} /> : null}
      {project.scenes.map((scene, index) => {
        const srtTiming = isSrtMode ? getSceneSrtTiming(scene, project.srtCues) : null;
        const durationInFrames = Math.max(1, Math.round((srtTiming?.duration ?? scene.duration) * project.fps));
        const from = srtTiming ? Math.round(srtTiming.start * project.fps) : currentFrame;
        if (!srtTiming) currentFrame += durationInFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <Scene
              scene={scene}
              durationInFrames={durationInFrames}
              isFirst={index === 0}
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
  if (project.audioMode === "fullVoSrt") {
    const mappedSceneEnd = Math.max(0, ...project.scenes.map((scene) => getSceneSrtTiming(scene, project.srtCues)?.end ?? 0));
    const duration = Math.max(project.audioDuration ?? 0, getSrtDuration(project.srtCues), mappedSceneEnd, getTotalSceneDuration(project.scenes));
    return Math.max(1, Math.ceil(duration * project.fps));
  }

  return Math.max(1, Math.ceil(getTotalSceneDuration(project.scenes) * project.fps));
}
