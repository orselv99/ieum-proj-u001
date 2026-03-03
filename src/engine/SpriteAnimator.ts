type AnimationState = "idle" | "walk" | "sit" | "run" | "push"

interface StateConfig {
  name: AnimationState
  frameCount: number
  fps: number
  spriteUrl: string
  frameWidth: number
  frameHeight: number
}

// TODO: User provided assets/idle.png. We will need assets for Walk eventually
// For now, let's use idle.png to mock both states if walk doesn't exist yet, 
// or maybe assume there is a generic sprite.
// The user says "idle.png 아틀라스 형태로 넣어뒀습니다". I'll assume it's a horizontal strip.
import idleImg from "data-base64:~assets/idle.png"

export const CAT_STATES: Record<AnimationState, StateConfig> = {
  idle: {
    name: "idle",
    frameCount: 4,
    fps: 4,
    spriteUrl: idleImg,
    frameWidth: 128,
    frameHeight: 64
  },
  walk: {
    name: "walk",
    frameCount: 4,
    fps: 8,
    spriteUrl: idleImg,
    frameWidth: 128,
    frameHeight: 64
  },
  sit: { name: "sit", frameCount: 1, fps: 1, spriteUrl: idleImg, frameWidth: 128, frameHeight: 64 },
  run: { name: "run", frameCount: 4, fps: 12, spriteUrl: idleImg, frameWidth: 128, frameHeight: 64 },
  push: { name: "push", frameCount: 4, fps: 6, spriteUrl: idleImg, frameWidth: 128, frameHeight: 64 }
}

export class SpriteAnimator {
  currentState: StateConfig
  currentFrame: number = 0
  accumulator: number = 0

  constructor(initialState: AnimationState = "idle") {
    this.currentState = CAT_STATES[initialState]
  }

  setState(stateName: AnimationState) {
    if (this.currentState.name !== stateName) {
      this.currentState = CAT_STATES[stateName]
      this.currentFrame = 0
      this.accumulator = 0
    }
  }

  update(delta: number) {
    this.accumulator += delta
    const frameDuration = 1000 / this.currentState.fps

    if (this.accumulator >= frameDuration) {
      this.accumulator -= frameDuration
      this.currentFrame = (this.currentFrame + 1) % this.currentState.frameCount
    }
  }

  getBackgroundPosition(): string {
    // 256x128 image with 128x64 frames means it's a 2x2 grid.
    // 0: (0,0), 1: (128,0), 2: (0,64), 3: (128,64)
    const col = this.currentFrame % 2;
    const row = Math.floor(this.currentFrame / 2);

    const xOffset = -(col * this.currentState.frameWidth)
    const yOffset = -(row * this.currentState.frameHeight)

    return `${xOffset}px ${yOffset}px`
  }
}
