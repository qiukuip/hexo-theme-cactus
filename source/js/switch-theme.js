const themes = [
  { name: 'dark', className: 'theme--dark' },
  // { name: 'light', className: 'theme--light' },
  // { name: 'classic', className: 'theme--classic' },
  { name: 'white', className: 'theme--white' }
];

document.addEventListener('DOMContentLoaded', () => {

  let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const nextColorScheme = isDark ? 'dark' : 'white'; // 修复单引号错误
  const nextTheme = themes.find(t => t.name === nextColorScheme);

  setTheme(null, nextTheme);
  syncGiscusTheme(nextTheme); // 初始应该同步当前主题

  
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://giscus.app') return;
    const colorScheme = localStorage.getItem('color-scheme');
    const theme = themes.find(t => t.name === colorScheme);
    syncGiscusTheme(theme);
  });

  const html = document.documentElement;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isDark = html.classList.contains('theme--dark'); // 用主题类名判断更准确
        syncGiscusTheme(isDark ? themes[0] : themes[1]);
      }
    });
  });
  observer.observe(html, { attributes: true });


  // 设置主题色
  function setTheme(currentTheme, newTheme) {
    if (!newTheme) return; // 增加当前主题的校验
    
    if (currentTheme) {
      document.documentElement.classList.remove(currentTheme.className);
    }
    document.documentElement.classList.add(newTheme.className);
  }

  
  // 设置评论区主题色
  function syncGiscusTheme(theme) {
    if (!theme) return;
    const giscusFrame = document.querySelector('iframe.giscus-frame');
    if (!giscusFrame) {
      if (window.giscusRetryCount === undefined) window.giscusRetryCount = 0;
      if (window.giscusRetryCount < 10) {
        window.giscusRetryCount++;
        setTimeout(() => syncGiscusTheme(theme), 100); // 这里传theme对象
      }
      return;
    }

    if (giscusFrame.contentWindow) {
      // 从 iframe 的 src 中提取正确的 origin（避免跨域错误）
      const frameOrigin = new URL(giscusFrame.src).origin;

      giscusFrame.contentWindow.postMessage({
        giscus: {
          setConfig: {
            defaultCommentOrder: "newest",
            theme: theme.name === 'white' ? 'light' : 'dark' // 使用主题对象的name属性
          }
        }
      }, frameOrigin);
    } else {
      // 延迟重试
      setTimeout(() => syncGiscusTheme(themeName), 100);
    }
  }


  // 避免页面加载时的白屏问题
  document.body.style.visibility = 'visible';
});
