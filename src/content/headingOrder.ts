export interface HeadingJump {
  fromLevel: number;
  toLevel: number;
  fromText: string;
  toText: string;
  toIndex: number;
}

export function findHeadingLevelJumps(headings: Array<{ level: number; text: string }>): HeadingJump[] {
  const jumps: HeadingJump[] = [];

  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1];
    const current = headings[index];

    if (current.level - previous.level > 1) {
      jumps.push({
        fromLevel: previous.level,
        toLevel: current.level,
        fromText: previous.text,
        toText: current.text,
        toIndex: index
      });
    }
  }

  return jumps;
}
