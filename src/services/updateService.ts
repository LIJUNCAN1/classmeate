import { APP_VERSION } from '../constants/version';

export interface GitHubReleaseInfo {
  hasUpdate: boolean;
  tagName: string;
  name: string;
  body: string;
  publishedAt: string;
  downloadUrl: string;
  htmlUrl: string;
}

/**
 * 语义化版本号比较
 * 返回 1: remote > current (有更新)
 * 返回 0: remote === current
 * 返回 -1: remote < current
 */
export function compareVersions(remote: string, current: string): number {
  const parse = (v: string) =>
    v.replace(/^v/i, '').split('.').map((num) => parseInt(num, 10) || 0);

  const r = parse(remote);
  const c = parse(current);

  const maxLen = Math.max(r.length, c.length);
  for (let i = 0; i < maxLen; i++) {
    const rv = r[i] || 0;
    const cv = c[i] || 0;
    if (rv > cv) return 1;
    if (rv < cv) return -1;
  }
  return 0;
}

/**
 * 获取 GitHub 仓库最新 Release 信息
 */
export async function fetchLatestGitHubRelease(): Promise<{
  success: boolean;
  data?: GitHubReleaseInfo;
  error?: string;
}> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/LIJUNCAN1/classmeate/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (res.status === 404) {
      return { success: false, error: '暂无已发布的 Release 版本' };
    }
    if (!res.ok) {
      return { success: false, error: `GitHub 请求状态异常 (${res.status})` };
    }

    const release = await res.json();
    const tagName = release.tag_name || '';
    const hasUpdate = compareVersions(tagName, APP_VERSION) > 0;

    // 寻找 assets 列表中的 APK 安装包直链
    let downloadUrl = release.html_url;
    if (Array.isArray(release.assets)) {
      const apkAsset = release.assets.find(
        (a: any) => typeof a.name === 'string' && a.name.endsWith('.apk')
      );
      if (apkAsset && apkAsset.browser_download_url) {
        downloadUrl = apkAsset.browser_download_url;
      }
    }

    return {
      success: true,
      data: {
        hasUpdate,
        tagName,
        name: release.name || tagName,
        body: release.body || '',
        publishedAt: release.published_at ? release.published_at.substring(0, 10) : '',
        downloadUrl,
        htmlUrl: release.html_url,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || '网络连接超时，请检查网络设置' };
  }
}
