import { useState } from "react"
import "./style.css"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div className="p-4 w-60 bg-white shadow-lg">
      <h2 className="text-xl font-bold mb-2 text-orange-500">
        Pixel Pet!
      </h2>
      <input
        className="w-full border border-gray-300 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        onChange={(e) => setData(e.target.value)}
        value={data}
        placeholder="Name your pet..."
      />
      <p className="text-sm text-gray-600">
        Meow! Your pixel pet is active on this page.
      </p>
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="mt-4 w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold py-2 px-4 rounded transition-colors"
      >
        Open Settings
      </button>
    </div>
  )
}

export default IndexPopup
