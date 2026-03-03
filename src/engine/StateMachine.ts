import { Physics } from "./Physics"
import { SpriteAnimator } from "./SpriteAnimator"

export class StateMachine {
  physics: Physics
  animator: SpriteAnimator

  // Timers
  stateTimer: number = 0
  nextStateTime: number = 3000 // ms

  // Situation Awareness
  targetVideo: HTMLVideoElement | null = null
  isEvadingMouse: boolean = false
  onAwarenessChange?: (msg: string | null) => void

  constructor(physics: Physics, animator: SpriteAnimator) {
    this.physics = physics
    this.animator = animator
    this.changeToIdle()
  }

  setAwarenessCallback(cb: (msg: string | null) => void) {
    this.onAwarenessChange = cb
  }

  update(delta: number) {
    // Clamp delta to prevent huge jumps after tab switching
    const safeDelta = Math.min(delta, 50)
    this.stateTimer += safeDelta

    if (this.isEvadingMouse) {
      return
    }

    if (this.targetVideo) {
      this.handleVideoApproach()
      return
    }

    if (this.stateTimer >= this.nextStateTime) {
      this.decideNextState()
    }
  }

  decideNextState() {
    this.stateTimer = 0
    this.nextStateTime = 2000 + Math.random() * 4000 // 2 to 6 seconds

    if (this.onAwarenessChange) this.onAwarenessChange(null) // clear msg

    const isWalking = Math.random() > 0.4
    if (isWalking) {
      this.changeToWalk()
    } else {
      this.changeToIdle()
    }
  }

  changeToIdle() {
    this.animator.setState("idle")
    this.physics.setSpeed(0, 0)
  }

  changeToWalk() {
    this.animator.setState("walk")
    const direction = Math.random() > 0.5 ? 1 : -1
    const baseSpeed = 0.05 // pixels per ms
    this.physics.setSpeed(baseSpeed * direction, 0)
  }

  // Phase 4: Mouse Evasion
  evadeMouse(mouseX: number) {
    this.isEvadingMouse = true
    this.animator.setState("run")

    // Run away from mouse
    const catCenterX = this.physics.x + (this.physics.width / 2)
    const runDirection = mouseX > catCenterX ? -1 : 1
    this.physics.setSpeed(runDirection * 0.2, 0) // run fast

    if (this.onAwarenessChange) {
      this.onAwarenessChange("mouse")
    }

    // Stop evading after 1.5 seconds if mouse doesn't trigger it again
    setTimeout(() => {
      this.isEvadingMouse = false
      this.changeToIdle()
      if (this.onAwarenessChange) this.onAwarenessChange(null)
    }, 1500)
  }

  // Phase 4: Video Detection
  setTargetVideo(video: HTMLVideoElement | null) {
    this.targetVideo = video
    if (video && !this.isEvadingMouse) {
      if (this.onAwarenessChange) {
        this.onAwarenessChange("video")
      }
    }
  }

  handleVideoApproach() {
    if (!this.targetVideo) return

    const rect = this.targetVideo.getBoundingClientRect()
    // Target is right below the video, near the center, but clamped to screen bounds
    const baseTargetX = rect.left + (rect.width / 2) - (this.physics.width / 2)
    const targetX = Math.max(0, Math.min(baseTargetX, window.innerWidth - this.physics.width))
    // We want the cat's HEAD (top edge) to be at rect.bottom.
    // However, the cat's pivot physics.y is actually its top-left corner in this simple engine.
    // Therefore, to place it right below the video, physics.y should be rect.bottom + margin.
    const targetY = rect.bottom + 5

    const catCenterX = this.physics.x + (this.physics.width / 2)

    // Move towards target X
    const distance = targetX - this.physics.x
    if (Math.abs(distance) > 10) {
      this.animator.setState("walk")
      const direction = distance > 0 ? 1 : -1
      this.physics.setSpeed(direction * 0.08, 0)
    } else {
      // Reached video
      this.physics.setSpeed(0, 0)
      this.animator.setState("sit")
    }

    // Keep the cat at the bottom margin of the video, but always on screen
    const maxFloorY = document.documentElement.clientHeight - this.physics.height
    this.physics.y = Math.min(targetY, maxFloorY)
  }

  handleWallCollision(windowWidth: number) {
    // windowWidth passed in should be document.documentElement.clientWidth to avoid scrollbar clipping
    if (this.physics.x < 0) {
      this.physics.x = 0
      this.physics.setSpeed(Math.abs(this.physics.speedX), 0) // turn right
    } else if (this.physics.x > windowWidth - this.physics.width) {
      this.physics.x = windowWidth - this.physics.width
      this.physics.setSpeed(-Math.abs(this.physics.speedX), 0) // turn left
    }
  }
}
