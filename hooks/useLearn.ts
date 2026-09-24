"use client";

// Learn mode: guided, line-by-line recitation of one stanza.
// Plays the text's chant recording through a hidden YouTube player, seeked to the stanza,
// and falls back to browser text-to-speech (over a soft generated drone) when YouTube
// isn't available.
import { useCallback, useEffect, useRef, useState } from "react";
import { TEXTS, type TextId } from "@/lib/texts";

// just the slice of the YouTube IFrame API used here
interface YTPlayer {
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(opts: { videoId: string; startSeconds: number }): void;
  setPlaybackRate(rate: number): void;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      height: string;
      width: string;
      videoId: string;
      playerVars: Record<string, number>;
      events: { onReady: () => void; onStateChange: (e: { data: number }) => void };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
    webkitAudioContext?: typeof AudioContext;
  }
}

interface Drone {
  ctx: AudioContext;
  gain: GainNode;
  oscs: OscillatorNode[];
}

export interface Learn {
  learning: boolean;
  activeLine: number; // -1 when no line is highlighted
  start: (textId: TextId, stanzaIndex: number) => void;
  stop: () => void;
}

export function useLearn(rate: number, onError: (msg: string) => void): Learn {
  const [learning, setLearning] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);

  const rateRef = useRef(rate);
  const onErrorRef = useRef(onError);
  const token = useRef(0); // bumped on every stop so stale async callbacks no-op
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const drone = useRef<Drone | null>(null);
  const yt = useRef({
    player: null as YTPlayer | null,
    ready: false,
    playing: false,
    videoId: TEXTS.chalisa.audio.videoId as string, // video currently loaded in the player
    onPlaying: null as null | (() => void), // runs once the requested video actually starts
  });

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    rateRef.current = rate;
    if (yt.current.player && yt.current.playing) {
      try {
        yt.current.player.setPlaybackRate(rate);
      } catch {
        /* player not ready for it; the next start applies the rate */
      }
    }
  }, [rate]);

  // load the YouTube IFrame API once, into an invisible 1×1 player
  useEffect(() => {
    const mount = document.createElement("div");
    mount.id = "ytPlayerMount";
    mount.setAttribute("aria-hidden", "true");
    const holder = document.createElement("div");
    mount.appendChild(holder);
    document.body.appendChild(mount);

    window.onYouTubeIframeAPIReady = () => {
      try {
        yt.current.player = new window.YT!.Player(holder, {
          height: "1",
          width: "1",
          videoId: yt.current.videoId,
          playerVars: { controls: 0, disablekb: 1, playsinline: 1 },
          events: {
            onReady: () => {
              yt.current.ready = true;
            },
            onStateChange: (e) => {
              const run = yt.current.onPlaying;
              if (e.data === window.YT!.PlayerState.PLAYING && run) {
                yt.current.onPlaying = null;
                run();
              }
            },
          },
        });
      } catch {
        /* YT unavailable (offline/blocked): Learn falls back to text-to-speech */
      }
    };
    let script: HTMLScriptElement | null = null;
    if (window.YT?.Player) {
      window.onYouTubeIframeAPIReady(); // API already loaded (e.g. effect re-run in dev)
    } else {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }
    const y = yt.current;
    return () => {
      y.player = null;
      y.ready = false;
      mount.remove();
      script?.remove();
    };
  }, []);

  const stopDrone = useCallback(() => {
    const d = drone.current;
    drone.current = null;
    if (!d) return;
    try {
      d.gain.gain.linearRampToValueAtTime(0, d.ctx.currentTime + 0.7);
      setTimeout(() => {
        d.oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
        d.ctx.close().catch(() => {});
      }, 750);
    } catch {
      /* the drone is a nice-to-have */
    }
  }, []);

  const startDrone = useCallback(() => {
    if (drone.current) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      // a soft sustained root + fifth, tanpura-like — generated tone, not a recording
      const oscs = [110, 165].map((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start();
        return osc;
      });
      gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 1.2);
      drone.current = { ctx, gain, oscs };
    } catch {
      /* the drone is a nice-to-have */
    }
  }, []);

  const stop = useCallback(() => {
    token.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    stopDrone();
    const y = yt.current;
    y.playing = false;
    y.onPlaying = null;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try {
      y.player?.pauseVideo();
    } catch {
      /* nothing playing */
    }
    setLearning(false);
    setActiveLine(-1);
  }, [stopDrone]);

  const startYouTube = useCallback(
    (textId: TextId, stanzaIndex: number) => {
      const { stanzas, audio } = TEXTS[textId];
      const stanza = stanzas[stanzaIndex];
      const next = stanzas[stanzaIndex + 1];
      const endT = stanza.tEnd ?? next?.t ?? audio.endT; // tEnd skips an interlude before the next stanza
      const startT = stanza.t!;
      const duration = Math.max(endT - startT, 1);
      const lineCount = stanza.text.split("\n").length;
      const y = yt.current;
      const myToken = ++token.current;

      setLearning(true);
      y.playing = true;
      // start highlighting only once audio is really playing (switching videos takes a moment)
      y.onPlaying = () => {
        if (myToken !== token.current) return;
        const r = rateRef.current;
        try {
          y.player!.setPlaybackRate(r);
        } catch {
          /* keep the default rate */
        }
        // only per-verse timing is known, so lines are spread evenly across the verse
        for (let i = 0; i < lineCount; i++) {
          timers.current.push(
            setTimeout(() => myToken === token.current && setActiveLine(i), ((duration * i) / lineCount / r) * 1000),
          );
        }
        timers.current.push(setTimeout(() => myToken === token.current && stop(), (duration / r) * 1000));
      };
      try {
        if (y.videoId === audio.videoId) {
          y.player!.seekTo(startT, true);
          y.player!.playVideo();
        } else {
          y.videoId = audio.videoId;
          y.player!.loadVideoById({ videoId: audio.videoId, startSeconds: startT });
        }
      } catch {
        stop();
        onErrorRef.current("Couldn't start chant audio — check your connection");
      }
    },
    [stop],
  );

  const start = useCallback(
    (textId: TextId, stanzaIndex: number) => {
      const stanza = TEXTS[textId].stanzas[stanzaIndex];
      if (yt.current.ready && typeof stanza.t === "number") {
        startYouTube(textId, stanzaIndex);
        return;
      }
      if (!("speechSynthesis" in window)) {
        onErrorRef.current("Voice guidance isn't supported on this browser");
        return;
      }
      window.speechSynthesis.cancel();
      setLearning(true);
      startDrone();
      const myToken = ++token.current;
      const lines = stanza.text.split("\n");
      let i = 0;

      const speakNext = () => {
        if (myToken !== token.current) return; // superseded by stop/navigation
        if (i >= lines.length) {
          stop();
          return;
        }
        setActiveLine(i);
        const utter = new SpeechSynthesisUtterance(lines[i]);
        utter.rate = rateRef.current;
        utter.onend = utter.onerror = () => {
          if (myToken !== token.current) return;
          i++;
          speakNext();
        };
        window.speechSynthesis.speak(utter);
      };
      speakNext();
    },
    [startDrone, startYouTube, stop],
  );

  useEffect(() => stop, [stop]);

  return { learning, activeLine, start, stop };
}
