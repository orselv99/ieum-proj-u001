import { useState, useEffect, useRef } from "react"

export function MessageInput({ value, onChange, onRemove, theme }: { value: string, onChange: (val: string) => void, onRemove: () => void, theme: 'light' | 'dark' }) {
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
        placeholder="내용을 입력하세요..."
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
