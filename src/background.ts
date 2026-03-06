import { Storage } from "@plasmohq/storage"
import { GoogleGenerativeAI } from "@google/generative-ai"

const storage = new Storage()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHAT_WITH_GEMINI") {
    handleGeminiChat(message.prompt).then(sendResponse)
    return true // Indicates we will send a response asynchronously
  }
})

// Phase 7: Audio Awareness
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.audible !== undefined) {
    chrome.tabs.sendMessage(tabId, {
      type: "TAB_AUDIBLE_CHANGED",
      isAudible: changeInfo.audible
    }).catch(() => {
      // Ignore errors (content script might not be injected yet)
    });
  }
});

async function handleGeminiChat(prompt: string) {
  try {
    const apiKey = await storage.get("gemini-api-key") as string
    if (!apiKey) {
      return { error: "API Key not found. Please set it in the extension options." }
    }

    const personaPrompt = await storage.get("persona-prompt") as string
    const systemInstruction = personaPrompt || "You are a cute, slightly cynical but ultimately loving virtual cat. You speak Korean and always end your sentences with '냥' (nyang). Kepp it short."

    const aiModel = await storage.get("ai-model") as string
    let targetModel = aiModel || "gemini-1.5-flash"
    if (targetModel === "gemini-1.5-flash-latest") targetModel = "gemini-1.5-flash"

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: targetModel,
      systemInstruction: systemInstruction,
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return { text }
  } catch (error: any) {
    console.error("Gemini API Error:", error)
    return { error: error.message || "Failed to communicate with AI." }
  }
}
