export const ChatBubble = ({
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
