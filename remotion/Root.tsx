import {Composition} from "remotion";
import type {CukiProject} from "../lib/types";
import {CukiStoryComposition, getProjectDurationInFrames} from "./CukiStoryComposition";

const defaultProject: CukiProject = {
  id: "default",
  title: "CukiStory Preview",
  aspectRatio: "9:16",
  fps: 30,
  width: 1080,
  height: 1920,
  audioUrl: null,
  audioDuration: null,
  globalSubtitleStyle: "cukiBoldMeme",
  globalImageEffect: "slowZoomIn",
  globalTransition: "hardCut",
  effectSpeed: "normal",
  transitionDuration: 0.25,
  subtitleMode: "full",
  subtitleSize: "normal",
  subtitlePosition: "lowerThird",
  scenes: [
    {
      id: "default-scene",
      order: 1,
      imageUrl: null,
      subtitle: "Upload panels to start",
      duration: 3,
      effect: "slowZoomIn",
      transition: "hardCut",
      subtitleStyle: "cukiBoldMeme",
    },
  ],
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export function RemotionRoot() {
  return (
    <Composition
      id="CukiStoryVideo"
      component={CukiStoryComposition}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={90}
      defaultProps={{project: defaultProject}}
      calculateMetadata={({props}) => ({
        durationInFrames: getProjectDurationInFrames(props.project),
        fps: props.project.fps,
        width: props.project.width,
        height: props.project.height,
      })}
    />
  );
}
