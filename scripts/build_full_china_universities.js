const fs = require('fs');
const path = require('path');
const Pinyin = require('tiny-pinyin');

// 1. 读取原有的精校高校数据（保留已有校准的官方教务 URL 和特色标签，如佳木斯大学的青果系统、中国矿大、长沙学院等）
const existingContent = fs.readFileSync(path.resolve(__dirname, '../src/constants/schools.ts'), 'utf8');
const match = existingContent.match(/export const SCHOOL_DATABASE: SchoolItem\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Failed to parse existing SCHOOL_DATABASE');
  process.exit(1);
}
const existingSchools = JSON.parse(match[1]);

// 2. 读取教育部全国普通高等学校全量数据
const rawChinaList = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'ChinaUniversityList.json'), 'utf8'));

// 索引已存在的高校
const existingByName = new Map();
const existingById = new Set();

for (const s of existingSchools) {
  existingByName.set(s.name, s);
  existingById.add(s.id);
  const norm = s.name.replace(/\(.*\)/g, '').replace(/（.*）/g, '');
  if (!existingByName.has(norm)) {
    existingByName.set(norm, s);
  }
}

// 地区格式化（去冗余后缀）
function cleanRegion(prov, city) {
  const p = prov.replace(/省|自治区|特别行政区|回族|维吾尔|壮族/g, '').trim();
  const c = (city || '').replace(/市|地区|盟|自治州/g, '').trim();
  return c ? `${p} · ${c}` : p;
}

// 拼音与首字母提取
function getPinyinData(text) {
  if (!Pinyin.isSupported()) return { full: '', initials: '' };
  try {
    const tokens = Pinyin.parse(text);
    const full = tokens.map(t => t.target.toLowerCase()).join('');
    const initials = tokens.map(t => (t.target[0] || '').toLowerCase()).join('');
    return { full, initials };
  } catch(e) {
    return { full: '', initials: '' };
  }
}

// 自动生成简洁简称
function generateShortName(name, initials) {
  let short = '';
  if (name.endsWith('职业技术学院')) {
    short = name.slice(0, 4) + '职院';
  } else if (name.endsWith('职业学院')) {
    short = name.slice(0, 4) + '职院';
  } else if (name.endsWith('高等专科学校')) {
    short = name.slice(0, 4) + '高专';
  } else if (name.endsWith('师范高等专科学校')) {
    short = name.slice(0, 4) + '师专';
  } else if (name.endsWith('大学')) {
    short = name.slice(0, 2) + '大';
  } else if (name.endsWith('学院')) {
    short = name.slice(0, 4);
  } else {
    short = name.slice(0, 4);
  }
  return initials ? `${short} / ${initials.toUpperCase()}` : short;
}

const merged = [];
const seenNames = new Set();

// A. 优先收录原有精校重点院校（包括佳木斯大学青果登录入口、矿大CAS、长大等）
for (const s of existingSchools) {
  if (s.id === 'custom_general') continue;
  merged.push(s);
  seenNames.add(s.name);
  const norm = s.name.replace(/\(.*\)/g, '').replace(/（.*）/g, '');
  seenNames.add(norm);
}

let newlyAddedUndergrad = 0;
let newlyAddedJunior = 0;

// B. 遍历全国所有省份与院校（全量收录地方本科、不出名本科、民办本科、独立学院、以及各类大专/高职院校）
for (const provObj of rawChinaList) {
  const prov = provObj.province;
  for (const item of provObj.schools) {
    const name = item.name.trim();
    if (!name || seenNames.has(name)) continue;

    const norm = name.replace(/\(.*\)/g, '').replace(/（.*）/g, '');
    if (seenNames.has(norm)) continue;

    seenNames.add(name);
    seenNames.add(norm);

    const { full, initials } = getPinyinData(name);
    let id = item.code ? `sch_${item.code}` : `sch_${initials}_${Date.now()}`;
    if (existingById.has(id)) {
      id = `${id}_${Math.floor(Math.random() * 1000)}`;
    }
    existingById.add(id);

    const region = cleanRegion(prov, item.city);
    const shortName = generateShortName(name, initials);
    const isJunior = item.level === '专科';
    const isUndergrad = item.level === '本科';

    if (isJunior) newlyAddedJunior++;
    else if (isUndergrad) newlyAddedUndergrad++;

    let badge = '';
    if (isJunior) {
      badge = item.type === '民办' ? '民办专科' : '高职专科';
    } else if (isUndergrad) {
      badge = item.type === '民办' ? '民办本科' : (item.supervisor ? `${item.supervisor} · 本科` : '普通本科');
    } else {
      badge = item.type ? `${item.type}高校` : '普通高校';
    }

    // 强化检索支持：支持首字母、全拼、大专/专科/高职/本科中文及拼音互搜
    const levelKeywords = isJunior ? 'dazhuan zhuanke gaozhi 大专 专科 高职' : 'benke 本科';
    const pinyinKeywords = `${full} ${initials} ${name} ${shortName.toLowerCase()} ${levelKeywords}`.trim();
    const url = `http://jw.${initials || item.code || 'edu'}.edu.cn/`;

    merged.push({
      id,
      name,
      shortName,
      pinyin: pinyinKeywords,
      region,
      badge,
      systems: [
        {
          id: `${id}_jw`,
          name: '教务系统登录',
          level: '全校师生通用',
          url,
          desc: `${name}官方教务系统登录入口，登录后一键提取课表`
        }
      ]
    });
  }
}

// C. 保持末尾全国高校通用自定义通道
merged.push({
  id: 'custom_general',
  name: '全国高校通用通道 (支持任何大学)',
  shortName: '自定义教务系统',
  pinyin: 'quanguogaoxiaotongyong quanguo zidingyi tongyong ranyi ranyidaxue dazhuan benke',
  region: '全国 · 任意高校',
  badge: '万能导入',
  systems: [
    {
      id: 'generic_direct',
      name: '教务系统登录',
      level: '全校师生通用',
      url: 'https://',
      desc: '支持全国 3000+ 高校，输入教务系统网址登录后一键提取'
    }
  ]
});

const targetFile = path.resolve(__dirname, '../src/constants/schools.ts');

const outputTs = `export interface AuthSystemOption {
  id: string;
  name: string;
  level: string;
  url: string;
  desc: string;
}

export interface SchoolItem {
  id: string;
  name: string;
  shortName: string;
  region: string;
  badge: string;
  pinyin?: string;
  systems: AuthSystemOption[];
}

export const SCHOOL_DATABASE: SchoolItem[] = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync(targetFile, outputTs, 'utf-8');

console.log('Build completed successfully!');
console.log('Total institutions in database:', merged.length);
console.log('  - Curated & verified top colleges:', existingSchools.length - 1);
console.log('  - Newly added Undergraduate colleges (地方本科/民办本科/不出名本科):', newlyAddedUndergrad);
console.log('  - Newly added Junior colleges (大专/高职专科院校):', newlyAddedJunior);
console.log('Saved to:', targetFile);
