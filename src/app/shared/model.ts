
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
        extension: string,
        projectVideo: string
    }
    turnAround: {
        path: string
    }
    carousel: Carousel
}

export interface Carousel {
    path: string
    images: string[]
}

export interface TurnAround {
    frames: TurnAroundFrame[]
}

export interface TurnAroundFrame {
    src: string
    size: number
    loaded?: number
    target?: HTMLImageElement
    complete?: boolean
}

import { Subscription } from "rxjs/Subscription";
export { Subscription }