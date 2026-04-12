# 首页排序、筛选与历史记录 Spec

## Why
目前用户在主页只能看到随机排列的歌曲，缺乏有效的查找手段。为了让用户能更快找到适合自己水平或喜欢的歌曲，并能无缝继续上次未完成的学习，我们需要在主页增加排序、难度筛选以及学习进度记录功能。

## What Changes
- 新增 `Progress` Store，用于记录每首歌曲的学习进度（当前句子索引、最后学习时间）。
- 在主页 (`Home.vue`) 添加筛选控件：按难度（全部、简单、中等、困难）。
- 在主页 (`Home.vue`) 添加排序控件：按最近学习、标题 (A-Z)、难度等。
- 在主页的歌曲卡片上显示学习进度（例如：10/45 句），并将按钮文本改为“继续学习 (Resume)”或“开始学习 (Start)”。
- 在游戏页面 (`Game.vue`) 开始时读取进度，完成句子时更新进度，并在游戏结束时重置进度。

## Impact
- Affected specs: 主页歌曲列表展示、游戏初始化流程。
- Affected code: `src/views/Home.vue`, `src/views/Game.vue`, 新建 `src/stores/progress.ts`。

## ADDED Requirements
### Requirement: 难度筛选与列表排序
系统必须提供控件让用户过滤和排序主页的歌曲列表。

#### Scenario: 按难度筛选
- **WHEN** 用户选择“简单 (Easy)”难度
- **THEN** 歌曲列表只显示 `difficulty` 为 `easy` 的歌曲。

#### Scenario: 按最近学习排序
- **WHEN** 用户选择“最近学习 (Recently Played)”排序
- **THEN** 歌曲列表优先显示有学习进度且最近玩过的歌曲。

### Requirement: 学习进度保存与继续
系统必须记录用户在每首歌曲中的学习位置。

#### Scenario: 记录并继续学习
- **WHEN** 用户在某首歌学到第 5 句后退出，然后从主页再次点击该歌曲的“继续学习”
- **THEN** 游戏直接从第 5 句开始，而不是第 0 句。