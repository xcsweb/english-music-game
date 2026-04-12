# Fix Refresh Bug and Expand Data Spec

## Why
目前系统在体验过程中暴露出严重的页面异常刷新 Bug（歌曲播放到一半或点击返回键时，页面会意外刷新导致游戏进度丢失）。同时，虽然之前生成了 100 条句子数据，但未满足用户对“100 首完整歌曲”的规模要求。随着数据规模扩大，旧的测试用例已不适用，需要推翻重写，从而彻底保障百首歌曲场景下的系统健壮性。

## What Changes
- 检查并修复引发页面异常刷新的原因（如表单意外提交、路由跳转配置错误等）。
- 修改数据爬虫脚本，使其能够从 iTunes API 批量拉取 **100 首不同的歌曲**，并下载 100 个音频文件至本地。
- 使用此前开发的启发式自动对齐算法，为这 100 首歌曲自动生成并对齐所有歌词的时间轴，覆盖生成全新的 `defaultData.ts`。
- 删除所有旧的测试用例文件，并使用新规模的 100 首歌数据重新编写端到端（E2E）测试。

## Impact
- Affected specs: `music-english-game` 中的核心游戏播放流程及后台数据重置功能。
- Affected code: `Game.vue` / `Home.vue` 等界面的路由和事件绑定、`scripts/generate.mjs` 数据生成脚本、所有 `tests/*.spec.ts` 及其相关配置文件。

## ADDED Requirements
### Requirement: 扩充至 100 首歌曲的曲库规模
The system SHALL provide a default library of 100 unique songs.

#### Scenario: Success case
- **WHEN** user resets data to defaults
- **THEN** the system populates the LocalStorage with 100 unique songs, each with auto-aligned lyrics and locally downloaded audio files.

### Requirement: 全新的 100 首歌曲规模测试集
The system SHALL provide an updated test suite validating the entire game flow.

#### Scenario: Success case
- **WHEN** the test suite is executed
- **THEN** it successfully verifies that songs load, audio plays without errors, and the game can be completed without page reloads.

## MODIFIED Requirements
### Requirement: 修复游戏页面异常刷新的 Bug
**Reason**: 用户点击某些交互按钮或使用浏览器返回键时，页面发生意外的全页刷新（Full Page Reload），导致前端状态与游戏进度丢失。
**Migration**: 排查 Vue Router 配置以及前端组件中的所有 `<button>`，补充 `type="button"` 并使用 Vue Router 的编程式导航代替可能存在的 `href` 跳转。

## REMOVED Requirements
### Requirement: 旧的测试用例
**Reason**: 旧的测试用例主要针对少量硬编码数据（如最初的 15 首歌），数据结构的升级以及页面元素的变动可能导致旧测试频繁误报。
**Migration**: 彻底删除原有的 `tests/game.spec.ts` 以及单元测试文件，基于新的 100 首曲库结构和新的 UI 交互重新编写测试逻辑。