import { ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface AIServiceSetupProps {
  theme: 'light' | 'dark';
  aiProvider: string;
  setAiProvider: (val: string) => void;
  aiModel: string;
  setAiModel: (val: string) => void;
  availableModels: { id: string, name: string }[];
  apiKey: string;
  setApiKey: (val: string) => void;
  isApiKeyLocked: boolean;
  setIsApiKeyLocked: (val: boolean) => void;
  isValidated: boolean;
  isValidating: boolean;
  setIsValidated: (val: boolean) => void;
}

export function AIServiceSetup({
  theme,
  aiProvider,
  setAiProvider,
  aiModel,
  setAiModel,
  availableModels,
  apiKey,
  setApiKey,
  isApiKeyLocked,
  setIsApiKeyLocked,
  isValidated,
  isValidating,
  setIsValidated
}: AIServiceSetupProps) {
  return (
    <div id="ai-provider" className="scroll-mt-8">
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
  );
}
