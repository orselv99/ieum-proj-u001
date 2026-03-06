import { useEffect, useRef, MutableRefObject } from "react";
import { Physics } from "../engine/Physics";
import { SpriteAnimator } from "../engine/SpriteAnimator";
import { StateMachine } from "../engine/StateMachine";

export function usePetEngine(
  catRef: MutableRefObject<HTMLDivElement | null>,
  isExcluded: boolean,
  setAwarenessType: (type: string | null) => void
) {
  const engineRef = useRef<{
    physics: Physics;
    animator: SpriteAnimator;
    stateMachine: StateMachine;
    lastTime: number;
    reqId: number;
  } | null>(null);

  useEffect(() => {
    if (isExcluded) return;

    // Initialize Engine
    const physics = new Physics(100, window.innerHeight - 100, 64, 64);
    const animator = new SpriteAnimator("idle");
    const stateMachine = new StateMachine(physics, animator);

    stateMachine.setAwarenessCallback((type: string | null) => {
      setAwarenessType(type);
    });

    engineRef.current = {
      physics,
      animator,
      stateMachine,
      lastTime: performance.now(),
      reqId: 0
    };

    const loop = (time: number) => {
      if (!engineRef.current || !catRef.current) return;

      const { physics, animator, stateMachine, lastTime } = engineRef.current;
      let delta = time - lastTime;
      engineRef.current.lastTime = time;

      // Clamp delta to prevent huge jumps after tab switch (max 50ms)
      delta = Math.min(delta, 50);

      // Update Engine
      stateMachine.update(delta);
      stateMachine.handleWallCollision(document.documentElement.clientWidth);
      physics.update(delta);
      animator.update(delta);

      // Apply to DOM
      const scaleX = physics.isFacingRight ? 1 : -1;

      catRef.current.style.transform = `translate(${physics.x}px, ${physics.y}px)`;

      // Dynamic Bubble positioning logic
      const bubbleEl = catRef.current.querySelector('#pixel-pet-bubble') as HTMLDivElement;
      if (bubbleEl) {
        let bubbleX = (physics.width / 2) - (bubbleEl.offsetWidth / 2);
        const globalLeft = physics.x + bubbleX;
        const globalRight = globalLeft + bubbleEl.offsetWidth;

        if (globalLeft < 10) {
          bubbleX += (10 - globalLeft);
        } else if (globalRight > document.documentElement.clientWidth - 10) {
          bubbleX -= (globalRight - (document.documentElement.clientWidth - 10));
        }

        bubbleEl.style.left = `${bubbleX}px`;

        const tailEl = bubbleEl.querySelector('#pixel-pet-bubble-tail') as HTMLDivElement;
        if (tailEl) {
          const tailX = (physics.width / 2) - bubbleX - 8;
          tailEl.style.left = `${tailX}px`;
        }
      }

      const visualElement = catRef.current.querySelector('.cat-visual') as HTMLDivElement;
      if (visualElement) {
        visualElement.style.transform = `scaleX(${scaleX})`;
        visualElement.style.backgroundImage = `url(${animator.spriteUrl})`;
        visualElement.style.backgroundPosition = animator.getBackgroundPosition();
      }

      engineRef.current.reqId = requestAnimationFrame(loop);
    };

    engineRef.current.reqId = requestAnimationFrame(loop);

    return () => {
      if (engineRef.current) {
        cancelAnimationFrame(engineRef.current.reqId);
      }
    };
  }, [isExcluded, setAwarenessType]);

  const setBreed = (breed: string) => {
    if (engineRef.current && breed) {
      engineRef.current.animator.setBreed(breed);
    }
  };

  return {
    engineRef,
    setBreed
  };
}
