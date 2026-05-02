import { createHuffmanStep } from '@/algorithms/shared/greedy/createHuffmanStep';
import { getHuffmanInput } from '@/algorithms/shared/inputs';
import type { AlgorithmDefinition, AlgorithmStep, HuffmanNode } from '@/types/algorithm';

let nodeIdCounter = 0;

function nextNodeId(): string {
  return `n${nodeIdCounter++}`;
}

function buildHuffmanTree(text: string): AlgorithmStep[] {
  nodeIdCounter = 0;
  const steps: AlgorithmStep[] = [];

  // Count character frequencies
  const freq = new Map<string, number>();
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }

  // Create leaf nodes
  const allNodes: HuffmanNode[] = [];
  const queue: string[] = [];

  for (const [char, weight] of freq) {
    const id = nextNodeId();
    allNodes.push({
      id,
      char,
      weight,
      x: 0,
      y: 0,
      left: null,
      right: null,
    });
    queue.push(id);
  }

  // Sort queue by weight
  queue.sort((a, b) => {
    const nodeA = allNodes.find(n => n.id === a);
    const nodeB = allNodes.find(n => n.id === b);
    return (nodeA?.weight ?? 0) - (nodeB?.weight ?? 0);
  });

  function getNode(id: string): HuffmanNode {
    return allNodes.find(n => n.id === id)!;
  }

  function buildEdges(): { source: string; target: string }[] {
    const edges: { source: string; target: string }[] = [];
    for (const node of allNodes) {
      if (node.left) edges.push({ source: node.id, target: node.left });
      if (node.right) edges.push({ source: node.id, target: node.right });
    }
    return edges;
  }

  function buildQueueHighlights(): Partial<Record<string, 'queue'>> {
    const h: Partial<Record<string, 'queue'>> = {};
    for (const id of queue) h[id] = 'queue';
    return h;
  }

  const charInfo = [...freq.entries()].map(([ch, w]) => `'${ch}':${w}`).join('，');
  steps.push(
    createHuffmanStep({
      nodes: allNodes,
      edges: [],
      queue,
      highlights: buildQueueHighlights(),
      description: `统计字符频率：${charInfo}。创建 ${queue.length} 个叶子节点加入优先队列。`,
    })
  );

  // Merge nodes until one remains
  while (queue.length > 1) {
    queue.sort((a, b) => getNode(a).weight - getNode(b).weight);

    const leftId = queue.shift()!;
    const rightId = queue.shift()!;
    const leftNode = getNode(leftId);
    const rightNode = getNode(rightId);

    const parentId = nextNodeId();
    const parentNode: HuffmanNode = {
      id: parentId,
      char: null,
      weight: leftNode.weight + rightNode.weight,
      x: 0,
      y: 0,
      left: leftId,
      right: rightId,
    };
    allNodes.push(parentNode);

    // Show merging step
    const mergeHighlights: Partial<Record<string, 'merging' | 'queue'>> = {
      [leftId]: 'merging',
      [rightId]: 'merging',
    };
    for (const id of queue) mergeHighlights[id] = 'queue';

    steps.push(
      createHuffmanStep({
        nodes: allNodes,
        edges: buildEdges(),
        queue: [...queue],
        merged: [leftId, rightId],
        newParent: parentId,
        highlights: mergeHighlights,
        description: `合并 '${leftNode.char ?? leftNode.weight}'(${leftNode.weight}) 和 '${rightNode.char ?? rightNode.weight}'(${rightNode.weight}) → 新节点(${parentNode.weight})`,
      })
    );

    queue.push(parentId);

    // Show after merge
    const afterHighlights: Partial<Record<string, 'merged' | 'queue'>> = {
      [parentId]: 'merged',
    };
    for (const id of queue) {
      if (id !== parentId) afterHighlights[id] = 'queue';
    }

    steps.push(
      createHuffmanStep({
        nodes: allNodes,
        edges: buildEdges(),
        queue: [...queue],
        highlights: afterHighlights,
        description: `新节点(权重=${parentNode.weight})加入队列。队列剩余 ${queue.length} 个节点。`,
      })
    );
  }

  // Build final encoding table
  const encodings = new Map<string, string>();
  function buildEncoding(nodeId: string, code: string) {
    const node = getNode(nodeId);
    if (node.char) {
      encodings.set(node.char, code || '0');
      return;
    }
    if (node.left) buildEncoding(node.left, code + '0');
    if (node.right) buildEncoding(node.right, code + '1');
  }

  const rootId = queue[0] ?? allNodes[allNodes.length - 1]?.id;
  if (rootId) buildEncoding(rootId, '');

  const encodingInfo = [...encodings.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([ch, code]) => `'${ch}'=${code}`)
    .join('，');

  const doneHighlights: Partial<Record<string, 'done'>> = {};
  for (const node of allNodes) doneHighlights[node.id] = 'done';

  steps.push(
    createHuffmanStep({
      nodes: allNodes,
      edges: buildEdges(),
      queue: [],
      highlights: doneHighlights,
      description: `哈夫曼编码完成！编码表：${encodingInfo}`,
    })
  );

  return steps;
}

export const huffmanRegistry: AlgorithmDefinition = {
  id: 'huffman',
  slug: 'huffman',
  title: '哈夫曼编码',
  description: '贪心构建最优前缀编码树，频率高的字符编码更短。',
  categories: ['greedy'],
  visualization: 'huffman',
  createSteps: () => buildHuffmanTree(getHuffmanInput().text),
};
