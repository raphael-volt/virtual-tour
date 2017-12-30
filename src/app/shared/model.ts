
export interface IAppartement {
    name: string
    position: [number, number]
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
export interface Config {
    buildings: Building[]
    layout: Layout
    name: string
    video: {
        projectVideo: string,
        formats: string[]
    }
    turnAround: TurnAround
    carousel: Carousel
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

import { Subscription } from "rxjs/Subscription";
export { Subscription }