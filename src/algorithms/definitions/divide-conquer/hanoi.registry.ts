import { getHanoiDiskCount } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep, HanoiStep } from '@/types/algorithm';

function clonePegs(pegs: HanoiStep['pegs']): HanoiStep['pegs'] {
  return [
    { id: pegs[0].id, disks: [...pegs[0].disks] },
    { id: pegs[1].id, disks: [...pegs[1].disks] },
    { id: pegs[2].id, disks: [...pegs[2].disks] },
  ];
}

function buildHanoiSteps(numDisks: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];

  const pegs: HanoiStep['pegs'] = [
    { id: 'A', disks: Array.from({ length: numDisks }, (_, i) => numDisks - i) },
    { id: 'B', disks: [] },
    { id: 'C', disks: [] },
  ];

  steps.push({
    kind: 'hanoi',
    pegs: clonePegs(pegs),
    move: null,
    description: `初始化 ${numDisks} 个圆盘于 A 柱，目标移至 C 柱。`,
  });

  function hanoi(n: number, from: number, to: number, aux: number) {
    if (n === 0) return;

    hanoi(n - 1, from, aux, to);

    const disk = pegs[from].disks.pop()!;
    pegs[to].disks.push(disk);

    steps.push({
      kind: 'hanoi',
      pegs: clonePegs(pegs),
      move: { from: pegs[from].id, to: pegs[to].id, disk },
      description: `移动圆盘 ${disk}：${pegs[from].id} → ${pegs[to].id}。`,
    });

    hanoi(n - 1, aux, to, from);
  }

  hanoi(numDisks, 0, 2, 1);

  return steps;
}

export const hanoiRegistry: AlgorithmDefinition = {
  id: 'hanoi',
  slug: 'hanoi',
  title: '汉诺塔',
  description: '将所有圆盘从 A 柱移至 C 柱，每次只移动一个且大盘不能压在小盘上。',
  categories: ['divide-conquer'],
  visualization: 'hanoi',
  createSteps: () => buildHanoiSteps(getHanoiDiskCount()),
};
