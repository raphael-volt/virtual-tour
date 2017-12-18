export class Point {
    constructor(public x: number = 0, public y: number = 0) { }
    get clone(): Point {
        return new Point(this.x, this.y)
    }

    scale(sx: number, sy: number) {
        this.x *= sx
        this.y *= sy
    }
}