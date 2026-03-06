import { useStorage } from "@plasmohq/storage/hook"
import { useState, useEffect } from "react"
import type { CatBreed } from "./engine/SpriteAnimator"
import { StringListEditor } from "./components/options/StringListEditor"
import { FloatingAnchorMenu } from "./components/options/FloatingAnchorMenu"
import { TopControlBar } from "./components/options/TopControlBar"
import { PetBasicSetup } from "./components/options/PetBasicSetup"
import { AIServiceSetup } from "./components/options/AIServiceSetup"
import { PersonaSetup } from "./components/options/PersonaSetup"
import "./style.css"

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

  // State definition stops here. Remove all local Message handle state functions

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
      if (testModel === "gemini-1.5-flash-latest") {
        testModel = "gemini-1.5-flash";
        setAiModel(testModel);
      }

      if (newModels.length > 0 && (!testModel || !newModels.some(m => m.id === testModel))) {
        testModel = newModels[0].id;
        setAiModel(testModel);
      } else if (!testModel || newModels.length === 0) {
        testModel = providerToTest === 'gemini' ? 'gemini-1.5-flash' : providerToTest === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-haiku-20240307';
        setAiModel(testModel);
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

        let currentModel = aiModel || "gemini-1.5-flash";
        if (currentModel === "gemini-1.5-flash-latest") currentModel = "gemini-1.5-flash";

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

  const handleReset = () => {
    if (window.confirm("정말로 모든 설정을 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다!)")) {
      chrome.storage.sync.clear(() => {
        window.location.reload();
      });
    }
  };

  const handleExport = () => {
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
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pixel-pet-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-8 min-h-screen transition-colors relative ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="max-w-2xl mx-auto">
        <TopControlBar
          theme={theme}
          toggleTheme={toggleTheme}
          onReset={handleReset}
          onExport={handleExport}
        />

        <div className="relative">
          <div className="absolute right-full mr-8 top-0 bottom-0 hidden xl:block w-[200px] z-50">
            <div className="sticky top-8">
              <FloatingAnchorMenu
                theme={theme}
                isValidated={isValidated} />
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-sm flex flex-col gap-8 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
            <PetBasicSetup
              theme={theme}
              petName={petName}
              setPetName={setPetName}
              petBreed={petBreed}
              setPetBreed={setPetBreed}
            />

            <AIServiceSetup
              theme={theme}
              aiProvider={aiProvider}
              setAiProvider={setAiProvider}
              aiModel={aiModel}
              setAiModel={setAiModel}
              availableModels={availableModels}
              apiKey={apiKey}
              setApiKey={setApiKey}
              isApiKeyLocked={isApiKeyLocked}
              setIsApiKeyLocked={setIsApiKeyLocked}
              isValidated={isValidated}
              isValidating={isValidating}
              setIsValidated={setIsValidated}
            />

            <PersonaSetup
              theme={theme}
              isValidated={isValidated}
              personaPrompt={personaPrompt}
              setPersonaPrompt={setPersonaPrompt}
              generateMessagesWithAI={generateMessagesWithAI}
              isGenerating={isGenerating}
            />

            <StringListEditor
              id="idle-messages"
              storageKey="default-messages-idle"
              defaultValues={["심심하다냥...", "API 키가 없어서 말할 수가 없다냥!"]}
              theme={theme}
              title="4. 대기 상태 기본 대사 (Idle Messages)"
              description="고양이가 평소에 돌아다니거나 멈춰있을 때 무작위로 출력됩니다."
              addButtonText="대사 추가하기"
            />

            <StringListEditor
              id="video-messages"
              storageKey="default-messages-video"
              defaultValues={["이 영상 재밌다냥!", "집사도 같이 보자냥 📺"]}
              theme={theme}
              title="5. 영상 감상 중 기본 대사 (Video Messages)"
              description="고양이가 비디오(유튜브 등)를 감상하고 있을 때 나오는 대사입니다."
              addButtonText="대사 추가하기"
            />

            <StringListEditor
              id="audio-messages"
              storageKey="default-messages-audio"
              defaultValues={["노래 좋다냥~ 🎵", "나도 춤을 출까냥? 😸"]}
              theme={theme}
              title="6. 노래 감상 중 기본 대사 (Audio Messages)"
              description="비디오가 없는 탭에서 음악 감상 등을 할 때 나오는 대사입니다."
              addButtonText="대사 추가하기"
            />

            <div className="mt-8 space-y-8">
              <StringListEditor
                id="positive-keywords"
                storageKey="positive-keywords"
                defaultValues={["츄르", "생선", "세일", "무료"]}
                theme={theme}
                title="7. 좋아하는 단어 (Positive Keywords)"
                description="화면에서 이 단어를 발견하면 😻 하트 이모지를 띄우고 조릅니다."
                addButtonText="단어 추가하기"
              />

              <StringListEditor
                id="negative-keywords"
                storageKey="negative-keywords"
                defaultValues={["오이", "개", "Dog", "병원", "버그"]}
                theme={theme}
                title="8. 싫어하는 단어 (Negative Keywords)"
                description="화면에서 이 단어를 발견하면 구석으로 도망치고 🙀 덜덜 떱니다."
                addButtonText="단어 추가하기"
              />
            </div>

            <div className="mt-8 space-y-8">
              <StringListEditor
                id="denylist"
                storageKey="denylisted-urls"
                defaultValues={["github.com"]}
                theme={theme}
                title="9. 표시 예외 페이지 (Denylist)"
                description={
                  <>현재 주소에 텍스트가 포함되어 있으면 고양이가 <strong>아예</strong> 나타나지 않습니다.</>
                }
                addButtonText="제외 URL 추가하기"
              />

              <StringListEditor
                id="quietlist"
                storageKey="quietlisted-urls"
                defaultValues={["youtube.com"]}
                theme={theme}
                title="10. 얌전히 있을 페이지 (Quietlist)"
                description={
                  <>이 텍스트가 포함된 주소에서는 고양이가 방해하지 않고 조용히 보기만 합니다.</>
                }
                addButtonText="얌전한 URL 추가하기"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptionsIndex
