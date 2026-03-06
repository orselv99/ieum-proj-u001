import { useRef, useState, useEffect } from "react";
import { SpriteAnimator, CAT_STATES } from "../../engine/SpriteAnimator";
import type { AnimationState, CatBreed } from "../../engine/SpriteAnimator";

export const AnimationPreviewer = ({ breed, theme }: { breed: CatBreed, theme: string }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const animatorRef = useRef<SpriteAnimator | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const [activeState, setActiveState] = useState<AnimationState>('idle');

  useEffect(() => {
    animatorRef.current = new SpriteAnimator(activeState, breed);
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      if (!animatorRef.current || !previewRef.current) return;
      let dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Clamp delta to prevent huge jumps after tab switch (max 50ms)
      dt = Math.min(dt, 50);

      animatorRef.current.update(dt);

      previewRef.current.style.backgroundImage = `url(${animatorRef.current.spriteUrl})`;
      previewRef.current.style.backgroundPosition = animatorRef.current.getBackgroundPosition();

      reqIdRef.current = requestAnimationFrame(loop);
    };
    reqIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setBreed(breed);
    }
  }, [breed]);

  useEffect(() => {
    if (animatorRef.current) {
      animatorRef.current.setState(activeState);
    }
  }, [activeState]);

  const allStates = Object.keys(CAT_STATES) as AnimationState[];

  return (
    <div className="flex flex-col gap-4">
      <div className={`w-full h-32 flex items-center justify-center rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} relative overflow-hidden`}>
        <div
          ref={previewRef}
          className="absolute"
          style={{ width: '128px', height: '64px', transform: 'scale(1.5)', imageRendering: 'pixelated' }}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {allStates.map((state) => (
          <button
            key={state}
            onClick={() => setActiveState(state)}
            className={`px-3 py-1 text-xs rounded border transition-colors ${activeState === state ? 'bg-orange-500 text-white border-orange-600 font-bold shadow-sm' : theme === 'dark' ? 'bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {state}
          </button>
        ))}
      </div>
    </div>
  );
};
