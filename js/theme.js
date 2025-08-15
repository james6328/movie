/**
 * 主题管理模块
 * 负责日间/夜间模式的切换和状态管理
 */

// 立即执行函数，在页面加载前应用主题，避免闪烁
(function() {
    const STORAGE_KEY = 'theme-preference';
    const THEME_ATTRIBUTE = 'data-theme';
    
    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }
    
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }
    
    // 立即应用主题
    const theme = getStoredTheme() || getSystemTheme();
    if (theme === 'light') {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    }
})();

class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'theme-preference';
        this.THEME_ATTRIBUTE = 'data-theme';
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        
        // 初始化主题
        this.init();
    }

    /**
     * 初始化主题管理器
     */
    init() {
        // 应用当前主题
        this.applyTheme(this.currentTheme);
        
        // 监听系统主题变化
        this.watchSystemTheme();
        
        // 绑定主题切换按钮事件
        this.bindThemeToggleEvents();
        
        // 更新按钮状态
        this.updateThemeButton();
    }

    /**
     * 获取存储的主题偏好
     */
    getStoredTheme() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
            console.warn('无法读取主题偏好设置:', e);
            return null;
        }
    }

    /**
     * 获取系统主题偏好
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    /**
     * 保存主题偏好
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (e) {
            console.warn('无法保存主题偏好设置:', e);
        }
    }

    /**
     * 应用主题
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.setAttribute(this.THEME_ATTRIBUTE, 'light');
        } else {
            root.removeAttribute(this.THEME_ATTRIBUTE);
        }
        
        this.currentTheme = theme;
        this.saveTheme(theme);
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateThemeButton();
        
        // 显示切换提示
        if (typeof showToast === 'function') {
            showToast(`已切换到${newTheme === 'light' ? '日间' : '夜间'}模式`, 'success');
        }
    }

    /**
     * 监听系统主题变化
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            
            // 监听变化
            const handleChange = (e) => {
                // 只有在没有用户偏好设置时才跟随系统
                if (!this.getStoredTheme()) {
                    const systemTheme = e.matches ? 'light' : 'dark';
                    this.applyTheme(systemTheme);
                    this.updateThemeButton();
                }
            };

            // 现代浏览器使用 addEventListener
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            } else {
                // 兼容旧浏览器
                mediaQuery.addListener(handleChange);
            }
        }
    }

    /**
     * 绑定主题切换按钮事件
     */
    bindThemeToggleEvents() {
        // 使用事件委托，支持动态添加的按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('#themeToggleButton')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    /**
     * 更新主题按钮的图标和文本
     */
    updateThemeButton() {
        const themeIcons = document.querySelectorAll('#themeIcon');
        const themeTexts = document.querySelectorAll('#themeText');
        
        const isLight = this.currentTheme === 'light';
        
        // 更新图标
        themeIcons.forEach(icon => {
            if (icon) {
                if (isLight) {
                    // 显示月亮图标（当前是日间模式，点击切换到夜间）
                    icon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    `;
                } else {
                    // 显示太阳图标（当前是夜间模式，点击切换到日间）
                    icon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    `;
                }
            }
        });
        
        // 更新文本
        themeTexts.forEach(text => {
            if (text) {
                text.textContent = isLight ? '夜间' : '日间';
            }
        });
        
        // 更新按钮标题
        const themeButtons = document.querySelectorAll('#themeToggleButton');
        themeButtons.forEach(button => {
            if (button) {
                button.title = `切换到${isLight ? '夜间' : '日间'}模式`;
                button.setAttribute('aria-label', `切换到${isLight ? '夜间' : '日间'}模式`);
            }
        });
    }

    /**
     * 获取当前主题
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 设置主题（不触发切换动画）
     */
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.applyTheme(theme);
            this.updateThemeButton();
        }
    }
}

// 创建全局主题管理器实例
let themeManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    themeManager = new ThemeManager();
});

// 导出到全局作用域
window.ThemeManager = ThemeManager;
window.getThemeManager = () => themeManager;