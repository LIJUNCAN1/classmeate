export interface AuthSystemOption {
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
  systems: AuthSystemOption[];
}

export const SCHOOL_DATABASE: SchoolItem[] = [
  // ================= 矿业大学系列 (用户重点指定) =================
  {
    id: 'cumt',
    name: '中国矿业大学',
    shortName: 'CUMT / 矿大',
    region: '江苏 · 徐州',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'cumt_cas',
        name: '统一身份认证平台 (SSO)',
        level: '本科/研究生',
        url: 'http://authserver.cumt.edu.cn/authserver/login',
        desc: '中国矿业大学官方统一身份认证登录通道',
      },
      {
        id: 'cumt_jw',
        name: '本科教学管理信息系统',
        level: '本科',
        url: 'http://jwxt.cumt.edu.cn/',
        desc: '矿大现代教务管理信息系统通道',
      },
      {
        id: 'cumt_webvpn',
        name: 'WebVPN 校外直连通道',
        level: '全校师生',
        url: 'https://webvpn.cumt.edu.cn/',
        desc: '校外访问专用免客户端 WebVPN 隧道',
      },
    ],
  },
  {
    id: 'cumtb',
    name: '中国矿业大学(北京)',
    shortName: 'CUMTB / 矿大北京',
    region: '北京 · 海淀',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'cumtb_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://authserver.cumtb.edu.cn/authserver/login',
        desc: '中国矿业大学(北京)统一身份认证服务',
      },
      {
        id: 'cumtb_jw',
        name: '综合教务管理系统',
        level: '本科',
        url: 'https://jwxt.cumtb.edu.cn/',
        desc: '综合教务系统课表直连入口',
      },
    ],
  },

  // ================= 湖南地区高校 =================
  {
    id: 'ccsu',
    name: '长沙学院',
    shortName: 'CCSU / 长大',
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
    shortName: 'CSU / 中南',
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
    shortName: 'HNU / 湖大',
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
    shortName: 'HUNNU / 湖师大',
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
    shortName: 'CSUST / 长理',
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
    shortName: 'HUNAU / 湖南农大',
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
      {
        id: 'hunau_jw',
        name: '教务管理信息系统',
        level: '本科',
        url: 'https://jwgl.hunau.edu.cn/',
        desc: '湖南农大本科教务系统',
      },
    ],
  },
  {
    id: 'csuft',
    name: '中南林业科技大学',
    shortName: 'CSUFT / 中南林',
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
    shortName: 'XTU / 湘大',
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
    id: 'hnust',
    name: '湖南科技大学',
    shortName: 'HNUST / 湖南科大',
    region: '湖南 · 湘潭',
    badge: '省重点',
    systems: [
      {
        id: 'hnust_cas',
        name: '统一身份认证',
        level: '本科/研究生',
        url: 'https://cas.hnust.edu.cn/authserver/login',
        desc: '湖南科技大学智慧校园统一登录',
      },
    ],
  },
  {
    id: 'usc',
    name: '南华大学',
    shortName: 'USC',
    region: '湖南 · 衡阳',
    badge: '省部共建',
    systems: [
      {
        id: 'usc_cas',
        name: '统一身份认证系统',
        level: '本科/研究生',
        url: 'https://cas.usc.edu.cn/authserver/login',
        desc: '南华大学统一认证门户',
      },
    ],
  },

  // ================= 全国 985 / 211 / 双一流名校 =================
  {
    id: 'pku',
    name: '北京大学',
    shortName: 'PKU / 北大',
    region: '北京 · 海淀',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'pku_portal',
        name: '北京大学综合信息服务 (门户)',
        level: '全校',
        url: 'https://portal.pku.edu.cn/',
        desc: '校内统一门户身份登录与课表查看',
      },
    ],
  },
  {
    id: 'thu',
    name: '清华大学',
    shortName: 'THU / 清华',
    region: '北京 · 海淀',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'thu_info',
        name: '清华大学网络学堂 / 综合教务',
        level: '本科/研究生',
        url: 'https://info.tsinghua.edu.cn/',
        desc: '清华大学信息化综合工作门户',
      },
    ],
  },
  {
    id: 'ruc',
    name: '中国人民大学',
    shortName: 'RUC / 人大',
    region: '北京 · 海淀',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'ruc_cas',
        name: '微人大 / 统一身份认证',
        level: '全日制',
        url: 'https://v.ruc.edu.cn/',
        desc: '中国人民大学微人大服务门户',
      },
    ],
  },
  {
    id: 'buaa',
    name: '北京航空航天大学',
    shortName: 'BUAA / 北航',
    region: '北京 · 海淀',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'buaa_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://sso.buaa.edu.cn/login',
        desc: '北航统一身份认证与教务选课系统',
      },
    ],
  },
  {
    id: 'bit',
    name: '北京理工大学',
    shortName: 'BIT / 北理工',
    region: '北京 · 海淀',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'bit_cas',
        name: '延河课堂 / 统一身份认证',
        level: '本科/研究生',
        url: 'https://login.bit.edu.cn/',
        desc: '北京理工大学统一登录认证',
      },
    ],
  },
  {
    id: 'bupt',
    name: '北京邮电大学',
    shortName: 'BUPT / 北邮',
    region: '北京 · 海淀',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'bupt_cas',
        name: '北邮统一认证平台',
        level: '本科/研究生',
        url: 'https://auth.bupt.edu.cn/authserver/login',
        desc: '北京邮电大学智慧教务与信息平台',
      },
    ],
  },
  {
    id: 'zju',
    name: '浙江大学',
    shortName: 'ZJU / 浙大',
    region: '浙江 · 杭州',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'zju_cas',
        name: '统一身份认证',
        level: '本科/研究生',
        url: 'https://zjuam.zju.edu.cn/cas/login',
        desc: '浙江大学本科教学管理与选课平台',
      },
    ],
  },
  {
    id: 'sjtu',
    name: '上海交通大学',
    shortName: 'SJTU / 上海交大',
    region: '上海 · 闵行',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'sjtu_jaccount',
        name: 'jAccount 统一认证',
        level: '全校',
        url: 'https://jaccount.sjtu.edu.cn/',
        desc: '上海交通大学统一认证教务通道',
      },
    ],
  },
  {
    id: 'fudan',
    name: '复旦大学',
    shortName: 'FUDAN / 复旦',
    region: '上海 · 杨浦',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'fudan_uis',
        name: '复旦 UIS 统一身份认证',
        level: '本科/研究生',
        url: 'https://uis.fudan.edu.cn/authserver/login',
        desc: '复旦大学本科教学管理系统直连',
      },
    ],
  },
  {
    id: 'tongji',
    name: '同济大学',
    shortName: 'TONGJI / 同济',
    region: '上海 · 杨浦',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'tongji_cas',
        name: '同济一网通办统一认证',
        level: '本科/研究生',
        url: 'https://ids.tongji.edu.cn:8443/nidp/saml2/sso',
        desc: '同济大学本科教学服务综合管理系统',
      },
    ],
  },
  {
    id: 'nju',
    name: '南京大学',
    shortName: 'NJU / 南大',
    region: '江苏 · 南京',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'nju_auth',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://authserver.nju.edu.cn/authserver/login',
        desc: '南京大学教务管理系统与在线服务',
      },
    ],
  },
  {
    id: 'seu',
    name: '东南大学',
    shortName: 'SEU / 东大',
    region: '江苏 · 南京',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'seu_cas',
        name: '东南大学统一身份认证',
        level: '本科/研究生',
        url: 'https://newcas.seu.edu.cn/authserver/login',
        desc: '东南大学新教务综合系统',
      },
    ],
  },
  {
    id: 'nuaa',
    name: '南京航空航天大学',
    shortName: 'NUAA / 南航',
    region: '江苏 · 南京',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'nuaa_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://authserver.nuaa.edu.cn/authserver/login',
        desc: '南京航空航天大学教务管理系统',
      },
    ],
  },
  {
    id: 'suda',
    name: '苏州大学',
    shortName: 'SUDA / 苏大',
    region: '江苏 · 苏州',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'suda_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://pass.suda.edu.cn/cas/login',
        desc: '苏州大学综合教务服务系统',
      },
    ],
  },
  {
    id: 'ustc',
    name: '中国科学技术大学',
    shortName: 'USTC / 中科大',
    region: '安徽 · 合肥',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'ustc_cas',
        name: '中科大统一身份认证平台',
        level: '全校',
        url: 'https://passport.ustc.edu.cn/login',
        desc: '中国科学技术大学本科教务系统',
      },
    ],
  },
  {
    id: 'whu',
    name: '武汉大学',
    shortName: 'WHU / 武大',
    region: '湖北 · 武汉',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'whu_cas',
        name: '智慧珞珈统一身份认证',
        level: '本科/研究生',
        url: 'https://cas.whu.edu.cn/authserver/login',
        desc: '武汉大学教务综合信息管理系统',
      },
    ],
  },
  {
    id: 'hust',
    name: '华中科技大学',
    shortName: 'HUST / 华科',
    region: '湖北 · 武汉',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'hust_pass',
        name: '华中大统一身份认证',
        level: '全日制',
        url: 'https://pass.hust.edu.cn/cas/login',
        desc: '华中科技大学一体化教务与选课平台',
      },
    ],
  },
  {
    id: 'wut',
    name: '武汉理工大学',
    shortName: 'WUT / 武汉理工',
    region: '湖北 · 武汉',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'wut_cas',
        name: '智慧理工统一身份认证',
        level: '本科/研究生',
        url: 'https://authserver.whut.edu.cn/authserver/login',
        desc: '武汉理工大学教务综合信息系统',
      },
    ],
  },
  {
    id: 'sysu',
    name: '中山大学',
    shortName: 'SYSU / 中大',
    region: '广东 · 广州',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'sysu_cas',
        name: '大学服务中心统一身份认证',
        level: '本科/研究生',
        url: 'https://cas.sysu.edu.cn/cas/login',
        desc: '中山大学本科综合教务系统',
      },
    ],
  },
  {
    id: 'scut',
    name: '华南理工大学',
    shortName: 'SCUT / 华工',
    region: '广东 · 广州',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'scut_cas',
        name: '华工统一认证平台',
        level: '本科/研究生',
        url: 'https://sso.scut.edu.cn/cas/login',
        desc: '华南理工大学教务管理系统',
      },
    ],
  },
  {
    id: 'jnu',
    name: '暨南大学',
    shortName: 'JNU / 暨大',
    region: '广东 · 广州',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'jnu_cas',
        name: '数字暨南统一身份认证',
        level: '本科/研究生',
        url: 'https://id.jnu.edu.cn/',
        desc: '暨南大学综合教务信息管理系统',
      },
    ],
  },
  {
    id: 'szu',
    name: '深圳大学',
    shortName: 'SZU / 深大',
    region: '广东 · 深圳',
    badge: '高水平大学',
    systems: [
      {
        id: 'szu_cas',
        name: '深大统一身份认证',
        level: '本科/研究生',
        url: 'https://authserver.szu.edu.cn/authserver/login',
        desc: '深圳大学教学一体化平台',
      },
    ],
  },
  {
    id: 'scu',
    name: '四川大学',
    shortName: 'SCU / 川大',
    region: '四川 · 成都',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'scu_cas',
        name: '微川大统一身份认证',
        level: '本科/研究生',
        url: 'https://zhjw.scu.edu.cn/',
        desc: '四川大学综合教务系统',
      },
    ],
  },
  {
    id: 'uestc',
    name: '电子科技大学',
    shortName: 'UESTC / 成电',
    region: '四川 · 成都',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'uestc_cas',
        name: '成电统一身份认证',
        level: '本科/研究生',
        url: 'https://idas.uestc.edu.cn/authserver/login',
        desc: '电子科技大学教务管理服务系统',
      },
    ],
  },
  {
    id: 'cqu',
    name: '重庆大学',
    shortName: 'CQU / 重大',
    region: '重庆 · 沙坪坝',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'cqu_cas',
        name: '重庆大学统一认证平台',
        level: '本科/研究生',
        url: 'https://sso.cqu.edu.cn/login',
        desc: '重庆大学现代教务管理信息系统',
      },
    ],
  },
  {
    id: 'swu',
    name: '西南大学',
    shortName: 'SWU / 西大',
    region: '重庆 · 北碚',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'swu_cas',
        name: '智慧西大统一身份认证',
        level: '本科/研究生',
        url: 'https://ids.swu.edu.cn/authserver/login',
        desc: '西南大学教务选课一体化系统',
      },
    ],
  },
  {
    id: 'xjtu',
    name: '西安交通大学',
    shortName: 'XJTU / 西安交大',
    region: '陕西 · 西安',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'xjtu_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://org.xjtu.edu.cn/openplatform/login.html',
        desc: '西安交通大学本科教学服务综合系统',
      },
    ],
  },
  {
    id: 'nwpu',
    name: '西北工业大学',
    shortName: 'NPU / 西工大',
    region: '陕西 · 西安',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'nwpu_cas',
        name: '翱翔门户统一身份认证',
        level: '本科/研究生',
        url: 'https://uis.nwpu.edu.cn/cas/login',
        desc: '西北工业大学本科教学管理系统',
      },
    ],
  },
  {
    id: 'xidian',
    name: '西安电子科技大学',
    shortName: 'XIDIAN / 西电',
    region: '陕西 · 西安',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'xidian_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://ids.xidian.edu.cn/authserver/login',
        desc: '西安电子科技大学智慧教务系统',
      },
    ],
  },
  {
    id: 'hit',
    name: '哈尔滨工业大学',
    shortName: 'HIT / 哈工大',
    region: '黑龙江 · 哈尔滨',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'hit_cas',
        name: '今日哈工大统一认证',
        level: '全日制',
        url: 'https://cas.hit.edu.cn/authserver/login',
        desc: '哈尔滨工业大学教务与教学服务平台',
      },
    ],
  },
  {
    id: 'jmsu',
    name: '佳木斯大学',
    shortName: 'JMSU / 佳大',
    region: '黑龙江 · 佳木斯',
    badge: '青果 · 喜鹊儿',
    systems: [
      {
        id: 'jmsu_jw',
        name: '教务管理信息系统 (青果)',
        level: '本科/专科/研究生',
        url: 'http://jwc.jmsu.edu.cn/',
        desc: '佳木斯大学青果教务系统（喜鹊儿移动端官方后台）',
      },
      {
        id: 'jmsu_xiqueer',
        name: '喜鹊儿移动教务直通平台',
        level: '全校师生',
        url: 'http://app.xiqueer.com/',
        desc: '青果软件喜鹊儿掌上校园移动课表同步入口',
      },
      {
        id: 'jmsu_portal',
        name: '智慧佳大数字校园门户',
        level: '全校师生',
        url: 'https://www.jmsu.edu.cn/',
        desc: '佳木斯大学官方数字校园统一门户',
      },
    ],
  },
  {
    id: 'jlu',
    name: '吉林大学',
    shortName: 'JLU / 吉大',
    region: '吉林 · 长春',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'jlu_cas',
        name: '吉大综合服务认证平台',
        level: '本科/研究生',
        url: 'https://sso.jlu.edu.cn/cas/login',
        desc: '吉林大学本科综合教务管理系统',
      },
    ],
  },
  {
    id: 'neu',
    name: '东北大学',
    shortName: 'NEU / 东大',
    region: '辽宁 · 沈阳',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'neu_cas',
        name: '东大统一身份认证',
        level: '本科/研究生',
        url: 'https://pass.neu.edu.cn/tpass/login',
        desc: '东北大学教务选课系统通道',
      },
    ],
  },
  {
    id: 'tju',
    name: '天津大学',
    shortName: 'TJU / 天大',
    region: '天津 · 南开',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'tju_cas',
        name: '天大统一认证平台',
        level: '本科/研究生',
        url: 'https://sso.tju.edu.cn/cas/login',
        desc: '天津大学本科教学管理系统',
      },
    ],
  },
  {
    id: 'nankai',
    name: '南开大学',
    shortName: 'NKU / 南开',
    region: '天津 · 南开',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'nankai_cas',
        name: '飞书/统一身份认证',
        level: '本科/研究生',
        url: 'https://authserver.nankai.edu.cn/authserver/login',
        desc: '南开大学综合教务信息系统',
      },
    ],
  },
  {
    id: 'sdu',
    name: '山东大学',
    shortName: 'SDU / 山大',
    region: '山东 · 济南',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'sdu_cas',
        name: '山大统一身份认证服务',
        level: '本科/研究生',
        url: 'https://pass.sdu.edu.cn/cas/login',
        desc: '山东大学本科综合教务系统',
      },
    ],
  },
  {
    id: 'zzu',
    name: '郑州大学',
    shortName: 'ZZU / 郑大',
    region: '河南 · 郑州',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'zzu_cas',
        name: '郑大综合服务认证平台',
        level: '本科/研究生',
        url: 'https://cas.zzu.edu.cn/authserver/login',
        desc: '郑州大学综合教务系统',
      },
    ],
  },
  {
    id: 'xmu',
    name: '厦门大学',
    shortName: 'XMU / 厦大',
    region: '福建 · 厦门',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'xmu_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://pass.xmu.edu.cn/cas/login',
        desc: '厦门大学教务管理系统',
      },
    ],
  },
  {
    id: 'ncu',
    name: '南昌大学',
    shortName: 'NCU / 昌大',
    region: '江西 · 南昌',
    badge: '211 · 双一流',
    systems: [
      {
        id: 'ncu_cas',
        name: '统一身份认证平台',
        level: '本科/研究生',
        url: 'https://cas.ncu.edu.cn/authserver/login',
        desc: '南昌大学教务管理系统',
      },
    ],
  },
  {
    id: 'lzu',
    name: '兰州大学',
    shortName: 'LZU / 兰大',
    region: '甘肃 · 兰州',
    badge: '985 · 双一流',
    systems: [
      {
        id: 'lzu_cas',
        name: '兰大个人工作台认证',
        level: '全日制',
        url: 'https://cas.lzu.edu.cn/authserver/login',
        desc: '兰州大学教务系统直连',
      },
    ],
  },

  // ================= 通用高校与自定义教务系统 =================
  {
    id: 'custom_general',
    name: '全国高校通用通道 (支持任何大学)',
    shortName: '通用 / 全国高校',
    region: '全国高校通用',
    badge: '全网兼容',
    systems: [
      {
        id: 'custom_general_input',
        name: '通用教务直连 / WebVPN',
        level: '正方/强智/青果/金智',
        url: 'https://',
        desc: '输入您学校的教务登录网址或校外 WebVPN，登录后自动提取课表',
      },
    ],
  },
];
