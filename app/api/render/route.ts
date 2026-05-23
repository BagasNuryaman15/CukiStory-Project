import {readFile, unlink} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {NextRequest} from "next/server";
import type {CukiProject} from "@/lib/types";
import {validateForRender} from "@/lib/renderValidation";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {project?: CukiProject};
    if (!body.project) {
      return Response.json({error: "Missing project data."}, {status: 400});
    }
    const validation = validateForRender(body.project);
    if (validation.errors.length > 0) {
      return Response.json({error: validation.errors[0]}, {status: 400});
    }

    const [{bundle}, {renderMedia, selectComposition}] = await Promise.all([
      import("@remotion/bundler"),
      import("@remotion/renderer"),
    ]);
    const entryPoint = path.join(process.cwd(), "remotion", "index.ts");
    const serveUrl = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });

    const inputProps = {project: body.project};
    const composition = await selectComposition({
      serveUrl,
      id: "CukiStoryVideo",
      inputProps,
    });

    const outputLocation = path.join(os.tmpdir(), `cukistory-${body.project.id}-${Date.now()}.mp4`);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
      inputProps,
      concurrency: 2,
    });

    const file = await readFile(outputLocation);
    await unlink(outputLocation).catch(() => undefined);

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${safeFilename(body.project.title)}.mp4"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Render failed.";
    return Response.json({error: message}, {status: 500});
  }
}

function safeFilename(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cukistory-video";
}
