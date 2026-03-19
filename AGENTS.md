# AGENTS 开发规范

## 环境设置

- 安装 pnpm: `npm install -g pnpm`
- 安装依赖：`pnpm install`

## 常用命令

| 命令             | 说明                        |
| ---------------- | --------------------------- |
| `pnpm dev`       | 启动开发服务器              |
| `pnpm build`     | 构建项目（类型检查 + Vite） |
| `pnpm preview`   | 预览构建结果                |
| `pnpm lint`      | Lint 检查（oxlint）         |
| `pnpm lint:fix`  | Lint 并自动修复             |
| `pnpm fmt`       | 格式化代码（oxfmt）         |
| `pnpm fmt:check` | 检查格式化                  |

## 编码标准

- 生成代码后必须执行 Lint 检查和格式化： `pnpm lint` 和 `pnpm fmt`

## Commit 规范

采用 Conventional Commits 规范，所有 commit message 必须遵循此格式，确保提交历史清晰、可读且便于自动生成 changelog。

### Commit Message 格式

- **基本格式：** `<type>(<scope>): <subject>`
- **完整格式：**

  ```
  <type>(<scope>): <subject>

  <body>

  <footer>
  ```

- Header（类型 + 作用域 + 主题）是必需的，scope 是可选的
- 每行最多 100 个字符

### Type 类型（推荐带 emoji）

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

推荐使用格式：`✨ feat(auth): add login validation`

### Scope 作用域

- scope 是可选的，位于 type 之后
- 由描述代码库某一部分的名词组成，用括号包围
- 推荐的作用域：auth, api, ui, router, store, utils, config, build, test, docs
- 变更影响多个区域时，使用 `*` 作为 scope
- 变更影响整个项目时，可省略 scope

### Subject 主题行

- 描述必须紧跟在 type/scope 前缀后的冒号和空格之后
- **使用中文进行描述**
- 使用祈使句、现在时态（如"add"而非"added"或"adds"）
- 首字母不要大写
- 结尾不要加句号 (.)
- 长度不超过 72 个字符

### Body 主体

- body 在描述之后空一行开始
- 自由格式，可由任意数量的换行分隔的段落组成
- 每行不超过 100 个字符
- 使用祈使句、现在时态
- 描述变更的动机和与之前行为的对比

### Footer 脚注

- footer 在 body 之后空一行提供
- 每个 footer 由 token 后跟 `: `或 ` #` 分隔符，再跟字符串值组成
- footer 的 token 使用 `-` 代替空格（如 `Acked-by`），`BREAKING CHANGE` 除外

#### Breaking Changes

- Breaking changes 必须在 type/scope 前缀中标明（使用 `!`），或作为 footer 中的条目
- Footer 格式：`BREAKING CHANGE: 描述`
- 前缀格式：`feat(api)!: change authentication requirement`（使用 `!` 时可省略 footer）

#### Issue 引用

- 格式：`Closes #123`、`Fixes #456`、`Refs #789`
- 多个 Issue 用换行分隔
- 仅当存在关联 Issue 时才添加

### 示例

```
✨ feat(auth): 添加用户登录验证

添加登录验证功能，支持实时错误消息和密码强度指示。

Closes #123
```

```
🐞 fix(api): 解决服务超时错误

修复超时处理问题。

Fixes #456
Reviewed-by: Z
BREAKING CHANGE: 修复了部分超时情况下仍返回 200 OK 的问题。
```
