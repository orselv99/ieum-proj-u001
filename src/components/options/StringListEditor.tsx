import { useStorage } from "@plasmohq/storage/hook"
import { MessageInput } from "./MessageInput"

interface StringListEditorProps {
  storageKey: string;
  defaultValues: string[];
  theme: 'light' | 'dark';
  title: string;
  description: React.ReactNode;
  addButtonText: string;
  id?: string;
}

export function StringListEditor({
  storageKey,
  defaultValues,
  theme,
  title,
  description,
  addButtonText,
  id
}: StringListEditorProps) {
  const [items, setItems] = useStorage<string[]>(storageKey, defaultValues);

  const handleChange = (index: number, value: string) => {
    const newItems = [...(items || [])];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleAdd = () => {
    setItems([...(items || []), ""]);
  };

  const handleRemove = (index: number) => {
    const newItems = (items || []).filter((_, i) => i !== index);
    if (newItems.length === 0) newItems.push("");
    setItems(newItems);
  };

  return (
    <div id={id} className={`scroll-mt-8`}>
      <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
        {title}
      </label>
      <div className="text-sm text-gray-500 leading-relaxed mb-4">
        {description}
      </div>
      <div className="flex flex-col gap-2 mb-3">
        {(items || [""]).map((msg, index) => (
          <MessageInput
            key={`${storageKey}-${index}`}
            value={msg}
            onChange={(val) => handleChange(index, val)}
            onRemove={() => handleRemove(index)}
            theme={theme}
          />
        ))}
      </div>
      <button
        onClick={handleAdd}
        className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-500 rounded font-bold transition-colors flex items-center justify-center gap-2"
      >
        <span>＋</span> {addButtonText}
      </button>
    </div>
  );
}
