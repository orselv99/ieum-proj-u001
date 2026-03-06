import { useEffect, useRef, useState, MutableRefObject } from "react";
import throttle from "lodash.throttle";
import type { Physics } from "../engine/Physics";
import type { StateMachine } from "../engine/StateMachine";

export function useInteractionSystems(
  engineRef: MutableRefObject<{ physics: Physics; stateMachine: StateMachine; } | null>,
  isQuietMode: boolean
) {
  const [isTabAudible, setIsTabAudible] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  useEffect(() => {
    // Phase 7: Audio Awareness
    const handleAudioMessage = (msg: any) => {
      if (msg.type === "TAB_AUDIBLE_CHANGED") {
        setIsTabAudible(msg.isAudible);
      }
    };
    chrome.runtime.onMessage.addListener(handleAudioMessage);

    const handleSelection = throttle(() => {
      const text = window.getSelection()?.toString().trim();
      if (text && text.length > 5) { // Only show for meaningful selections
        setSelectedText(text);
      } else {
        setSelectedText(null);
      }
    }, 500);

    document.addEventListener("selectionchange", handleSelection);

    // Phase 4 & Phase 8 Update: Mouse Tracking & Evasion
    const handleMouseMove = throttle((e: MouseEvent) => {
      if (!engineRef.current || isQuietMode) return

      const { physics, stateMachine } = engineRef.current
      const catCenterX = physics.x + (physics.width / 2)
      const catCenterY = physics.y + (physics.height / 2)

      // Calculate Euclidean distance
      const dist = Math.sqrt(Math.pow(e.clientX - catCenterX, 2) + Math.pow(e.clientY - catCenterY, 2))

      // If mouse is too close (e.g. within 80px), evade!
      if (dist < 80 && !stateMachine.isEvadingMouse) {
        stateMachine.evadeMouse(e.clientX)
      }
    }, 100)

    window.addEventListener("mousemove", handleMouseMove)

    // Phase 4 & Phase 7 Update: Video Detection
    // Filter out invisible or 1x1 tracking/audio-only videos (like YouTube Music)
    const checkForVideo = () => {
      if (!engineRef.current) return
      const videos = Array.from(document.getElementsByTagName("video"))

      const visibleVideos = videos.filter(v => {
        const rect = v.getBoundingClientRect();
        const style = window.getComputedStyle(v);
        return (
          rect.width > 20 &&
          rect.height > 20 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          style.opacity !== '0'
        );
      });

      if (visibleVideos.length > 0) {
        // Just pick the first visible video found
        engineRef.current.stateMachine.setTargetVideo(visibleVideos[0])
      } else {
        engineRef.current.stateMachine.setTargetVideo(null)
      }
    }

    // Check initially and also observe DOM changes
    checkForVideo()
    const observer = new MutationObserver(throttle(() => {
      checkForVideo()
    }, 1000))
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("selectionchange", handleSelection);
      chrome.runtime.onMessage.removeListener(handleAudioMessage);
      observer.disconnect();
    };
  }, [isQuietMode, engineRef]);

  return {
    isTabAudible,
    selectedText,
    setSelectedText
  };
}
