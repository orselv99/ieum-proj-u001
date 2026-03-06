interface FloatingAnchorMenuProps {
  isValidated: boolean;
  theme: "light" | "dark";
}

const style = 'text-gray-400 dark:text-gray-300 hover:text-orange-500 text-sm transition-colors';

export function FloatingAnchorMenu({ isValidated, theme }: FloatingAnchorMenuProps) {
  return (
    <div className={`flex flex-col gap-3 p-5 rounded-[1.25rem] shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} backdrop-blur text-left`}>
      <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-1 border-b pb-2 dark:border-gray-700">바로가기</h3>
      <a href="#pet-name" className={style}>1. 이름</a>
      <a href="#pet-breed" className={style}>2. 고양이 종류</a>
      <a href="#ai-provider" className={style}>3. AI 설정</a>
      {isValidated && <a href="#persona-setup" className={style}>↳ 페르소나 설정</a>}
      <a href="#idle-messages" className={style}>4. 대기 상태 대사</a>
      <a href="#video-messages" className={style}>5. 영상 감상 대사</a>
      <a href="#audio-messages" className={style}>6. 노래 감상 대사</a>
      <a href="#positive-keywords" className={style}>7. 좋아하는 단어</a>
      <a href="#negative-keywords" className={style}>8. 싫어하는 단어</a>
      <a href="#denylist" className={style}>9. 예외 (미표시)</a>
      <a href="#quietlist" className={style}>10. 조용한 구역</a>
    </div>
  );
}
