---
name: 航天任务调度工具
status: final
updated: 2026-08-14
colors:
  surface-base: '#F4F7F9'
  surface-raised: '#FFFFFF'
  surface-subtle: '#EDF2F5'
  ink-primary: '#16242E'
  ink-secondary: '#52636F'
  ink-muted: '#758590'
  border: '#D7E0E5'
  border-strong: '#B8C6CE'
  primary: '#176B87'
  primary-hover: '#12566D'
  primary-soft: '#E4F2F6'
  success: '#2E7D68'
  warning: '#B7791F'
  danger: '#B4413E'
typography:
  family: 'Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
  page-title: '24px / 1.35 / 600'
  section-title: '18px / 1.4 / 600'
  body: '14px / 1.6 / 400'
  label: '13px / 1.4 / 500'
rounded:
  sm: 4px
  md: 6px
  lg: 8px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
components:
  control-height: 36px
  header-height: 64px
  content-max: 1920px
---

## Brand & Style

航天任务调度工具是面向任务规划与资源调度的专业工作台。界面应呈现“可靠、精确、可扫描”的工具感：清晰层级、稳定尺寸、克制色彩和高效操作优先于装饰。保留现有 logo，产品名称与系统说明放在页脚展示，不使用渐变、装饰光斑、超大营销标题或大面积深色背景。

## Colors

- `{colors.primary}` 仅用于当前导航、主要命令、链接和可见焦点。
- `{colors.success}`、`{colors.warning}`、`{colors.danger}` 分别表达成功、注意和错误，不用主色替代状态语义。
- 页面底色使用 `{colors.surface-base}`，工具栏和内容区域使用 `{colors.surface-raised}`；层级主要依靠色调、间距和细边框建立。
- 文本默认 `{colors.ink-primary}`，次要信息使用 `{colors.ink-secondary}`，不得以低对比灰色承载关键操作。

## Typography

使用系统无衬线字体，中文优先 `PingFang SC` / `Microsoft YaHei`。页面标题固定 24px，内容区标题 18px，正文和表格主体 14px。工具界面不使用随视口缩放的字号，字距统一为 0。

## Layout & Spacing

应用由 64px 品牌栏、紧凑命令导航、主内容和页脚组成。内容最大宽度 1920px，桌面边距 24px，窄屏边距 12px。数据密集页面保持全宽；表单内容限制在可读宽度。间距遵循 4 / 8 / 12 / 16 / 24 / 32px。

## Elevation & Depth

阴影只用于悬浮菜单、弹窗和固定顶部栏。常规内容区不使用重阴影；边框使用 1px `{colors.border}`。避免卡片嵌套，页面分区使用无框布局或全宽色带。

## Shapes

输入框和按钮使用 4-6px 圆角，弹窗和独立内容面板最多 8px。状态标签可以使用胶囊形，普通命令按钮不得使用夸张圆角。

## Components

- **品牌栏**：logo、示例数据下载命令；产品名称与系统说明在页脚展示，下载继续调用原接口。
- **命令导航**：按项目、视图、资源、任务、调度、帮助分组；当前路由有明确选中态；窄屏横向滚动。
- **步骤条**：作为规划流程导航，当前步骤清晰，非当前步骤保持可读；不可达步骤不制造虚假可点击状态。
- **表格**：表头 13px/600，表体 14px；行高 48px；悬停使用中性或主色浅底；数据区可横向滚动。
- **表单**：标签和控件对齐，控件高度 36px，焦点环清晰；主要动作使用主按钮，次要动作使用默认或文本按钮。
- **反馈**：继续使用 Ant Design message/modal；成功、警告、错误保持语义色。

## Do's and Don'ts

| Do | Don't |
|---|---|
| 让路由、表格、表单和流程状态一眼可扫 | 用大段装饰文字解释功能 |
| 复用 Ant Design 和现有图标 | 新增另一套组件库或手绘 SVG 图标 |
| 将横向滚动限制在导航或数据区内部 | 让整个页面在窄屏产生不可控横向溢出 |
| 保留所有现有业务动作和数据契约 | 为了视觉重构修改 Store、API 或算法流程 |
