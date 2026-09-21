"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, RotateCcw, SwitchCamera } from "lucide-react";
import { uploadImage } from "@/lib/client-image";

export function PanoCamera({
  preview,
  onUploaded,
}: {
  preview?: string;
  onUploaded: (url: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [facing, setFacing] = useState<"environment" | "user">("environment");

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(false);
  }

  async function startCamera(nextFacing: "environment" | "user" = facing) {
    setError("");
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser has no camera API. Use Choose photo, or open on a phone.");
      fileRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: nextFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setFacing(nextFacing);
      setLive(true);
    } catch {
      setError("Allow the camera, or use Choose photo.");
      setLive(false);
    }
  }

  useEffect(() => () => stopCamera(), []);

  async function uploadFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const url = await uploadImage(file, "pano");
      onUploaded(url);
      stopCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function snap() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !live) {
      setError("Open the camera first, then tap the shutter.");
      return;
    }
    const width = video.videoWidth || 1600;
    const height = video.videoHeight || 900;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/jpeg", 0.9),
    );
    if (!blob) return;
    await uploadFile(new File([blob], `room-360-${Date.now()}.jpg`, { type: "image/jpeg" }));
  }

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        360° photo — camera
      </p>
      <div className="relative mt-1 overflow-hidden rounded-2xl bg-ink">
        <video
          ref={videoRef}
          className={`h-56 w-full object-cover ${live ? "block" : "hidden"}`}
          playsInline
          muted
          autoPlay
        />
        {!live && preview ? (
          <img src={preview} alt="Captured room" className="h-56 w-full object-cover" />
        ) : null}
        {!live && !preview ? (
          <button
            type="button"
            onClick={() => startCamera()}
            className="flex h-56 w-full flex-col items-center justify-center gap-3 text-sand"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-terracotta shadow-[0_0_0_8px_rgba(194,77,29,0.25)]">
              <Camera className="h-7 w-7" />
            </span>
            <span className="text-sm font-medium">Open camera & shoot this room</span>
            <span className="px-6 text-center text-xs text-sand/60">
              Stand in the doorway, tap shutter. One photo per room.
            </span>
          </button>
        ) : null}

        {live ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent px-4 py-3">
            <button
              type="button"
              onClick={() => startCamera(facing === "environment" ? "user" : "environment")}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-paper"
              aria-label="Flip camera"
            >
              <SwitchCamera className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={snap}
              disabled={busy}
              className="grid h-16 w-16 place-items-center rounded-full bg-white ring-4 ring-terracotta disabled:opacity-50"
              aria-label="Capture"
            >
              {busy ? (
                <Loader2 className="h-6 w-6 animate-spin text-ink" />
              ) : (
                <span className="h-12 w-12 rounded-full bg-terracotta" />
              )}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-paper"
              aria-label="Close camera"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => startCamera()}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
        >
          <Camera className="h-4 w-4" />
          {preview ? "Retake with camera" : "Open camera"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm ring-1 ring-ink/10"
        >
          <ImagePlus className="h-4 w-4" />
          Choose photo
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadFile(file);
          event.target.value = "";
        }}
      />
      {busy && !live ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading 360° photo…
        </p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-terracotta">{error}</p> : null}
      {preview && !live ? (
        <p className="mt-2 text-xs text-forest">Photo ready — name the room and save.</p>
      ) : null}
    </div>
  );
}
