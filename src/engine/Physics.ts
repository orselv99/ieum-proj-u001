export class Physics {
  x: number
  y: number
  width: number
  height: number
  speedX: number
  speedY: number
  isFacingRight: boolean

  constructor(x = 0, y = 0, width = 64, height = 64) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speedX = 0
    this.speedY = 0
    this.isFacingRight = true
  }

  update(delta: number) {
    this.x += this.speedX * delta
    this.y += this.speedY * delta
  }

  setSpeed(x: number, y: number) {
    this.speedX = x
    this.speedY = y

    if (x > 0) this.isFacingRight = true
    if (x < 0) this.isFacingRight = false
  }
}
