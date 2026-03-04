import { useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import "./style.css"

function IndexPopup() {
  const [currentUrl, setCurrentUrl] = useState("")
  // Must match the default used in options.tsx exactly
  const [denylistedUrls, setDenylistedUrls] = useStorage<string[]>(
    "denylisted-urls",
    ["github.com"]
  )

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        try {
          const urlObj = new URL(tabs[0].url);
          setCurrentUrl(urlObj.hostname);
        } catch {
          setCurrentUrl(tabs[0].url);
        }
      }
    });
  }, []);

  const isExcluded = currentUrl && (denylistedUrls || []).some(url => currentUrl.includes(url));

  const toggleExclusion = () => {
    if (!currentUrl) return;

    if (isExcluded) {
      setDenylistedUrls((denylistedUrls || []).filter(url => !currentUrl.includes(url)));
    } else {
      setDenylistedUrls([...(denylistedUrls || []), currentUrl]);
    }
  }

  return (
    <div className="p-4 w-64 bg-white shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-500">
        <span>🐾</span> Pixel Cat
      </h2>

      {currentUrl && (
        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-500 mb-2 truncate" title={currentUrl}>
            현재 도메인: <strong className="text-gray-700">{currentUrl}</strong>
          </p>
          <button
            onClick={toggleExclusion}
            className={`w-full py-2 px-3 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${isExcluded
              ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
              }`}
          >
            {isExcluded ? "🚫 현재 사이트 차단됨" : "✅ 현재 사이트 허용됨"}
          </button>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            클릭하여 고양이 표시 여부를 전환하세요 (새로고침 시 적용)
          </p>
        </div>
      )}

      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold py-2 px-4 rounded transition-colors"
      >
        설정 열기
      </button>
    </div>
  )
}

export default IndexPopup
