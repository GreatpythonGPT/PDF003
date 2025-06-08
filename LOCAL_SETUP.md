# 本地运行指南

以下步骤说明如何在 Windows 11 环境（PowerShell 7.5、Node.js 22.16、VS Code）下克隆并启动该 Electron + React 项目。

## 1. 克隆仓库

```powershell
# 任选目录执行
git clone <仓库地址>
cd <仓库目录>
```

## 2. 安装依赖

```powershell
npm install
```

如果国内网络安装较慢，可配置 npm 镜像源。

## 3. 启动应用

```powershell
npm start
```

正常情况下会弹出 Electron 窗口并加载界面。如果出现 `Running as root without --no-sandbox` 错误（通常在以管理员身份或 Linux root 运行时才会出现），请改用：

```powershell
electron . --no-sandbox
```

## 4. 功能测试

1. 点击「增加图片」选择多张图片，确认缩略图正常显示。
2. 在「参数设置」中可设置输出宽度、标题文本、标题页高度与颜色；
   也可以上传 PNG 水印并指定位置、边距及缩放比例。
3. 完成设置后点击「生成PDF」保存文件。
4. 若需要保存/读取配置，可使用界面的相应按钮，设置会存储在浏览器本地存储中。

## 5. 其他命令

运行项目自带的测试（目前仅占位）：

```powershell
npm test
```

## 6. 常见问题

- **Electron 无法启动**：确认 Node.js 已安装且版本在 22.16 及以上。若 npm 无法安装依赖，可检查网络或代理设置。
- **无法选择或保存文件**：本项目使用 IPC 调用系统对话框，请确保未修改 `preload.js` 和 `main.js` 中相关逻辑。
- **PDF 生成失败**：请确认导入的图片格式受支持（png、jpg、jpeg、gif、bmp）。

完成以上步骤后，即可在本地调试和扩展该项目。
