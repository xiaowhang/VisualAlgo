<template>
  <div>
    <div class="graph-controls">
      <div class="node-controls">
        <button @click="addNode">添加节点</button>
        <button @click="clearNodes">清除所有节点</button>
      </div>
      <div class="edge-controls">
        <div v-if="nodes.length >= 2">
          <label>添加边：</label>
          <select v-model="selectedSource">
            <option v-for="node in nodes" :key="'src-' + node.id" :value="node.id">{{ node.id }}</option>
          </select>
          <span> - </span>
          <select v-model="selectedTarget">
            <option v-for="node in nodes" :key="'tgt-' + node.id" :value="node.id">{{ node.id }}</option>
          </select>
          <button @click="addEdge">连接</button>
        </div>
        <button @click="clearEdges">清除所有边</button>
      </div>
    </div>
    <div class="graph-container" ref="graphContainer"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';

export default {
  name: 'SimpleGraph',
  setup() {
    const graphContainer = ref(null);
    const nodes = ref([]);
    const edges = ref([]);
    const selectedSource = ref('');
    const selectedTarget = ref('');
    let simulation = null;

    // 添加节点
    const addNode = () => {
      const nodeId = `节点${nodes.value.length + 1}`;
      nodes.value.push({
        id: nodeId,
        x: Math.random() * 500,
        y: Math.random() * 300
      });
      updateGraph();
    };

    // 清除所有节点
    const clearNodes = () => {
      nodes.value = [];
      edges.value = [];
      updateGraph();
    };

    // 添加边
    const addEdge = () => {
      if (selectedSource.value && selectedTarget.value && selectedSource.value !== selectedTarget.value) {
        // 检查是否已存在相同的边
        const edgeExists = edges.value.some(
          edge => (edge.source === selectedSource.value && edge.target === selectedTarget.value) ||
                 (edge.source === selectedTarget.value && edge.target === selectedSource.value)
        );

        if (!edgeExists) {
          edges.value.push({
            id: `edge-${edges.value.length + 1}`,
            source: selectedSource.value,
            target: selectedTarget.value
          });
          updateGraph();
        }
      }
    };

    // 清除所有边
    const clearEdges = () => {
      edges.value = [];
      updateGraph();
    };

    // 更新图形
    const updateGraph = () => {
      if (!graphContainer.value) return;

      const width = graphContainer.value.clientWidth;
      const height = 400;

      // 清除现有SVG
      d3.select(graphContainer.value).selectAll('*').remove();

      // 创建SVG
      const svg = d3.select(graphContainer.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      // 定义力导向图
      simulation = d3.forceSimulation(nodes.value)
        .force('link', d3.forceLink(edges.value).id(d => d.id).distance(50))
        .force('charge', d3.forceManyBody().strength(-80))
        .force('center', d3.forceCenter(width / 2, height / 2));

      // 绘制边
      const link = svg.append('g')
        .selectAll('line')
        .data(edges.value)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 2);

      // 绘制节点
      const node = svg.append('g')
        .selectAll('circle')
        .data(nodes.value)
        .enter()
        .append('circle')
        .attr('r', 20)
        .attr('fill', '#69b3a2')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      // 添加节点文本标签
      const text = svg.append('g')
        .selectAll('text')
        .data(nodes.value)
        .enter()
        .append('text')
        .text(d => d.id)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'white')
        .attr('font-size', '12px');

      // 更新力导向图
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);

        text
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      });

      // 拖拽事件处理函数
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    };

    // 监听节点和边的变化
    watch([nodes, edges], () => {
      if (nodes.value.length === 0) {
        selectedSource.value = '';
        selectedTarget.value = '';
      } else if (nodes.value.length === 1) {
        selectedSource.value = nodes.value[0].id;
        selectedTarget.value = '';
      } else if (selectedSource.value === '' || selectedTarget.value === '') {
        selectedSource.value = nodes.value[0].id;
        selectedTarget.value = nodes.value[1].id;
      }
    });

    onMounted(() => {
      updateGraph();
      // 初始添加两个节点
      addNode();
      addNode();
    });

    return {
      graphContainer,
      nodes,
      edges,
      selectedSource,
      selectedTarget,
      addNode,
      clearNodes,
      addEdge,
      clearEdges
    };
  }
}
</script>

<style scoped>
.graph-container {
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 20px;
}

.graph-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.node-controls, .edge-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

select {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>