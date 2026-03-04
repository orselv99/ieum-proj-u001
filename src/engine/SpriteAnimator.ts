export type AnimationState =
  | "idle" | "walk" | "run" | "sit" | "push"
  | "grooming" | "love_happy" | "hiss_angry" | "fear_tremble" | "confused"
  | "meow_talk" | "dragged" | "falling" | "landing" | "climb"
  | "watch_sit" | "watch_popcon" | "sleep_start" | "sleep_deep" | "wake_up"

export type CatBreed = "mackerel" | "cheese" | "siam"

interface StateConfig {
  name: AnimationState
  frameCount: number
  fps: number
  frameWidth: number
  frameHeight: number
}

import idleMackerelImg from "data-base64:~assets/idle-mackerel.png"
import idleCheeseImg from "data-base64:~assets/idle-cheese.png"
import idleSiamImg from "data-base64:~assets/idle-siam.png"

export const BREED_ASSETS: Record<CatBreed, string> = {
  mackerel: idleMackerelImg,
  cheese: idleCheeseImg,
  siam: idleSiamImg
}

const DEFAULT_STATE: Omit<StateConfig, 'name'> = { frameCount: 4, fps: 4, frameWidth: 128, frameHeight: 64 };

export const CAT_STATES: Record<AnimationState, StateConfig> = {
  idle: { name: "idle", ...DEFAULT_STATE },
  walk: { name: "walk", ...DEFAULT_STATE, fps: 8 },
  run: { name: "run", ...DEFAULT_STATE, fps: 12 },
  sit: { name: "sit", ...DEFAULT_STATE, frameCount: 1, fps: 1 },
  push: { name: "push", ...DEFAULT_STATE, fps: 6 },
  grooming: { name: "grooming", ...DEFAULT_STATE },
  love_happy: { name: "love_happy", ...DEFAULT_STATE },
  hiss_angry: { name: "hiss_angry", ...DEFAULT_STATE },
  fear_tremble: { name: "fear_tremble", ...DEFAULT_STATE },
  confused: { name: "confused", ...DEFAULT_STATE },
  meow_talk: { name: "meow_talk", ...DEFAULT_STATE },
  dragged: { name: "dragged", ...DEFAULT_STATE },
  falling: { name: "falling", ...DEFAULT_STATE },
  landing: { name: "landing", ...DEFAULT_STATE },
  climb: { name: "climb", ...DEFAULT_STATE },
  watch_sit: { name: "watch_sit", ...DEFAULT_STATE },
  watch_popcon: { name: "watch_popcon", ...DEFAULT_STATE },
  sleep_start: { name: "sleep_start", ...DEFAULT_STATE },
  sleep_deep: { name: "sleep_deep", ...DEFAULT_STATE },
  wake_up: { name: "wake_up", ...DEFAULT_STATE }
}

export class SpriteAnimator {
  currentState: StateConfig
  currentFrame: number = 0
  accumulator: number = 0
  breed: CatBreed = "mackerel"

  constructor(initialState: AnimationState = "idle", initialBreed: CatBreed = "mackerel") {
    this.currentState = CAT_STATES[initialState]
    this.breed = initialBreed
  }

  setBreed(breed: CatBreed) {
    this.breed = breed
  }

  get spriteUrl(): string {
    return BREED_ASSETS[this.breed]
  }

  setState(stateName: AnimationState) {
    if (this.currentState.name !== stateName) {
      if (!CAT_STATES[stateName]) {
        console.warn(`Unknown state: ${stateName}, falling back to idle`);
        stateName = "idle";
      }
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
