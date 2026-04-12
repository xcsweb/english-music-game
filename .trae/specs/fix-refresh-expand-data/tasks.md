# Tasks
- [x] Task 1: 排查并修复前端页面异常刷新 Bug
  - [x] SubTask 1.1: 检查所有组件的 `<button>` 标签，确保没有遗漏的 `type="button"` 导致表单默认提交刷新。
  - [x] SubTask 1.2: 检查 Vue Router 配置，排查是否存在直接操作 `window.location` 导致的重定向或刷新行为。
  - [x] SubTask 1.3: 检查所有界面的“返回”按钮与浏览器默认的“返回键”行为，确保采用 SPA（单页应用）平滑过渡，不会丢失前端状态。

- [x] Task 2: 重新收集 100 首歌曲并生成音频与自动打轴数据
  - [x] SubTask 2.1: 编写包含 100 首歌名及歌词片段的配置表（可基于已有脚本扩充）。
  - [x] SubTask 2.2: 更新 `scripts/generate.mjs`，从 iTunes API 批量下载 100 首不同的试听音频至 `public/audio` 目录。
  - [x] SubTask 2.3: 调用内置启发式时间轴自动对齐算法，计算 100 首歌曲中每一句歌词的精确起止时间。
  - [x] SubTask 2.4: 运行脚本，重新生成项目运行依赖的 `src/data/defaultData.ts`。

- [x] Task 3: 重新编写单元测试与 E2E 测试用例
  - [x] SubTask 3.1: 删除所有旧的单元测试 (`*.spec.ts`) 以及端到端测试 (`tests/game.spec.ts`) 文件。
  - [x] SubTask 3.2: 编写新的单元测试，覆盖 100 首规模下 Store 数据解析和音效工具函数的鲁棒性。
  - [x] SubTask 3.3: 编写新的 Playwright E2E 测试，覆盖随机选择 100 首中任意一首、等待加载、完成拼装流程及返回操作的完整闭环。
  - [x] SubTask 3.4: 运行并确认新测试用例全部通过（100% 绿灯）。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]