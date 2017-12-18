import { Point } from "./point";

export class Rect {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public width: number = 0,
        public height: number = 0,
    ) { }

    letterBox(child: Rect, maxScale: number=NaN): Rect {
        return letterBox(this, child, maxScale)
    }

    get right(): number {
        return this.x + this.width
    }
    get bottom(): number {
        return this.y + this.height
    }
    move(x: number, y: number) {
        this.x += x
        this.y += y
    }
    setPosition(x: number, y: number) {
        this.x = x
        this.y = y
    }
    setSize(width: number, height: number) {
        this.width = width
        this.height = height
    }
    scale(sx: number, sy: number) {
        this.x *= sx
        this.y *= sy
        this.width *= sx
        this.height *= sy
    }
    /**
     * If a contains rect, return rect.
     * If rect does not intersects with the target, return null.
     * Otherwise, return a new Rect.
     *   
     * @param rect 
     */
    intersection(_r: Rect): Rect {
        const _a: Rect = this
        if (this.contains(_r))
            return _r
        if (_r.right <= _a.x || _r.x >= _a.right || _r.bottom <= _a.y || _r.y >= _a.bottom)
            return null
        const _result: Rect = new Rect()
        const _tl: Point = new Point()
        const _br: Point = new Point()

        if (_r.x < _a.x)
            _tl.x = _a.x
        else
            _tl.x = _r.x

        if (_r.right > _a.right)
            _br.x = _a.right
        else
            _br.x = _r.right


        if (_r.y < _a.y)
            _tl.y = _a.y
        else
            _tl.y = _r.y

        if (_r.bottom < _a.bottom)
            _br.y = _r.bottom
        else
            _br.y = _a.bottom
        return new Rect(_tl.x, _tl.y, _br.x - _tl.x, _br.y - _tl.y)
    }

    contains(rect: Rect): boolean {
        const a: Rect = this
        const _aL: number = a.x
        const _aT: number = a.y
        const _aR: number = a.right
        const _aB: number = a.bottom

        const _rL: number = rect.x
        const _rT: number = rect.y
        const _rR: number = rect.right
        const _rB: number = rect.bottom
        return (
            _rL >= _aL && _rT >= _aT
            && _rR <= _aR && _rB <= _aB)
    }
    get clone(): Rect {
        return new Rect(this.x, this.y, this.width, this.height)
    }
    toString(): string {
        const round = (val: number) => {
            return val.toFixed(3)
        }
        return `{ x: ${round(this.x)}, y: ${round(this.y)}, w: ${round(this.width)}, h: ${round(this.height)} }`
    }
}

const letterBox = (layout: Rect, child: Rect, maxScale:number = NaN): Rect => {
    let result: Rect = child.clone
    let s: number = layout.width / child.width
    const sy: number = layout.height / child.height
    if (sy < s)
        s = sy
    if(! isNaN(maxScale) && s > maxScale)
        s = maxScale
    result.scale(s, s)
    result.setPosition(
        layout.x + (layout.width - result.width) / 2,
        layout.y + (layout.height - result.height) / 2
    )
    return result
}

export { letterBox }