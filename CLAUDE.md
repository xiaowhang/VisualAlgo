# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

| 命令             | 说明                                               |
| ---------------- | -------------------------------------------------- |
| `pnpm dev`       | 启动 Vite 开发服务器                               |
| `pnpm build`     | 类型检查 + Vite 构建（`vue-tsc -b && vite build`） |
| `pnpm preview`   | 预览构建结果                                       |
| `pnpm lint`      | oxlint 检查                                        |
| `pnpm lint:fix`  | oxlint 并自动修复                                  |
| `pnpm fmt`       | oxfmt 格式化                                       |
| `pnpm fmt:check` | 检查格式（CI 用）                                  |

变更完成后至少执行 `pnpm lint && pnpm fmt`。涉及类型、路由、构建链路的改动，额外执行 `pnpm build`。

## 架构大局观

### 注册表模式（Registry Pattern）

算法通过注册表模式组织，整个链路为：

```
src/algorithms/definitions/{sorting|graph}/*.registry.ts  →  AlgorithmDefinition 对象
src/algorithms/definitions/index.ts                        →  汇总 allAlgorithmRegistries
src/algorithms/registry/algorithmRegistry.ts                →  全局算法注册表
src/router/index.ts                                        →  /algorithm/:category/:slug
```

每个算法导出一个 `AlgorithmDefinition`，其核心是 `createSteps(): AlgorithmStep[]` 工厂函数。路由参数 `:category` 和 `:slug` 用于在注册表中查找对应算法。

### 算法步骤的 Discriminated Union

`src/types/algorithm.ts` 是领域类型的单一真值源（single source of truth）。核心设计：

```ts
type AlgorithmStep = SortingStep | GraphStep; // discriminated by .kind
```

排序和图的每一步都通过 `kind` 字段（`'sorting'` | `'graph'`）区分，视图层和可视化层通过 type narrowing 分发到对应渲染组件。

### D3 可视化层（命令式渲染）

`src/visualizers/` 包含命令式 D3 渲染函数，不依赖 Vue 响应式：

- `sortingBarVisualizer.ts` — 排序柱状图（D3 data join + transition）
- `graphLayout.ts` — 图力导向布局（确定性 seeding）
- `colorSemantics.ts` — 将算法状态（compare/swap/pivot/visited/frontier/current）映射到 CSS 变量颜色 token
- `resolveCssColorToken.ts` — 将 CSS `var()` 和 `oklch()` 解析为 RGB 字符串（D3 不能直接动画化 CSS 变量）

Vue 组件（`SortingChart.vue`、`GraphTraversalView.vue`）持有 SVG 元素 ref，通过 watcher 将当前步骤传给 D3 渲染函数。颜色链路：colorSemantics → CSS 变量 token → resolveCssColorToken → RGB 字符串 → D3。

### 可组合函数（Composables）

状态逻辑通过 Vue Composables 复用：

- `src/composables/` — 共享层（`usePlaybackController`、`useSvgPanAndCenter`、`useAlgorithmStepSelection`）
- `src/features/compare/composables/` — 对比功能专用（`useCompareViewModel`、`useCompareSide`、`useCompareRouteActions`）
- `src/features/settings/composables/` — 设置面板专用（`useSettingsInputForm`、`useSettingsPanelViewModel`）

### 功能模块（Features）

`src/features/compare/` 和 `src/features/settings/` 是自包含的功能模块，各自拥有 composables、types 和 barrel export。这是新增功能模块时的推荐模式。

### 数据流

```
用户输入（Sidebar / SettingsPanel）
  → Pinia Store（algorithmInputs / algorithmPlayback / algorithmComparison）
    → AlgorithmDefinition.createSteps() 读取 store 数据
      → AlgorithmStep[]（同步计算）
        → useAlgorithmStepSelection 派生当前步骤
          → Vue 组件（SortingChart / GraphTraversalView）
            → D3 渲染到 SVG
```

### Pinia Store 职责

- `useAlgorithmInputsStore` — 数据输入（数组值、图节点/边、随机生成、导入导出）
- `useAlgorithmPlaybackStore` — 播放控制（当前步、总步数、播放/暂停/步进、速度），核心逻辑委托给 `usePlaybackController` composable
- `useAlgorithmComparisonStore` — 对比状态（左右算法 slug、URL query 同步、localStorage 持久化）

## 路由结构

| 路径                         | 名称                 | 全局播放器 |
| ---------------------------- | -------------------- | ---------- |
| `/`                          | Home                 | 隐藏       |
| `/algorithm/:category/:slug` | AlgorithmView (lazy) | 显示       |
| `/compare`                   | CompareView (lazy)   | 显示       |

对比页使用 URL query（`?left=quick-sort&right=bubble-sort`）编码算法对。

## 关键约束

- **严格 TypeScript**：`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch` 全部开启
- **自动导入**：`auto-imports.d.ts` 和 `components.d.ts` 由 `unplugin-auto-import` / `unplugin-vue-components` 自动生成，禁止手动编辑
- **oxc 工具链**：lint 使用 oxlint（非 ESLint），格式化使用 oxfmt（非 Prettier）。VSCode 需安装 `oxc.oxc-vscode` 扩展
- **无测试框架**：当前项目未配置测试依赖
- **Pre-commit Hook**：Husky + lint-staged，对 `*.{js,ts,vue}` 运行 `oxfmt` + `oxlint -D correctness --max-warnings 0`
- **`cn()` 工具**：使用 `src/lib/utils.ts` 中的 `cn()` 合并 CSS class（clsx + tailwind-merge + cva），不要直接拼接 class 字符串

## 提交规范

采用 Conventional Commits + emoji 前缀 + 中文主题行：`<emoji> <type>(<scope>): <subject>`

详细规范见 `AGENTS.md` Section 5。

## 参考文件

- `AGENTS.md` — 完整开发规范与提交约定
- `DESIGN.md` — 设计系统（受 cal.com 启发的灰度单色体系）
- `.agents/skills/` — Vue/Pinia/Router 最佳实践参考
- `package.json` — 脚本命令与工具链
- `src/types/algorithm.ts` — 算法领域类型
- `src/router/index.ts` — 路由定义
