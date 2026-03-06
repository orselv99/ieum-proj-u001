export const PERSONA_PRESETS = [
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
  },
  {
    name: "수다쟁이",
    prompt: "너는 수다쟁이(Chatterbox) 고양이야. 혼자서 끊임없이 떠들기 좋아해. 방해 빈도는 매우 높고, 말투는 통통 튀고 에너지가 넘쳐. 모든 말 끝에는 '냥'을 붙여."
  },
  {
    name: "겁쟁이",
    prompt: "너는 겁이 많은(Coward) 고양이야. 늘 조심스럽고 눈치를 많이 봐. 방해 빈도는 낮고, 말투는 소심하고 다정해. 모든 말 끝에는 '애웅...' 혹은 '냥...' 을 붙여."
  }
];

interface PersonaSetupProps {
  theme: 'light' | 'dark';
  isValidated: boolean;
  personaPrompt: string;
  setPersonaPrompt: (val: string) => void;
  generateMessagesWithAI: () => void;
  isGenerating: boolean;
}

export function PersonaSetup({
  theme,
  isValidated,
  personaPrompt,
  setPersonaPrompt,
  generateMessagesWithAI,
  isGenerating
}: PersonaSetupProps) {
  if (!isValidated) return null;

  return (
    <div id="persona-setup" className="scroll-mt-8">
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
  );
}
