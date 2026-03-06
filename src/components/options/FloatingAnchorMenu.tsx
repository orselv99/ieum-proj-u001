interface FloatingAnchorMenuProps {
  isValidated: boolean;
}

export function FloatingAnchorMenu({ isValidated }: FloatingAnchorMenuProps) {
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 p-5 rounded-2xl shadow-sm border bg-white/80 dark:bg-gray-800/80 backdrop-blur z-50">
      <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-1 border-b pb-2 dark:border-gray-700">바로가기</h3>
      <a href="#pet-name" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors">1. 이름</a>
      <a href="#pet-breed" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors">2. 고양이 종류</a>
      <a href="#ai-provider" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors">3. AI 설정</a>
      {isValidated && <a href="#persona-setup" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors opacity-80 pl-2">↳ 페르소나 설정</a>}
      <a href="#idle-messages" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors">4. 대기 상태 대사</a>
      <a href="#video-messages" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors pl-2">5. 영상 감상 대사</a>
      <a href="#audio-messages" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors pl-2">6. 노래 감상 대사</a>
      <a href="#positive-keywords" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors">7. 좋아하는 단어</a>
      <a href="#negative-keywords" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors">8. 싫어하는 단어</a>
      <a href="#denylist" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors">9. 예외 (미표시)</a>
      <a href="#quietlist" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold text-sm transition-colors">10. 조용한 구역</a>
    </div>
  );
}
