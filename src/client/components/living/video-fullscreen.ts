import { leavePictureInPicture } from "./use-picture-in-picture";

export type FullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitSupportsFullscreen?: boolean;
  webkitDisplayingFullscreen?: boolean;
  webkitPresentationMode?: string;
};

// Type-only helpers for the Screen Orientation API and fullscreen options,
  // which are not yet in every TypeScript lib.dom version.
  type ScreenOrientationExtension = ScreenOrientation & {
    lock?: (orientation: "any" | "natural" | "landscape" | "portrait" | "landscape-primary" | "landscape-secondary" | "portrait-primary" | "portrait-secondary") => Promise<void>;
  };
type LockableScreen = Screen & { orientation?: ScreenOrientationExtension };

export function videoFullscreenState(video: FullscreenVideo) {
  const screen = video.parentElement;
  const pageSupported = Boolean(document.fullscreenEnabled && screen?.requestFullscreen);
  const nativeSupported = typeof video.webkitEnterFullscreen === "function";
  const nativeActive = Boolean(video.webkitDisplayingFullscreen || video.webkitPresentationMode === "fullscreen");
  return {
    supported: pageSupported || nativeSupported,
    ready: pageSupported || (nativeSupported && video.readyState >= 1 && video.webkitSupportsFullscreen === true),
    active: Boolean(screen && document.fullscreenElement === screen) || nativeActive,
    nativeActive,
  };
}

// Lock the screen to landscape when entering fullscreen on mobile. The lock
// is released when leaving. Errors (unsupported or already locked) are
// ignored — the fullscreen transition itself is not affected.
async function tryLandscapeLock(entering: boolean): Promise<void> {
  const lockableScreen = screen as LockableScreen;
  const orientation = lockableScreen?.orientation;
  if (!orientation?.lock) return;
  if (entering) {
    try { await orientation.lock("landscape"); } catch { /* unsupported */ }
  } else {
    try { await orientation.lock("any"); } catch { /* unsupported */ }
    try { orientation.unlock(); } catch { /* unsupported */ }
  }
}

// Request in the original click stack: fullscreen consumes user activation.
// Native events, rather than a successful method call, confirm Safari entry.
export async function toggleVideoFullscreen(video: FullscreenVideo): Promise<void> {
  const screen = video.parentElement;
  const state = videoFullscreenState(video);
  if (screen && document.fullscreenElement === screen) {
    await document.exitFullscreen();
    await tryLandscapeLock(false);
  } else if (state.nativeActive) {
    video.webkitExitFullscreen?.();
    await tryLandscapeLock(false);
  } else if (state.ready) {
    if (document.fullscreenEnabled && screen?.requestFullscreen) {
      await screen.requestFullscreen();
      await tryLandscapeLock(true);
      await leavePictureInPicture(video).catch(() => undefined);
    } else {
      video.webkitEnterFullscreen?.();
      await tryLandscapeLock(true);
    }
  }
}
