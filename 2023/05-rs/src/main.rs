use std::fs::read_to_string;

fn get_numbers(line: &str) -> Vec<usize> {
    return line
        .split(" ")
        .map(|f| f.parse::<usize>().expect(&format!("could not parse {}", f)))
        .collect();
}

struct PartA {
    seeds: Vec<usize>,
    actions: Vec<Action>,
}
impl PartA {
    fn from(file: &str) -> PartA {
        let content = read_to_string(file).unwrap();
        let groups: Vec<&str> = content.split("\n\n").collect();

        let seeds = get_numbers(&groups.get(0).unwrap().replace("seeds: ", ""));

        return PartA {
            seeds: seeds,
            actions: Action::from_groups(groups),
        };
    }

    fn solve(&self) -> usize {
        let mut seeds = self.seeds.clone();

        for action in &self.actions {
            seeds = seeds
                .iter()
                .map(|seed| action.transform(seed.clone()))
                .collect();
        }

        return seeds.iter().min().unwrap().clone();
    }
}

struct PartB {
    seeds: Vec<Range>,
    actions: Vec<Action>,
}
impl PartB {
    fn from(file: &str) -> PartB {
        let content = read_to_string(file).unwrap();
        let groups: Vec<&str> = content.split("\n\n").collect();

        let seeds: Vec<Range> = get_numbers(&groups.get(0).unwrap().replace("seeds: ", ""))
            .chunks(2)
            .into_iter()
            .map(|el| Range::new(el.get(0).unwrap().to_owned(), el.get(1).unwrap().to_owned()))
            .collect();

        return PartB {
            seeds: seeds,
            actions: Action::from_groups(groups),
        };
    }

    fn solve(&self) -> usize {
        let mut min = usize::MAX;

        for range in &self.seeds {
            for seed in range.clone() {
                let res = self.actions.iter().fold(seed, |acc, a| a.transform(acc));

                if res < min {
                    min = res;
                }
            }
        }

        return min;
    }
}

struct Transform {
    dest: usize,
    source: usize,
    range: usize,
}
impl Transform {
    fn parse(line: &str) -> Transform {
        let numbers = get_numbers(line);
        return Transform {
            dest: numbers.get(0).unwrap().to_owned(),
            source: numbers.get(1).unwrap().to_owned(),
            range: numbers.get(2).unwrap().to_owned(),
        };
    }
}

struct Action {
    // from: String,
    // to: String,
    transforms: Vec<Transform>,
}
impl Action {
    fn from_groups(lines: Vec<&str>) -> Vec<Action> {
        return lines[1..].iter().map(|l| Action::parse(l)).collect();
    }

    fn parse(content: &str) -> Action {
        let lines: Vec<&str> = content.split("\n").collect();

        // let first_line = lines.get(0).unwrap().replace(" map:", "");
        // let direction: Vec<&str> = first_line.split("-to-").collect();

        let transforms: Vec<Transform> = lines[1..]
            .iter()
            .map(|line| Transform::parse(line))
            .collect();

        return Action {
            // from: direction.get(0).unwrap().to_string(),
            // to: direction.get(1).unwrap().to_string(),
            transforms: transforms,
        };
    }

    fn transform(&self, seed: usize) -> usize {
        for trans in &self.transforms {
            if seed >= trans.source && seed < trans.source + trans.range {
                return seed + trans.dest - trans.source;
            }
        }
        return seed;
    }
}

#[derive(Clone)]
struct Range {
    from: usize,
    to: usize,
}
impl Range {
    fn new(from: usize, len: usize) -> Range {
        return Range {
            from: from,
            to: from + len - 1,
        };
    }
}
impl Iterator for Range {
    type Item = usize;
    fn next(&mut self) -> Option<Self::Item> {
        if self.from <= self.to {
            let value = Some(self.from);
            self.from += 1;
            return value;
        } else {
            return None;
        }
    }
}

fn main() {
    println!("A : {}", PartA::from("../05-js/input.txt").solve());
    println!("B : {}", PartB::from("../05-js/input.txt").solve());
}

#[cfg(test)]
mod tests {
    use crate::{PartA, PartB};

    #[test]
    fn part_a() {
        assert_eq!(PartA::from("../05-js/spec.txt").solve(), 35);
    }

    #[test]
    fn part_b() {
        assert_eq!(PartB::from("../05-js/spec.txt").solve(), 46);
    }
}
