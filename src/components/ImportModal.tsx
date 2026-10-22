import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Colors, Rounded, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { parseTimetableTextOrHtml, getCurrentSemesterName, repairCourse, repairCourseList } from '../services/jwParser';
import { Course } from '../types/schedule';

// 条件引入原生 WebView（在 Android 端提供内置安全教务浏览器）
let NativeWebView: any = null;
if (Platform.OS !== 'web') {
  try {
    NativeWebView = require('react-native-webview').WebView;
  } catch (err) {
    NativeWebView = null;
  }
}

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportSuccess: (importedCourses: Course[], semesterName?: string) => void;
  semesterName?: string;
}

// 认证系统预设
export interface AuthSystemOption {
  id: string;
  name: string;
  level: string;
  url: string;
  desc: string;
}

// 学校条目定义
export interface SchoolItem {
  id: string;
  name: string;
  shortName: string;
  region: string;
  badge: string;
  systems: AuthSystemOption[];
}

export const SCHOOL_DATABASE: SchoolItem[] = [
  {
    id: 'ccsu',
    name: '长沙学院',
    shortName: 'CCSU',
    region: '湖南 · 长沙',
    badge: '3个通道',
    systems: [
      {
        id: 'cas_sso',
        name: '统一身份认证',
        level: '本科/专科',
        url: 'https://cas.ccsu.cn/authserver/login?service=https%3A%2F%2Fjwxt.ccsu.cn%2Fsso%2Flyiotlogin',
        desc: '官方金智统一身份认证平台 SSO 直连通道（推荐）',
      },
      {
        id: 'jwxt_direct',
        name: '教学管理信息服务平台',
        level: '本科/专科',
        url: 'https://jwxt.ccsu.cn/',
        desc: '长沙学院教务管理信息系统直连入口',
      },
      {
        id: 'webvpn',
        name: 'WEBVPN',
        level: '本科/专科',
        url: 'https://cas.ccsu.cn/authserver/login?service=https%3A%2F%2Fvpn.ccsu.cn%3A443%2Fpassport%2Fv1%2Fauth%2Fcas%3FsfDomain%3Dcas58282',
        desc: '深信服 WebVPN 校外隧道通道',
      },
    ],
  },
  {
    id: 'csu',
    name: '中南大学',
    shortName: 'CSU',
    region: '湖南 · 长沙',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'csu_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://ca.csu.edu.cn/authserver/login',
        desc: '中南大学统一身份认证教务入口',
      },
      {
        id: 'csu_jw',
        name: '本科教务管理系统',
        level: '本科',
        url: 'https://csujwc.its.csu.edu.cn/',
        desc: '中南大学强智教务管理系统',
      },
    ],
  },
  {
    id: 'hnu',
    name: '湖南大学',
    shortName: 'HNU',
    region: '湖南 · 长沙',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'hnu_cas',
        name: '统一身份认证 / 个人工作台',
        level: '全日制',
        url: 'https://cas.hnu.edu.cn/authserver/login',
        desc: '湖南大学信息化综合服务门户',
      },
      {
        id: 'hnu_jw',
        name: '综合教务管理系统',
        level: '本科',
        url: 'http://jw.hnu.edu.cn/',
        desc: '湖南大学本科教务系统',
      },
    ],
  },
  {
    id: 'hunnu',
    name: '湖南师范大学',
    shortName: 'HUNNU',
    region: '湖南 · 长沙',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'hunnu_cas',
        name: '数字校园统一身份认证',
        level: '本科/研究生',
        url: 'https://cas.hunnu.edu.cn/authserver/login',
        desc: '湖南师范大学智慧教务平台通道',
      },
      {
        id: 'hunnu_jw',
        name: '师大教务管理系统',
        level: '本科',
        url: 'https://jwgl.hunnu.edu.cn/',
        desc: '湖南师范大学青果/强智教务系统',
      },
    ],
  },
  {
    id: 'csust',
    name: '长沙理工大学',
    shortName: 'CSUST',
    region: '湖南 · 长沙',
    badge: '省重点',
    systems: [
      {
        id: 'csust_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://cas.csust.edu.cn/authserver/login',
        desc: '长沙理工大学统一认证服务',
      },
      {
        id: 'csust_jw',
        name: '综合教务管理系统',
        level: '本科',
        url: 'http://xk.csust.edu.cn/',
        desc: '长沙理工大学强智教务选课系统',
      },
    ],
  },
  {
    id: 'hunau',
    name: '湖南农业大学',
    shortName: 'HUNAU',
    region: '湖南 · 长沙',
    badge: '省重点',
    systems: [
      {
        id: 'hunau_cas',
        name: '智慧农大统一认证',
        level: '本科/研究生',
        url: 'https://cas.hunau.edu.cn/authserver/login',
        desc: '湖南农大一站式服务门户',
      },
    ],
  },
  {
    id: 'csuft',
    name: '中南林业科技大学',
    shortName: 'CSUFT',
    region: '湖南 · 长沙',
    badge: '省重点',
    systems: [
      {
        id: 'csuft_cas',
        name: '统一身份认证系统',
        level: '本科/研究生',
        url: 'https://cas.csuft.edu.cn/authserver/login',
        desc: '中南林业科技大学教务直连通道',
      },
    ],
  },
  {
    id: 'xtu',
    name: '湘潭大学',
    shortName: 'XTU',
    region: '湖南 · 湘潭',
    badge: '双一流',
    systems: [
      {
        id: 'xtu_cas',
        name: '湘大统一身份认证平台',
        level: '本科/研究生',
        url: 'https://cas.xtu.edu.cn/authserver/login',
        desc: '湘潭大学数字校园及教务服务',
      },
    ],
  },
  {
    id: 'custom_general',
    name: '通用高校教务系统 (自定义网址)',
    shortName: '通用',
    region: '全国高校',
    badge: '自定义',
    systems: [
      {
        id: 'custom_input',
        name: '自定义教务系统网址',
        level: '正方/强智/青果',
        url: 'https://cas.ccsu.cn/authserver/login',
        desc: '输入您学校的教务登录网址或选课页面',
      },
    ],
  },
];

export const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onClose,
  onImportSuccess,
  semesterName: propSemesterName,
}) => {
  const [activeSemesterName, setActiveSemesterName] = useState(
    propSemesterName || getCurrentSemesterName()
  );

  useEffect(() => {
    if (propSemesterName) {
      setActiveSemesterName(propSemesterName);
    }
  }, [propSemesterName]);
  // 当前步骤视图：'options' (图1: 导课选项) | 'school_select' (选择学校) | 'auth_select' (图2: 认证方式选择) | 'import_success' (图1: 课表已更新)
  const [currentStep, setCurrentStep] = useState<
    'options' | 'school_select' | 'auth_select' | 'import_success'
  >('options');

  // 当前选中的学校（默认为长沙学院，但进入前必须经过选择或可自由重选）
  const [selectedSchool, setSelectedSchool] = useState<SchoolItem>(SCHOOL_DATABASE[0]);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');

  // 选中的认证系统
  const [selectedSystemId, setSelectedSystemId] = useState(SCHOOL_DATABASE[0].systems[0].id);

  // 自定义网址
  const [customWebUrl, setCustomWebUrl] = useState('');
  const [isEditingCustomUrl, setIsEditingCustomUrl] = useState(false);

  // 图3内置浏览器状态
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [currentWebUrl, setCurrentWebUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [browserZoom, setBrowserZoom] = useState(1.0);
  const webViewRef = useRef<any>(null);

  // 快速填充账密弹窗状态
  const [autofillModalVisible, setAutofillModalVisible] = useState(false);
  const [autofillUsername, setAutofillUsername] = useState('');
  const [autofillPassword, setAutofillPassword] = useState('');

  // 帮助教程弹窗
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // 识别成功的暂存排课
  const [scannedCoursesCache, setScannedCoursesCache] = useState<Course[]>([]);

  // 切换重置
  const handleModalClose = () => {
    setCurrentStep('options');
    setIsBrowserOpen(false);
    onClose();
  };

  // 点击图1的【教务系统导课】进入【选择学校】
  const handleSelectJwImport = () => {
    setCurrentStep('school_select');
  };

  // 选中学校后进入该学校的【认证方式选择】
  const handlePickSchool = (school: SchoolItem) => {
    setSelectedSchool(school);
    setSelectedSystemId(school.systems[0].id);
    if (school.id === 'custom_general') {
      setIsEditingCustomUrl(true);
    } else {
      setIsEditingCustomUrl(false);
    }
    setCurrentStep('auth_select');
  };

  // 点击认证页底部的【进入】打开内置浏览器
  const handleEnterBrowser = () => {
    const chosen =
      selectedSchool.systems.find((s) => s.id === selectedSystemId) ||
      selectedSchool.systems[0];

    const targetUrl =
      selectedSchool.id === 'custom_general' && customWebUrl.trim()
        ? customWebUrl.trim()
        : chosen.url;

    if (Platform.OS === 'web' || !NativeWebView) {
      Alert.alert(
        '环境提示',
        '内置安全浏览器与 DOM 课表识别在 Android 原生运行。当前 Web 预览环境将为您在外部浏览器打开登录页。',
        [
          { text: '在浏览器打开', onPress: () => Linking.openURL(targetUrl) },
          { text: '取消', style: 'cancel' },
        ]
      );
      return;
    }

    setIsBrowserOpen(true);
  };

  // 页面放大与缩小
  const handleZoomIn = () => {
    const nextZoom = Math.min(browserZoom + 0.15, 2.0);
    setBrowserZoom(nextZoom);
    webViewRef.current?.injectJavaScript(`document.body.style.zoom = ${nextZoom}; true;`);
  };

  const handleZoomOut = () => {
    const nextZoom = Math.max(browserZoom - 0.15, 0.6);
    setBrowserZoom(nextZoom);
    webViewRef.current?.injectJavaScript(`document.body.style.zoom = ${nextZoom}; true;`);
  };

  // 核心识别导课按钮（递归深入多级 frame / iframe 及各类高校教务 DOM 课表结构，执行 2D 矩阵与学期智能识别）
  const handleIdentifyTimetable = () => {
    if (!webViewRef.current) return;

    const scanScript = `
      (function() {
        try {
          function searchDoc(doc) {
            if (!doc) return null;
            try {
              // 1. 优先高校专用 ID / Class 表格选择器（必须严格校验为 TABLE 标签且含有至少 2 行）
              var tList = doc.querySelectorAll('table#kbtable, table.table-schedule, table.timetable, table.kbtable, table[id*="kb"], table[class*="kb"], table[id*="schedule"], table[class*="schedule"]');
              for (var ti = 0; ti < tList.length; ti++) {
                if (tList[ti].rows && tList[ti].rows.length >= 2) {
                  return { table: tList[ti], doc: doc };
                }
              }

              var container = doc.querySelector('#kbtable, .table-schedule, .timetable, .kbtable, [id*="schedule"], [class*="schedule"]');
              if (container && container.tagName !== 'TABLE') {
                var innerT = container.querySelector('table');
                if (innerT && innerT.rows && innerT.rows.length >= 2) {
                  return { table: innerT, doc: doc };
                }
              }

              // 2. 检索包含“星期一”或“周一”排课表头的真正课表表格（过滤外层嵌套布局表格）
              var allTables = Array.from(doc.querySelectorAll('table'));
              for (var i = 0; i < allTables.length; i++) {
                var tbl = allTables[i];
                if (!tbl.rows || tbl.rows.length < 2) continue;
                var hasDayHeader = false;
                for (var rIdx = 0; rIdx < Math.min(3, tbl.rows.length); rIdx++) {
                  var rText = tbl.rows[rIdx].innerText || tbl.rows[rIdx].textContent || '';
                  if (rText.indexOf('星期一') !== -1 || rText.indexOf('周一') !== -1 || (rText.indexOf('星期') !== -1 && rText.indexOf('节') !== -1)) {
                    hasDayHeader = true;
                    break;
                  }
                }
                if (hasDayHeader) {
                  var childTbl = tbl.querySelector('table');
                  if (childTbl && childTbl.rows && childTbl.rows.length >= 2) {
                    return { table: childTbl, doc: doc };
                  }
                  return { table: tbl, doc: doc };
                }
              }

              // 3. 递归穿透 iframe 与 frame (应对高校 WebVPN 和多分栏框架系统)
              var frames = doc.querySelectorAll('iframe, frame');
              for (var j = 0; j < frames.length; j++) {
                try {
                  var fDoc = frames[j].contentDocument || (frames[j].contentWindow && frames[j].contentWindow.document);
                  var subRes = searchDoc(fDoc);
                  if (subRes) return subRes;
                } catch(err) {}
              }
            } catch(e) {}
            return null;
          }

          var found = searchDoc(document);
          var tableEl = found ? found.table : null;
          var hostDoc = found ? found.doc : document;

          // 提取学期
          var detectedSemester = '';
          var fullBodyText = (hostDoc && hostDoc.body ? hostDoc.body.innerText : '') + ' ' + (document.body ? document.body.innerText : '');
          var semM = fullBodyText.match(/(\\d{4}\\s*[-~至到/]\\s*\\d{4})\\s*(?:学年)?\\s*(?:第)?([一二12])\\s*学期/);
          if (semM) {
            var sNum = (semM[2] === '一' || semM[2] === '1') ? '1' : '2';
            var yr = semM[1].replace(/\\s+/g, '');
            detectedSemester = yr + ' 第' + sNum + '学期';
          }

          var html = tableEl ? tableEl.outerHTML : (hostDoc && hostDoc.body ? hostDoc.body.innerHTML : '');
          var text = tableEl ? (tableEl.innerText || tableEl.textContent || '') : (hostDoc && hostDoc.body ? (hostDoc.body.innerText || hostDoc.body.textContent || '') : '');

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SCHEDULE_SCAN_RESULT',
            semester: detectedSemester,
            text: text,
            html: html
          }));
        } catch(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SCHEDULE_SCAN_ERROR',
            error: e.toString()
          }));
        }
      })();
      true;
    `;
    webViewRef.current.injectJavaScript(scanScript);
  };

  // 快速填充账密
  const handleExecuteAutofill = () => {
    if (!autofillUsername.trim() || !autofillPassword.trim()) {
      Alert.alert('提示', '请输入学号与密码');
      return;
    }

    const fillScript = `
      (function() {
        var userInputs = document.querySelectorAll('input[type="text"], input[name*="user"], input[name*="login"], input[id*="user"], input[id*="username"], input[id*="loginName"]');
        var passInputs = document.querySelectorAll('input[type="password"]');
        if (userInputs.length > 0) {
          userInputs[0].value = "${autofillUsername.trim()}";
          userInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          userInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (passInputs.length > 0) {
          passInputs[0].value = "${autofillPassword.trim()}";
          passInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          passInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(fillScript);
    setAutofillModalVisible(false);
  };

  // 处理 WebView 消息：识别成功后直接进入【课表已更新】弹窗提示
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SCHEDULE_SCAN_RESULT') {
        if (data.semester) {
          setActiveSemesterName(data.semester);
        }
        let parsed: Course[] = [];
        if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          parsed = repairCourseList(data.courses);
        } else {
          if (data.html) {
            parsed = parseTimetableTextOrHtml(data.html);
          }
          if (parsed.length === 0 && data.text) {
            parsed = parseTimetableTextOrHtml(data.text);
          }
        }

        if (parsed.length > 0) {
          setIsBrowserOpen(false);
          setScannedCoursesCache(parsed);
          // 立即同步到父级 ScheduleScreen 课表状态，保证数据彻底导入不丢失！
          onImportSuccess(parsed, data.semester || activeSemesterName);
          // 切换到【图1：课表已更新】提示弹窗
          setCurrentStep('import_success');
        } else {
          Alert.alert(
            '未在当前页面检测到课表',
            '当前网页未找到排课表格。请先完成学号密码登录，并点击进入【学生课表查询】或【学期理论课表】页面后，再次点击底部的【识别导课】！'
          );
        }
      } else if (data.type === 'SCHEDULE_SCAN_ERROR') {
        Alert.alert('识别出错', '抓取错误：' + data.error);
      }
    } catch (e) {
      console.error('WebView message error:', e);
    }
  };

  // 点击【查看课表】完成导课
  const handleConfirmViewSchedule = () => {
    if (scannedCoursesCache.length > 0) {
      onImportSuccess(repairCourseList(scannedCoursesCache), activeSemesterName);
    }
    handleModalClose();
  };

  const currentChosenSystem =
    selectedSchool.systems.find((s) => s.id === selectedSystemId) ||
    selectedSchool.systems[0];

  const browserLoadUrl =
    selectedSchool.id === 'custom_general' && customWebUrl.trim()
      ? customWebUrl.trim()
      : currentChosenSystem.url;

  // 学校搜索过滤
  const filteredSchools = SCHOOL_DATABASE.filter((s) => {
    if (!schoolSearchQuery.trim()) return true;
    const q = schoolSearchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.shortName.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* 步骤 1：导课选项弹窗 (图 1) */}
      <Modal
        visible={visible && currentStep === 'options' && !isBrowserOpen}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <TouchableOpacity
          style={styles.popoverOverlay}
          activeOpacity={1}
          onPress={handleModalClose}
        >
          <View style={[styles.optionsMenuCard, Shadows.modal]}>
            {/* 切换学期 */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleModalClose}>
              <Text style={styles.menuItemTitle}>切换学期</Text>
              <Text style={styles.menuItemSub}>{activeSemesterName}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            {/* 教务系统导课 (核心入口，首先进入选择学校) */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleSelectJwImport}>
              <Text style={styles.menuItemTitle}>教务系统导课</Text>
              <Text style={styles.menuItemSub}>导入至{activeSemesterName}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            {/* 手动添课 */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                handleModalClose();
                Alert.alert('手动添课', '可在课程表直接点击添加自定义课程');
              }}
            >
              <Text style={styles.menuItemTitle}>手动添课</Text>
              <Text style={styles.menuItemSub}>添加至{activeSemesterName}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            {/* 蹭课 */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                handleModalClose();
                Alert.alert('蹭课', '可检索其他专业学期课表加入旁听');
              }}
            >
              <Text style={styles.menuItemTitle}>蹭课</Text>
              <Text style={styles.menuItemSub}>添加至{activeSemesterName}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            {/* 扫码导课 */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                handleModalClose();
                Alert.alert('扫码导课', '支持扫描同学分享的课程二维码直接导入');
              }}
            >
              <Text style={styles.menuItemTitle}>扫码导课</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 步骤 2：选择学校界面 (满足“第一次导课先选择学校，去掉单独的长沙学院认证”) */}
      <Modal
        visible={visible && currentStep === 'school_select' && !isBrowserOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setCurrentStep('options')}
      >
        <View style={styles.authPageContainer}>
          {/* 顶部导航 */}
          <View style={styles.authNavBar}>
            <TouchableOpacity
              onPress={() => setCurrentStep('options')}
              style={styles.navBackBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>选择学校</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* 搜索框 */}
          <View style={styles.searchBoxWrap}>
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.schoolSearchInput}
              placeholder="搜索高校名称或拼音缩写 (如 长沙学院 / CCSU)"
              placeholderTextColor="#94A3B8"
              value={schoolSearchQuery}
              onChangeText={setSchoolSearchQuery}
              clearButtonMode="while-editing"
            />
            {schoolSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSchoolSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* 常用热门高校快速标签 */}
          <View style={styles.quickTagsRow}>
            {['长沙学院', '中南大学', '湖南大学', '湖南师大', '长沙理工'].map((name) => (
              <TouchableOpacity
                key={name}
                style={[
                  styles.quickTagPill,
                  selectedSchool.name.includes(name) && styles.quickTagPillActive,
                ]}
                onPress={() => {
                  const target = SCHOOL_DATABASE.find((s) => s.name.includes(name));
                  if (target) handlePickSchool(target);
                }}
              >
                <Text
                  style={[
                    styles.quickTagPillText,
                    selectedSchool.name.includes(name) && styles.quickTagPillTextActive,
                  ]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 学校列表 */}
          <ScrollView style={styles.schoolListScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.schoolListSectionTitle}>支持教务系统的高校列表</Text>
            {filteredSchools.map((school) => {
              const isSelected = school.id === selectedSchool.id;
              return (
                <TouchableOpacity
                  key={school.id}
                  style={[styles.schoolItemCard, isSelected && styles.schoolItemCardActive]}
                  activeOpacity={0.7}
                  onPress={() => handlePickSchool(school)}
                >
                  <View style={styles.schoolAvatarBadge}>
                    <Ionicons name="school" size={20} color="#3B82F6" />
                  </View>

                  <View style={styles.schoolInfoCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.schoolItemName}>{school.name}</Text>
                      {school.badge && (
                        <View style={styles.schoolItemTag}>
                          <Text style={styles.schoolItemTagText}>{school.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.schoolItemDesc}>
                      {school.region} · {school.systems.length} 个通道
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* 步骤 3：认证方式选择页面 (根据当前所选学校动态展示系统，并提供 [切换学校] 入口) */}
      <Modal
        visible={visible && currentStep === 'auth_select' && !isBrowserOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setCurrentStep('school_select')}
      >
        <View style={styles.authPageContainer}>
          {/* 顶部导航栏 */}
          <View style={styles.authNavBar}>
            <TouchableOpacity
              onPress={() => setCurrentStep('school_select')}
              style={styles.navBackBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#1E293B" />
            </TouchableOpacity>

            <Text style={styles.navTitle}>{selectedSchool.name}</Text>

            {/* 右侧切换学校按钮 */}
            <TouchableOpacity
              onPress={() => setCurrentStep('school_select')}
              style={styles.switchSchoolBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.switchSchoolBtnText}>切换学校</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.authScrollContent} showsVerticalScrollIndicator={false}>
            {/* 当前导入课表学期为提示横幅 */}
            <View style={styles.semesterBanner}>
              <View style={styles.bannerRow}>
                <Text style={styles.bannerLabel}>当前导入课表学期为</Text>
                <Text style={styles.bannerValue}>{activeSemesterName}</Text>
              </View>
              <Text style={styles.bannerSubtext}>返回课程表页面即可切换学期</Text>
            </View>

            {/* 主标题 */}
            <Text style={styles.authSectionTitle}>请选择可 [查询课表] 的系统</Text>
            <Text style={styles.authSectionSub}>
              如下，因【{selectedSchool.name}】存在多个「查询课表」的系统，请选择后，再点击 [进入]。
            </Text>

            {/* 蓝色帮助条 */}
            <TouchableOpacity
              style={styles.helpBanner}
              activeOpacity={0.7}
              onPress={() => setHelpModalVisible(true)}
            >
              <Text style={styles.helpBannerText}>不知道选择哪个系统可以查询 [课程表]，请点击这里</Text>
              <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
            </TouchableOpacity>

            {/* 自定义网址输入（当选中自定义高校时） */}
            {isEditingCustomUrl && (
              <View style={styles.customUrlBox}>
                <Text style={styles.customUrlLabel}>输入教务系统网址：</Text>
                <TextInput
                  style={styles.customUrlInput}
                  placeholder="https://..."
                  placeholderTextColor="#94A3B8"
                  value={customWebUrl}
                  onChangeText={setCustomWebUrl}
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* 系统选项列表 (每个选项带 3D 书本几何图标 + 单选框) */}
            <View style={styles.systemsList}>
              {selectedSchool.systems.map((sys) => {
                const isSelected = sys.id === selectedSystemId;
                return (
                  <TouchableOpacity
                    key={sys.id}
                    style={[styles.systemCard, isSelected && styles.systemCardActive]}
                    onPress={() => setSelectedSystemId(sys.id)}
                    activeOpacity={0.7}
                  >
                    {/* 左侧 3D 书本几何图标 */}
                    <View style={styles.bookIconBadge}>
                      <Ionicons name="book" size={24} color="#3B82F6" />
                    </View>

                    {/* 中间文字 */}
                    <View style={styles.systemInfoWrap}>
                      <Text style={styles.systemTitle}>{sys.name}</Text>
                      <Text style={styles.systemLevel}>{sys.level}</Text>
                    </View>

                    {/* 右侧选中单选框 */}
                    <View style={styles.radioWrap}>
                      {isSelected ? (
                        <View style={styles.checkedCircle}>
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View style={styles.uncheckedCircle} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* 底部固定进入按钮 */}
          <View style={styles.authFooter}>
            <TouchableOpacity
              style={styles.enterActionBtn}
              onPress={handleEnterBrowser}
              activeOpacity={0.8}
            >
              <Text style={styles.enterActionBtnText}>进入</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 步骤 4：内置全屏浏览器与底部课表识别控制栏 */}
      {NativeWebView && isBrowserOpen && (
        <Modal
          visible={isBrowserOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsBrowserOpen(false)}
        >
          <View style={styles.browserContainer}>
            {/* 顶部微型地址与关闭导航栏 */}
            <View style={styles.browserTopNav}>
              <TouchableOpacity
                onPress={() => setIsBrowserOpen(false)}
                style={styles.browserCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>

              {/* 后退按钮 */}
              <TouchableOpacity
                onPress={() => webViewRef.current?.goBack()}
                style={[styles.browserNavBtn, !canGoBack && styles.browserNavBtnDisabled]}
                disabled={!canGoBack}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color={canGoBack ? '#1E293B' : '#CBD5E1'} />
              </TouchableOpacity>

              {/* 前进按钮 */}
              <TouchableOpacity
                onPress={() => webViewRef.current?.goForward()}
                style={[styles.browserNavBtn, !canGoForward && styles.browserNavBtnDisabled]}
                disabled={!canGoForward}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color={canGoForward ? '#1E293B' : '#CBD5E1'} />
              </TouchableOpacity>

              <View style={styles.browserUrlPill}>
                <Ionicons name="lock-closed" size={12} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.browserUrlPillText} numberOfLines={1}>
                  {currentWebUrl || browserLoadUrl}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => webViewRef.current?.reload()}
                style={styles.browserCloseBtn}
              >
                <Ionicons name="reload" size={18} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* 页面加载指示器 */}
            {browserLoading && (
              <View style={styles.loadingBar}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            )}

            {/* 原生内置 WebView：锁定单窗口运行并拦截 window.open 防止弹至外部或功能坞消失 */}
            <NativeWebView
              ref={webViewRef}
              source={{ uri: browserLoadUrl }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              mixedContentMode="always"
              allowsBackForwardNavigationGestures={true}
              setSupportMultipleWindows={false}
              javaScriptCanOpenWindowsAutomatically={true}
              injectedJavaScriptBeforeContentLoaded={`
                (function() {
                  window.open = function(url) {
                    if (url) { window.location.href = url; }
                    return window;
                  };
                })();
                true;
              `}
              userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
              onLoadStart={() => setBrowserLoading(true)}
              onLoadEnd={() => setBrowserLoading(false)}
              onNavigationStateChange={(navState: any) => {
                setCurrentWebUrl(navState.url);
                setCanGoBack(navState.canGoBack);
                setCanGoForward(navState.canGoForward);
              }}
              onMessage={handleWebViewMessage}
            />

            {/* 浏览器底部常驻控制坞 (页面缩小、页面放大、识别导课、快速填充账密、帮助教程) */}
            <View style={[styles.dockBar, Shadows.modal]}>
              {/* 1. 页面缩小 */}
              <TouchableOpacity style={styles.dockItem} onPress={handleZoomOut} activeOpacity={0.7}>
                <View style={styles.squareIconBox}>
                  <Ionicons name="remove" size={18} color="#1E293B" />
                </View>
                <Text style={styles.dockItemLabel}>页面缩小</Text>
              </TouchableOpacity>

              {/* 2. 页面放大 */}
              <TouchableOpacity style={styles.dockItem} onPress={handleZoomIn} activeOpacity={0.7}>
                <View style={styles.squareIconBox}>
                  <Ionicons name="add" size={18} color="#1E293B" />
                </View>
                <Text style={styles.dockItemLabel}>页面放大</Text>
              </TouchableOpacity>

              {/* 3. 识别导课（中间大蓝圆圈突出） */}
              <TouchableOpacity style={styles.dockCenterItem} onPress={handleIdentifyTimetable} activeOpacity={0.8}>
                <View style={styles.centerBlueCircle}>
                  <Ionicons name="grid" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.dockCenterLabel}>识别导课</Text>
              </TouchableOpacity>

              {/* 4. 快速填充账密 */}
              <TouchableOpacity style={styles.dockItem} onPress={() => setAutofillModalVisible(true)} activeOpacity={0.7}>
                <View style={styles.squareIconBox}>
                  <Ionicons name="key-outline" size={18} color="#1E293B" />
                </View>
                <Text style={styles.dockItemLabel}>快速填充账密</Text>
              </TouchableOpacity>

              {/* 5. 帮助教程 */}
              <TouchableOpacity style={styles.dockItem} onPress={() => setHelpModalVisible(true)} activeOpacity={0.7}>
                <View style={styles.squareIconBox}>
                  <Ionicons name="help" size={18} color="#1E293B" />
                </View>
                <Text style={styles.dockItemLabel}>帮助教程</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* 步骤 5：导课成功后的提示弹窗 (精确对齐图 1 截图：课表已更新 文件夹与绿色对勾图标) */}
      <Modal
        visible={visible && currentStep === 'import_success'}
        transparent
        animationType="fade"
        onRequestClose={handleConfirmViewSchedule}
      >
        <TouchableOpacity
          style={styles.popoverOverlay}
          activeOpacity={1}
          onPress={handleConfirmViewSchedule}
        >
          <TouchableOpacity
            style={[styles.successCard, Shadows.modal]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* 顶部立体文件夹 + 绿色勾图标 (精确复刻图1顶部图标) */}
            <View style={styles.folderBadgeContainer}>
              <View style={styles.folderBody}>
                {/* 文件夹内部文件张角 */}
                <View style={styles.folderPaper} />
                <Ionicons name="folder" size={54} color="#4F86F7" />
              </View>

              {/* 右下角叠放绿色对勾徽章 */}
              <View style={styles.checkBadgeOverlay}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>

            {/* 课表已更新 标题 */}
            <Text style={styles.successMainTitle}>课表已更新</Text>

            {/* 学期副标题 */}
            <Text style={styles.successSemesterTitle}>{activeSemesterName}</Text>

            {/* 描述正文 (精确对齐图1文本内容) */}
            <Text style={styles.successDescription}>
              已经将你刚刚所选择的“课程表页面”信息识别成功，并放入【{activeSemesterName}】文件夹里。请再次核对下课程信息，避免上错课。
            </Text>

            {/* 底部主按钮：查看课表 */}
            <TouchableOpacity
              style={styles.viewScheduleActionBtn}
              onPress={handleConfirmViewSchedule}
              activeOpacity={0.8}
            >
              <Text style={styles.viewScheduleActionText}>查看课表</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 快速填充账密弹窗 */}
      <Modal
        visible={autofillModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAutofillModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.popoverOverlay}
          activeOpacity={1}
          onPress={() => setAutofillModalVisible(false)}
        >
          <View style={[styles.autofillCard, Shadows.card]}>
            <Text style={styles.autofillTitle}>快速填充账号与密码</Text>
            <Text style={styles.autofillSub}>将在当前网页中自动匹配学号与密码输入框</Text>

            <TextInput
              style={styles.autofillInput}
              placeholder="请输入学号"
              placeholderTextColor="#94A3B8"
              value={autofillUsername}
              onChangeText={setAutofillUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.autofillInput}
              placeholder="请输入密码"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={autofillPassword}
              onChangeText={setAutofillPassword}
            />

            <TouchableOpacity
              style={styles.autofillConfirmBtn}
              onPress={handleExecuteAutofill}
              activeOpacity={0.8}
            >
              <Text style={styles.autofillConfirmBtnText}>一键填入网页</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 帮助教程弹窗 */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.popoverOverlay}
          activeOpacity={1}
          onPress={() => setHelpModalVisible(false)}
        >
          <View style={[styles.autofillCard, Shadows.card]}>
            <Text style={styles.autofillTitle}>教务课表导入帮助教程</Text>
            <View style={{ marginVertical: 10 }}>
              <Text style={styles.helpStepText}>1. 推荐在校内连接校园网 WiFi 选择【统一身份认证】直连进入，免 403 拦截。</Text>
              <Text style={styles.helpStepText}>2. 在网页中输入学号密码及验证码登录系统。</Text>
              <Text style={styles.helpStepText}>3. 登录进入后，点击打开【学期理论课表】或【学生课表查询】页面。</Text>
              <Text style={styles.helpStepText}>4. 看到排课表格后，直接轻点底部蓝色圆圈【识别导课】，即可秒级自动抓取并导入！</Text>
            </View>
            <TouchableOpacity
              style={styles.autofillConfirmBtn}
              onPress={() => setHelpModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.autofillConfirmBtnText}>我知道了</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  popoverOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // 图 1：导课选项菜单卡片 (精确对齐图1截图)
  optionsMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '84%',
    maxWidth: 320,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  menuItemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // 选择学校界面样式
  searchBoxWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  schoolSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    padding: 0,
  },
  quickTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  quickTagPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickTagPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickTagPillText: {
    fontSize: 12,
    color: '#475569',
  },
  quickTagPillTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  schoolListScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  schoolListSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
    marginTop: 6,
  },
  schoolItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  schoolItemCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F7FF',
  },
  schoolAvatarBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  schoolInfoCol: {
    flex: 1,
  },
  schoolItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  schoolItemTag: {
    backgroundColor: '#E0F2FE',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  schoolItemTagText: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '600',
  },
  schoolItemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  // 认证方式选择页 (图 2)
  authPageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 24 : 44,
  },
  authNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  switchSchoolBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  switchSchoolBtnText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  authScrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  semesterBanner: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerLabel: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  bannerValue: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },
  bannerSubtext: {
    fontSize: 11,
    color: '#60A5FA',
  },
  authSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  authSectionSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  helpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  helpBannerText: {
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
  },
  customUrlBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customUrlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  customUrlInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  systemsList: {
    marginBottom: 24,
  },
  systemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  systemCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  bookIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  systemInfoWrap: {
    flex: 1,
  },
  systemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  systemLevel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  radioWrap: {
    marginLeft: 12,
  },
  checkedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  authFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  enterActionBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterActionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // 内置浏览器 (图 3)
  browserContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 24 : 44,
  },
  browserTopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  browserCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browserNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  browserNavBtnDisabled: {
    opacity: 0.35,
  },
  browserUrlPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  browserUrlPillText: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
  },
  loadingBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 68 : 88,
    left: 0,
    right: 0,
    zIndex: 99,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 4,
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginBottom: Platform.OS === 'android' ? 70 : 80,
  },
  dockBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? 70 : 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
    paddingBottom: Platform.OS === 'android' ? 6 : 16,
    zIndex: 99999,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  squareIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dockItemLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  dockCenterItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -22,
  },
  centerBlueCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 4,
  },
  dockCenterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },

  // 导课成功弹窗 (精确复刻图1截图：课表已更新)
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '88%',
    maxWidth: 340,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  folderBadgeContainer: {
    width: 72,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  folderBody: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderPaper: {
    position: 'absolute',
    top: 6,
    width: 24,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    opacity: 0.9,
    zIndex: 1,
  },
  checkBadgeOverlay: {
    position: 'absolute',
    right: 6,
    bottom: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  successMainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D2129',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSemesterTitle: {
    fontSize: 15,
    color: '#4E5969',
    textAlign: 'center',
    marginBottom: 16,
  },
  successDescription: {
    fontSize: 14,
    color: '#4E5969',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  viewScheduleActionBtn: {
    width: '100%',
    backgroundColor: '#4F86F7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewScheduleActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // 辅助弹窗
  autofillCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '84%',
    maxWidth: 320,
    padding: 20,
  },
  autofillTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  autofillSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
  },
  autofillInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 10,
  },
  autofillConfirmBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  autofillConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  helpStepText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 6,
  },
});
