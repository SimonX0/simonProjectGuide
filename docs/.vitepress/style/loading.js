// 页面加载进度条脚本
(function() {
  'use strict';

  // 进度条元素
  let progressBar = null;

  // 创建进度条
  function createProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'page-progress-bar';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #42b883, #3a8ee6, #42b883);
      background-size: 200% 100%;
      z-index: 9999;
      transition: width 0.3s ease;
      box-shadow: 0 0 10px rgba(66, 184, 131, 0.5);
    `;
    document.body.appendChild(bar);

    // 添加光效动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes progressShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      #page-progress-bar {
        animation: progressShimmer 2s linear infinite;
      }
    `;
    document.head.appendChild(style);

    return bar;
  }

  // 更新进度
  let progress = 0;
  function updateProgress() {
    if (!progressBar) {
      progressBar = createProgressBar();
    }

    // 模拟加载进度
    if (progress < 30) {
      progress += Math.random() * 10;
    } else if (progress < 70) {
      progress += Math.random() * 5;
    } else if (progress < 90) {
      progress += Math.random() * 2;
    } else {
      progress += 0.5;
    }

    if (progress > 99) progress = 99;

    progressBar.style.width = progress + '%';

    if (progress < 99) {
      requestAnimationFrame(updateProgress);
    }
  }

  // 完成加载
  function completeLoading() {
    if (progressBar) {
      progressBar.style.width = '100%';

      // 淡出动画
      setTimeout(() => {
        progressBar.style.transition = 'opacity 0.3s ease';
        progressBar.style.opacity = '0';

        // 移除进度条
        setTimeout(() => {
          if (progressBar && progressBar.parentNode) {
            progressBar.parentNode.removeChild(progressBar);
            progressBar = null;
          }
        }, 300);
      }, 200);
    }
    progress = 100;
  }

  // 监听页面加载
  function initLoading() {
    progress = 0;
    updateProgress();

    // 页面加载完成
    if (document.readyState === 'complete') {
      setTimeout(completeLoading, 300);
    } else {
      window.addEventListener('load', () => {
        setTimeout(completeLoading, 300);
      });
    }
  }

  // 监听路由变化
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      // 页面切换，重置进度
      progress = 0;
      if (progressBar && progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar);
        progressBar = null;
      }
      initLoading();
    }
  }).observe(document, { subtree: true, childList: true });

  // 初始化
  initLoading();
})();
