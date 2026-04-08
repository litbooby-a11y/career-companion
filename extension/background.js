chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'JD_EXTRACTED') {
    const payload = request.payload;

    // 查找本地或线上生产环境是否有打开的 Career Companion
    chrome.tabs.query({}, (tabs) => {
      // 筛选出 localhost 或 vercel 生产环境的 tab
      let targetTabs = tabs.filter(t => 
        t.url && (t.url.includes("localhost:5173") || t.url.includes("career-companion-1.vercel.app"))
      );
      
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

      if (targetTabs && targetTabs.length > 0) {
        // 找到了目标网页，唤醒并聚焦
        let targetTab = targetTabs[0];
        chrome.tabs.update(targetTab.id, { active: true });
        chrome.windows.update(targetTab.windowId, { focused: true });
        
        executeInjection(targetTab.id);

      } else {
        // 没有找到，优先使用线上生产环境地址新建一个页签引导用户
        chrome.tabs.create({ url: "https://career-companion-1.vercel.app/" }, (newTab) => {
          // 等待页面及 React 加载完成
          setTimeout(() => {
             executeInjection(newTab.id);
          }, 3500); // 线上环境考虑网络延迟，增加到3.5秒
        });
      }
    });

    sendResponse({ success: true });
  }
  return true;
});
