
export interface IAppartement {
    name: string
    position: [number, number]
    image: string
}

export interface Building {
    path: string
    name: string
    image: string
    items: IAppartement[]
}
export interface Layout {
    width: number
    height: number
}

export interface Carousel {
    path: string
    images: string[]
}

export interface TurnAround {
    animFramerate: number
    path: string
    frames?: TurnAroundFrame[]
}

export interface TurnAroundFrame {
    src: string
    size: number
}

export type VideoEncodeType = "webm" | "mp4" | "ogv"

export interface IVideo {
    formats: VideoEncodeType[]
}

export interface ConfigLayout {
    name: string
    layout: Layout
    video: IVideo
}
export interface Config {
    buildings: Building[]
    layout?: Layout
    name: string
    image: string
    projectVideo: string
    turnAround: TurnAround
    carousel: Carousel
    layouts: ConfigLayout[]
}

import { Subscription } from "rxjs/Subscription";
export { Subscription }