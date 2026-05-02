import { getLpInput } from '@/algorithms/shared/inputs';
import type {
  AlgorithmDefinition,
  AlgorithmStep,
  LpGraphicalHighlightKind,
  LpGraphicalStep,
  LpGraphicalConstraint,
} from '@/types/algorithm';

function buildLpGraphicalSteps(): AlgorithmStep[] {
  const input = getLpInput();
  const { objective, constraints, constraintLabels } = input;

  const steps: LpGraphicalStep[] = [];

  const c1 = objective[0] ?? 0;
  const c2 = objective[1] ?? 0;

  const lpConstraints: LpGraphicalConstraint[] = constraints.map((row, i) => ({
    a: row[0] ?? 0,
    b: row[1] ?? 0,
    c: row[2] ?? 0,
    label: constraintLabels[i] ?? `约束${i + 1}`,
  }));

  // Determine axis ranges
  let maxX = 10;
  let maxY = 10;
  for (const con of lpConstraints) {
    if (con.a > 0) maxX = Math.max(maxX, con.c / con.a + 2);
    if (con.b > 0) maxY = Math.max(maxY, con.c / con.b + 2);
  }
  maxX = Math.min(maxX, 50);
  maxY = Math.min(maxY, 50);

  // Find feasible region vertices
  function isFeasible(x: number, y: number): boolean {
    if (x < -1e-9 || y < -1e-9) return false;
    for (const con of lpConstraints) {
      if (con.a * x + con.b * y > con.c + 1e-9) return false;
    }
    return true;
  }

  // Generate candidate vertices from constraint intersections
  const vertices: [number, number][] = [];

  // Origin
  if (isFeasible(0, 0)) vertices.push([0, 0]);

  // Axis intercepts
  for (const con of lpConstraints) {
    if (con.a > 0) {
      const x = con.c / con.a;
      if (isFeasible(x, 0)) vertices.push([x, 0]);
    }
    if (con.b > 0) {
      const y = con.c / con.b;
      if (isFeasible(0, y)) vertices.push([0, y]);
    }
  }

  // Pairwise intersections
  for (let i = 0; i < lpConstraints.length; i++) {
    for (let j = i + 1; j < lpConstraints.length; j++) {
      const a1 = lpConstraints[i]!.a,
        b1 = lpConstraints[i]!.b,
        c1v = lpConstraints[i]!.c;
      const a2 = lpConstraints[j]!.a,
        b2 = lpConstraints[j]!.b,
        c2v = lpConstraints[j]!.c;
      const det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < 1e-9) continue;
      const x = (c1v * b2 - c2v * b1) / det;
      const y = (a1 * c2v - a2 * c1v) / det;
      if (isFeasible(x, y)) vertices.push([x, y]);
    }
  }

  // Sort vertices by angle for polygon rendering
  const cx = vertices.reduce((s, v) => s + v[0], 0) / (vertices.length || 1);
  const cy = vertices.reduce((s, v) => s + v[1], 0) / (vertices.length || 1);
  vertices.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));

  // Step 1: Show constraints
  steps.push({
    kind: 'lp-graphical',
    constraints: lpConstraints,
    objectiveA: c1,
    objectiveB: c2,
    objectiveValue: 0,
    feasibleRegion: vertices,
    optimalPoint: null,
    currentVertex: null,
    xRange: [0, maxX],
    yRange: [0, maxY],
    highlights: {},
    description: `目标函数：max Z = ${c1}x₁ + ${c2}x₂。约束条件已绘制。`,
  });

  // Step 2: Show feasible region
  const feasibleHighlights: Partial<Record<string, LpGraphicalHighlightKind>> = {};
  feasibleHighlights['feasible'] = 'feasible';
  steps.push({
    kind: 'lp-graphical',
    constraints: lpConstraints,
    objectiveA: c1,
    objectiveB: c2,
    objectiveValue: 0,
    feasibleRegion: vertices,
    optimalPoint: null,
    currentVertex: null,
    xRange: [0, maxX],
    yRange: [0, maxY],
    highlights: feasibleHighlights,
    description: `可行域由 ${vertices.length} 个顶点围成：${vertices.map(v => `(${v[0].toFixed(1)}, ${v[1].toFixed(1)})`).join(', ')}。`,
  });

  // Step 3-: Walk through vertices showing objective value
  // Sort vertices by objective value
  const sortedVertices = [...vertices].sort(
    (a, b) => c1 * a[0] + c2 * a[1] - (c1 * b[0] + c2 * b[1])
  );

  for (let i = 0; i < sortedVertices.length; i++) {
    const v = sortedVertices[i]!;
    const val = c1 * v[0] + c2 * v[1];
    const isOptimal = i === sortedVertices.length - 1;

    const vertexHighlights: Partial<Record<string, LpGraphicalHighlightKind>> = {};
    vertexHighlights['feasible'] = 'feasible';
    vertexHighlights['objective'] = 'objective';
    if (isOptimal) {
      vertexHighlights['optimal'] = 'optimal';
    } else {
      vertexHighlights['vertex'] = 'vertex';
    }

    steps.push({
      kind: 'lp-graphical',
      constraints: lpConstraints,
      objectiveA: c1,
      objectiveB: c2,
      objectiveValue: val,
      feasibleRegion: vertices,
      optimalPoint: isOptimal ? v : null,
      currentVertex: v,
      xRange: [0, maxX],
      yRange: [0, maxY],
      highlights: vertexHighlights,
      description: isOptimal
        ? `顶点 (${v[0].toFixed(1)}, ${v[1].toFixed(1)})：Z = ${val.toFixed(2)}。这是最优解！`
        : `顶点 (${v[0].toFixed(1)}, ${v[1].toFixed(1)})：Z = ${val.toFixed(2)}。继续检查其他顶点...`,
    });
  }

  return steps;
}

export const lpGraphicalRegistry: AlgorithmDefinition = {
  id: 'lp-graphical',
  slug: 'lp-graphical',
  title: '图解法',
  description: '在二维坐标系中展示约束线、可行域和目标函数等值线，直观找到最优解。',
  category: 'linear-programming',
  visualization: 'lp-graphical',
  createSteps: () => buildLpGraphicalSteps(),
};
