import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState, useMemo } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import throttle from "lodash.throttle"
import { Physics } from "./engine/Physics"
import { SpriteAnimator } from "./engine/SpriteAnimator"
import { StateMachine } from "./engine/StateMachine"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const ChatBubble = ({
  message,
  isLoading,
  onClose,
  selectedText,
  onAction
}: {
  message: string,
  isLoading: boolean,
  onClose: () => void,
  selectedText?: string | null,
  onAction?: (action: 'summarize' | 'translate', text: string) => void
}) => {
  if (!message && !isLoading && !selectedText) return null;

  return (
    <div id="pixel-pet-bubble" className="absolute bottom-full mb-2 min-w-[120px] max-w-[250px] bg-white rounded-2xl p-3 shadow-lg border border-gray-100 opacity-95 transition-opacity z-50 text-left" style={{ boxSizing: "border-box" }}>
      <div className="text-sm text-gray-800 font-medium whitespace-pre-wrap" style={{ wordBreak: "break-word", lineHeight: "1.5" }}>
        {isLoading ? (
          <div className="flex space-x-1 items-center justify-center p-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <>
            {message}
            {selectedText && !isLoading && !message && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-blue-500 italic line-clamp-2">"{selectedText}"</span>
                <div className="flex gap-2 mt-1">
                  <button onClick={(e) => { e.stopPropagation(); onAction?.('summarize', selectedText) }} className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs py-1 px-2 rounded font-bold">요약하기</button>
                  <button onClick={(e) => { e.stopPropagation(); onAction?.('translate', selectedText) }} className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs py-1 px-2 rounded font-bold">번역하기</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div id="pixel-pet-bubble-tail" className="absolute -bottom-2 w-4 h-4 bg-white rotate-45 border-b border-r border-gray-100" />
      {!isLoading && (
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs text-gray-500"
        >
          ×
        </button>
      )}
    </div>
  )
}

const PixelPetContent = () => {
  const catRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<{
    physics: Physics;
    animator: SpriteAnimator;
    stateMachine: StateMachine;
    lastTime: number;
    reqId: number;
  } | null>(null)

  const [chatMessage, setChatMessage] = useState("")
  const [awarenessType, setAwarenessType] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [awarenessMessage, setAwarenessMessage] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isTabAudible, setIsTabAudible] = useState(false)
  const [apiKey] = useStorage("gemini-api-key", "")

  const [idleMessages] = useStorage<string[]>("default-messages-idle", ["심심하다냥...", "API 키가 없어서 말할 수가 없다냥!"])
  const [videoMessages] = useStorage<string[]>("default-messages-video", ["이 영상 재밌다냥!", "집사도 같이 보자냥 📺"])
  const [audioMessages] = useStorage<string[]>("default-messages-audio", ["노래 좋다냥~ 🎵", "나도 춤을 출까냥? 😸"])
  const [positiveKeywords] = useStorage<string[]>("positive-keywords", ["츄르", "생선", "세일", "무료"])
  const [negativeKeywords] = useStorage<string[]>("negative-keywords", ["오이", "개", "Dog", "병원", "버그"])
  const [denylistedUrls] = useStorage<string[]>("denylisted-urls", ["github.com"])
  const [quietlistedUrls] = useStorage<string[]>("quietlisted-urls", ["youtube.com"])
  const [petBreed] = useStorage<any>("pet-breed", "mackerel")

  useEffect(() => {
    if (engineRef.current && petBreed) {
      engineRef.current.animator.setBreed(petBreed)
    }
  }, [petBreed])

  const keywordCooldown = useRef<{ [key: string]: number }>({})

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

  useEffect(() => {
    if (awarenessType === "video") {
      const msgs = Array.isArray(videoMessages) && videoMessages.length > 0 ? videoMessages : ["오잉? 영상 발견! 앉아서 볼 거다냥 📺"];
      setAwarenessMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    } else if (awarenessType === "audio") {
      const msgs = Array.isArray(audioMessages) && audioMessages.length > 0 ? audioMessages : ["노래 좋다냥~ 🎵"];
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
  }, [awarenessType, videoMessages, audioMessages])

  const displayMessage = awarenessMessage || chatMessage

  const askPixelPet = async () => {
    if (isThinking) return

    if (!apiKey) {
      const isWatchingVideo = engineRef.current?.animator.currentState.name === "sit";

      let targetMessages = idleMessages;
      if (isWatchingVideo) {
        targetMessages = videoMessages;
      } else if (isTabAudible) {
        targetMessages = audioMessages;
      }

      const msgs = Array.isArray(targetMessages) && targetMessages.length > 0
        ? targetMessages
        : ["API 키가 설정되지 않았어! 냥!"];

      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];

      setChatMessage(randomMsg)
      // Don't change state to idle if watching video, let it keep sitting
      if (!isWatchingVideo) {
        engineRef.current?.stateMachine.changeToIdle()
      }
      setTimeout(() => setChatMessage(""), 3000)
      return
    }

    const prompt = window.prompt("고양이에게 할 말을 입력하세요 (취소하면 닫힙니다):")
    if (!prompt) return

    setChatMessage("")
    setIsThinking(true)
    engineRef.current?.stateMachine.changeToIdle() // 대화 중에는 멈춤

    try {
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ type: "CHAT_WITH_GEMINI", prompt }, resolve)
      })

      if (response && response.error) {
        setChatMessage("Error: " + response.error)
      } else if (response && response.text) {
        setChatMessage(response.text)
      } else {
        setChatMessage("Meow...?")
      }
    } catch (e) {
      setChatMessage("Failed to connect to background script.")
    } finally {
      setIsThinking(false)
    }
  }

  useEffect(() => {
    // Initialize Engine
    const physics = new Physics(100, window.innerHeight - 100, 64, 64)
    const animator = new SpriteAnimator("idle")
    const stateMachine = new StateMachine(physics, animator)

    // Phase 7: Audio Awareness
    const handleAudioMessage = (msg: any) => {
      if (msg.type === "TAB_AUDIBLE_CHANGED") {
        setIsTabAudible(msg.isAudible);

        // If sound starts and no video is present, pop up an audio message
        if (msg.isAudible && stateMachine.targetVideo === null) {
          setAwarenessType("audio");
          setTimeout(() => setAwarenessType((prev) => prev === "audio" ? null : prev), 8000); // clear after 8s
        } else if (!msg.isAudible) {
          // If sound stops and they were listening, return to normal
          setAwarenessType((prev) => prev === "audio" ? null : prev);
        }
      }
    };
    chrome.runtime.onMessage.addListener(handleAudioMessage);

    const handleAwareness = (type: string | null) => {
      setAwarenessType(type)
    }
    stateMachine.setAwarenessCallback(handleAwareness)

    const handleSelection = throttle(() => {
      const text = window.getSelection()?.toString().trim();
      if (text && text.length > 5) { // Only show for meaningful selections
        setSelectedText(text);
        setChatMessage(""); // Clear previous messages to show tools
      } else {
        setSelectedText(null);
      }
    }, 500);

    document.addEventListener("selectionchange", handleSelection);

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
          if (pageText.includes(word)) {
            const lastTime = keywordCooldown.current['negative'] || 0;
            if (now - lastTime > 5000) { // 30s cooldown
              keywordCooldown.current['negative'] = now;
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
          if (pageText.includes(word)) {
            const lastTime = keywordCooldown.current['positive'] || 0;
            if (now - lastTime > 30000) { // 30s cooldown
              keywordCooldown.current['positive'] = now;
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

    engineRef.current = {
      physics,
      animator,
      stateMachine,
      lastTime: performance.now(),
      reqId: 0
    }

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

    // Phase 4: Handle window resize to avoid out of bounds
    const handleResize = throttle(() => {
      if (!engineRef.current) return
      // We don't strictly "do" anything here, but we could update physics bounds 
      // if we stored window bounds there. The loop checks clientWidth/Height directly however.
    }, 500)
    window.addEventListener("resize", handleResize)


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

    const loop = (time: number) => {
      if (!engineRef.current || !catRef.current) return

      const { physics, animator, stateMachine, lastTime } = engineRef.current
      let delta = time - lastTime
      engineRef.current.lastTime = time

      // Clamp delta to prevent huge jumps after tab switch (max 50ms)
      delta = Math.min(delta, 50)

      // Update Engine
      stateMachine.update(delta)
      stateMachine.handleWallCollision(document.documentElement.clientWidth)
      physics.update(delta)
      animator.update(delta)

      // Apply to DOM
      const scaleX = physics.isFacingRight ? 1 : -1

      catRef.current.style.transform = `translate(${physics.x}px, ${physics.y}px)`

      // Dynamic Bubble positioning logic
      const bubbleEl = catRef.current.querySelector('#pixel-pet-bubble') as HTMLDivElement
      if (bubbleEl) {
        let bubbleX = (physics.width / 2) - (bubbleEl.offsetWidth / 2)
        const globalLeft = physics.x + bubbleX
        const globalRight = globalLeft + bubbleEl.offsetWidth

        if (globalLeft < 10) {
          bubbleX += (10 - globalLeft)
        } else if (globalRight > document.documentElement.clientWidth - 10) {
          bubbleX -= (globalRight - (document.documentElement.clientWidth - 10))
        }

        bubbleEl.style.left = `${bubbleX}px`

        const tailEl = bubbleEl.querySelector('#pixel-pet-bubble-tail') as HTMLDivElement
        if (tailEl) {
          const tailX = (physics.width / 2) - bubbleX - 8
          tailEl.style.left = `${tailX}px`
        }
      }

      const visualElement = catRef.current.querySelector('.cat-visual') as HTMLDivElement
      if (visualElement) {
        visualElement.style.transform = `scaleX(${scaleX})`
        visualElement.style.backgroundImage = `url(${animator.spriteUrl})`
        visualElement.style.backgroundPosition = animator.getBackgroundPosition()
      }

      engineRef.current.reqId = requestAnimationFrame(loop)
    }

    engineRef.current.reqId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("selectionchange", handleSelection)
      chrome.runtime.onMessage.removeListener(handleAudioMessage)
      observer.disconnect()
      keywordObserver.disconnect()
      if (engineRef.current) {
        cancelAnimationFrame(engineRef.current.reqId)
      }
    }
  }, [])

  if (isExcluded) return null;

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
          onAction={async (action, text) => {
            if (!apiKey) {
              setChatMessage("API 키가 설정되지 않았어! 냥!");
              return;
            }
            setIsThinking(true);
            setSelectedText(null);
            engineRef.current?.stateMachine.changeToIdle();

            const actionPrompt = action === 'summarize'
              ? `다음 텍스트를 고양이 말투로 3문장 이내로 요약해줘: "${text}"`
              : `다음 텍스트를 고양이 말투로 한국어로 번역하고 뜻을 설명해줘: "${text}"`;

            try {
              const response = await new Promise<any>((resolve) => {
                chrome.runtime.sendMessage({ type: "CHAT_WITH_GEMINI", prompt: actionPrompt }, resolve)
              });
              if (response && response.text) {
                setChatMessage(response.text);
              } else {
                setChatMessage("오류가 발생했다냥...");
              }
            } catch (e) {
              setChatMessage("통신 실패냥...");
            } finally {
              setIsThinking(false);
            }
          }}
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

        {/* Positive Keyword Effect: Floating Hearts */}
        {awarenessType === 'positive_keyword' && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute text-red-500 animate-float-up text-2xl"
                style={{
                  left: `${20 + (i * 10)}px`,
                  animationDelay: `${i * 0.2}s`,
                  bottom: '10px'
                }}
              >
                ❤️
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PixelPetContent
