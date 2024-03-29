import { readFileSync } from "node:fs";

/**
 * @typedef {{x:number, y:number}} Point
 * @typedef {Point & {i:number}} PointWithIndex
 */

/**
 * @param {Point} a
 * @param {Point} b
 */
const isSamePoint = (a, b) => a.x === b.x && a.y === b.y;

const DIR_N = new Set(["|", "L", "J"]);
const DIR_S = new Set(["|", "7", "F"]);
const DIR_E = new Set(["-", "L", "F"]);
const DIR_W = new Set(["-", "J", "7"]);

class Grid {
  constructor(file) {
    this.map = readFileSync(file, { encoding: "utf-8" })
      .split("\n")
      .map((line) => line.split(""));

    this.visitedMap = new Array(this.map.length).fill(undefined).map(() => new Array(this.map[0].length).fill(" "));
  }

  /**
   * @param {Point} param0
   */
  getPointValue({ x, y }) {
    return this.map[x]?.[y];
  }

  /**
   * @returns {Point}
   */
  findStartingPoint() {
    for (let x = 0; x < this.map.length; x++) {
      const line = this.map[x];
      for (let y = 0; y < line.length; y++) {
        if (line[y] === "S") return { x, y };
      }
    }
    throw Error("Cound not find S");
  }

  /**
   * @param {Point} from
   * @param {Point} to
   * @returns {Point | undefined}
   */
  findNextPoint(from, to) {
    for (const neighbor of this.getNeighbors(to, [from])) {
      return neighbor;
    }
  }

  /**
   * @param {Point} param1
   * @param {Point[]} blacklist
   * @returns {Generator<Point, any, undefined>}
   */
  *getNeighbors({ x, y }, blacklist = []) {
    /**
     * @param {Point} p
     * @param {Set<string>} values
     * @returns
     */
    const isValidPoint = (p, values) => values.has(this.getPointValue(p)) && !blacklist.some((b) => isSamePoint(p, b));

    const value = this.getPointValue({ x, y });
    const isStart = value === "S";

    if (DIR_S.has(value) || isStart) {
      const next = { x: x + 1, y };
      if (isValidPoint(next, DIR_N)) yield next;
    }

    if (DIR_N.has(value) || isStart) {
      const next = { x: x - 1, y };
      if (isValidPoint(next, DIR_S)) yield next;
    }

    if (DIR_E.has(value) || isStart) {
      const next = { x, y: y + 1 };
      if (isValidPoint(next, DIR_W)) yield next;
    }

    if (DIR_W.has(value) || isStart) {
      const next = { x, y: y + -1 };
      if (isValidPoint(next, DIR_E)) yield next;
    }
  }

  /**
   * @param {Point} from
   * @param {Point} to
   * @returns {Generator<Point, undefined, unknown>}
   */
  *computePath(from, to) {
    const path = [from, to];
    let i = 0;

    while (true) {
      const next = this.findNextPoint(from, to);
      if (next === undefined) return;
      if (path.some((p) => isSamePoint(p, next))) return;
      yield next;
      from = to;
      to = next;
      i++;
    }
  }

  computePaths() {
    const start = this.findStartingPoint();
    /** @type {Point[]} */
    let visited = [start];
    const pointsG = Array.from(this.getNeighbors(start)).map((p) => ({ gen: this.computePath(start, p), point: p }));
    let i = 1;

    while (true) {
      for (const g of pointsG) {
        g.point = g.gen?.next()?.value;

        if (g.point && !visited.some((v) => isSamePoint(v, g.point))) {
          visited.push(g.point);
          this.visitedMap[g.point.x][g.point.y] = "|";
        } else {
          g.gen = undefined;
        }
      }

      if (pointsG.every((g) => !g.gen)) return i;
      i++;
    }
  }

  /**
   * @param {Point[]} points
   */
  print(points) {
    const map = new Array(this.map.length).fill(undefined).map(() => new Array(this.map[0].length).fill(" "));
    points.forEach(({ x, y }, i) => (map[x][y] = String(i)));
    console.log(map);
  }
}

const spec = new Grid("input.txt");
console.log(spec.computePaths());

/**
 * @param {string[][]} visitedMap
 */
function part2(visitedMap) {
  /**
   * @param {Point} param0
   * @returns {Point[]}
   */
  function getNeighbors({ x, y }) {
    return [
      { x: x - 1, y: y - 1 },
      { x: x + 0, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x + 1, y: y },
      { x: x + 1, y: y + 1 },
      { x: x + 0, y: y + 1 },
      { x: x - 1, y: y + 1 },
      { x: x - 1, y: y + 0 },
    ].filter(({ x, y }) => visitedMap[x]?.[y] === " ");
  }

  function* getFrameWork() {
    for (let x = 0; x < visitedMap.length; x++) {
      yield { x, y: 0 };
      yield { x, y: visitedMap[x].length - 1 };
    }

    for (let y = 0; y < visitedMap[0].length; y++) {
      yield { x: 0, y };
      yield { x: visitedMap.length - 1, y };
    }
  }

  let stack = Array.from(getFrameWork());

  while (stack.length > 0) {
    const p = stack.pop();
    if (p === undefined) throw Error();
    visitedMap[p.x][p.y] = "$";
    stack.push(...getNeighbors(p));
  }

  return visitedMap;
}

console.log(
  part2(spec.visitedMap)
    .map((r) => r.join(""))
    .join("\n")
);

// too high 556
console.log(
  part2(spec.visitedMap)
    .flatMap((r) => r)
    .filter((c) => c === " ").length
);
