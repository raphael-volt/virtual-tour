import { EventEmitter } from "@angular/core";
type TweenEventType = "change" | "start" | "end"
export class TweenEvent {
    constructor(type: TweenEventType, tween: Tween) {
        this.type = type
        this.tween = tween
    }
    tween: Tween
    type: TweenEventType
    get currentValue(): number {
        return this.tween.currentValue
    }
}

const request = (callback: FrameRequestCallback): any => {
    return window.requestAnimationFrame(callback)
}
const cancel = (id) => {
    window.cancelAnimationFrame(id)
    return null
}
export type PlayStatus = "none" | "toEnd" | "toStart"
export class Tween {
    constructor(public ease: Ease) { }

    private _currentValue: number = NaN
    change: EventEmitter<TweenEvent> = new EventEmitter<TweenEvent>()

    private _running: boolean
    get running(): boolean {
        return this._running
    }
    private _playStatus: PlayStatus
    get playStatus(): PlayStatus {
        return this._playStatus
    }
    private paused: boolean = false
    get currentValue(): number {
        return this._currentValue
    }
    private t: number = 0
    private requestId: any | null
    private pendingEvents: TweenEvent[] = [

    ]
    private update = () => {
        let e: TweenEvent
        if (this.pendingEvents.length) {
            for (e of this.pendingEvents)
                this.change.next(e)
            this.pendingEvents.length = 0
        }
        let t: number = this.t
        const ease = this.ease
        let finished: boolean = false
        if (this._playStatus == "toEnd") {
            t++
            if (t >= ease.duration) {
                t = ease.duration
                finished = true
            }
        }
        if (this._playStatus == "toStart") {
            t--
            if (t <= 0) {
                t = 0
                finished = true
            }
        }
        this.t = t
        this._currentValue = this.ease.get(t)
        this.logProgress("update")
        this.change.emit(new TweenEvent("change", this))
        if (finished) {
            this._running = false
            this.logProgress("end")
            this.change.emit(new TweenEvent("end", this))
            this.requestId = null
        }
        else
            this.requestId = request(this.update)
    }
    logProgress(e: string) {
        //console.log(`[Tween ${e}] t:${this.t} d:${this.ease.duration} v:${this._currentValue}`)
    }
    start() {
        this.t = 0
        this.paused = false
        this._running = true
        this._playStatus = "toEnd"
        this._currentValue = this.ease.start
        this.logProgress("start")
        this.pendingEvents.push(new TweenEvent("start", this))
        this.requestId = request(this.update)
    }
    pause() {
        if (this.paused)
            return
        this.paused = true
        this._running = false
        this.requestId = cancel(this.requestId)
    }
    resume() {
        if (!this.paused)
            return
        this.paused = false
        this._running = true
        this.requestId = request(this.update)
    }
    toogle() {
        let status: PlayStatus = "none"
        switch (this._playStatus) {
            case "toEnd":
                status = "toStart"
                break;
        
            case "toStart":
                status = "toEnd"
                break;
        
            default:

                break;
        }
        if(status == "none")
            return
        this._playStatus = status
    }
    rewind() {
        if (this._playStatus == "toStart" || this.t == 0)
            return
        this._playStatus = "toStart"
        this._running = true
        this.requestId = request(this.update)
    }
    reset() {
        if (this.requestId !== null) {
            this.requestId = cancel(this.requestId)
        }
        this._running = false
        this._playStatus = "none"
        this.t = 0
    }
}

export class Ease {
    constructor(public start: number, public end: number, public duration: number, public ease: EaseFunction) {
        this.calculateChange()
    }
    private calculateChange() {
        this.c = this.end - this.start
    }
    set(start: number = NaN, end: number = NaN, duration: number = NaN, ease: EaseFunction = null) {
        if (!isNaN(start))
            this.start = start
        if (!isNaN(end))
            this.end = end
        if (!isNaN(duration))
            this.duration = duration
        if (ease)
            this.ease = ease
        this.calculateChange()
    }

    private c: number

    get(t: number): number {
        if (t < 0)
            t = 0
        if (t > this.duration)
            t = this.duration
        return this.ease(t, this.start, this.c, this.duration)
    }
}

type EaseFunction = (time: number, start: number, end: number, duration: number) => number

export class Linear {

    static in(t: number, b: number, c: number, d: number): number {
        return c * t / d + b;
    }

    static out(t: number, b: number, c: number, d: number): number {
        return Linear.in(t, b, c, d)
    }

    static inOut(t: number, b: number, c: number, d: number): number {
        return Linear.in(t, b, c, d)
    }
}

export class Sine {

    static in(t: number, b: number, c: number, d: number): number {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
    }

    static out(t: number, b: number, c: number, d: number): number {
        return c * Math.sin(t / d * (Math.PI / 2)) + b
    }

    static inOut(t: number, b: number, c: number, d: number): number {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
    }
}

export class Quintic {

    static in(t: number, b: number, c: number, d: number): number {
        return c * (t /= d) * t * t * t * t + b
    }

    static out(t: number, b: number, c: number, d: number): number {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b
    }

    static inOut(t: number, b: number, c: number, d: number): number {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t * t + b

        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
    }
}

export class Quartic {

    static in(t: number, b: number, c: number, d: number): number {
        return c * (t /= d) * t * t * t + b
    }

    static out(t: number, b: number, c: number, d: number): number {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b
    }

    static inOut(t: number, b: number, c: number, d: number): number {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t + b;

        return -c / 2 * ((t -= 2) * t * t * t - 2) + b
    }
}

export class Quadratic {

    static in(t: number, b: number, c: number, d: number): number {
        return c * (t /= d) * t + b
    }

    static out(t: number, b: number, c: number, d: number): number {
        return -c * (t /= d) * (t - 2) + b
    }

    static inOut(t: number, b: number, c: number, d: number): number {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t + b

        return -c / 2 * ((--t) * (t - 2) - 1) + b
    }
}

const interpolate = (t: number, from: number, to: number): number => {
    return from + (to - from) * t
}
export { EaseFunction, TweenEventType, interpolate }