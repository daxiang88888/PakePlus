window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// ======================
// PakePlus + Tauri API 通用脚本（可直接注入使用）
// ======================
(async function () {
  "use strict";

  // 1. 检测 Tauri API 是否可用
  const isTauriAvailable = !!window.__TAURI__;
  if (!isTauriAvailable) {
    console.warn("[PakePlus-Tauri] 未检测到 Tauri 环境，API 功能无法使用，请检查配置是否开启 TauriApi");
    return;
  }

  console.log("[PakePlus-Tauri] ✅ Tauri API 已就绪");

  // 引入核心模块
  const { notification } = window.__TAURI__.notification;
  const { fs, path } = window.__TAURI__;
  const { appWindow } = window.__TAURI__.window;
  const { dialog } = window.__TAURI__.dialog;
  const { clipboard } = window.__TAURI__.clipboard;
  const { app } = window.__TAURI__.app;

  // ======================
  // 功能 1：系统通知
  // ======================
  async function sendSystemNotification(title, body) {
    try {
      const permission = await notification.requestPermission();
      if (permission === "granted") {
        await new notification.Notification({ title, body }).show();
        console.log("[通知] 发送成功");
      } else {
        console.warn("[通知] 权限被拒绝");
      }
    } catch (e) {
      console.error("[通知] 发送失败：", e);
    }
  }

  // ======================
  // 功能 2：本地文件读写
  // ======================
  const dataFile = "app-data.txt";

  async function writeToFile(content) {
    try {
      const appDir = await path.appDataDir();
      const filePath = `${appDir}${dataFile}`;
      await fs.writeTextFile(filePath, content);
      console.log("[文件写入] 成功，路径：", filePath);
      return true;
    } catch (e) {
      console.error("[文件写入] 失败：", e);
      return false;
    }
  }

  async function readFromFile() {
    try {
      const appDir = await path.appDataDir();
      const filePath = `${appDir}${dataFile}`;
      const content = await fs.readTextFile(filePath);
      console.log("[文件读取] 内容：", content);
      return content;
    } catch (e) {
      console.error("[文件读取] 失败：", e);
      return null;
    }
  }

  // ======================
  // 功能 3：窗口控制
  // ======================
  const windowControls = {
    minimize: () => appWindow.minimize(),
    toggleMaximize: async () => {
      const isMax = await appWindow.isMaximized();
      isMax ? appWindow.unmaximize() : appWindow.maximize();
    },
    close: () => appWindow.close(),
    setSize: (w, h) => appWindow.setSize({ width: w, height: h }),
  };

  // ======================
  // 功能 4：系统对话框
  // ======================
  async function showConfirmDialog(title, message) {
    return await dialog.confirm(message, { title });
  }

  async function showAlertDialog(title, message) {
    await dialog.message(message, { title });
  }

  // ======================
  // 功能 5：剪贴板操作
  // ======================
  async function copyToClipboard(text) {
    await clipboard.writeText(text);
    console.log("[剪贴板] 已复制：", text);
  }

  async function readFromClipboard() {
    const text = await clipboard.readText();
    console.log("[剪贴板] 读取到：", text);
    return text;
  }

  // ======================
  // 功能 6：获取应用信息
  // ======================
  async function getAppInfo() {
    const name = await app.getName();
    const version = await app.getVersion();
    console.log("[应用信息] 名称：", name, "版本：", version);
    return { name, version };
  }

  // ======================
  // 对外暴露接口（方便你在页面里直接调用）
  // ======================
  window.PakePlusTauri = {
    sendSystemNotification,
    writeToFile,
    readFromFile,
    windowControls,
    showConfirmDialog,
    showAlertDialog,
    copyToClipboard,
    readFromClipboard,
    getAppInfo,
  };

  console.log("[PakePlus-Tauri] 所有功能已挂载到 window.PakePlusTauri");
  console.log("[使用示例]：PakePlusTauri.sendSystemNotification('标题', '内容')");

  // 可选：页面加载完成后自动发送一条测试通知（可注释掉）
  // setTimeout(() => {
  //   sendSystemNotification("PakePlus 测试", "Tauri API 已成功加载！");
  // }, 2000);

})();