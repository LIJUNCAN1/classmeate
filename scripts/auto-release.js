const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getGitRecentLogs() {
  try {
    const raw = execSync('git log -n 12 --pretty=format:"%s"', { encoding: 'utf8' });
    return raw.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function autoGenerateReleaseNotes(commitLines) {
  const items = [];
  const seen = new Set();

  for (const line of commitLines) {
    if (line.startsWith('chore(release)')) continue;
    // 去掉前缀
    const cleaned = line
      .replace(/^(feat|fix|perf|style|refactor|docs)(\([^)]+\))?:\s*/i, '')
      .trim();

    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      items.push(cleaned);
    }
  }

  if (items.length === 0) {
    return [
      '1. 优化系统性能与多端兼容性',
      '2. 修复已知交互问题，提升使用体验',
    ].join('\n');
  }

  return items.slice(0, 6).map((item, idx) => `${idx + 1}. ${item}`).join('\n');
}

function main() {
  const pkgPath = path.join(__dirname, '../package.json');
  const appJsonPath = path.join(__dirname, '../app.json');
  const versionTsPath = path.join(__dirname, '../src/constants/version.ts');
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  // 1. 语义化版本号自动递增
  const parts = pkg.version.split('.').map(Number);
  const major = parts[0] || 0;
  const minor = parts[1] || 5;
  const patch = (parts[2] || 0) + 1;
  const newVersion = `${major}.${minor}.${patch}`;

  const currentBuild = (appJson.expo?.android?.versionCode || 50) + 1;

  console.log(`\n🚀 [版本号检测递增] 当前版本: v${pkg.version} -> 升级为: v${newVersion} (BuildCode: ${currentBuild})`);

  // 2. 自动写更新说明
  const commitLines = getGitRecentLogs();
  const releaseNotes = autoGenerateReleaseNotes(commitLines);
  console.log(`\n📝 [自动生成更新说明]:\n${releaseNotes}\n`);

  // 3. 同步 package.json
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // 4. 同步 app.json
  appJson.expo.version = newVersion;
  if (!appJson.expo.android) appJson.expo.android = {};
  appJson.expo.android.versionCode = currentBuild;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

  // 5. 同步 src/constants/version.ts
  const today = new Date().toISOString().substring(0, 10);
  const versionTsContent = `export const APP_VERSION = '${newVersion}';
export const APP_NAME = '课星球';
export const BUILD_NUMBER = ${currentBuild};
export const RELEASE_DATE = '${today}';
export const RELEASE_NOTES = ${JSON.stringify(releaseNotes)};
`;
  fs.writeFileSync(versionTsPath, versionTsContent);

  // 6. 追加 CHANGELOG.md
  const changelogEntry = `## [v${newVersion}] - ${today}\n\n${releaseNotes}\n\n`;
  if (fs.existsSync(changelogPath)) {
    const existing = fs.readFileSync(changelogPath, 'utf8');
    fs.writeFileSync(changelogPath, `# 更新日志 (Changelog)\n\n${changelogEntry}${existing.replace(/^# 更新日志 \(Changelog\)\s*/i, '')}`);
  } else {
    fs.writeFileSync(changelogPath, `# 更新日志 (Changelog)\n\n${changelogEntry}`);
  }

  console.log('✅ 所有版本号及更新说明文件已自动更新完毕！');
}

main();
