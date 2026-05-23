import {AbsoluteFill, Audio, Sequence} from "remotion";
import type {CukiProject} from "../lib/types";
import {getProjectTimelineDuration, getScenePlaybackTimings} from "../lib/timing";
import {Scene} from "./Scene";
import {SrtSubtitleTrack} from "./Subtitle";

export function CukiStoryComposition({project}: {project: CukiProject}) {
  const isSrtMode = project.audioMode === "fullVoSrt" && Boolean(project.srtCues?.length);
  const playbackTimings = getScenePlaybackTimings(project);

  return (
    <AbsoluteFill style={{backgroundColor: "#050611"}}>
      {project.audioUrl ? <Audio src={project.audioUrl} /> : null}
      {playbackTimings.map(({scene, index, start, duration}) => {
        const durationInFrames = Math.max(1, Math.round(duration * project.fps));
        const from = Math.round(start * project.fps);
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
