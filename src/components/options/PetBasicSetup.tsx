import { AnimationPreviewer } from "./AnimationPreviewer"
import type { CatBreed } from "../../engine/SpriteAnimator"

interface PetBasicSetupProps {
  theme: 'light' | 'dark';
  petName: string;
  setPetName: (val: string) => void;
  petBreed: CatBreed;
  setPetBreed: (val: CatBreed) => void;
}

export function PetBasicSetup({ theme, petName, setPetName, petBreed, setPetBreed }: PetBasicSetupProps) {
  return (
    <>
      <div id="pet-name" className="scroll-mt-8">
        <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          1. 고양이 이름 (Pet Name)
        </label>
        <input
          type="text"
          value={petName || ""}
          onChange={(e) => setPetName(e.target.value)}
          placeholder="고양이의 이름을 지어주세요..."
          className={`w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
        />
        <p className="text-sm text-gray-500 mt-2">
          확장 프로그램 팝업에 표시될 애완동물의 이름입니다.
        </p>
      </div>

      <div id="pet-breed" className="mb-2 scroll-mt-8">
        <label className={`block text-lg font-semibold mb-2 border-b pb-2 ${theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
          2. 고양이 종류 및 미리보기 (Cat Breed & Preview)
        </label>
        <div className={`p-5 rounded-md border mt-4 ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 opacity-80">고양이 종 선택</label>
            <select
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value as CatBreed)}
              className={`w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="mackerel">고등어 태비 (Mackerel Tabby)</option>
              <option value="cheese">치즈 태비 (Cheese Tabby)</option>
              <option value="siam">샴 (Siam)</option>
            </select>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold mb-3 opacity-80">애니메이션 액션 테스트</label>
            <AnimationPreviewer breed={petBreed} theme={theme} />
          </div>
        </div>
      </div>
    </>
  );
}
