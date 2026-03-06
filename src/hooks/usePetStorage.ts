import { useStorage } from "@plasmohq/storage/hook";
import { useMemo } from "react";

export function usePetStorage() {
  const [apiKey] = useStorage("gemini-api-key", "")
  const [idleMessages] = useStorage<string[]>("default-messages-idle", ["심심하다냥...", "API 키가 없어서 말할 수가 없다냥!"])
  const [videoMessages] = useStorage<string[]>("default-messages-video", ["이 영상 재밌다냥!", "집사도 같이 보자냥 📺"])
  const [audioMessages] = useStorage<string[]>("default-messages-audio", ["노래 좋다냥~ 🎵", "나도 춤을 출까냥? 😸"])
  const [positiveKeywords] = useStorage<string[]>("positive-keywords", ["츄르", "생선", "세일", "무료"])
  const [negativeKeywords] = useStorage<string[]>("negative-keywords", ["오이", "개", "Dog", "병원", "버그"])
  const [denylistedUrls] = useStorage<string[]>("denylisted-urls", ["github.com"])
  const [quietlistedUrls] = useStorage<string[]>("quietlisted-urls", ["youtube.com"])
  const [petBreed] = useStorage<any>("pet-breed", "mackerel")

  // Phase 8: Check if current page is excluded entirely
  const isExcluded = useMemo(() => {
    const url = window.location.href;
    return (denylistedUrls || []).some(denyUrl => url.includes(denyUrl));
  }, [denylistedUrls]);

  // Phase 8: Check if current page is in quiet mode
  const isQuietMode = useMemo(() => {
    const url = window.location.href;
    return (quietlistedUrls || []).some(quietUrl => url.includes(quietUrl));
  }, [quietlistedUrls]);

  return {
    apiKey,
    idleMessages,
    videoMessages,
    audioMessages,
    positiveKeywords,
    negativeKeywords,
    denylistedUrls,
    quietlistedUrls,
    petBreed,
    isExcluded,
    isQuietMode
  };
}
