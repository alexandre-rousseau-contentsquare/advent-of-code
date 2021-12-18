// @ts-check
const assert = require("assert");
const { readFileSync } = require("fs");

const getLines = (file) => readFileSync(file).toString().split("\n");

const couples = [
  { start: "{", end: "}", p: 1197 },
  { start: "(", end: ")", p: 3 },
  { start: "[", end: "]", p: 57 },
  { start: "<", end: ">", p: 25137 },
];

/**
 * @param {string} line
 */
function findClosingChar(line) {
  let position = 0;

  const stack = [];

  do {
    const char = line[position];

    const openingCouple = couples.find(({ start }) => start === char);

    if (openingCouple) {
      stack.push(openingCouple);
      position++;
      continue;
    }

    const lastCouple = stack.pop();

    if (char !== lastCouple.end) {
      // console.log(char);
      // return lastCouple.p;
      return couples.find(({ end, start }) => end === char || start === char).p;
    } else {
      position++;
    }
  } while (stack.length !== 0 && line.length > position);

  return 0;
}

// assert.throws(() => , );

assert.strictEqual(findClosingChar("{(<>)}"), 0);
assert.strictEqual(findClosingChar("{<}"), 1197);

function partA(file) {
  return getLines(file)
    .map(findClosingChar)
    .reduce((a, b) => a + b, 0);
}

// console.log(getLines("10.test.txt").map(findClosingChar));
assert.strictEqual(partA("10.test.txt"), 26397);
console.log("Part A", partA("10.txt"));

// console.log();

// ----

/**
 * @param {string} line
 */
function completeClosingChar(line) {
  let position = 0;

  const stack = [];

  do {
    const char = line[position];

    const openingCouple = couples.find(({ start }) => start === char);

    if (openingCouple) {
      stack.push(openingCouple);
      position++;
      continue;
    }

    // console.log(stack)

    const lastCouple = stack.pop();

    if (char !== lastCouple.end) {
      // console.log(char);
      // return lastCouple.p;
      return lastCouple.end.concat(
        stack
          .reverse()
          .map(({ end }) => end)
          .join("")
      );
    } else {
      position++;
    }
  } while (line.length > position);

  if (stack.length > 0) {
    return stack
      .reverse()
      .map(({ end }) => end)
      .join("");
  }

  return "";
}

assert.strictEqual(completeClosingChar("[({(<(())[]>[[{[]{<()<>>"), "}}]])})]");
assert.strictEqual(completeClosingChar("[(()[<>])]({[<{<<[]>>("), ")}>]})");
assert.strictEqual(completeClosingChar("(((({<>}<{<{<>}{[]{[]{}"), "}}>}>))))");
assert.strictEqual(completeClosingChar("{<[[]]>}<{[{[{[]{()[[[]"), "]]}}]}]}>");
// assert.strictEqual(compleClosingChar("[(()[<>])]({[<{<<[]>>("), ")}>]})");

/**
 *
 * @param {string} line
 */
function getScore(line) {
  let score = 0;

  for (const char of line) {
    score = score * 5;

    switch (char) {
      case ")":
        score += 1;
        break;
      case "]":
        score += 2;
        break;
      case "}":
        score += 3;
        break;
      case ">":
        score += 4;
        break;
    }
  }

  return score;
}

assert.strictEqual(getScore("}}]])})]"), 288957);
assert.strictEqual(getScore(")}>]})"), 5566);
assert.strictEqual(getScore("]]}}]}]}>"), 995444);
assert.strictEqual(getScore("])}>"), 294);

function partB(file) {
  const scores = getLines(file).map(completeClosingChar).filter(c => c).map(getScore);
  console.log(scores)
  return scores.sort((a, b) => b - a)[scores.length / 2];

  while (scores.length > 0) {
    console.log(scores);
    scores.pop();
    scores.shift();
  }

  console.log(scores.length);
}

// console.log(getLines("10.test.txt").map(findClosingChar));
// assert.strictEqual(partA("10.test.txt"), 26397);
console.log("Part B", partB("10.txt"));
// not 1216349671
// not 1542093438
// not 1186608909
// not 5805183582
// not 96291822