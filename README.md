# 算法可视化实验室

基于 Vue 3 + TypeScript + D3 的交互式算法可视化平台，内置 25 个经典算法，覆盖排序、图、树、分治、动态规划、贪心、回溯、网络流、线性规划共 9 大分类。

## 功能特性

- **分步可视化** — 播放 / 暂停 / 步进 / 速度调节，逐步观察算法执行过程
- **算法对比** — 并排对比两个同类算法的执行差异
- **自定义输入** — 手动编辑数据或随机生成，设置算法参数
- **暗色主题** — 受 cal.com 启发的灰度单色设计系统

## 算法列表

| 分类     | 算法                                                     |
| -------- | -------------------------------------------------------- |
| 排序     | 冒泡排序、插入排序、选择排序、归并排序、快速排序、堆排序 |
| 图遍历   | 广度优先搜索（BFS）、深度优先搜索（DFS）                 |
| 树       | BST 查找                                                 |
| 分治     | 二分检索、汉诺塔                                         |
| 动态规划 | 0/1 背包问题、最长公共子序列 (LCS)、投资问题             |
| 贪心     | Dijkstra 最短路径、哈夫曼编码、活动选择                  |
| 回溯     | N 皇后、子集和                                           |
| 网络流   | Ford-Fulkerson、Edmonds-Karp、最小割                     |
| 线性规划 | 单纯形法、对偶单纯形法、图解法                           |

## 技术栈

| 层            | 技术                                         |
| ------------- | -------------------------------------------- |
| 框架          | Vue 3（Composition API）+ TypeScript         |
| 构建          | Vite 8                                       |
| 状态管理      | Pinia                                        |
| 路由          | Vue Router                                   |
| 可视化        | D3.js                                        |
| UI            | Tailwind CSS v4 + Reka UI（shadcn-vue 风格） |
| Lint / 格式化 | oxlint + oxfmt                               |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 常用命令

| 命令             | 说明                 |
| ---------------- | -------------------- |
| `pnpm dev`       | 启动 Vite 开发服务器 |
| `pnpm build`     | 类型检查 + Vite 构建 |
| `pnpm preview`   | 预览构建结果         |
| `pnpm lint`      | oxlint 检查          |
| `pnpm lint:fix`  | oxlint 并自动修复    |
| `pnpm fmt`       | oxfmt 格式化         |
| `pnpm fmt:check` | 检查格式（CI 用）    |

## 项目结构

```
src/
├── algorithms/
│   ├── definitions/     # 算法定义（*.registry.ts），按分类组织
│   ├── registry/        # 全局算法注册表
│   └── shared/          # 算法共享工具
├── components/
│   ├── ui/              # shadcn-vue 基础组件
│   └── visualization/   # 可视化视图组件（SortingChart、GraphTraversalView 等）
├── composables/         # 共享可组合函数（播放控制、SVG 交互等）
├── features/
│   ├── compare/         # 对比功能模块
│   └── settings/        # 设置面板模块
├── stores/              # Pinia 状态（输入、播放、对比）
├── types/               # 算法领域类型（AlgorithmStep discriminated union）
├── views/               # 页面视图（Home、AlgorithmView、CompareView）
└── visualizers/         # D3 命令式渲染函数
```

## 提交规范

采用 Conventional Commits + emoji 前缀 + 中文主题行：

```
<emoji> <type>(<scope>): <subject>
```

示例：`✨ feat(algorithms): 新增网络流算法分类`
