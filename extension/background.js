chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'JD_EXTRACTED') {
    const payload = request.payload;

    // 查找本地是否有打开的 Career Companion
    chrome.tabs.query({ url: "http://localhost:*/*" }, (tabs) => {
      
      const executeInjection = (tabId) => {
         chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (data) => {
            // 写入 localStorage，如果在其它页面，下次切换过来可以读取
            localStorage.setItem('career_companion_incoming_jd', data);
            
            // 触发自定义事件，通知已经挂载的 React 组件（如 JobAssessor 直接响应）
            window.dispatchEvent(new CustomEvent('extension_jd_received', { detail: data }));
          },
          args: [payload.jd]
        });
      };

      if (tabs && tabs.length > 0) {
        // 找到了本地开发服务器网页，唤醒并聚焦
        let targetTab = tabs[0];
        chrome.tabs.update(targetTab.id, { active: true });
        chrome.windows.update(targetTab.windowId, { focused: true });
        
        executeInjection(targetTab.id);

      } else {
        // 没有找到，新建一个页签引导用户
        chrome.tabs.create({ url: "http://localhost:5173/" }, (newTab) => {
          // 等待页面及 React 加载完成
          setTimeout(() => {
             executeInjection(newTab.id);
          }, 2500);
        });
      }
    });

    sendResponse({ success: true });
  }
  return true;
});
