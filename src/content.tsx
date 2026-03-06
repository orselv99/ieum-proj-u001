import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"
import { ChatBubble } from "./components/content/ChatBubble"
import { HeartParticles } from "./components/content/HeartParticles"
import { usePetStorage } from "./hooks/usePetStorage"
import { usePetEngine } from "./hooks/usePetEngine"
import { useInteractionSystems } from "./hooks/useInteractionSystems"
import { useKeywordScanner } from "./hooks/useKeywordScanner"
import { usePetChat } from "./hooks/usePetChat"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PixelPetContent = () => {
  const catRef = useRef<HTMLDivElement>(null)
  const [awarenessType, setAwarenessType] = useState<string | null>(null)
  const [awarenessMessage, setAwarenessMessage] = useState<string | null>(null)

  const storage = usePetStorage()

  const { engineRef, setBreed } = usePetEngine(catRef, storage.isExcluded, setAwarenessType);

  useEffect(() => {
    setBreed(storage.petBreed);
  }, [storage.petBreed, setBreed]);

  const { isTabAudible, selectedText, setSelectedText } = useInteractionSystems(engineRef, storage.isQuietMode);

  useKeywordScanner(engineRef, storage.positiveKeywords, storage.negativeKeywords, setAwarenessType);

  const { chatMessage, setChatMessage, isThinking, askPixelPet, handleAction } = usePetChat({
    engineRef,
    apiKey: storage.apiKey,
    idleMessages: storage.idleMessages,
    videoMessages: storage.videoMessages,
    audioMessages: storage.audioMessages,
    isExcluded: storage.isExcluded,
    isQuietMode: storage.isQuietMode,
    isTabAudible,
    selectedText,
    setSelectedText
  });

  useEffect(() => {
    if (awarenessType === "video") {
      const msgs = Array.isArray(storage.videoMessages) && storage.videoMessages.length > 0 ? storage.videoMessages : ["오잉? 영상 발견! 앉아서 볼 거다냥 📺"];
      setAwarenessMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    } else if (awarenessType === "audio") {
      const msgs = Array.isArray(storage.audioMessages) && storage.audioMessages.length > 0 ? storage.audioMessages : ["노래 좋다냥~ 🎵"];
      setAwarenessMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    } else if (awarenessType === "mouse") {
      setAwarenessMessage("히익! 마우스다냥! 💨");
    } else if (awarenessType === "positive_keyword") {
      setAwarenessMessage("집사야 이거 사자! 😻");
    } else if (awarenessType === "negative_keyword") {
      setAwarenessMessage("히익! 무서운 단어다냥! 🙀");
    } else {
      setAwarenessMessage(null);
    }
  }, [awarenessType, storage.videoMessages, storage.audioMessages])

  const displayMessage = awarenessMessage || chatMessage

  if (storage.isExcluded) return null;

  return (
    <div className="plasmo-z-[2147483647] fixed top-0 left-0 z-[9999] pointer-events-none w-full h-full">
      <div
        ref={catRef}
        id="pixel-pet"
        className={`absolute pointer-events-auto filter drop-shadow-md cursor-pointer select-none outline-none ${awarenessType === 'negative_keyword' ? 'animate-shake' : ''}`}
        style={{ width: "64px", height: "64px" }}
        onClick={askPixelPet}
      >
        <ChatBubble
          message={displayMessage as string}
          isLoading={isThinking}
          selectedText={selectedText}
          onAction={handleAction}
          onClose={() => {
            setChatMessage("")
            setAwarenessType(null)
            setSelectedText(null)
          }}
        />

        <div
          className="cat-visual w-full h-full bg-no-repeat"
          style={{ imageRendering: "pixelated", backgroundSize: "400% 200%" }}
        />

        <HeartParticles isActive={awarenessType === 'positive_keyword'} />
      </div>
    </div>
  )
}

export default PixelPetContent
