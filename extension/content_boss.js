console.log("Career Companion Scraper loaded on Boss Zhipin.");

function injectButton() {
  if (document.getElementById('career-companion-ext-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'career-companion-ext-btn';
  btn.innerHTML = '✨ 发送至本地雷达并打穿';
  
  // 极简科技风悬浮按钮
  Object.assign(btn.style, {
    position: 'fixed',
    top: '30vh',
    right: '20px',
    zIndex: '999999',
    padding: '14px 28px',
    backgroundColor: '#8b5cf6', // accent-primary
    color: '#ffffff',
    border: 'none',
    borderRadius: '100px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backdropFilter: 'blur(10px)',
    letterSpacing: '1px'
  });

  btn.onmouseover = () => { 
    btn.style.transform = 'scale(1.05) translateY(-2px)'; 
    btn.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.5)';
  };
  btn.onmouseout = () => { 
    btn.style.transform = 'scale(1) translateY(0)'; 
    btn.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)';
  };

  btn.onclick = () => {
    btn.innerHTML = '⚡ 提取穿透中...';
    btn.style.backgroundColor = '#0ea5e9';
    btn.style.boxShadow = '0 8px 30px rgba(14, 165, 233, 0.4)';
    
    setTimeout(() => {
      // 1. 获取工作详情 (处理各种 Boss 的 DOM 版本)
      const jdNode = document.querySelector('.job-sec-text') || document.querySelector('.job-detail-box') || document.querySelector('.job-detail-section');
      const jdText = jdNode ? jdNode.innerText.trim() : '未直接定位到 JD，可能是未知新版页面布局。';

      // 2. 获取岗位名
      const titleNode = document.querySelector('.name h1') || document.querySelector('.info-primary .name') || document.querySelector('.job-title');
      const titleText = titleNode ? titleNode.innerText.trim() : '';

      // 3. 获取薪水
      const salaryNode = document.querySelector('.salary');
      const salaryText = salaryNode ? salaryNode.innerText.trim() : '';
      
      // 4. 获取公司名
      const compNode = document.querySelector('.company-info a[ka="job-detail-company"]') || document.querySelector('.company-info .name') || document.querySelector('.company-name');
      const compText = compNode ? compNode.innerText.trim() : '';

      const fullString = `【公司】${compText}\n【岗位】${titleText}\n【薪资】${salaryText}\n\n【JD 详情】\n${jdText}`;

      chrome.runtime.sendMessage({
        type: 'JD_EXTRACTED',
        payload: {
          jd: fullString
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          btn.innerHTML = '❌ 传送失败 (后台已休眠或无权限)';
          btn.style.backgroundColor = '#ef4444';
        } else {
          btn.innerHTML = '✅ 发送成功！已触发自动化';
          btn.style.backgroundColor = '#10b981';
          btn.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
          setTimeout(() => {
            btn.innerHTML = '✨ 发送至本地雷达并打穿';
            btn.style.backgroundColor = '#8b5cf6';
            btn.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)';
          }, 3000);
        }
      });
    }, 500);
  };

  document.body.appendChild(btn);
}

// 观测 DOM 完全加载完成时注入
const observer = new MutationObserver(() => {
  if (document.querySelector('.job-detail-box') || document.querySelector('.job-sec-text') || document.querySelector('.job-title')) {
    injectButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// 备用兜底强制注入
setTimeout(injectButton, 2000);
