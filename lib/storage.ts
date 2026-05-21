"use client";

import type {CukiProject, CukiScene, ImageEffect, SubtitleStyle, TransitionType} from "./types";
import {createId, reorderScenes} from "./utils";

const STORAGE_KEY = "cukistory.projects.v1";

export function getProjects(): CukiProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const projects = (JSON.parse(raw) as CukiProject[]).map(normalizeProject);
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export function getProject(id: string) {
  return getProjects().find((project) => project.id === id) ?? null;
}

export function saveProject(project: CukiProject) {
  if (typeof window === "undefined") return project;
  const projects = getProjects();
  const updatedProject = normalizeProject({...project, scenes: reorderScenes(project.scenes), updatedAt: new Date().toISOString()});
  const storageProject = stripLargeSessionFiles(updatedProject);
  const nextProjects = projects.some((item) => item.id === project.id)
    ? projects.map((item) => (item.id === project.id ? storageProject : item))
    : [storageProject, ...projects];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects.map(stripLargeSessionFiles)));
  return updatedProject;
}

export function updateProject(project: CukiProject) {
  return saveProject(project);
}

export function deleteProject(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getProjects().filter((project) => project.id !== id)));
}

export function createProject(title: string) {
  const now = new Date().toISOString();
  const project: CukiProject = {
    id: createId("project"),
    title: title.trim() || "Untitled CukiStory",
    aspectRatio: "9:16",
    fps: 30,
    width: 1080,
    height: 1920,
    audioMode: "fullVoEstimated",
    audioUrl: null,
    audioDuration: null,
    srtCues: [],
    srtFileName: null,
    globalSubtitleStyle: "cukiBoldMeme",
    globalImageEffect: "slowZoomIn",
    globalTransition: "hardCut",
    effectSpeed: "normal",
    transitionDuration: 0.25,
    subtitleMode: "full",
    subtitleSize: "normal",
    subtitlePosition: "lowerThird",
    scenes: [],
    createdAt: now,
    updatedAt: now,
  };
  return saveProject(project);
}

export function createScene(
  order: number,
  defaults?: {
    subtitleStyle?: SubtitleStyle;
    transition?: TransitionType;
    effect?: ImageEffect;
  },
): CukiScene {
  return {
    id: createId("scene"),
    order,
    imageUrl: null,
    subtitle: "",
    duration: 3,
    timingSource: "estimated",
    note: "",
    srtCueStartIndex: null,
    srtCueEndIndex: null,
    manualDurationOverride: false,
    effect: defaults?.effect ?? "slowZoomIn",
    transition: defaults?.transition ?? "hardCut",
    transitionDuration: 0.25,
    subtitleStyle: defaults?.subtitleStyle ?? "cukiBoldMeme",
  };
}

function normalizeProject(project: CukiProject): CukiProject {
  return {
    ...project,
    aspectRatio: "9:16",
    fps: 30,
    width: 1080,
    height: 1920,
    audioMode: project.audioMode ?? "fullVoEstimated",
    globalSubtitleStyle: project.globalSubtitleStyle ?? "cukiBoldMeme",
    srtCues: project.srtCues ?? [],
    srtFileName: project.srtFileName ?? null,
    globalImageEffect: project.globalImageEffect ?? "slowZoomIn",
    globalTransition: project.globalTransition ?? "hardCut",
    effectSpeed: project.effectSpeed ?? "normal",
    transitionDuration: project.transitionDuration ?? 0.25,
    subtitleMode: project.subtitleMode ?? "full",
    subtitleSize: project.subtitleSize ?? "normal",
    subtitlePosition: project.subtitlePosition ?? "lowerThird",
    scenes: reorderScenes(
      (project.scenes ?? []).map((scene) => ({
        ...scene,
        imageUrl: scene.imageUrl ?? null,
        subtitle: scene.subtitle ?? "",
        duration: Number.isFinite(scene.duration) ? scene.duration : 3,
        timingSource: scene.timingSource ?? "estimated",
        note: scene.note ?? "",
        srtCueStartIndex: scene.srtCueStartIndex ?? null,
        srtCueEndIndex: scene.srtCueEndIndex ?? null,
        manualDurationOverride: scene.manualDurationOverride ?? false,
        effect: scene.effect ?? "slowZoomIn",
        transition: scene.transition ?? project.globalTransition ?? "hardCut",
        transitionDuration: scene.transitionDuration ?? project.transitionDuration ?? 0.25,
        subtitleStyle: scene.subtitleStyle ?? project.globalSubtitleStyle ?? "cukiBoldMeme",
      })),
    ),
  };
}

function stripLargeSessionFiles(project: CukiProject): CukiProject {
  return {
    ...project,
    audioUrl: isLargeSessionUrl(project.audioUrl) ? null : project.audioUrl,
    scenes: project.scenes.map((scene) => ({
      ...scene,
      imageUrl: isLargeSessionUrl(scene.imageUrl) ? null : scene.imageUrl,
    })),
  };
}

function isLargeSessionUrl(value: string | null | undefined) {
  return Boolean(value && (/^(data|blob):/.test(value)));
}
