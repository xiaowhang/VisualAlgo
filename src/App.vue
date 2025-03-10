<script setup>
import SimpleGraph from './components/SimpleGraph.vue'
</script>

<template>
  <div class="app-container">
    <header>
      <h1>简单无向图绘制工具</h1>
    </header>
    <main>
      <SimpleGraph />
    </main>
    <footer>
      <p>基于Vue 3和D3.js的无向图可视化演示</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f2f5;
  color: #333;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

header {
  margin-bottom: 20px;
  text-align: center;
}

header h1 {
  color: #2c3e50;
  font-size: 2.2rem;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
}

footer {
  margin-top: 20px;
  text-align: center;
  padding: 10px;
  color: #666;
  font-size: 0.9rem;
}
</style>
