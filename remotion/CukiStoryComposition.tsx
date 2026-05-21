import {AbsoluteFill, Audio, Sequence} from "remotion";
import type {CukiProject} from "../lib/types";
import {getTotalSceneDuration} from "../lib/timing";
import {Scene} from "./Scene";

export function CukiStoryComposition({project}: {project: CukiProject}) {
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{backgroundColor: "#050611"}}>
      {project.audioUrl ? <Audio src={project.audioUrl} /> : null}
      {project.scenes.map((scene, index) => {
        const durationInFrames = Math.max(1, Math.round(scene.duration * project.fps));
        const from = currentFrame;
        currentFrame += durationInFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <Scene
              scene={scene}
              durationInFrames={durationInFrames}
              isFirst={index === 0}
              effectSpeed={project.effectSpeed ?? "normal"}
              transitionDuration={project.transitionDuration ?? 0.25}
              subtitleMode={project.subtitleMode ?? "full"}
            />
          </Sequence>
        );
      })}
      {project.scenes.length === 0 ? (
        <AbsoluteFill style={{alignItems: "center", justifyContent: "center", color: "white", fontSize: 64, fontWeight: 900}}>
          Add scenes to preview
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}

export function getProjectDurationInFrames(project: CukiProject) {
  return Math.max(1, Math.ceil(getTotalSceneDuration(project.scenes) * project.fps));
}
