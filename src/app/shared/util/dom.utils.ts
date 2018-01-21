const CLASS: string = "class"
const SPACE: string = " "

const classList = (svg: Element) => {
  let v = svg.getAttribute(CLASS)
  if (!v || !v.length)
    return []
  const re = /\s+/;
  v = v.replace(re, SPACE)
  v = v.trim()
  if (!v.length)
    return []
  return v.split(SPACE)
}

const setClass = (svg: Element, value: string | string[]) => {
  if (typeof value != "string") {
    value = value.join(SPACE)
  }
  svg.setAttribute(CLASS, value)
}

const hasClass = (svg: Element, cls: string, list?) => {
  if (!list)
    list = classList(svg)
  return list.indexOf(cls) > -1
}

const addClass = (svg: Element, ...args: string[]) => {
  let l = classList(svg)
  for (const cls of args) {
    if (!hasClass(svg, cls, l)) {
      l.push(cls)
    }
  }
  setClass(svg, l)
}

const removeClass = (svg: Element, cls: string) => {
  let l = classList(svg)
  if (hasClass(svg, cls, l)) {
    const i = l.indexOf(cls)
    l.splice(l.indexOf(cls), 1)
    setClass(svg, l)
  }
}

const getId = (svg: Element): string => {
  return svg.getAttribute('id')
}

const isNode = (elmt: Node) => {
  return elmt.nodeType == Node.ELEMENT_NODE
}

const mapCollection = (target: Node) => {
  const l = []
  if (isNode(target)) {
    const n = target.childNodes.length
    for (var i = 0; i < n; i++) {
      const c = target.childNodes.item(i)
      if (isNode(c))
        l.push(c)
    }
  }
  return l
}
const findById = (node: Node, ids: string[]): { [id: string]: HTMLElement } => {
  const map = {}
  ids = ids.splice(0)
  let done: boolean = false
  let sps = []
  const _findRecurse = (e: Node) => {
    if (done)
      return
    const id: string = getId(e as Element)
    const i: number = ids.indexOf(id)
    if (i > -1) {
      ids.splice(i, 1)
      map[id] = e
    }
    const l = mapCollection(e)
    for (const c of l)
      _findRecurse(c)
  }
  _findRecurse(node)
  return map
}

export { isNode, mapCollection,
  getId, findById, 
  classList, hasClass, addClass, removeClass, 
  SPACE, CLASS }