# 渲染图演示 PDF 生成器

This project packages an Electron desktop application for generating presentation
PDFs from batches of renderings. The app uses Electron 36.x together with React
and Material UI.

## 开发

```bash
npm install
npm run dev
```

During development the window loads from the Vite dev server.

To test the production build locally run:

```bash
npm start
```

The development server launches both Vite and Electron. Ensure Node.js 18 or
newer is installed.

The original specification follows.

1. 产品定位

目标用户：室内 / 工业 / 产品设计师及渲染师。

核心价值

一致宽度，自适应浏览：将任意分辨率图片 等比缩放 到用户设定的统一宽度（常用 1080 px），保持纵横比不变，使手机或 iPad 竖屏滑动浏览体验如刷网页般连贯。

大批量排序效率：支持 多选拖拽 快速调整顺序，减轻管理数十到上百张渲染图的负担。

一键批量标注、生成标题页并导出 PDF，避免重复排版。

2. 全局信息架构

区域

职责

主要交互

侧边栏

Logo + 三大入口：参数调整 / 图片排序 / 生成 PDF

点击切换，高亮当前页；底部状态栏显示 总数 与 已选

主工作区

根据入口呈现对应功能页

表单输入、缩略图网格拖拽、实时预览

3. 功能需求

3.1 图片选择与管理

系统文件对话框批量导入

缩略图网格（150–190 px）：复选框、框选与 Shift 多选

多选拖拽排序：可一次拖动多张，插入指示线提示

批量操作：全选 / 清空选择 / 删除所选 / 清空全部

状态栏：实时显示总数与已选数

3.2 输出尺寸

目标宽度（500–3000 px，默认 1000）

按比例批量缩放，高度随之自适应

3.3 标注

左上 & 右下独立：文本、字体、字号、颜色、边距

更改实时反映到预览

3.4 标题页

白底，高 500 px，宽度 = 目标宽度

标题文本垂直 & 水平居中；可设置字体、字号、颜色、背景色

3.5 预览 & 导出

实时 PDF 预览（含背景色调试）

生成 PDF 按钮：收集参数 → 渲染 → 导出

4. 交互细节

拖拽未选中项 → 自动只选该项

4 px 虚线插入指示

快捷键：Ctrl+A 全选，Del 删除，↑/↓ 调序

未选中即生成 → Toast 提示

5. 视觉规范

项

设计

主题

浅色；Primary #4361ee; Accent #4895ef; Danger #e63946

圆角

8–10 px

阴影

0 4 12 rgba(0,0,0,.08)

字体

Segoe UI / Arial / 思源黑体

响应式

≤1200 px 侧边栏横向；≤768 px 缩略图缩至 120 px

6. 技术栈

React + TypeScript + Material UI + Framer Motion

Electron 36.x

pdf-lib / jsPDF + HTML Canvas

browser-image-compression（前端）或 Sharp（Node）

本地存储最近使用参数

7. 后续计划

水印功能（中心 Logo 或文字）

多页模板（双栏、网格布局）

UI 中英双语

同时导出多尺寸 PDF

本文档定义 UI / 交互要点，供设计与开发评审使用。

