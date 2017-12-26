export type VideoEventType = "start" | "progress" | "complete" | "begin" | "finish"
export class VideoEvent {
    constructor(
        public type?: VideoEventType,
        public loaded?: number,
        public total?: number) {
    }

    get ratio(): number {
        return this.loaded / this.total
    }
}