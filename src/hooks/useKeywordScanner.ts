import { useEffect, useRef, MutableRefObject } from "react";
import throttle from "lodash.throttle";
import type { StateMachine } from "../engine/StateMachine";

export function useKeywordScanner(
  engineRef: MutableRefObject<{ stateMachine: StateMachine } | null>,
  positiveKeywords: string[],
  negativeKeywords: string[],
  setAwarenessType: (type: string | null) => void
) {
  const keywordCooldown = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    // Phase 6: Keyword Scanner
    // Runs periodically to scan document body for positive/negative keywords
    const scanKeywords = throttle(() => {
      if (!engineRef.current) return;
      const now = Date.now();

      const pageText = document.body.innerText || "";

      // Check Negatives
      if (negativeKeywords && negativeKeywords.length > 0) {
        for (const word of negativeKeywords) {
          if (!word.trim()) continue;
          const matchIndex = pageText.indexOf(word);
          if (matchIndex !== -1) {
            const lastTime = keywordCooldown.current['negative'] || 0;
            if (now - lastTime > 5000) { // 30s cooldown
              keywordCooldown.current['negative'] = now;

              const start = Math.max(0, pageText.lastIndexOf('.', matchIndex) + 1);
              let end = pageText.indexOf('.', matchIndex);
              if (end === -1) end = Math.min(pageText.length, matchIndex + 100);
              const sentence = pageText.substring(start, end).replace(/\n/g, ' ').trim();
              console.log(`[Pixel Cat Debug] 🙀 싫어하는 단어 "${word}" 발견! 문장: "${sentence}"`);

              setAwarenessType("negative_keyword");
              // Force evade equivalent
              engineRef.current.stateMachine.evadeMouse(document.documentElement.clientWidth / 2); // run away from center
              setTimeout(() => setAwarenessType(null), 5000);
              return; // Stop scanning further if we found something
            }
          }
        }
      }

      // Check Positives
      if (positiveKeywords && positiveKeywords.length > 0) {
        for (const word of positiveKeywords) {
          if (!word.trim()) continue;
          const matchIndex = pageText.indexOf(word);
          if (matchIndex !== -1) {
            const lastTime = keywordCooldown.current['positive'] || 0;
            if (now - lastTime > 30000) { // 30s cooldown
              keywordCooldown.current['positive'] = now;

              const start = Math.max(0, pageText.lastIndexOf('.', matchIndex) + 1);
              let end = pageText.indexOf('.', matchIndex);
              if (end === -1) end = Math.min(pageText.length, matchIndex + 100);
              const sentence = pageText.substring(start, end).replace(/\n/g, ' ').trim();
              console.log(`[Pixel Cat Debug] 😻 좋아하는 단어 "${word}" 발견! 문장: "${sentence}"`);

              setAwarenessType("positive_keyword");
              setTimeout(() => setAwarenessType(null), 5000);
              return;
            }
          }
        }
      }
    }, 3000);

    // Initial scan + observer
    scanKeywords();
    const keywordObserver = new MutationObserver(scanKeywords);
    keywordObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      keywordObserver.disconnect();
    };
  }, [positiveKeywords, negativeKeywords, engineRef, setAwarenessType]);
}
