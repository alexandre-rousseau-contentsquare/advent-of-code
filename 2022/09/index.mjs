import { createReadStream } from "fs";
import assert from "node:assert";
import readline from "readline";

/**
 * @typedef {[number, number]} Point
 * @typedef {(point: Point) => Point} Move
 */

/** @type {Record<string, Move>} */
const moves = {
  L: ([px, py]) => [px - 1, py],
  R: ([px, py]) => [px + 1, py],
  U: ([px, py]) => [px, py + 1],
  D: ([px, py]) => [px, py - 1],
};

/**
 * @param {Point} headPoint
 * @param {Point} tailPoint
 */
const isTailTooFar = ([hx, hy], [tx, ty]) => ![hx, hx - 1, hx + 1].includes(tx) || ![hy, hy - 1, hy + 1].includes(ty);

/**
 * @param {Point} headPoint
 * @param {Point} tailPoint
 * @return {Point}
 */
function moveTail(headPoint, tailPoint) {
  if (!isTailTooFar(headPoint, tailPoint)) return tailPoint;

  // @ts-ignore
  return [0, 1].map((axe) => {
    if (headPoint[axe] > tailPoint[axe]) return tailPoint[axe] + 1;
    if (headPoint[axe] < tailPoint[axe]) return tailPoint[axe] - 1;
    return tailPoint[axe];
  });
}
assert.deepEqual(moveTail([1, 1], [1, 1]), [1, 1]);
assert.deepEqual(moveTail([1, 1], [0, 0]), [0, 0]);
assert.deepEqual(moveTail([2, 2], [0, 0]), [1, 1]);
assert.deepEqual(moveTail([2, 0], [0, 0]), [1, 0]);

/**
 * @param {string} file
 * @param {number}
 * @return {Promise<number>}
 */
async function computeRope(file, size) {
  /** @type {Point[]} */
  const rope = new Array(size).fill([0, 0]);
  const tailVisits = new Set();

  for await (const line of readline.createInterface({ input: createReadStream(file) })) {
    const [direction, qtyStr] = line.split(" ");
    const qty = Number(qtyStr);

    for (let index = 0; index < qty; index++) {
      for (let index = 0; index < rope.length; index++) {
        if (index === 0) {
          rope[index] = moves[direction](rope[index]);
        } else {
          rope[index] = moveTail(rope[index - 1], rope[index]);
        }

        if (index === size - 1) tailVisits.add(`${rope[index][0]}*${rope[index][1]}`);
      }
    }
  }
  return tailVisits.size;
}

assert.strictEqual(await computeRope("spec.txt", 2), 13);
console.log("result A", await computeRope("input.txt", 2));

assert.strictEqual(await computeRope("specb.txt", 10), 36);
console.log("result B", await computeRope("input.txt", 10));
