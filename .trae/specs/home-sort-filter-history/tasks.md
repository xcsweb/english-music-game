# Tasks

- [x] Task 1: 创建和持久化学习进度 Store
  - [x] SubTask 1.1: 创建 `src/stores/progress.ts`，定义 `useProgressStore`。
  - [x] SubTask 1.2: 添加状态：`progressMap`，结构为 `Record<string, { currentIndex: number, total: number, lastPlayed: number }>`。
  - [x] SubTask 1.3: 实现更新进度、获取进度、清空进度的方法，并配置 `persist: true` 将其存入 LocalStorage。

- [x] Task 2: 在 Game.vue 中集成进度读写
  - [x] SubTask 2.1: 引入 `useProgressStore`。在 `Game.vue` 挂载获取到 `sentences` 后，检查 `progressStore`。如果有保存的 `currentIndex`，直接跳到该句开始。
  - [x] SubTask 2.2: 在成功拼装并切换到下一句时（如 `currentIndex.value++`），调用 store 更新当前歌曲进度和最后游玩时间戳。
  - [x] SubTask 2.3: 在游戏胜利（所有句子完成，显示 Victory）时，调用 store 清除当前歌曲进度，使其下次从头开始。

- [x] Task 3: 更新 Home.vue 的 UI 和列表逻辑
  - [x] SubTask 3.1: 在主页顶部（Header 之下，列表之上）增加难度筛选组（All, Easy, Medium, Hard）。
  - [x] SubTask 3.2: 在筛选组旁增加排序下拉框或切换组（Recently Played, Title A-Z, Difficulty）。
  - [x] SubTask 3.3: 修改 `src/views/Home.vue` 中的歌曲渲染列表。将原本简单的循环改为计算属性 `displayedMusics`，根据筛选、排序和进度状态动态计算展示列表。
  - [x] SubTask 3.4: 在歌曲卡片 UI 上，如果歌曲有进度，则展示进度条或文字（如 `10 / 41`），并将原来的 "START" 按钮改为 "RESUME"。

- [x] Task 4: 验证和自动化测试
  - [x] SubTask 4.1: 创建 `src/stores/progress.spec.ts` 并编写对进度存储的基础单元测试。
  - [x] SubTask 4.2: 运行所有单元测试 `npx vitest run` 和端到端测试 `npx playwright test`，确保无报错。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 2] and [Task 3]