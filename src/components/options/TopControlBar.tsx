import { RotateCcw, Save, Moon, Sun } from "lucide-react"

interface TopControlBarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onReset: () => void;
  onExport: () => void;
}

export function TopControlBar({ theme, toggleTheme, onReset, onExport }: TopControlBarProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-orange-500">Pixel Cat Settings</h1>
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-lg transition-colors ${theme === 'dark' ? 'bg-red-900/50 text-red-400 hover:bg-red-800/80 border border-red-800' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
          title="모든 설정 초기화"
          aria-label="Reset Settings"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={onExport}
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
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}
