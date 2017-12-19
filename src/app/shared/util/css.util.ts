const PX: string = 'px'

const PERCENT: string = "%"
const CSS_NUM_PART = /^(\d+)(\w+)$/
const CSS_PX_NUM_PART = /^(\d+)px$/

const parseCSSSizePX = (val: string): number => {
    if (CSS_PX_NUM_PART.test(val)) {
        const res = CSS_NUM_PART.exec(val)
        return Number(res[1])
    }
    return NaN

}        

const px = (value: number, floor: boolean = true): string => {
    if (floor)
        value = Math.floor(value)
    return value + PX
}

const px2num = (value: string): number => {
    if (!value)
        return 0
    value = value.toLowerCase()
    value = value.replace(PX, "")
    return parseFloat(value)
}

class Bounds {
    x: number
    y: number
    width: number
    height: number
    get left(): number {
        return this.x + this.width
    }
    get bottom(): number {
        return this.y + this.height
    }
    get totalWidth(): number {
        return this.width + this.horizontalMargin
    }
    get totalHeight(): number {
        return this.height + this.verticalMargin
    }
    get horizontalMargin(): number {
        return this.margin.left + this.margin.right
    }
    get verticalMargin(): number {
        return this.margin.top + this.margin.bottom
    }
    margin: {
        left: number
        top: number
        right: number
        bottom: number
    }
    equals(value: Bounds): boolean {
        if(
            this.x == value.x &&
            this.y == value.y &&
            this.width == value.width &&
            this.height == value.height &&
            this.totalWidth == value.totalWidth &&
            this.totalHeight == value.totalHeight)
            return true
        return false
    }
    constructor(element: HTMLElement) {
        const bounds: ClientRect = element.getBoundingClientRect()
        this.x = bounds.left
        this.y = bounds.top
        this.width = bounds.width
        this.height = bounds.height
        const style = window.getComputedStyle(element);
        this.margin = {
            left: px2num(style.marginLeft),
            right: px2num(style.marginRight),
            top: px2num(style.marginTop),
            bottom: px2num(style.marginBottom)
        }
    }
    toString(): string {
        const round = (val: number) => {
            return val.toFixed(3)
        }
        return `{ x: ${round(this.x)}, y: ${round(this.y)}, w: ${round(this.width)}, h: ${round(this.height)}, tw: ${round(this.totalWidth)}, th: ${round(this.totalHeight)} }`
    }
}

const getComputedBounds = (target: Element): [number, number] => {
    const style = window.getComputedStyle(target)
    return [parseCSSSizePX(style.width), parseCSSSizePX(style.height)]
}


const parseCSSSize = (val: string): [number, string] | null => {
    if (CSS_NUM_PART.test(val)) {
        const res = CSS_NUM_PART.exec(val)
        return [Number(res[1]), String(res[2])]
    }
    return null
}

export { 
    getComputedBounds, parseCSSSize, parseCSSSizePX, 
    PERCENT, CSS_NUM_PART, CSS_PX_NUM_PART,
    PX, px, px2num, Bounds
}