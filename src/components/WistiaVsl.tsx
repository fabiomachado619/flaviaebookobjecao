import { useEffect, useRef } from "react";
import { REVEAL_AT_SECONDS, WISTIA_MEDIA_ID } from "@/lib/vsl-config";
import {
  trackVslPlay,
  trackVslProgressMilestone,
  trackVslRevealPoint,
  VSL_PROGRESS_MILESTONES,
} from "@/lib/meta-pixel";

interface WistiaVideo {
  time(): number;
  duration(): number;
  state(): string;
  bind(event: string, callback: (...args: unknown[]) => void): void;
  unbind(event: string, callback?: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    _wq?: Array<{ id: string; onReady: (video: WistiaVideo) => void }>;
    Wistia?: unknown;
  }
}

let wistiaScriptPromise: Promise<void> | null = null;

function loadWistiaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Wistia) return Promise.resolve();
  if (wistiaScriptPromise) return wistiaScriptPromise;

  wistiaScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="E-v1.js"]');
    if (existing) {
      if (window.Wistia) resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://fast.wistia.net/assets/external/E-v1.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

  return wistiaScriptPromise;
}

function isPlayingState(state: string): boolean {
  return state === "playing" || state === "play" || state === "buffering";
}

interface WistiaVslProps {
  onReachThreshold: () => void;
  /** Quando false, não dispara liberação por tempo — pixel da VSL continua ativo. */
  trackThreshold?: boolean;
}

export function WistiaVsl({ onReachThreshold, trackThreshold = true }: WistiaVslProps) {
  const onReachThresholdRef = useRef(onReachThreshold);
  const trackThresholdRef = useRef(trackThreshold);
  onReachThresholdRef.current = onReachThreshold;
  trackThresholdRef.current = trackThreshold;

  useEffect(() => {
    loadWistiaScript();
  }, []);

  useEffect(() => {
    let mounted = true;
    let video: WistiaVideo | null = null;
    let thresholdReached = false;
    let playTracked = false;
    let revealPointTracked = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    const milestonesFired = new Set<number>();

    const tryRevealThreshold = (player: WistiaVideo) => {
      if (
        trackThresholdRef.current &&
        !thresholdReached &&
        player.time() >= REVEAL_AT_SECONDS
      ) {
        thresholdReached = true;
        onReachThresholdRef.current();
      }
    };

    const trackMilestonesWhilePlaying = (player: WistiaVideo) => {
      if (!isPlayingState(player.state())) return;

      const currentTime = player.time();
      const duration = player.duration() || REVEAL_AT_SECONDS;

      for (const milestone of VSL_PROGRESS_MILESTONES) {
        if (milestonesFired.has(milestone)) continue;
        const thresholdTime = (duration * milestone) / 100;
        if (currentTime >= thresholdTime) {
          milestonesFired.add(milestone);
          trackVslProgressMilestone(milestone, currentTime, duration);
        }
      }

      if (!revealPointTracked && currentTime >= REVEAL_AT_SECONDS) {
        revealPointTracked = true;
        trackVslRevealPoint(currentTime);
      }
    };

    const checkProgress = (player: WistiaVideo) => {
      trackMilestonesWhilePlaying(player);
      tryRevealThreshold(player);
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const startPolling = () => {
      stopPolling();
      pollInterval = setInterval(() => {
        if (!video) return;
        checkProgress(video);
      }, 1000);
    };

    const onPlay = () => {
      if (!video) return;

      if (!playTracked) {
        playTracked = true;
        trackVslPlay(video.time());
      }

      checkProgress(video);
      startPolling();
    };

    const onPause = () => {
      stopPolling();
      if (!video) return;
      tryRevealThreshold(video);
    };

    const onSecondChange = () => {
      if (!video) return;
      checkProgress(video);
    };

    const onEnd = () => {
      stopPolling();
      if (!video) return;
      tryRevealThreshold(video);
    };

    const initPlayer = () => {
      window._wq = window._wq || [];
      window._wq.push({
        id: WISTIA_MEDIA_ID,
        onReady: (player) => {
          if (!mounted) return;
          video = player;
          player.bind("play", onPlay);
          player.bind("pause", onPause);
          player.bind("secondchange", onSecondChange);
          player.bind("end", onEnd);
        },
      });
    };

    loadWistiaScript().then(() => {
      if (!mounted) return;
      initPlayer();
    });

    return () => {
      mounted = false;
      stopPolling();
      if (video) {
        video.unbind("play", onPlay);
        video.unbind("pause", onPause);
        video.unbind("secondchange", onSecondChange);
        video.unbind("end", onEnd);
      }
    };
  }, []);

  return (
    <div id="vsl-section" className="vsl-player-wrap">
      <div className="vsl-player-frame">
        <div
          className={`wistia_embed wistia_async_${WISTIA_MEDIA_ID} seo=false videoFoam=true`}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          &nbsp;
        </div>
      </div>
    </div>
  );
}
