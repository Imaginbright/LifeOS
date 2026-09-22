export function crossedFollowerMilestones(previous: number, current: number) {
  if (current <= previous) return [];
  const milestones: number[] = [];
  for (let value = previous + 1; value <= current; value += 1) {
    const step = value <= 1_000 ? 100 : value <= 10_000 ? 1_000 : 10_000;
    if (value % step === 0) milestones.push(value);
  }
  return milestones;
}

export function followerDelta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return { change: null, percentage: null };
  const change = current - previous;
  return { change, percentage: previous === 0 ? null : (change / previous) * 100 };
}

