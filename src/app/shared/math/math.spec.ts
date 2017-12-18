import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Point } from "./point"
import { Rect } from "./rect"
import { Ease, interpolate, Linear } from "../tween/ease";
interface SlideData {
    dir: number,
    current: {
        src: Point
        box: Rect
        xFrom: number
        xTo: number
    }
    previous: {
        src: Point
        box: Rect
        xFrom: number
        xTo: number
    }
}

const cw = 1200
const ch = 675

let slideNext: SlideData
let slidePrev: SlideData

describe('Math Rect', () => {

    it('should create and modifie', () => {
        let r: Rect
        r = new Rect()
        expect(0).toEqual(r.x)
        expect(0).toEqual(r.y)
        expect(0).toEqual(r.width)
        expect(0).toEqual(r.height)
        expect(0).toEqual(r.right)
        expect(0).toEqual(r.bottom)
        r.move(10, 10)
        expect(10).toEqual(r.x)
        expect(10).toEqual(r.y)
        expect(10).toEqual(r.right)
        expect(10).toEqual(r.bottom)
        r.setSize(20, 10)
        expect(20).toEqual(r.width)
        expect(10).toEqual(r.height)
        expect(10).toEqual(r.x)
        expect(10).toEqual(r.y)
        expect(30).toEqual(r.right)
        expect(20).toEqual(r.bottom)
        r.scale(.5, .5)
        expect(10).toEqual(r.width)
        expect(5).toEqual(r.height)
        expect(5).toEqual(r.x)
        expect(5).toEqual(r.y)
        expect(15).toEqual(r.right)
        expect(10).toEqual(r.bottom)


    })

    it("should contains", () => {
        let a: Rect = new Rect()
        a.setSize(200, 100)
        let b: Rect = new Rect(10, 10, 30, 50)
        expect(a.contains(b)).toBe(true)
        b.move(500, 0)
        expect(a.contains(b)).toBe(false)
    })

    it("should interset", () => {

        let a: Rect = new Rect()
        a.setSize(200, 200)
        let b: Rect = new Rect(0, 0, 100, 200)

        let r: Rect = a.intersection(b)
        expect((r === b)).toBe(true)
        b.move(-50, 0)
        r = a.intersection(b)
        expect((r === b)).toBe(false)
        expect(r.x).toEqual(0)
        expect(r.y).toEqual(0)
        expect(r.right).toEqual(50)
        expect(r.bottom).toEqual(200)
        b.move(0, 50)
        r = a.intersection(b)
        expect((r === b)).toBe(false)
        expect(r.x).toEqual(0)
        expect(r.y).toEqual(50)
        expect(r.right).toEqual(50)
        expect(r.bottom).toEqual(200)
        expect(r.height).toEqual(150)

        b.setPosition(100, 100)
        b.setSize(200, 50)

        r = a.intersection(b)
        expect((r === b)).toBe(false)
        expect(r.x).toEqual(100)
        expect(r.y).toEqual(100)
        expect(r.right).toEqual(200)
        expect(r.bottom).toEqual(150)
        expect(r.height).toEqual(50)

        b.height = 100
        r = a.intersection(b)
        expect((r === b)).toBe(false)
        expect(r.x).toEqual(100)
        expect(r.y).toEqual(100)
        expect(r.right).toEqual(200)
        expect(r.bottom).toEqual(200)
        expect(r.height).toEqual(100)

        b.height = 1000
        r = a.intersection(b)
        expect((r === b)).toBe(false)
        expect(r.x).toEqual(100)
        expect(r.y).toEqual(100)
        expect(r.right).toEqual(200)
        expect(r.bottom).toEqual(200)
        expect(r.height).toEqual(100)

        b.setSize(100, 100)
        b.setPosition(100, -50)
        r = a.intersection(b)
        expect((r === b)).toBe(false)
        expect(r.x).toEqual(100)
        expect(r.y).toEqual(0)
        expect(r.right).toEqual(200)
        expect(r.bottom).toEqual(50)
        expect(r.height).toEqual(50)

        /*
*/
    })

    it('should create rectangles for slide PREV animation (dir:1)', () => {
        // x: naturalWidth
        // y: naturalHeight
        let imgs: Point[] = [
            new Point(1920, 1000),
            new Point(800, 800)
        ]
        let scaledImgs: Point[] = imgs.map(r => r.clone)

        let s: number
        let sy: number
        let i: Point
        for (i of scaledImgs) {
            s = cw / i.x
            sy = ch / i.y
            if (sy < s)
                s = sy
            if (s < 1) {
                i.scale(s, s)
            }
        }
        // cur is image to show at index 1
        let cur: Rect = new Rect(0, 0, scaledImgs[1].x, scaledImgs[1].y)
        // prev is current image to hide  at index 0
        let prev: Rect = new Rect(0, 0, scaledImgs[0].x, scaledImgs[0].y)
        // align scaled into layout
        cur.x = (cw - cur.width) / 2
        cur.y = (ch - cur.height) / 2
        prev.x = (cw - prev.width) / 2
        prev.y = (ch - prev.height) / 2
        // calculate start and end values
        // cur come from right to left
        type fromTo = [number, number]
        let curTo: fromTo = [cw + cur.x, cur.x]
        // cur come from right to left
        let prevTo: fromTo = [prev.x, -cw + prev.x]
        slidePrev = {
            dir: 1,
            current: {
                src: imgs[1],
                box: cur,
                xFrom: cw + cur.x,
                xTo: cur.x
            },
            previous: {
                src: imgs[0],
                box: prev,
                xFrom: prev.x,
                xTo: -cw + prev.x
            }
        }
    })
    it('should create rectangles for slide NEXT animation (dir:-1)', () => {
        // x: naturalWidth
        // y: naturalHeight
        let imgs: Point[] = [
            new Point(1920, 1000),
            new Point(800, 800)
        ]
        let scaledImgs: Point[] = imgs.map(r => r.clone)
        let s: number
        let sy: number
        let i: Point
        for (i of scaledImgs) {
            s = cw / i.x
            sy = ch / i.y
            if (sy < s)
                s = sy
            if (s < 1) {
                i.scale(s, s)
            }
        }
        // cur is image to show at index 1
        let cur: Rect = new Rect(0, 0, scaledImgs[1].x, scaledImgs[1].y)
        // prev is current image to hide  at index 0
        let prev: Rect = new Rect(0, 0, scaledImgs[0].x, scaledImgs[0].y)
        // align scaled into layout
        cur.x = (cw - cur.width) / 2
        cur.y = (ch - cur.height) / 2
        prev.x = (cw - prev.width) / 2
        prev.y = (ch - prev.height) / 2
        // calculate start and end values
        // cur come from left to right
        type fromTo = [number, number]
        let curTo: fromTo = [-cw + cur.x, cur.x]
        // cur come from left to right
        let prevTo: fromTo = [prev.x, cw + prev.x]
        slideNext = {
            dir: -1,
            current: {
                src: imgs[1],
                box: cur,
                xFrom: -cw + cur.x,
                xTo: cur.x
            },
            previous: {
                src: imgs[0],
                box: prev,
                xFrom: prev.x,
                xTo: cw + prev.x
            }
        }

    })

    it('should interpolate slide and check intersection', () => {
        const _layout: Rect = new Rect(0, 0, cw, ch)
        let r = slidePrev.current.box.clone
        // come from right to left
        r.x = interpolate(0, slidePrev.current.xFrom, slidePrev.current.xTo)
        expect(r.x).toBeGreaterThanOrEqual(cw)
        expect(_layout.intersection(r)).toBe(null)
        r.x = interpolate(1, slidePrev.current.xFrom, slidePrev.current.xTo)
        expect(r.x).toBeGreaterThanOrEqual(0)
        expect(r.right).toBeLessThanOrEqual(cw)
        expect(_layout.intersection(r) === r).toBe(true)
        r.x = interpolate(.5, slidePrev.current.xFrom, slidePrev.current.xTo)
        expect(r.x).toBeLessThan(cw)
        expect(r.right).toBeGreaterThan(cw)
        let _int: Rect = _layout.intersection(r)
        expect( _int === r).toBe(false)
        expect(_int.right).toEqual(cw)
    })
})