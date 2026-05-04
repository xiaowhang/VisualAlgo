# 兼容性测试报告

## 1. 测试概述

| 项目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 测试目标 | 验证算法可视化系统在颜色转换、数据格式、CSS token、Zod 校验、浏览器 API 等方面的兼容性与健壮性 |
| 测试框架 | Vitest 4.1.5 + happy-dom                                                                       |
| 测试文件 | 5 个 `*.compat.test.ts` 文件                                                                   |
| 测试用例 | 71 个（通过 71，失败 0）                                                                       |
| 测试环境 | Windows 11, Node.js, happy-dom 虚拟 DOM                                                        |

---

## 2. oklch-to-rgb 颜色转换兼容性

**测试文件**: `src/visualizers/resolveCssColorToken.compat.test.ts`（18 个用例）

`resolveCssColorToken` 函数负责将 CSS `oklch()` 颜色值转换为 `rgb()` 格式，以兼容 D3 SVG 动画。

### 测试结果

| 用例                | 输入                         | 预期输出                   | 结果 |
| ------------------- | ---------------------------- | -------------------------- | ---- |
| 纯黑                | `oklch(0 0 0)`               | `rgb(0, 0, 0)`             | 通过 |
| 纯白                | `oklch(1 0 0)`               | `rgb(255, 255, 255)`       | 通过 |
| 零彩度灰色          | `oklch(0.5 0 120)`           | R≈G≈B（差值<5）            | 通过 |
| 百分比 L 值         | `oklch(50% 0.1 120)`         | `rgb(r, g, b)` 格式        | 通过 |
| 带 alpha            | `oklch(0.5 0.2 180 / 0.5)`   | `rgba(r, g, b, 0.5)`       | 通过 |
| 百分比 alpha        | `oklch(0.5 0.2 180 / 50%)`   | `rgba(r, g, b, 0.5)`       | 通过 |
| alpha=1 无 rgba     | `oklch(0.5 0.2 180 / 1)`     | `rgb(...)` 格式            | 通过 |
| alpha 缺省          | `oklch(0.5 0.2 180)`         | `rgb(...)` 格式            | 通过 |
| 大小写不敏感        | `OKLCH(0.5 0.2 180)`         | `rgb(r, g, b)`             | 通过 |
| 各色相差异          | H=0/60/120/180/240/300       | 6 种不同颜色               | 通过 |
| 极端 L 值           | L=0.01 / L=0.99              | 不溢出                     | 通过 |
| 无空格格式          | `oklch(0.5 0.2 180)`         | 正确解析                   | 通过 |
| 多空格格式          | `oklch(  0.5   0.2   180  )` | 正确解析                   | 通过 |
| 非法格式            | `not-a-color`                | 返回原始字符串             | 通过 |
| 已有 rgb            | `rgb(100, 200, 50)`          | 直接返回                   | 通过 |
| 已有 rgba           | `rgba(100, 200, 50, 0.5)`    | 直接返回                   | 通过 |
| var() 解析          | `var(--test-color)`          | 通过 getComputedStyle 获取 | 通过 |
| getComputedStyle 空 | mock 返回空                  | fallback 到原始 token      | 通过 |

### 结论

oklch-to-rgb 转换器在所有边界条件下表现稳定，包括极端亮度值、零彩度、alpha 通道、大小写混合、多余空格等场景。var() 引用解析在 getComputedStyle 返回空值时能正确 fallback。

---

## 3. 数据格式版本兼容性

**测试文件**: `src/lib/validation/formatVersion.compat.test.ts`（20 个用例）

项目支持 4 种数据类型的快照导入导出，每种类型有独立的 `formatVersion` 常量。

### formatVersion 常量值

| 数据类型 | 常量名                            | 值  |
| -------- | --------------------------------- | --- |
| 排序     | `SORTING_SNAPSHOT_FORMAT_VERSION` | 1   |
| 图       | `GRAPH_SNAPSHOT_FORMAT_VERSION`   | 2   |
| 树       | `TREE_SNAPSHOT_FORMAT_VERSION`    | 2   |
| DP       | `DP_SNAPSHOT_FORMAT_VERSION`      | 1   |

### 测试结果

| 分类                   | 用例数 | 结果                                     |
| ---------------------- | ------ | ---------------------------------------- |
| 常量值验证             | 4      | 全部通过                                 |
| 裸数组旧格式拒绝       | 3      | 全部通过，消息含"格式已升级"             |
| formatVersion 可选     | 4      | 全部通过，不含 formatVersion 时 ok=true  |
| 版本号校验             | 3      | 全部通过（999→ok，字符串/小数→ok=false） |
| 导出包含 formatVersion | 4      | 全部通过                                 |
| 往返一致性             | 2      | 全部通过，导出→导入→再导出版本号不变     |

### 结论

数据格式版本系统工作正常：旧格式（裸数组）被正确拒绝并给出升级提示，formatVersion 字段可选，非法版本号（字符串/小数）被拒绝，往返一致性保持。

---

## 4. CSS 颜色 Token 完整性

**测试文件**: `src/visualizers/colorSemantics.compat.test.ts`（27 个用例）

`colorSemantics.ts` 将算法状态映射到 CSS 变量颜色 token，覆盖 10 种可视化类型。

### 各算法 fallback 测试

| 可视化类型        | fallback 行为                                   | 结果 |
| ----------------- | ----------------------------------------------- | ---- |
| sorting           | 无高亮 → `default`                              | 通过 |
| graph             | 普通节点 → `idle`，current > frontier > visited | 通过 |
| tree              | 无高亮 → `default`                              | 通过 |
| dp-table          | 有值无高亮 → `computed`，null → `default`       | 通过 |
| huffman           | 无高亮 → `default`                              | 通过 |
| timeline          | 无高亮 → `idle`                                 | 通过 |
| chessboard        | 无高亮 → `idle`                                 | 通过 |
| decision-tree     | 无高亮 → `idle`                                 | 通过 |
| network-flow 节点 | 普通节点 → `idle`                               | 通过 |
| network-flow 边   | 非饱和边 → `border`                             | 通过 |
| lp-tableau        | 无高亮 → `idle`                                 | 通过 |

### VISUALIZATION_COLOR_TOKENS 完整性

| 验证项                     | 结果 |
| -------------------------- | ---- |
| 包含全部 11 个 key         | 通过 |
| 所有值匹配 `var(--*)` 格式 | 通过 |

### 结论

所有 10 种可视化的颜色映射在缺失高亮信息时均能正确 fallback 到默认颜色。`VISUALIZATION_COLOR_TOKENS` 对象包含完整的 11 个 token key，且所有值均为合法的 CSS 变量引用格式。

---

## 5. Zod Strict 模式兼容性

**测试文件**: `src/lib/validation/strictMode.compat.test.ts`（10 个用例）

所有 6 种快照 schema 均使用 `.strict()` 模式，拒绝未声明的额外字段。

### 额外字段拒绝测试

| Schema                | 输入                                         | 结果     |
| --------------------- | -------------------------------------------- | -------- |
| sortingSnapshotSchema | `{ sortingInput: [...], extraField: 'bad' }` | ok=false |
| graphSnapshotSchema   | `{ nodes, edges, extraField }`               | ok=false |
| treeSnapshotSchema    | `{ nodes, edges, extraField }`               | ok=false |
| dpLcsSchema           | `{ type: 'lcs', x, y, extraField }`          | ok=false |
| dpKnapsackSchema      | `{ type: 'knapsack', ..., extraField }`      | ok=false |
| dpInvestmentSchema    | `{ type: 'investment', ..., extraField }`    | ok=false |

### 错误消息质量

| 验证项               | 结果                             |
| -------------------- | -------------------------------- |
| 错误消息非空         | 通过                             |
| 自定义验证消息含中文 | 通过（如"请输入 3-50 个整数。"） |

### 结论

所有 schema 的 `.strict()` 模式工作正常，能有效防止用户传入意外字段。自定义验证规则（如元素数量限制）的消息为中文，符合国际化要求。

---

## 6. 浏览器 API 依赖与降级策略

**测试文件**: `src/lib/browserApis.compat.test.ts`（8 个用例）

### 测试结果

| API                      | 测试内容                     | 结果 |
| ------------------------ | ---------------------------- | ---- |
| localStorage             | happy-dom 中正常读写         | 通过 |
| localStorage 不可用      | 模拟抛出异常时的降级处理     | 通过 |
| document                 | happy-dom 中 document 可用   | 通过 |
| document.createElementNS | 创建 SVG 元素                | 通过 |
| Blob                     | 可用性验证                   | 通过 |
| URL.createObjectURL      | 可用性验证 + revokeObjectURL | 通过 |
| Pointer Events           | pointerdown 事件注册与触发   | 通过 |

### 结论

项目依赖的浏览器 API（localStorage、Blob、URL.createObjectURL、Pointer Events、SVG 创建）在 happy-dom 测试环境中均正常工作。localStorage 不可用时有降级处理机制。

---

## 7. 兼容性风险总结与建议

### 风险等级：低

| 风险项           | 等级 | 说明                                                        |
| ---------------- | ---- | ----------------------------------------------------------- |
| oklch 浏览器支持 | 中   | oklch() 在旧浏览器中不被支持，但项目已实现手动转换 fallback |
| 数据格式迁移     | 低   | 旧格式（裸数组）被正确拒绝并给出升级提示                    |
| Zod strict 模式  | 低   | 有效防止额外字段污染，错误消息质量良好                      |
| 浏览器 API 降级  | 低   | localStorage 不可用时有降级处理                             |
| CSS 变量解析     | 低   | getComputedStyle 返回空时能正确 fallback                    |

### 建议

1. **oklch 手动转换器**已覆盖边界场景，建议在生产环境中监控首次颜色解析的性能（缓存命中率）
2. **数据格式版本**当前不校验版本号值（999 也通过），未来如需强制版本校验可添加范围检查
3. **Zod 错误消息**中 `.strict()` 的拒绝消息为英文（"Unrecognized key"），如需统一中文可考虑自定义错误处理器
