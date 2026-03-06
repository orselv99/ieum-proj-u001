import { useState, useEffect, MutableRefObject } from "react";
import type { StateMachine } from "../engine/StateMachine";
import type { SpriteAnimator } from "../engine/SpriteAnimator";

interface UsePetChatProps {
  engineRef: MutableRefObject<{ stateMachine: StateMachine; animator: SpriteAnimator } | null>;
  apiKey: string;
  idleMessages: string[];
  videoMessages: string[];
  audioMessages: string[];
  isExcluded: boolean;
  isQuietMode: boolean;
  isTabAudible: boolean;
  selectedText: string | null;
  setSelectedText: (text: string | null) => void;
}

export function usePetChat({
  engineRef,
  apiKey,
  idleMessages,
  videoMessages,
  audioMessages,
  isExcluded,
  isQuietMode,
  isTabAudible,
  selectedText,
  setSelectedText
}: UsePetChatProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Phase 13: Random Idle Chat Timer
  useEffect(() => {
    const randomChatInterval = setInterval(() => {
      if (isExcluded || isQuietMode) return; // Don't chat in excluded/quiet modes
      setChatMessage((prevChat) => {
        if (prevChat !== "" || selectedText !== null) return prevChat; // Don't overwrite existing msg or selection tools

        // 30% chance to say something
        if (Math.random() > 0.3) return "";

        let sourceMsgs = idleMessages;
        if (engineRef.current?.stateMachine.targetVideo) {
          sourceMsgs = videoMessages;
        } else if (isTabAudible) {
          sourceMsgs = audioMessages;
        }

        if (!sourceMsgs || sourceMsgs.length === 0) return "";
        const m = sourceMsgs[Math.floor(Math.random() * sourceMsgs.length)];

        // Clear it after 4 seconds
        setTimeout(() => setChatMessage(""), 4000);
        return m;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(randomChatInterval);
  }, [isExcluded, isQuietMode, selectedText, idleMessages, videoMessages, audioMessages, isTabAudible, engineRef]);

  const askPixelPet = async () => {
    if (isThinking) return;

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

      setChatMessage(randomMsg);
      // Don't change state to idle if watching video, let it keep sitting
      if (!isWatchingVideo) {
        engineRef.current?.stateMachine.changeToIdle();
      }
      setTimeout(() => setChatMessage(""), 3000);
      return;
    }

    const prompt = window.prompt("고양이에게 할 말을 입력하세요 (취소하면 닫힙니다):");
    if (!prompt) return;

    setChatMessage("");
    setIsThinking(true);
    engineRef.current?.stateMachine.changeToIdle(); // 대화 중에는 멈춤

    try {
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ type: "CHAT_WITH_GEMINI", prompt }, resolve);
      });

      if (response && response.error) {
        setChatMessage("Error: " + response.error);
      } else if (response && response.text) {
        setChatMessage(response.text);
      } else {
        setChatMessage("Meow...?");
      }
    } catch (e) {
      setChatMessage("Failed to connect to background script.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleAction = async (action: 'summarize' | 'translate', text: string) => {
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
  };

  return {
    chatMessage,
    setChatMessage,
    isThinking,
    askPixelPet,
    handleAction
  };
}
