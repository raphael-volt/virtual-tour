export type VideoEventType = "start" | "progress" | "complete" | "begin" | "finish"
export class VideoEvent {
    constructor(
        public type?: VideoEventType,
        public loaded?: number,
        public total?: number) { }

    get ratio(): number {
        if (this.total == 0 || isNaN(this.total) || isNaN(this.loaded))
            return 0
        return this.loaded / this.total
    }
}