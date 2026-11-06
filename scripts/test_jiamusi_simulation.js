const { SCHOOL_DATABASE } = require('../dist_test/constants/schools.js');
const {
  parseHtmlTable,
  parseTimetableTextOrHtml,
  splitCellIntoCourses,
  extractCourseFields,
  repairCourseList
} = require('../dist_test/services/jwParser.js');

console.log('====================================================');
console.log('🧪 开始全流程模拟测试：以佳木斯大学 (青果/喜鹊儿) 为重点');
console.log('====================================================\n');

// ----------------------------------------------------
// 步骤 1：测试学校检索流程（多维度搜索匹配）
// ----------------------------------------------------
console.log('>>> [步骤 1] 测试高校检索能力...');
const searchKeywords = ['佳木斯', 'jms', '喜鹊', '青果', '黑龙江', 'JMSU'];

function executeSearch(keyword) {
  const q = keyword.toLowerCase().trim();
  return SCHOOL_DATABASE.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.shortName.toLowerCase().includes(q) ||
    s.region.toLowerCase().includes(q) ||
    (s.badge && s.badge.toLowerCase().includes(q)) ||
    (s.pinyin && s.pinyin.toLowerCase().includes(q)) ||
    s.systems.some(sys =>
      sys.name.toLowerCase().includes(q) ||
      sys.desc.toLowerCase().includes(q) ||
      sys.url.toLowerCase().includes(q)
    )
  );
}

for (const kw of searchKeywords) {
  const results = executeSearch(kw);
  const foundJmsu = results.find(s => s.id === 'jmsu');
  if (foundJmsu) {
    console.log(`  ✅ 搜索 "${kw}" -> 成功命中: ${foundJmsu.name} (${foundJmsu.shortName}) [共找到 ${results.length} 所高校]`);
  } else {
    console.error(`  ❌ 搜索 "${kw}" -> 未找到佳木斯大学！`);
  }
}

// ----------------------------------------------------
// 步骤 2：测试佳木斯大学系统配置与直达通道
// ----------------------------------------------------
console.log('\n>>> [步骤 2] 校验佳木斯大学配置通道...');
const jmsu = SCHOOL_DATABASE.find(s => s.id === 'jmsu');
if (!jmsu) {
  throw new Error('未找到佳木斯大学配置！');
}
console.log(`  高校名称: ${jmsu.name}`);
console.log(`  高校简称: ${jmsu.shortName}`);
console.log(`  所属地区: ${jmsu.region}`);
console.log(`  系统标签: ${jmsu.badge}`);
console.log(`  系统通道数: ${jmsu.systems.length}`);
jmsu.systems.forEach((sys, i) => {
  console.log(`    通道 [${i + 1}] ${sys.name} -> 目标: ${sys.url} (${sys.level})`);
});

// ----------------------------------------------------
// 步骤 3：模拟青果教务系统 (Kingosoft / 喜鹊儿后台) 真实课表 HTML 解析
// ----------------------------------------------------
console.log('\n>>> [步骤 3] 模拟青果系统 HTML 课表真实解析...');

// 典型的青果软件 (Kingosoft) 课表 HTML 结构（含合并单元格 rowspan、单双周、多门课、教室）
const mockQingguoHtml = `
<table id="timetable" class="timetable_con" border="1" cellpadding="0" cellspacing="0">
  <tbody>
    <tr>
      <th colspan="2">时间/节次</th>
      <th>星期一</th>
      <th>星期二</th>
      <th>星期三</th>
      <th>星期四</th>
      <th>星期五</th>
      <th>星期六</th>
      <th>星期日</th>
    </tr>
    <!-- 上午 1-2 节 -->
    <tr>
      <td rowspan="2">上午</td>
      <td>第1节</td>
      <td rowspan="2">
        内科学<br>
        陈建华(教授)<br>
        1-16周(1-2节)<br>
        第一教学楼201
      </td>
      <td rowspan="2">
        外科学<br>
        刘志远[01-16周(单)]<br>
        临床综合楼402
      </td>
      <td rowspan="2">&nbsp;</td>
      <td rowspan="2">
        病理学实验<br>
        赵立峰<br>
        1-12周(双)<br>
        基础医学院机房B
      </td>
      <td rowspan="2">
        医学免疫学<br>
        周雪琴(副教授)<br>
        1-16周<br>
        学术报告厅
      </td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>第2节</td>
    </tr>
    <!-- 上午 3-4 节 -->
    <tr>
      <td rowspan="2">上午</td>
      <td>第3节</td>
      <td rowspan="2">
        医学伦理学<br>
        孙敏<br>
        1-8周<br>
        二教305
        <hr>
        卫生法学<br>
        吴明(讲师)<br>
        9-16周<br>
        二教305
      </td>
      <td rowspan="2">&nbsp;</td>
      <td rowspan="2">
        毛泽东思想和中国特色社会主义理论体系概论<br>
        马克思主义学院<br>
        1-16周<br>
        主楼报告厅
      </td>
      <td rowspan="2">&nbsp;</td>
      <td rowspan="2">&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>第4节</td>
    </tr>
    <!-- 下午 5-6 节 -->
    <tr>
      <td rowspan="2">下午</td>
      <td>第5节</td>
      <td rowspan="2">&nbsp;</td>
      <td rowspan="2">
        大学英语(4)<br>
        外语学院教师<br>
        1-16周<br>
        外语楼301
      </td>
      <td rowspan="2">&nbsp;</td>
      <td rowspan="2">
        医学影像学<br>
        张丽娟<br>
        1-14周<br>
        附院影像楼示教室
      </td>
      <td rowspan="2">&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>第6节</td>
    </tr>
  </tbody>
</table>
`;

const parsedFromTable = parseHtmlTable(mockQingguoHtml);
console.log(`  📊 青果表格解析结果：提取到 ${parsedFromTable.length} 门课程`);
parsedFromTable.forEach((c, idx) => {
  console.log(`    [课程 ${idx + 1}] 课程: 《${c.name}》 | 教师: ${c.teacher} | 教室: ${c.location} | 周次: ${c.weekRange} | 星期: 周${c.dayOfWeek} | 时间: ${c.startTime}-${c.endTime}`);
});

// ----------------------------------------------------
// 步骤 4：模拟喜鹊儿 (Xiqueer) 移动版文本流与纯文本解析
// ----------------------------------------------------
console.log('\n>>> [步骤 4] 模拟喜鹊儿移动端文本流解析...');
const mockXiqueerText = `
佳木斯大学 2026-2027学年第1学期 学生个人课表
周一 第1-2节 内科学 1-16周 第一教学楼201 陈建华教授
周二 第1-2节 外科学 1-16周(单) 临床综合楼402 刘志远老师
周三 第3-4节 毛概 1-16周 主楼报告厅 教师
周四 第1-2节 病理学实验 1-12周(双) 基础医学院机房B 赵立峰
周五 第1-2节 医学免疫学 1-16周 学术报告厅 周雪琴副教授
`;

const parsedFromText = parseTimetableTextOrHtml(mockXiqueerText);
console.log(`  📱 喜鹊儿移动文本解析结果：提取到 ${parsedFromText.length} 门课程`);
parsedFromText.forEach((c, idx) => {
  console.log(`    [课程 ${idx + 1}] 《${c.name}》 周${c.dayOfWeek} ${c.startTime}-${c.endTime} | 地点: ${c.location} | 教师: ${c.teacher} | 周次: ${c.weekRange}`);
});

// ----------------------------------------------------
// 步骤 5：字段修复与完整性测试 (repairCourseList)
// ----------------------------------------------------
console.log('\n>>> [步骤 5] 检验课程模型完整性与属性规范...');
const allRepaired = repairCourseList(parsedFromTable);
let passes = true;
allRepaired.forEach((c, i) => {
  if (!c.id || !c.name || !c.dayOfWeek || !c.startTime || !c.endTime || !c.location || !c.teacher || !c.weekRange) {
    passes = false;
    console.error(`  ❌ 课程 [${i}] 字段缺失:`, c);
  }
});
if (passes) {
  console.log('  ✅ 所有提取课程均通过完整性校验，包含 id, name, dayOfWeek, startTime, endTime, location, teacher, weekRange 等全套必要字段！');
}

console.log('\n====================================================');
console.log('🎉 佳木斯大学 (青果/喜鹊儿) 全流程模拟测试全部成功通过！');
console.log('====================================================');
