# AGENTS 开发规范

## 1. 环境设置

- 安装 pnpm：`npm install -g pnpm`
- 安装依赖：`pnpm install`

## 2. 常用命令

| 命令             | 说明                        |
| ---------------- | --------------------------- |
| `pnpm dev`       | 启动开发服务器              |
| `pnpm build`     | 构建项目（类型检查 + Vite） |
| `pnpm preview`   | 预览构建结果                |
| `pnpm lint`      | Lint 检查（oxlint）         |
| `pnpm lint:fix`  | Lint 并自动修复             |
| `pnpm fmt`       | 格式化代码（oxfmt）         |
| `pnpm fmt:check` | 检查格式化                  |

## 3. 编码标准

- 生成代码后必须执行 Lint 与格式化：`pnpm lint`、`pnpm fmt`

## 4. AI 代理快速上手（Workspace Instructions）

本仓库是 Vue 3 + TypeScript + Vite 的算法可视化项目。AI 代理在开始编码前，先遵循本节约定，再按需查阅对应源码文件。

### 4.1 首选工作流

1. 安装依赖：`pnpm install`
2. 开发调试：`pnpm dev`
3. 变更完成后至少执行：`pnpm lint` + `pnpm fmt`
4. 涉及类型、路由、构建链路的改动，额外执行：`pnpm build`

### 4.2 技术栈与边界

- 前端框架：Vue 3（Composition API）+ TypeScript
- 构建工具：Vite
- 状态管理：Pinia
- 路由：Vue Router
- 可视化：D3
- UI 体系：Tailwind v4 + Reka UI（shadcn-vue 风格）

### 4.3 核心目录职责（先读再改）

- `src/algorithms/definitions/`：算法定义（`*.registry.ts`），按分类组织（`sorting/`、`graph/`）
- `src/algorithms/registry/`：算法注册、菜单、查找逻辑
- `src/algorithms/shared/`：算法共享输入与步骤构造工具
- `src/stores/`：全局状态（输入与播放控制）
- `src/views/AlgorithmView.vue`：算法页容器，连接路由、步骤与可视化组件
- `src/components/visualization/`：具体可视化视图组件
- `src/visualizers/`：D3 渲染与颜色语义
- `src/types/algorithm.ts`：算法领域类型单一真值源

### 4.4 算法扩展约定

新增算法时，优先遵循现有 registry 模式：

1. 在 `src/algorithms/definitions/{sorting|graph}/` 新增 `*.registry.ts`
2. 导出 `AlgorithmDefinition`，实现 `createSteps(): AlgorithmStep[]`
3. 在对应分类 `index.ts` 中注册导出
4. 确认能被 `src/algorithms/definitions/index.ts` 汇总
5. 通过路由 `/algorithm/:category/:slug` 访问验证

### 4.5 代码风格与实现约束

- 默认使用 Composition API 与 `<script setup lang="ts">`
- 优先复用现有 UI 组件与主题变量，不引入额外设计系统
- 不手动编辑 `auto-imports.d.ts`、`components.d.ts`（由插件生成）
- 更改代码与执行 git commit 时，忽略 `auto-imports.d.ts`、`components.d.ts` 的变更；提交前无需手动修复，由 `lint-staged` 自动处理
- 保持修改最小化，避免与任务无关的重构

### 4.6 常见坑

- 避免在 `src/algorithms/registry.ts` 中通过 `./registry` 重导出，使用 `./registry/index`
- `tsconfig.app.json` 开启严格选项（`noUnusedLocals` / `noUnusedParameters`），提交前清理未使用符号
- 修改可视化相关逻辑时，注意颜色语义与样式变量一致性

### 4.7 参考文件（链接优先，不复制）

- `README.md`：项目基础说明
- `package.json`：脚本命令与工具链
- `vite.config.ts`：插件与别名配置
- `tsconfig.app.json`：严格 TS 规则与路径别名
- `src/router/index.ts`：路由入口
- `src/views/AlgorithmView.vue`：算法页面主流程

### 4.8 参考资料与技能资源

- Vue、Pinia、Vue Router：查看 `.agents/skills` 中对应内容（如 `vue-best-practices`、`vue-pinia-best-practices`、`vue-router-best-practices`）
- shadcn-vue：查看 shadcn mcp
- D3：查看 context7 mcp

## 5. Commit 规范

采用 Conventional Commits 规范，所有 commit message 必须遵循此格式，确保提交历史清晰、可读且便于自动生成 changelog。

### 5.1 Commit Message 格式

- 基本格式：`<emoji> <type>(<scope>): <subject>`
- 完整格式：

  ```
  <emoji> <type>(<scope>): <subject>

  <body>

  <footer>
  ```

- Header（emoji + 类型 + 作用域 + 主题）必填，`scope` 可选
- 每行最多 100 个字符

### 5.2 Type 类型

| Type       | Emoji | 说明                           |
| ---------- | ----- | ------------------------------ |
| `feat`     | ✨    | 添加新功能                     |
| `fix`      | 🐞    | Bug 修复                       |
| `docs`     | 📃    | 文档变更                       |
| `style`    | 🌈    | 代码格式调整（不影响代码运行） |
| `refactor` | 🦄    | 代码重构                       |
| `perf`     | 🎈    | 性能优化                       |
| `test`     | 🧪    | 添加或修改测试                 |
| `build`    | 🔧    | 构建系统或外部依赖变更         |
| `ci`       | 🐎    | CI 配置文件或脚本变更          |
| `chore`    | 🐳    | 其他不修改源代码的变更         |
| `revert`   | ↩     | 撤销之前的提交                 |

可用格式示例：

- `📃 docs(agents): 规范化 AGENTS 文档结构`
- `🐞 fix(store): 修复播放状态不同步`

### 5.3 Scope 作用域

- `scope` 位于 `type` 之后，可选
- 由描述代码库某一部分的名词组成，并使用括号包围
- 推荐作用域：`auth`、`api`、`ui`、`router`、`store`、`utils`、`config`、`build`、`test`、`docs`
- 变更影响多个区域时，使用 `*` 作为 `scope`
- 变更影响整个项目时，可省略 `scope`

### 5.4 Subject 主题行

- 主题行必须紧跟在 `type/scope` 前缀后的冒号与空格之后
- 使用中文描述
- 使用祈使句、现在时态
- 首字母不大写
- 结尾不加句号
- 长度不超过 72 个字符

### 5.5 Body 主体

- `body` 在主题行后空一行开始
- 可包含任意数量段落
- 每行不超过 100 个字符
- 使用祈使句、现在时态
- 说明变更动机与和此前行为的差异

### 5.6 Footer 脚注

- `footer` 在 `body` 之后空一行提供
- 每个 footer 由 token + `: ` 或 ` #` + 字符串值组成
- token 使用 `-` 代替空格（如 `Acked-by`），`BREAKING CHANGE` 除外

#### Breaking Changes

- 破坏性变更必须在前缀中加 `!`，或在 footer 中声明
- footer 格式：`BREAKING CHANGE: 描述`
- 前缀格式：`feat(api)!: 调整认证要求`（使用 `!` 时可省略 footer）

#### Issue 引用

- 格式：`Closes #123`、`Fixes #456`、`Refs #789`
- 多个 Issue 使用换行分隔
- 仅在存在关联 Issue 时添加

### 5.7 示例

```
✨ feat(auth): 添加用户登录校验

添加登录校验流程，支持实时错误提示与密码强度反馈。

Closes #123
```

```
🐞 fix(api): 修复服务超时处理

修复超时处理逻辑，避免异常场景下误返回成功状态。

Fixes #456
Reviewed-by: Z
BREAKING CHANGE: 调整部分超时场景的响应语义。
```
