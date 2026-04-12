# Tasks

- [x] Task 1: 创建和持久化系统设置 Store
  - [x] SubTask 1.1: 创建 `src/stores/settings.ts` 文件，使用 Pinia 定义 `useSettingsStore`。
  - [x] SubTask 1.2: 添加状态：`buildTimeout` (number, 默认 30), `autoFillOnTimeout` (boolean, 默认 true), `autoProceedOnTimeout` (boolean, 默认 true)。
  - [x] SubTask 1.3: 确保使用 `pinia-plugin-persistedstate` 将设置持久化到 LocalStorage。

- [x] Task 2: 创建系统设置弹窗组件
  - [x] SubTask 2.1: 创建 `src/components/SettingsModal.vue` 组件，包含打开和关闭的 Modal 逻辑。
  - [x] SubTask 2.2: 在弹窗内加入 Slider 控件，调节 `buildTimeout` (10~60秒)。
  - [x] SubTask 2.3: 在弹窗内加入两个 Toggle 控件，分别绑定 `autoFillOnTimeout`（超时自动填入并播放）和 `autoProceedOnTimeout`（超时后自动进行下一句）。
  - [x] SubTask 2.4: 调整 UI 样式，确保符合赛博朋克深色主题（Neon English）。

- [x] Task 3: 将设置入口加入各个页面
  - [x] SubTask 3.1: 在 `src/views/Home.vue` 顶部右侧加入一个齿轮图标（Settings）。
  - [x] SubTask 3.2: 在 `src/views/Game.vue` 顶部右侧加入相同的齿轮图标，用于在游戏过程中快速调节。
  - [x] SubTask 3.3: 绑定点击事件，呼出 `SettingsModal` 弹窗。

- [x] Task 4: 在 Game.vue 中实现核心超时逻辑
  - [x] SubTask 4.1: 在 `gameState === 'build'` 阶段加入新的计时器变量 `buildTimer` 和剩余秒数 `buildCountdown`，并在界面显示倒计时。
  - [x] SubTask 4.2: 当 `buildCountdown <= 0` 时，触发超时处理流程（暂停用户交互）。
  - [x] SubTask 4.3: 如果 `autoFillOnTimeout` 开启，则将 `wordPool` 的单词按正确顺序移入 `selectedWords` 并触发 `playAudioSegment()`。
  - [x] SubTask 4.4: 监听当前句子的音频播放结束事件（或使用 `setTimeout` 延迟）。如果 `autoProceedOnTimeout` 开启，则调用 `startSentence(currentIndex + 1)` 强制进入下一句；否则清空 `selectedWords` 恢复原样，重新开始当前句子的 `build` 倒计时，强制用户重试。

- [x] Task 5: 验证并运行测试
  - [x] SubTask 5.1: 修复因引入新设置选项可能导致的 `src/stores/settings.spec.ts` (如果有的话) 或 `game.spec.ts` 端到端测试失败。
  - [x] SubTask 5.2: 运行 `npx playwright test` 并确认无页面报错或阻塞。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1]
- [Task 5] depends on [Task 4]
