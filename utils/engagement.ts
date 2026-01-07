
/**
 * 生成一个基于浏览器特征的简单指纹，用于未登录状态下的点赞识别
 * 结合 LocalStorage 实现平滑的用户体验
 */
export function getBrowserFingerprint(): string {
    if (typeof window === 'undefined') return 'server';

    // 检查本地存储
    let fp = localStorage.getItem('aura_fingerprint');
    if (fp) return fp;

    // 生成新指纹
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        // 简单的随机因子增强唯一性（由于不涉及安全，这种程度已足够）
        Math.random().toString(36).substring(2)
    ];

    fp = btoa(unescape(encodeURIComponent(components.join('|')))).substring(0, 32);
    localStorage.setItem('aura_fingerprint', fp);
    return fp;
}

// 检查某个 ID 是否在本地已被点赞（用于即时 UI 反馈）
export function checkIfLikedLocal(targetType: string, targetId: string): boolean {
    const key = `aura_liked_${targetType}_${targetId}`;
    return localStorage.getItem(key) === 'true';
}

export function setLikedLocal(targetType: string, targetId: string, liked: boolean): void {
    const key = `aura_liked_${targetType}_${targetId}`;
    if (liked) {
        localStorage.setItem(key, 'true');
    } else {
        localStorage.removeItem(key);
    }
}
