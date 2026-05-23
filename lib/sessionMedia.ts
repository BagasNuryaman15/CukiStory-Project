import type {CukiProject} from "./types";

type ProjectSessionMedia = {
  audioUrl: string | null;
  audioDuration: number | null;
  sceneImages: Map<string, string>;
};

const sessionMediaByProject = new Map<string, ProjectSessionMedia>();

export function storeProjectAudioSessionMedia(projectId: string, audioUrl: string, audioDuration: number | null) {
  const media = getOrCreateProjectSessionMedia(projectId);
  media.audioUrl = audioUrl;
  media.audioDuration = audioDuration;
}

export function clearProjectAudioSessionMedia(projectId: string) {
  const media = sessionMediaByProject.get(projectId);
  if (!media) return;
  media.audioUrl = null;
  media.audioDuration = null;
}

export function getProjectAudioSessionMedia(projectId: string) {
  const media = sessionMediaByProject.get(projectId);
  if (!media?.audioUrl) return null;
  return {
    audioUrl: media.audioUrl,
    audioDuration: media.audioDuration,
  };
}

export function storeSceneImageSessionMedia(projectId: string, sceneId: string, imageUrl: string) {
  getOrCreateProjectSessionMedia(projectId).sceneImages.set(sceneId, imageUrl);
}

export function clearSceneImageSessionMedia(projectId: string, sceneId: string) {
  sessionMediaByProject.get(projectId)?.sceneImages.delete(sceneId);
}

export function getSceneImageSessionMedia(projectId: string, sceneId: string) {
  return sessionMediaByProject.get(projectId)?.sceneImages.get(sceneId) ?? null;
}

export function rehydrateProjectSessionMedia(project: CukiProject): CukiProject {
  const media = sessionMediaByProject.get(project.id);
  if (!media) return project;

  return {
    ...project,
    audioUrl: media.audioUrl ?? project.audioUrl,
    audioDuration: media.audioUrl ? media.audioDuration : project.audioDuration,
    scenes: project.scenes.map((scene) => ({
      ...scene,
      imageUrl: media.sceneImages.get(scene.id) ?? scene.imageUrl,
    })),
  };
}

export function clearProjectSessionMedia(projectId: string) {
  sessionMediaByProject.delete(projectId);
}

function getOrCreateProjectSessionMedia(projectId: string): ProjectSessionMedia {
  const existing = sessionMediaByProject.get(projectId);
  if (existing) return existing;

  const media: ProjectSessionMedia = {
    audioUrl: null,
    audioDuration: null,
    sceneImages: new Map(),
  };
  sessionMediaByProject.set(projectId, media);
  return media;
}
