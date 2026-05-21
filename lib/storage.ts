"use client";

import type {CukiProject, CukiScene, SubtitleStyle, TransitionType} from "./types";
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
  const nextProjects = projects.some((item) => item.id === project.id)
    ? projects.map((item) => (item.id === project.id ? updatedProject : item))
    : [updatedProject, ...projects];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
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
    audioUrl: null,
    audioDuration: null,
    globalSubtitleStyle: "cukiBoldMeme",
    globalTransition: "hardCut",
    effectSpeed: "normal",
    transitionDuration: 0.25,
    subtitleMode: "full",
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
  },
): CukiScene {
  return {
    id: createId("scene"),
    order,
    imageUrl: null,
    subtitle: "",
    duration: 3,
    timingSource: "estimated",
    effect: "slowZoomIn",
    transition: defaults?.transition ?? "hardCut",
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
    globalSubtitleStyle: project.globalSubtitleStyle ?? "cukiBoldMeme",
    globalTransition: project.globalTransition ?? "hardCut",
    effectSpeed: project.effectSpeed ?? "normal",
    transitionDuration: project.transitionDuration ?? 0.25,
    subtitleMode: project.subtitleMode ?? "full",
    scenes: reorderScenes(
      (project.scenes ?? []).map((scene) => ({
        ...scene,
        imageUrl: scene.imageUrl ?? null,
        subtitle: scene.subtitle ?? "",
        duration: Number.isFinite(scene.duration) ? scene.duration : 3,
        timingSource: scene.timingSource ?? "estimated",
        effect: scene.effect ?? "slowZoomIn",
        transition: scene.transition ?? project.globalTransition ?? "hardCut",
        subtitleStyle: scene.subtitleStyle ?? project.globalSubtitleStyle ?? "cukiBoldMeme",
      })),
    ),
  };
}
