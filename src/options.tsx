import { useStorage } from "@plasmohq/storage/hook"
import { useState, useEffect, useRef } from "react"
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
        className={`px-4 rounded font-bold transition-colors flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700 hover:bg-red-900 text-gray-300 hover:text-red-400' : 'bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600'
          }`}
        aria-label="제거"
      >
        ✕
      </button>
    </div>
  )
}

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

  const handleMessageChange = (type: 'idle' | 'video' | 'audio' | 'positive' | 'negative', index: number, value: string) => {
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
    }
  }

  const handleAddMessage = (type: 'idle' | 'video' | 'audio' | 'positive' | 'negative') => {
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
    }
  }

  const handleRemoveMessage = (type: 'idle' | 'video' | 'audio' | 'positive' | 'negative', index: number) => {
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
    }
  }

  // Mock API Validation (just checking length for now)
  const isApiValid = apiKey && apiKey.length > 5;

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const exportSettings = () => {
    const data = { apiKey, personaPrompt, idleMessages, videoMessages, audioMessages, positiveKeywords, negativeKeywords };
    return JSON.stringify(data, null, 2);
  }

  return (
    <div className={`p-8 min-h-screen transition-colors ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-500">Pixel Pet Settings</h1>
          <div className="flex gap-3">
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
              className={`px-4 py-2 rounded text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}
            >
              JSON 내보내기
            </button>
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-lg transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm flex flex-col gap-8 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          {/* API Key Section */}
          <div>
            <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              1. Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={`w-full p-3 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none transition-shadow mb-2 mt-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="AIzaSy..."
            />
            <p className="text-sm text-gray-500 leading-relaxed">
              Your API key is securely stored in your browser's local storage. We use it to communicate directly with Google's Gemini API so your Pixel Pet can talk to you!
            </p>
          </div>

          {/* Persona Prompt Section (Visible only if API Key exists) */}
          {isApiValid && (
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
              </div>

              <textarea
                value={personaPrompt}
                onChange={(e) => setPersonaPrompt(e.target.value)}
                className={`w-full p-3 border rounded focus:ring-2 focus:ring-orange-400 focus:outline-none transition-shadow min-h-[120px] ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="예: 너는 시니컬 하지만 정이 많은 고양이야."
              />
            </div>
          )}

          {/* Idle Messages Section */}
          <div>
            <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              2. 대기 상태 기본 대사 (Idle Messages)
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
              3. 영상 감상 중 기본 대사 (Video Messages)
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
              3.5. 노래 감상 중 기본 대사 (Audio Messages)
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
                4. 좋아하는 단어 (Positive Keywords)
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
                5. 싫어하는 단어 (Negative Keywords)
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
        </div>
      </div>
    </div>
  )
}

export default OptionsIndex
