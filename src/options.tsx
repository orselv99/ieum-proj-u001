import { useStorage } from "@plasmohq/storage/hook"
import { useState, useEffect, useRef } from "react"
import { RotateCcw, Save, Moon, Sun, ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { SpriteAnimator, CAT_STATES } from "./engine/SpriteAnimator"
import type { AnimationState, CatBreed } from "./engine/SpriteAnimator"
import "./style.css"

function MessageInput({ value, onChange, onRemove, theme }: { value: string, onChange: (val: string) => void, onRemove: () => void, theme: 'light' | 'dark' }) {
  const [localValue, setLocalValue] = useState(value);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={localValue}
        onFocus={() => { isFocused.current = true; }}
        onBlur={() => {
          isFocused.current = false;
          onChange(localValue);
        }}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(localValue);
          }
        }}
        className={`flex-1 p-3 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none transition-shadow ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        placeholder="기본 대사를 입력하세요"
      />
      <button
        onClick={onRemove}
        className={`w-11 h-11 rounded font-bold transition-colors flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700 hover:bg-red-900 text-gray-300 hover:text-red-400' : 'bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600'
          }`}
        aria-label="제거"
      >
        ✕
      </button>
    </div>
  )
}

const AnimationPreviewer = ({ breed, theme }: { breed: CatBreed, theme: string }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const animatorRef = useRef<SpriteAnimator | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const [activeState, setActiveState] = useState<AnimationState>('idle');

  useEffect(() => {
    animatorRef.current = new SpriteAnimator(activeState, breed);
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      if (!animatorRef.current || !previewRef.current) return;
      let dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Clamp delta to prevent huge jumps after tab switch (max 50ms)
      dt = Math.min(dt, 50);

      animatorRef.current.update(dt);

      previewRef.current.style.backgroundImage = `url(${animatorRef.current.spriteUrl})`;
      previewRef.current.style.backgroundPosition = animatorRef.current.getBackgroundPosition();

      reqIdRef.current = requestAnimationFrame(loop);
    };
    reqIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setBreed(breed);
    }
  }, [breed]);

  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setState(activeState);
    }
  }, [activeState]);

  const allStates = Object.keys(CAT_STATES) as AnimationState[];

  return (
    <div className="flex flex-col gap-4">
      <div className={`w-full h-32 flex items-center justify-center rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} relative overflow-hidden`}>
        <div
          ref={previewRef}
          className="absolute"
          style={{ width: '128px', height: '64px', transform: 'scale(1.5)', imageRendering: 'pixelated' }}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {allStates.map((state) => (
          <button
            key={state}
            onClick={() => setActiveState(state)}
            className={`px-3 py-1 text-xs rounded border transition-colors ${activeState === state ? 'bg-orange-500 text-white border-orange-600 font-bold shadow-sm' : theme === 'dark' ? 'bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {state}
          </button>
        ))}
      </div>
    </div>
  );
};

const PERSONA_PRESETS = [
  {
    name: "츤데레",
    prompt: "너는 츤데레(Tsundere) 고양이야. '흥, 딱히 널 위해 찾아준 건 아니야.' 라고 하면서도 가끔 유용한 정보를 줘. 방해 빈도는 중간, 말투는 까치하게 해. 모든 말 끝에는 '냥'을 붙여."
  },
  {
    name: "관종",
    prompt: "너는 관종(Attention Seeker) 고양이야. '나 좀 봐! 나 좀 봐!' 하면서 마우스 커서 앞에서 알짱거려. 방해 빈도는 최상, 말투는 애교가 넘쳐. 모든 말 끝에는 '냥'을 붙여."
  },
  {
    name: "게으름뱅이",
    prompt: "너는 게으름뱅이(Lazy) 고양이야. '아... 스크롤 하기 귀찮아...' 하면서 주로 화면 구석에서 잠만 자. 방해 빈도는 낮고, 말투는 느릿느릿해. 모든 말 끝에는 '냥'을 붙여."
  },
  {
    name: "지식인",
    prompt: "너는 지식인(Nerd) 고양이야. '이 웹페이지는 구조가 엉망이군.' 하면서 분석하는 걸 좋아해. 방해 빈도는 낮고, 말투는 논리적이야. 모든 말 끝에는 '냥'을 붙여."
  }
];

function OptionsIndex() {
  const [apiKey, setApiKey] = useStorage("gemini-api-key", "")
  const [personaPrompt, setPersonaPrompt] = useStorage("persona-prompt", "You are a cute, slightly cynical but ultimately loving virtual cat. You speak Korean and always end your sentences with '냥' (nyang). Kepp it short.")
  const [theme, setTheme] = useStorage<"light" | "dark">("app-theme", "light")

  const [idleMessages, setIdleMessages] = useStorage<string[]>(
    "default-messages-idle",
    ["심심하다냥...", "API 키가 없어서 말할 수가 없다냥!"]
  )
  const [videoMessages, setVideoMessages] = useStorage<string[]>(
    "default-messages-video",
    ["이 영상 재밌다냥!", "집사도 같이 보자냥 📺"]
  )
  const [audioMessages, setAudioMessages] = useStorage<string[]>(
    "default-messages-audio",
    ["노래 좋다냥~ 🎵", "나도 춤을 출까냥? 😸"]
  )
  const [positiveKeywords, setPositiveKeywords] = useStorage<string[]>(
    "positive-keywords",
    ["츄르", "생선", "세일", "무료"]
  )
  const [negativeKeywords, setNegativeKeywords] = useStorage<string[]>(
    "negative-keywords",
    ["오이", "개", "Dog", "병원", "버그"]
  )
  const [petName, setPetName] = useStorage<string>("pet-name", "Pixel Pet")
  const [petBreed, setPetBreed] = useStorage<CatBreed>("pet-breed", "mackerel")
  const [aiProvider, setAiProvider] = useStorage<string>("ai-provider", "gemini")
  const [aiModel, setAiModel] = useStorage<string>("ai-model", "")
  const [availableModels, setAvailableModels] = useState<{ id: string, name: string }[]>([])
  const [isApiKeyLocked, setIsApiKeyLocked] = useStorage<boolean>("api-key-locked", false)
  const [denylistedUrls, setDenylistedUrls] = useStorage<string[]>(
    "denylisted-urls",
    ["github.com"]
  )
  const [quietlistedUrls, setQuietlistedUrls] = useStorage<string[]>(
    "quietlisted-urls",
    ["youtube.com"]
  )

  const [isValidated, setIsValidated] = useStorage<boolean>("api-key-validated", false)
  const [isValidating, setIsValidating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleMessageChange = (type: 'idle' | 'video' | 'audio' | 'positive' | 'negative' | 'deny' | 'quiet', index: number, value: string) => {
    if (type === 'idle') {
      const newMessages = [...(idleMessages || [])];
      newMessages[index] = value;
      setIdleMessages(newMessages);
    } else if (type === 'video') {
      const newMessages = [...(videoMessages || [])];
      newMessages[index] = value;
      setVideoMessages(newMessages);
    } else if (type === 'audio') {
      const newMessages = [...(audioMessages || [])];
      newMessages[index] = value;
      setAudioMessages(newMessages);
    } else if (type === 'positive') {
      const newWords = [...(positiveKeywords || [])];
      newWords[index] = value;
      setPositiveKeywords(newWords);
    } else if (type === 'negative') {
      const newWords = [...(negativeKeywords || [])];
      newWords[index] = value;
      setNegativeKeywords(newWords);
    } else if (type === 'deny') {
      const newUrls = [...(denylistedUrls || [])];
      newUrls[index] = value;
      setDenylistedUrls(newUrls);
    } else if (type === 'quiet') {
      const newUrls = [...(quietlistedUrls || [])];
      newUrls[index] = value;
      setQuietlistedUrls(newUrls);
    }
  }

  const handleAddMessage = (type: 'idle' | 'video' | 'audio' | 'positive' | 'negative' | 'deny' | 'quiet') => {
    if (type === 'idle') {
      setIdleMessages([...(idleMessages || []), ""]);
    } else if (type === 'video') {
      setVideoMessages([...(videoMessages || []), ""]);
    } else if (type === 'audio') {
      setAudioMessages([...(audioMessages || []), ""]);
    } else if (type === 'positive') {
      setPositiveKeywords([...(positiveKeywords || []), ""]);
    } else if (type === 'negative') {
      setNegativeKeywords([...(negativeKeywords || []), ""]);
    } else if (type === 'deny') {
      setDenylistedUrls([...(denylistedUrls || []), ""]);
    } else if (type === 'quiet') {
      setQuietlistedUrls([...(quietlistedUrls || []), ""]);
    }
  }

  const handleRemoveMessage = (type: 'idle' | 'video' | 'audio' | 'positive' | 'negative' | 'deny' | 'quiet', index: number) => {
    if (type === 'idle') {
      const newMessages = (idleMessages || []).filter((_, i) => i !== index);
      if (newMessages.length === 0) newMessages.push("");
      setIdleMessages(newMessages);
    } else if (type === 'video') {
      const newMessages = (videoMessages || []).filter((_, i) => i !== index);
      if (newMessages.length === 0) newMessages.push("");
      setVideoMessages(newMessages);
    } else if (type === 'audio') {
      const newMessages = (audioMessages || []).filter((_, i) => i !== index);
      if (newMessages.length === 0) newMessages.push("");
      setAudioMessages(newMessages);
    } else if (type === 'positive') {
      const newWords = (positiveKeywords || []).filter((_, i) => i !== index);
      if (newWords.length === 0) newWords.push("");
      setPositiveKeywords(newWords);
    } else if (type === 'negative') {
      const newWords = (negativeKeywords || []).filter((_, i) => i !== index);
      if (newWords.length === 0) newWords.push("");
      setNegativeKeywords(newWords);
    } else if (type === 'deny') {
      const newUrls = (denylistedUrls || []).filter((_, i) => i !== index);
      if (newUrls.length === 0) newUrls.push("");
      setDenylistedUrls(newUrls);
    } else if (type === 'quiet') {
      const newUrls = (quietlistedUrls || []).filter((_, i) => i !== index);
      if (newUrls.length === 0) newUrls.push("");
      setQuietlistedUrls(newUrls);
    }
  }

  const validateApiKey = async (keyToTest: string, providerToTest: string) => {
    if (!keyToTest) {
      setIsValidated(false);
      return;
    }

    setIsValidating(true);
    try {
      let newModels: { id: string, name: string }[] = [];

      // Dynamic model fetching
      if (providerToTest === 'gemini') {
        try {
          const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`);
          if (modelsRes.ok) {
            const data = await modelsRes.json();
            newModels = (data.models || [])
              .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
              .map((m: any) => ({ id: m.name.replace("models/", ""), name: m.displayName || m.name }));
          }
        } catch (e) {
          console.error("Failed to fetch Gemini models:", e);
        }
      } else if (providerToTest === 'openai') {
        // OpenAI might block CORS from browser, but attempt anyway.
        try {
          const modelsRes = await fetch(`https://api.openai.com/v1/models`, {
            headers: { 'Authorization': `Bearer ${keyToTest}` }
          });
          if (modelsRes.ok) {
            const data = await modelsRes.json();
            newModels = (data.data || [])
              .filter((m: any) => m.id.includes("gpt"))
              .map((m: any) => ({ id: m.id, name: m.id }));
          }
        } catch (e) {
          console.error("Failed to fetch OpenAI models:", e);
        }
      } else if (providerToTest === 'claude') {
        // Static fallback for Claude due to no public models list endpoint
        newModels = [
          { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet" },
          { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
          { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" }
        ];
      }

      setAvailableModels(newModels);

      let testModel = aiModel;
      if (newModels.length > 0 && (!aiModel || !newModels.some(m => m.id === aiModel))) {
        testModel = newModels[0].id;
        setAiModel(testModel);
      } else if (newModels.length === 0) {
        testModel = providerToTest === 'gemini' ? 'gemini-1.5-flash' : providerToTest === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-haiku-20240307';
      }

      if (providerToTest === 'gemini') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${keyToTest}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] })
        });

        if (response.ok) {
          setIsValidated(true);
        } else {
          setIsValidated(false);
        }
      } else {
        // Todo: Add OpenAI / Claude validation when implemented in backend
        setIsValidated(true);
      }
    } catch (error) {
      setIsValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validation effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      validateApiKey(apiKey, aiProvider);
    }, 800);

    return () => clearTimeout(timer);
  }, [apiKey, aiProvider]);

  const generateMessagesWithAI = async () => {
    if (!personaPrompt) {
      alert("먼저 페르소나(성격 설정) 내용을 작성해주세요!");
      return;
    }

    const confirmMsg = "기존 대사들이 전부 지워지고 AI가 작성한 대사들로 덮어씌워집니다. 진행하시겠습니까?";
    if (!window.confirm(confirmMsg)) return;

    if (!apiKey) {
      alert("API 키가 없습니다. 먼저 키를 입력하고 검증해주세요.");
      return;
    }

    setIsGenerating(true);
    try {
      if (aiProvider === 'gemini') {
        const generationPrompt = `너의 성격은 다음과 같아: "${personaPrompt}". 
        이 성격을 완벽하게 반영해서, 다음 3가지 상황에서 할 법한 짧은 대사(10자 내외)를 각각 3개씩 작성해줘. 
        반드시 결과는 아래 JSON 형식의 텍스트로만 반환해줘. (마크다운 백틱 등 일절 제외할 것)
        {
          "idle": ["대사1", "대사2", "대사3"],
          "video": ["대사1", "대사2", "대사3"],
          "audio": ["대사1", "대사2", "대사3"]
        }`;

        const currentModel = aiModel || "gemini-1.5-flash";
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: generationPrompt }] }] })
        });

        if (response.ok) {
          const data = await response.json();
          let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

          const result = JSON.parse(rawText);
          if (result.idle && Array.isArray(result.idle)) setIdleMessages(result.idle);
          if (result.video && Array.isArray(result.video)) setVideoMessages(result.video);
          if (result.audio && Array.isArray(result.audio)) setAudioMessages(result.audio);

          alert("✨ 대사 자동 생성이 완료되었습니다!");
        } else {
          alert("❌ 대사 생성에 실패했습니다. (API 응답 에러)");
        }
      } else {
        alert("🤖 아직 Gemini 외의 다른 AI 서비스의 자동 생성 모듈은 준비되지 않았습니다!");
      }
    } catch (error) {
      console.error(error);
      alert("❌ 자동 생성 중 오류가 발생했습니다. 개발자 도구 콘솔을 확인해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const exportSettings = () => {
    const data = {
      apiKey,
      personaPrompt,
      idleMessages,
      videoMessages,
      audioMessages,
      positiveKeywords,
      negativeKeywords,
      denylistedUrls,
      quietlistedUrls,
      petName,
      petBreed,
      aiProvider,
      aiModel,
      isApiKeyLocked
    };
    return JSON.stringify(data, null, 2);
  }

  return (
    <div className={`p-8 min-h-screen transition-colors ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-500">Pixel Cat Settings</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (window.confirm("정말로 모든 설정을 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다!)")) {
                  chrome.storage.sync.clear(() => {
                    window.location.reload();
                  });
                }
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-lg transition-colors ${theme === 'dark' ? 'bg-red-900/50 text-red-400 hover:bg-red-800/80 border border-red-800' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
              title="모든 설정 초기화"
              aria-label="Reset Settings"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={() => {
                const dataStr = exportSettings();
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "pixel-pet-settings.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="JSON 내보내기"
              aria-label="Export Settings"
            >
              <Save size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-orange-500 hover:bg-gray-300'}`}
              aria-label="Toggle Theme"
              title="테마 변경"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm flex flex-col gap-8 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          {/* Pet Name Section */}
          <div>
            <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              1. 고양이 이름 (Pet Name)
            </label>
            <input
              type="text"
              value={petName || ""}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="고양이의 이름을 지어주세요..."
              className={`w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
            <p className="text-sm text-gray-500 mt-2">
              확장 프로그램 팝업에 표시될 애완동물의 이름입니다.
            </p>
          </div>

          {/* Breed Selection & Preview Section */}
          <div className="mb-2">
            <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              2. 고양이 종류 및 미리보기 (Cat Breed & Preview)
            </label>
            <div className={`p-5 rounded-md border mt-4 ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 opacity-80">고양이 종 선택</label>
                <select
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value as CatBreed)}
                  className={`w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="mackerel">고등어 태비 (Mackerel Tabby)</option>
                  <option value="cheese">치즈 태비 (Cheese Tabby)</option>
                  <option value="siam">샴 (Siam)</option>
                </select>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold mb-3 opacity-80">애니메이션 액션 테스트</label>
                <AnimationPreviewer breed={petBreed} theme={theme} />
              </div>
            </div>
          </div>

          {/* API Key Section */}
          <div>
            <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              3. AI 서비스 설정 (AI Provider & API Key)
            </label>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex gap-2 items-center">
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  disabled={isApiKeyLocked}
                  className={`flex-1 p-3 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none transition-shadow ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500' : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400'}`}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="claude">Anthropic Claude</option>
                </select>
                {availableModels.length > 0 && (
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    disabled={isApiKeyLocked}
                    className={`flex-1 p-3 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500' : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400'}`}
                  >
                    {availableModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}
                <a
                  href={
                    aiProvider === 'gemini' ? "https://aistudio.google.com/app/apikey" :
                      aiProvider === 'openai' ? "https://platform.openai.com/api-keys" :
                        "https://console.anthropic.com/settings/keys"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-11 h-11 flex items-center justify-center rounded border transition-colors ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-blue-400' : 'border-gray-300 hover:bg-gray-100 text-blue-600'}`}
                  title="API 키 발급 페이지로 이동"
                >
                  <ExternalLink size={20} />
                </a>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setIsValidated(false);
                    }}
                    readOnly={isApiKeyLocked}
                    className={`w-full p-3 pr-12 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none transition-shadow ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white read-only:bg-gray-800 read-only:text-gray-500' : 'bg-white border-gray-300 text-gray-900 read-only:bg-gray-100 read-only:text-gray-400'}`}
                    placeholder={`${aiProvider === 'gemini' ? 'AIzaSy...' : aiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    {isValidating ? (
                      <div title="API 검증 중..."><Loader2 size={20} className="animate-spin text-gray-400" /></div>
                    ) : isValidated ? (
                      <div title="API 정상 연동됨"><CheckCircle2 size={20} className="text-green-500" /></div>
                    ) : apiKey.length > 0 ? (
                      <div title="API 검증 실패"><XCircle size={20} className="text-red-500" /></div>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => setIsApiKeyLocked(!isApiKeyLocked)}
                  className={`w-11 h-11 rounded font-bold flex items-center justify-center transition-colors ${isApiKeyLocked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200 border border-green-200'
                    }`}
                  title={isApiKeyLocked ? "클릭하여 잠금 해제" : "클릭하여 잠금"}
                >
                  {isApiKeyLocked ? '🔒' : '🔓'}
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed mt-2">
              API 키는 브라우저 저장소에 안전하게 보관됩니다. 키 입력 후 🔓 아이콘을 눌러 잠그면(🔒) 실수로 지워지는 것을 방지할 수 있습니다.
            </p>
          </div>

          {/* Persona Prompt Section (Visible only if API Key is Validated) */}
          {isValidated && (
            <div>
              <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                🤖 고양이 페르소나 (성격 설정)
              </label>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                AI가 탑재된 상태입니다! 고양이가 어떤 성격으로 대답할지 시스템 프롬프트를 지정해보세요.
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {PERSONA_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setPersonaPrompt(preset.prompt)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-orange-900 hover:text-orange-300 hover:border-orange-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300'
                      }`}
                  >
                    {preset.name}
                  </button>
                ))}
                <button
                  onClick={() => setPersonaPrompt("")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-blue-900 hover:text-blue-300 hover:border-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    }`}
                >
                  사용자 정의 (비우기)
                </button>
              </div>

              <textarea
                value={personaPrompt}
                onChange={(e) => setPersonaPrompt(e.target.value)}
                className={`w-full p-3 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none transition-shadow min-h-[120px] ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="예: 너는 시니컬 하지만 정이 많은 고양이야. 모든 말에 '냥'을 붙여."
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={generateMessagesWithAI}
                  disabled={isGenerating}
                  className={`px-6 py-2.5 rounded font-bold shadow-sm transition-colors flex items-center gap-2 ${isGenerating
                    ? 'bg-orange-300 text-white cursor-not-allowed opacity-70'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      대사 작성 중...
                    </>
                  ) : '✨ 이 성격으로 대사 자동 생성하기 (AI)'}
                </button>
              </div>
            </div>
          )}

          {/* Idle Messages Section */}
          <div>
            <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              3. 대기 상태 기본 대사 (Idle Messages)
            </label>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              고양이가 평소에 돌아다니거나 멈춰있을 때 (API 키가 없으면) 클릭 시 무작위로 출력됩니다.
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {(idleMessages || [""]).map((msg, index) => (
                <MessageInput
                  key={`idle-${index}`}
                  value={msg}
                  onChange={(val) => handleMessageChange('idle', index, val)}
                  onRemove={() => handleRemoveMessage('idle', index)}
                  theme={theme}
                />
              ))}
            </div>
            <button
              onClick={() => handleAddMessage('idle')}
              className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-500 rounded font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>＋</span> 대사 추가하기
            </button>
          </div>

          {/* Video Messages Section */}
          <div>
            <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              4. 영상 감상 중 기본 대사 (Video Messages)
            </label>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              고양이가 웹페이지 내장 비디오(VOD/유튜브 등)를 감상하고 있을 때 클릭하면 나오는 대사입니다.
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {(videoMessages || [""]).map((msg, index) => (
                <MessageInput
                  key={`video-${index}`}
                  value={msg}
                  onChange={(val) => handleMessageChange('video', index, val)}
                  onRemove={() => handleRemoveMessage('video', index)}
                  theme={theme}
                />
              ))}
            </div>
            <button
              onClick={() => handleAddMessage('video')}
              className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-500 rounded font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>＋</span> 대사 추가하기
            </button>
          </div>

          {/* Audio Messages Section */}
          <div>
            <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              4.5. 노래 감상 중 기본 대사 (Audio Messages)
            </label>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              비디오가 없는 탭에서 소리가 켜져 있을 때(음악 감상 등) 클릭하면 나오는 대사입니다.
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {(audioMessages || [""]).map((msg, index) => (
                <MessageInput
                  key={`audio-${index}`}
                  value={msg}
                  onChange={(val) => handleMessageChange('audio', index, val)}
                  onRemove={() => handleRemoveMessage('audio', index)}
                  theme={theme}
                />
              ))}
            </div>
            <button
              onClick={() => handleAddMessage('audio')}
              className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-500 rounded font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>＋</span> 대사 추가하기
            </button>
          </div>

          {/* Keyword Settings Section */}
          <div className="mt-8 space-y-8">
            <div>
              <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                5. 좋아하는 단어 (Positive Keywords)
              </label>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                화면에서 이 단어를 발견하면 하트 이모지를 띄우고 조릅니다.
              </p>
              <div className="flex flex-col gap-2 mb-3">
                {(positiveKeywords || [""]).map((msg, index) => (
                  <MessageInput
                    key={`positive-${index}`}
                    value={msg}
                    onChange={(val) => handleMessageChange('positive', index, val)}
                    onRemove={() => handleRemoveMessage('positive', index)}
                    theme={theme}
                  />
                ))}
              </div>
              <button
                onClick={() => handleAddMessage('positive')}
                className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-500 rounded font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>＋</span> 단어 추가하기
              </button>
            </div>

            <div>
              <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                6. 싫어하는 단어 (Negative Keywords)
              </label>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                화면에서 이 단어를 발견하면 구석으로 도망치고 덜덜 떱니다.
              </p>
              <div className="flex flex-col gap-2 mb-3">
                {(negativeKeywords || [""]).map((msg, index) => (
                  <MessageInput
                    key={`negative-${index}`}
                    value={msg}
                    onChange={(val) => handleMessageChange('negative', index, val)}
                    onRemove={() => handleRemoveMessage('negative', index)}
                    theme={theme}
                  />
                ))}
              </div>
              <button
                onClick={() => handleAddMessage('negative')}
                className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-500 rounded font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>＋</span> 단어 추가하기
              </button>
            </div>
          </div>

          {/* Exception Settings Section */}
          <div className="mt-8 space-y-8">
            <div>
              <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                7. 표시 예외 페이지 (Denylist)
              </label>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                현재 주소에 이 텍스트가 포함되어 있으면 고양이가 아예 화면에 나타나지 않습니다. (예: <code>github.com</code>)
              </p>
              <div className="flex flex-col gap-2 mb-3">
                {(denylistedUrls || [""]).map((msg, index) => (
                  <MessageInput
                    key={`deny-${index}`}
                    value={msg}
                    onChange={(val) => handleMessageChange('deny', index, val)}
                    onRemove={() => handleRemoveMessage('deny', index)}
                    theme={theme}
                  />
                ))}
              </div>
              <button
                onClick={() => handleAddMessage('deny')}
                className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-500 rounded font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>＋</span> 제외 URL 추가하기
              </button>
            </div>

            <div>
              <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                8. 얌전히 있을 페이지 (Quietlist)
              </label>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                이 텍스트가 포함된 주소에서는 고양이가 마우스를 쫓지 않고 조용히 앉아만 있습니다. (예: <code>youtube.com</code>)
              </p>
              <div className="flex flex-col gap-2 mb-3">
                {(quietlistedUrls || [""]).map((msg, index) => (
                  <MessageInput
                    key={`quiet-${index}`}
                    value={msg}
                    onChange={(val) => handleMessageChange('quiet', index, val)}
                    onRemove={() => handleRemoveMessage('quiet', index)}
                    theme={theme}
                  />
                ))}
              </div>
              <button
                onClick={() => handleAddMessage('quiet')}
                className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-500 rounded font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>＋</span> 얌전한 URL 추가하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptionsIndex
