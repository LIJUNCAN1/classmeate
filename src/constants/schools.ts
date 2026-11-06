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
  pinyin?: string;
  systems: AuthSystemOption[];
}

export const SCHOOL_DATABASE: SchoolItem[] = [
  {
    "id": "cumt",
    "name": "中国矿业大学",
    "shortName": "CUMT / 矿大",
    "pinyin": "zhongguokuangyedaxue cumt kd zgkydx kuangda",
    "region": "江苏 · 徐州",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "cumt_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.cumt.edu.cn/",
        "desc": "中国矿业大学官方教务管理系统登录"
      }
    ]
  },
  {
    "id": "cumtb",
    "name": "中国矿业大学(北京)",
    "shortName": "CUMTB / 矿大北京",
    "pinyin": "zhongguokuangyedaxuebeijing cumtb kdbj",
    "region": "北京 · 海淀",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "cumtb_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://jwxt.cumtb.edu.cn/",
        "desc": "中国矿业大学(北京)官方教务系统登录"
      }
    ]
  },
  {
    "id": "jmsu",
    "name": "佳木斯大学",
    "shortName": "JMSU / 佳大",
    "pinyin": "jiamusidaxue jmsu jd jmsdx jiada xiqueer qingguo",
    "region": "黑龙江 · 佳木斯",
    "badge": "青果 · 喜鹊儿",
    "systems": [
      {
        "id": "jmsu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwc.jmsu.edu.cn/",
        "desc": "佳木斯大学青果教务系统登录"
      }
    ]
  },
  {
    "id": "ccsu",
    "name": "长沙学院",
    "shortName": "CCSU / 长大",
    "pinyin": "changshaxueyuan ccsu cd csxy changda qiangzhi",
    "region": "湖南 · 长沙",
    "badge": "强智系统",
    "systems": [
      {
        "id": "ccsu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.ccsu.cn/jsxsd/",
        "desc": "长沙学院强智教务管理系统登录"
      }
    ]
  },
  {
    "id": "pku",
    "name": "北京大学",
    "shortName": "PKU / 北大",
    "pinyin": "beijingdaxue pku bd beida",
    "region": "北京 · 海淀",
    "badge": "C9 · 985 · 双一流",
    "systems": [
      {
        "id": "pku_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://elective.pku.edu.cn/",
        "desc": "北京大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "thu",
    "name": "清华大学",
    "shortName": "THU / 清华",
    "pinyin": "qinghuadaxue thu qh qinghua",
    "region": "北京 · 海淀",
    "badge": "C9 · 985 · 双一流",
    "systems": [
      {
        "id": "thu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://academic.tsinghua.edu.cn/",
        "desc": "清华大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ruc",
    "name": "中国人民大学",
    "shortName": "RUC / 人大",
    "pinyin": "zhongguorenmindaxue ruc rd renda",
    "region": "北京 · 海淀",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "ruc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ruc.edu.cn/",
        "desc": "中国人民大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "buaa",
    "name": "北京航空航天大学",
    "shortName": "BUAA / 北航",
    "pinyin": "beijinghangkonghangtiandaxue buaa bh behang",
    "region": "北京 · 海淀",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "buaa_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.buaa.edu.cn/",
        "desc": "北京航空航天大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bit",
    "name": "北京理工大学",
    "shortName": "BIT / 北理工",
    "pinyin": "beijingligongdaxue bit blg beiligong",
    "region": "北京 · 海淀",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "bit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwms.bit.edu.cn/",
        "desc": "北京理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bupt",
    "name": "北京邮电大学",
    "shortName": "BUPT / 北邮",
    "pinyin": "beijingyoudiandaxue bupt by beiyou",
    "region": "北京 · 海淀",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "bupt_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.bupt.edu.cn/",
        "desc": "北京邮电大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bnu",
    "name": "北京师范大学",
    "shortName": "BNU / 北师大",
    "pinyin": "beijingshifandaxue bnu bsd beishida",
    "region": "北京 · 海淀",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "bnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.bnu.edu.cn/",
        "desc": "北京师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bjtu",
    "name": "北京交通大学",
    "shortName": "BJTU / 北交大",
    "pinyin": "beijingjiaotongdaxue bjtu bjd beijiaoda",
    "region": "北京 · 海淀",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "bjtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://bjjw.bjtu.edu.cn/",
        "desc": "北京交通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ustb",
    "name": "北京科技大学",
    "shortName": "USTB / 北科大",
    "pinyin": "beijingkejidaxue ustb bkd beikeda",
    "region": "北京 · 海淀",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "ustb_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.ustb.edu.cn/",
        "desc": "北京科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cau",
    "name": "中国农业大学",
    "shortName": "CAU / 中农",
    "pinyin": "zhongguonongyedaxue cau zn zhongnong",
    "region": "北京 · 海淀",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "cau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.cau.edu.cn/",
        "desc": "中国农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cuc",
    "name": "中国传媒大学",
    "shortName": "CUC / 中传",
    "pinyin": "zhongguochuanmeidaxue cuc zc zhongchuan",
    "region": "北京 · 朝阳",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "cuc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.cuc.edu.cn/",
        "desc": "中国传媒大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cupl",
    "name": "中国政法大学",
    "shortName": "CUPL / 法大",
    "pinyin": "zhongguozhengfadaxue cupl fd fada",
    "region": "北京 · 昌平",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "cupl_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.cupl.edu.cn/",
        "desc": "中国政法大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "uibe",
    "name": "对外经济贸易大学",
    "shortName": "UIBE / 贸大",
    "pinyin": "duiwaijingjimaoyidaxue uibe md maoda",
    "region": "北京 · 朝阳",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "uibe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.uibe.edu.cn/",
        "desc": "对外经济贸易大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cufe",
    "name": "中央财经大学",
    "shortName": "CUFE / 央财",
    "pinyin": "zhongyangcaijingdaxue cufe yc yangcai",
    "region": "北京 · 海淀",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "cufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.cufe.edu.cn/",
        "desc": "中央财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bjut",
    "name": "北京工业大学",
    "shortName": "BJUT / 北工大",
    "pinyin": "beijinggongyedaxue bjut bgd beigongda",
    "region": "北京 · 朝阳",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "bjut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.bjut.edu.cn/",
        "desc": "北京工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bfu",
    "name": "北京林业大学",
    "shortName": "BFU / 北林",
    "pinyin": "beijinglinyedaxue bfu bl beilin",
    "region": "北京 · 海淀",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "bfu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.bjfu.edu.cn/",
        "desc": "北京林业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bucm",
    "name": "北京中医药大学",
    "shortName": "BUCM / 北中医",
    "pinyin": "beijingzhongyiyaodaxue bucm bzy beizhongyi",
    "region": "北京 · 朝阳",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "bucm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.bucm.edu.cn/",
        "desc": "北京中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "buct",
    "name": "北京化工大学",
    "shortName": "BUCT / 北化",
    "pinyin": "beijinghuagongdaxue buct bh beihua",
    "region": "北京 · 朝阳",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "buct_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.buct.edu.cn/",
        "desc": "北京化工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bfsu",
    "name": "北京外国语大学",
    "shortName": "BFSU / 北外",
    "pinyin": "beijingwaiguoyudaxue bfsu bw beiwai",
    "region": "北京 · 海淀",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "bfsu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.bfsu.edu.cn/",
        "desc": "北京外国语大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ncepu",
    "name": "华北电力大学",
    "shortName": "NCEPU / 华电",
    "pinyin": "huabeidianlidaxue ncepu hd huadian",
    "region": "北京 · 昌平",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "ncepu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.ncepu.edu.cn/",
        "desc": "华北电力大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cugb",
    "name": "中国地质大学(北京)",
    "shortName": "CUGB / 地大北京",
    "pinyin": "zhongguodizhidaxuebeijing cugb ddbj dida",
    "region": "北京 · 海淀",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "cugb_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cugb.edu.cn/",
        "desc": "中国地质大学(北京)官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cupb",
    "name": "中国石油大学(北京)",
    "shortName": "CUPB / 石大北京",
    "pinyin": "zhongguoshiyoudaxuebeijing cupb sdbj shida",
    "region": "北京 · 昌平",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "cupb_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cup.edu.cn/",
        "desc": "中国石油大学(北京)官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "muc",
    "name": "中央民族大学",
    "shortName": "MUC / 民大",
    "pinyin": "zhongyangminzudaxue muc md minda",
    "region": "北京 · 海淀",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "muc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.muc.edu.cn/",
        "desc": "中央民族大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cnu",
    "name": "首都师范大学",
    "shortName": "CNU / 首师大",
    "pinyin": "shoudushifandaxue cnu ssd shoushida",
    "region": "北京 · 海淀",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "cnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cnu.edu.cn/",
        "desc": "首都师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cueb",
    "name": "首都经济贸易大学",
    "shortName": "CUEB / 首经贸",
    "pinyin": "shoudujingjimaoyidaxue cueb sjm shoujingmao",
    "region": "北京 · 丰台",
    "badge": "重点大学",
    "systems": [
      {
        "id": "cueb_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.cueb.edu.cn/",
        "desc": "首都经济贸易大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "btbu",
    "name": "北京工商大学",
    "shortName": "BTBU / 北工商",
    "pinyin": "beijinggongshangdaxue btbu bgs beigongshang",
    "region": "北京 · 海淀",
    "badge": "重点大学",
    "systems": [
      {
        "id": "btbu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.btbu.edu.cn/",
        "desc": "北京工商大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bistu",
    "name": "北京信息科技大学",
    "shortName": "BISTU / 北信科",
    "pinyin": "beijingxinxikejidaxue bistu bxk beixinke",
    "region": "北京 · 海淀",
    "badge": "重点大学",
    "systems": [
      {
        "id": "bistu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.bistu.edu.cn/",
        "desc": "北京信息科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "bucea",
    "name": "北京建筑大学",
    "shortName": "BUCEA / 北建大",
    "pinyin": "beijingjianzhadaxue bucea bjd beijianda",
    "region": "北京 · 西城",
    "badge": "重点大学",
    "systems": [
      {
        "id": "bucea_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.bucea.edu.cn/",
        "desc": "北京建筑大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ncut",
    "name": "北方工业大学",
    "shortName": "NCUT / 北方工大",
    "pinyin": "beifanggongyedaxue ncut bfgd beifanggongda",
    "region": "北京 · 石景山",
    "badge": "省属重点",
    "systems": [
      {
        "id": "ncut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.ncut.edu.cn/",
        "desc": "北方工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "buu",
    "name": "北京联合大学",
    "shortName": "BUU / 联大",
    "pinyin": "beijinglianhedaxue buu ld lianda",
    "region": "北京 · 朝阳",
    "badge": "市属大学",
    "systems": [
      {
        "id": "buu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.buu.edu.cn/",
        "desc": "北京联合大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ccmu",
    "name": "首都医科大学",
    "shortName": "CCMU / 首医",
    "pinyin": "shouduyikedaxue ccmu sy shouyi",
    "region": "北京 · 丰台",
    "badge": "医科重点",
    "systems": [
      {
        "id": "ccmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ccmu.edu.cn/",
        "desc": "首都医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tju",
    "name": "天津大学",
    "shortName": "TJU / 天大",
    "pinyin": "tianjindaxue tju td tianda",
    "region": "天津 · 津南",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "tju_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jxgl.tju.edu.cn/",
        "desc": "天津大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nku",
    "name": "南开大学",
    "shortName": "NKU / 南开",
    "pinyin": "nankaidaxue nku nk nankai",
    "region": "天津 · 南开",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "nku_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://eamis.nankai.edu.cn/",
        "desc": "南开大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tjpu",
    "name": "天津工业大学",
    "shortName": "TJPU / 天工大",
    "pinyin": "tianjingongyedaxue tjpu tgd tiangongda",
    "region": "天津 · 西青",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "tjpu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.tiangong.edu.cn/",
        "desc": "天津工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tut",
    "name": "天津理工大学",
    "shortName": "TUT / 天理工",
    "pinyin": "tianjinligongdaxue tut tlg tianligong",
    "region": "天津 · 西青",
    "badge": "市属重点",
    "systems": [
      {
        "id": "tut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.tjut.edu.cn/",
        "desc": "天津理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tjnu",
    "name": "天津师范大学",
    "shortName": "TJNU / 天师大",
    "pinyin": "tianjinshifandaxue tjnu tsd tianshida",
    "region": "天津 · 西青",
    "badge": "重点师范",
    "systems": [
      {
        "id": "tjnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.tjnu.edu.cn/",
        "desc": "天津师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tust",
    "name": "天津科技大学",
    "shortName": "TUST / 天科大",
    "pinyin": "tianjinkejidaxue tust tkd tiankeda",
    "region": "天津 · 河西",
    "badge": "市属重点",
    "systems": [
      {
        "id": "tust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.tust.edu.cn/",
        "desc": "天津科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tufe",
    "name": "天津财经大学",
    "shortName": "TUFE / 天财",
    "pinyin": "tianjincaijingdaxue tufe tc tiancai",
    "region": "天津 · 河西",
    "badge": "财经重点",
    "systems": [
      {
        "id": "tufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.tjufe.edu.cn/",
        "desc": "天津财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tjtcm",
    "name": "天津中医药大学",
    "shortName": "TUTCM / 天中医",
    "pinyin": "tianjinzhongyiyaodaxue tutcm tzy tianzhongyi",
    "region": "天津 · 静海",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "tjtcm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.tjutcm.edu.cn/",
        "desc": "天津中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cauc",
    "name": "中国民航大学",
    "shortName": "CAUC / 中航大",
    "pinyin": "zhongguominhangdaxue cauc zhd zhonghangda",
    "region": "天津 · 东丽",
    "badge": "民航特色",
    "systems": [
      {
        "id": "cauc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.cauc.edu.cn/",
        "desc": "中国民航大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ysu",
    "name": "燕山大学",
    "shortName": "YSU / 燕大",
    "pinyin": "yanshandaxue ysu yd yanda",
    "region": "河北 · 秦皇岛",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "ysu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.ysu.edu.cn/",
        "desc": "燕山大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hbu",
    "name": "河北大学",
    "shortName": "HBU / 河大",
    "pinyin": "hebeidaxue hbu hd heda",
    "region": "河北 · 保定",
    "badge": "部省合建重点",
    "systems": [
      {
        "id": "hbu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hbu.cn/",
        "desc": "河北大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hebut",
    "name": "河北工业大学",
    "shortName": "HEBUT / 河工大",
    "pinyin": "hebeigongyedaxue hebut hgd hegongda",
    "region": "河北/天津 · 北辰",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "hebut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hebut.edu.cn/",
        "desc": "河北工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hebnu",
    "name": "河北师范大学",
    "shortName": "HEBNU / 河北师大",
    "pinyin": "hebeishifandaxue hebnu hbsd hebeishida",
    "region": "河北 · 石家庄",
    "badge": "省属重点",
    "systems": [
      {
        "id": "hebnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hebtu.edu.cn/",
        "desc": "河北师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "stdu",
    "name": "石家庄铁道大学",
    "shortName": "STDU / 铁大",
    "pinyin": "shijiazhuangtiedaodaxue stdu td tieda",
    "region": "河北 · 石家庄",
    "badge": "特色高水平",
    "systems": [
      {
        "id": "stdu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.stdu.edu.cn/",
        "desc": "石家庄铁道大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ncst",
    "name": "华北理工大学",
    "shortName": "NCST / 华理工",
    "pinyin": "huabeiligongdaxue ncst hblg huabeiligong",
    "region": "河北 · 唐山",
    "badge": "省部共建",
    "systems": [
      {
        "id": "ncst_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.ncst.edu.cn/",
        "desc": "华北理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hebust",
    "name": "河北科技大学",
    "shortName": "HEBUST / 河科大",
    "pinyin": "hebeikejidaxue hebust hkd hebeikeda",
    "region": "河北 · 石家庄",
    "badge": "省属重点",
    "systems": [
      {
        "id": "hebust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hebust.edu.cn/",
        "desc": "河北科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hebmu",
    "name": "河北医科大学",
    "shortName": "HEBMU / 河北医大",
    "pinyin": "hebeiyikedaxue hebmu hyd hebeiyida",
    "region": "河北 · 石家庄",
    "badge": "重点医科",
    "systems": [
      {
        "id": "hebmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hebmu.edu.cn/",
        "desc": "河北医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hebau",
    "name": "河北农业大学",
    "shortName": "HEBAU / 河北农大",
    "pinyin": "hebeinongyedaxue hebau hnd hebeinongda",
    "region": "河北 · 保定",
    "badge": "省属重点",
    "systems": [
      {
        "id": "hebau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hebau.edu.cn/",
        "desc": "河北农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hueb",
    "name": "河北经贸大学",
    "shortName": "HUEB / 河经贸",
    "pinyin": "hebeijingmaodaxue hueb hjm hebeijingmao",
    "region": "河北 · 石家庄",
    "badge": "财经重点",
    "systems": [
      {
        "id": "hueb_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.heuet.edu.cn/",
        "desc": "河北经贸大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hgu",
    "name": "河北地质大学",
    "shortName": "HGU / 河地大",
    "pinyin": "hebeidizhidaxue hgu hdd hebeidida",
    "region": "河北 · 石家庄",
    "badge": "特色高校",
    "systems": [
      {
        "id": "hgu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hgu.edu.cn/",
        "desc": "河北地质大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tyut",
    "name": "太原理工大学",
    "shortName": "TYUT / 太原理工",
    "pinyin": "taiyuanligongdaxue tyut tylg taiyuanligong",
    "region": "山西 · 太原",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "tyut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jxgl.tyut.edu.cn/",
        "desc": "太原理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sxu",
    "name": "山西大学",
    "shortName": "SXU / 山大",
    "pinyin": "shanxidaxue sxu sd shanda shanxidaxue",
    "region": "山西 · 太原",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "sxu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sxu.edu.cn/",
        "desc": "山西大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nuc",
    "name": "中北大学",
    "shortName": "NUC / 中北",
    "pinyin": "zhongbeidaxue nuc zb zhongbei",
    "region": "山西 · 太原",
    "badge": "省部共建",
    "systems": [
      {
        "id": "nuc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nuc.edu.cn/",
        "desc": "中北大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tyust",
    "name": "太原科技大学",
    "shortName": "TYUST / 太科大",
    "pinyin": "taiyuankejidaxue tyust tkd taiyuankeda",
    "region": "山西 · 太原",
    "badge": "省属高校",
    "systems": [
      {
        "id": "tyust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.tyust.edu.cn/",
        "desc": "太原科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sxnu",
    "name": "山西师范大学",
    "shortName": "SXNU / 山西师大",
    "pinyin": "shanxishifandaxue sxnu sxsd shanxishida",
    "region": "山西 · 太原",
    "badge": "重点师范",
    "systems": [
      {
        "id": "sxnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sxnu.edu.cn/",
        "desc": "山西师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sxufe",
    "name": "山西财经大学",
    "shortName": "SXUFE / 山财",
    "pinyin": "shanxicaijingdaxue sxufe sc shancai",
    "region": "山西 · 太原",
    "badge": "财经重点",
    "systems": [
      {
        "id": "sxufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sxufe.edu.cn/",
        "desc": "山西财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sxmu",
    "name": "山西医科大学",
    "shortName": "SXMU / 山医大",
    "pinyin": "shanxiyikedaxue sxmu syd shanyida",
    "region": "山西 · 太原",
    "badge": "医学重点",
    "systems": [
      {
        "id": "sxmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sxmu.edu.cn/",
        "desc": "山西医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sxau",
    "name": "山西农业大学",
    "shortName": "SXAU / 山西农大",
    "pinyin": "shanxinongyedaxue sxau snd shanxinongda",
    "region": "山西 · 晋中",
    "badge": "重点高校",
    "systems": [
      {
        "id": "sxau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sxau.edu.cn/",
        "desc": "山西农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jzxy",
    "name": "晋中学院",
    "shortName": "JZU / 晋中",
    "pinyin": "jinzhongxueyuan jzu jzxy jinzhong",
    "region": "山西 · 晋中",
    "badge": "公办本科",
    "systems": [
      {
        "id": "jzxy_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jzxy.edu.cn/",
        "desc": "晋中学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sxdtdx",
    "name": "山西大同大学",
    "shortName": "SDU / 大同大学",
    "pinyin": "shanxidatongdaxue sdu dtdx datong",
    "region": "山西 · 大同",
    "badge": "公办综合",
    "systems": [
      {
        "id": "sxdtdx_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sxdtdx.edu.cn/",
        "desc": "山西大同大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "imu",
    "name": "内蒙古大学",
    "shortName": "IMU / 内大",
    "pinyin": "neimenggudaxue imu nd neida",
    "region": "内蒙古 · 呼和浩特",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "imu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.imu.edu.cn/",
        "desc": "内蒙古大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "imut",
    "name": "内蒙古工业大学",
    "shortName": "IMUT / 内工大",
    "pinyin": "neimenggugongyedaxue imut ngd neigongda",
    "region": "内蒙古 · 呼和浩特",
    "badge": "自治区重点",
    "systems": [
      {
        "id": "imut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.imut.edu.cn/",
        "desc": "内蒙古工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "imau",
    "name": "内蒙古农业大学",
    "shortName": "IMAU / 内农大",
    "pinyin": "neimenggunongyedaxue imau nnd neinongda",
    "region": "内蒙古 · 呼和浩特",
    "badge": "特色重点",
    "systems": [
      {
        "id": "imau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.imau.edu.cn/",
        "desc": "内蒙古农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "imnu",
    "name": "内蒙古师范大学",
    "shortName": "IMNU / 内师大",
    "pinyin": "neimenggushifandaxue imnu nsd neishida",
    "region": "内蒙古 · 呼和浩特",
    "badge": "重点师范",
    "systems": [
      {
        "id": "imnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.imnu.edu.cn/",
        "desc": "内蒙古师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "imun",
    "name": "内蒙古民族大学",
    "shortName": "IMUN / 蒙民大",
    "pinyin": "neimengguminzudaxue imun mmd mengminda",
    "region": "内蒙古 · 通辽",
    "badge": "综合重点",
    "systems": [
      {
        "id": "imun_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.imun.edu.cn/",
        "desc": "内蒙古民族大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "imust",
    "name": "内蒙古科技大学",
    "shortName": "IMUST / 内科大",
    "pinyin": "neimenggukejidaxue imust nkd neikeda",
    "region": "内蒙古 · 包头",
    "badge": "公办重点",
    "systems": [
      {
        "id": "imust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.imust.edu.cn/",
        "desc": "内蒙古科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dlut",
    "name": "大连理工大学",
    "shortName": "DUT / 大工",
    "pinyin": "dalianligongdaxue dlut dut dg dagong",
    "region": "辽宁 · 大连",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "dlut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jxgl.dlut.edu.cn/",
        "desc": "大连理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "neu",
    "name": "东北大学",
    "shortName": "NEU / 东大",
    "pinyin": "dongbeidaxue neu dd dongda",
    "region": "辽宁 · 沈阳",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "neu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://219.216.96.4/",
        "desc": "东北大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lnu",
    "name": "辽宁大学",
    "shortName": "LNU / 辽大",
    "pinyin": "liaoningdaxue lnu ld liaoda",
    "region": "辽宁 · 沈阳",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "lnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lnu.edu.cn/",
        "desc": "辽宁大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dmu",
    "name": "大连海事大学",
    "shortName": "DMU / 海大",
    "pinyin": "dalianhaishidaxue dmu hd haida haishi",
    "region": "辽宁 · 大连",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "dmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.dlmu.edu.cn/",
        "desc": "大连海事大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sau",
    "name": "沈阳航空航天大学",
    "shortName": "SAU / 沈航",
    "pinyin": "shenyanghangkonghangtiandaxue sau sh shenhang",
    "region": "辽宁 · 沈阳",
    "badge": "特色高水平",
    "systems": [
      {
        "id": "sau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.sau.edu.cn/",
        "desc": "沈阳航空航天大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sylu",
    "name": "沈阳理工大学",
    "shortName": "SYLU / 沈理工",
    "pinyin": "shenyangligongdaxue sylu slg shenligong",
    "region": "辽宁 · 沈阳",
    "badge": "省属重点",
    "systems": [
      {
        "id": "sylu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.sylu.edu.cn/",
        "desc": "沈阳理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sut",
    "name": "沈阳工业大学",
    "shortName": "SUT / 沈工大",
    "pinyin": "shenyanggongyedaxue sut sgd shengongda",
    "region": "辽宁 · 沈阳",
    "badge": "重点工科",
    "systems": [
      {
        "id": "sut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sut.edu.cn/",
        "desc": "沈阳工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lntu",
    "name": "辽宁工程技术大学",
    "shortName": "LNTU / 辽工程",
    "pinyin": "liaoninggongchengjishudaxue lntu lgc liaogongcheng",
    "region": "辽宁 · 阜新",
    "badge": "重点工科",
    "systems": [
      {
        "id": "lntu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.lntu.edu.cn/",
        "desc": "辽宁工程技术大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lnpu",
    "name": "辽宁石油化工大学",
    "shortName": "LNPU / 辽石化",
    "pinyin": "liaoningshiyouhuagongdaxue lnpu lsh liaoshihua",
    "region": "辽宁 · 抚顺",
    "badge": "石化特色",
    "systems": [
      {
        "id": "lnpu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lnpu.edu.cn/",
        "desc": "辽宁石油化工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dlju",
    "name": "大连交通大学",
    "shortName": "DLJTU / 大连交大",
    "pinyin": "dalianjiaotongdaxue dljtu dljd dalianjiaoda",
    "region": "辽宁 · 大连",
    "badge": "行业特色",
    "systems": [
      {
        "id": "dlju_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.djtu.edu.cn/",
        "desc": "大连交通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sjzu",
    "name": "沈阳建筑大学",
    "shortName": "SJZU / 沈建大",
    "pinyin": "shenyangjianzhadaxue sjzu sjd shenjianda",
    "region": "辽宁 · 沈阳",
    "badge": "建筑特色",
    "systems": [
      {
        "id": "sjzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sjzu.edu.cn/",
        "desc": "沈阳建筑大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dlpu",
    "name": "大连工业大学",
    "shortName": "DLPU / 大工大",
    "pinyin": "daliangongyedaxue dlpu dgd daliangongda",
    "region": "辽宁 · 大连",
    "badge": "轻工特色",
    "systems": [
      {
        "id": "dlpu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.dlpu.edu.cn/",
        "desc": "大连工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "syau",
    "name": "沈阳农业大学",
    "shortName": "SYAU / 沈农",
    "pinyin": "shenyangnongyedaxue syau sn shennong",
    "region": "辽宁 · 沈阳",
    "badge": "农科重点",
    "systems": [
      {
        "id": "syau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.syau.edu.cn/",
        "desc": "沈阳农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cmu_ln",
    "name": "中国医科大学",
    "shortName": "CMU / 中国医大",
    "pinyin": "zhongguoyikedaxue cmu zgyd zhongguoyida",
    "region": "辽宁 · 沈阳",
    "badge": "医学重点",
    "systems": [
      {
        "id": "cmu_ln_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.cmu.edu.cn/",
        "desc": "中国医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dmu_med",
    "name": "大连医科大学",
    "shortName": "DLMEDU / 大医",
    "pinyin": "dalianyikedaxue dlmedu dy dayi",
    "region": "辽宁 · 大连",
    "badge": "重点医科",
    "systems": [
      {
        "id": "dmu_med_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.dmu.edu.cn/",
        "desc": "大连医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lnnu",
    "name": "辽宁师范大学",
    "shortName": "LNNU / 辽师大",
    "pinyin": "liaoningshifandaxue lnnu lsd liaoshida",
    "region": "辽宁 · 大连",
    "badge": "重点师范",
    "systems": [
      {
        "id": "lnnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lnnu.edu.cn/",
        "desc": "辽宁师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "synu",
    "name": "沈阳师范大学",
    "shortName": "SYNU / 沈师大",
    "pinyin": "shenyangshifandaxue synu ssd shenshida",
    "region": "辽宁 · 沈阳",
    "badge": "省属重点",
    "systems": [
      {
        "id": "synu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.synu.edu.cn/",
        "desc": "沈阳师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dufe",
    "name": "东北财经大学",
    "shortName": "DUFE / 东财",
    "pinyin": "dongbeicaijingdaxue dufe dc dongcai",
    "region": "辽宁 · 大连",
    "badge": "财经名校",
    "systems": [
      {
        "id": "dufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.dufe.edu.cn/",
        "desc": "东北财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "syu",
    "name": "沈阳大学",
    "shortName": "SYU / 沈大",
    "pinyin": "shenyangdaxue syu sd shenda",
    "region": "辽宁 · 沈阳",
    "badge": "公办综合",
    "systems": [
      {
        "id": "syu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.syu.edu.cn/",
        "desc": "沈阳大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "asnu",
    "name": "鞍山师范学院",
    "shortName": "ASNU / 鞍师",
    "pinyin": "anshanshifanxueyuan asnu as anshi",
    "region": "辽宁 · 鞍山",
    "badge": "公办本科",
    "systems": [
      {
        "id": "asnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.asnc.edu.cn/",
        "desc": "鞍山师范学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jlu",
    "name": "吉林大学",
    "shortName": "JLU / 吉大",
    "pinyin": "jilindaxue jlu jd jida",
    "region": "吉林 · 长春",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "jlu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://uims.jlu.edu.cn/",
        "desc": "吉林大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nenu",
    "name": "东北师范大学",
    "shortName": "NENU / 东北师大",
    "pinyin": "dongbeishifandaxue nenu dbsd dongbeishida",
    "region": "吉林 · 长春",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "nenu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nenu.edu.cn/",
        "desc": "东北师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ybu",
    "name": "延边大学",
    "shortName": "YBU / 延大",
    "pinyin": "yanbiandaxue ybu yd yanda",
    "region": "吉林 · 延吉",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "ybu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ybu.edu.cn/",
        "desc": "延边大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cust",
    "name": "长春理工大学",
    "shortName": "CUST / 长理工",
    "pinyin": "changchunligongdaxue cust clg changligong",
    "region": "吉林 · 长春",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "cust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.cust.edu.cn/",
        "desc": "长春理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jlau",
    "name": "吉林农业大学",
    "shortName": "JLAU / 吉农",
    "pinyin": "jilinnongyedaxue jlau jn jinong",
    "region": "吉林 · 长春",
    "badge": "重点高校",
    "systems": [
      {
        "id": "jlau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jlau.edu.cn/",
        "desc": "吉林农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ccucm",
    "name": "长春中医药大学",
    "shortName": "CCUCM / 长中医",
    "pinyin": "changchunzhongyiyaodaxue ccucm czy changzhongyi",
    "region": "吉林 · 长春",
    "badge": "特色高水平",
    "systems": [
      {
        "id": "ccucm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ccucm.edu.cn/",
        "desc": "长春中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "neepu",
    "name": "东北电力大学",
    "shortName": "NEEPU / 东电",
    "pinyin": "dongbeidianlidaxue neepu dd dongdian",
    "region": "吉林 · 吉林",
    "badge": "行业特色重点",
    "systems": [
      {
        "id": "neepu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.neepu.edu.cn/",
        "desc": "东北电力大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ccit",
    "name": "长春工业大学",
    "shortName": "CCUT / 长工大",
    "pinyin": "changchungongyedaxue ccut cgd changgongda",
    "region": "吉林 · 长春",
    "badge": "重点工科",
    "systems": [
      {
        "id": "ccit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ccut.edu.cn/",
        "desc": "长春工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jlufe",
    "name": "吉林财经大学",
    "shortName": "JUFE / 吉财",
    "pinyin": "jilincaijingdaxue jufe jc jicai",
    "region": "吉林 · 长春",
    "badge": "财经重点",
    "systems": [
      {
        "id": "jlufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jlufe.edu.cn/",
        "desc": "吉林财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "beihua",
    "name": "北华大学",
    "shortName": "BHU / 北华",
    "pinyin": "beihuadaxue bhu bh beihua",
    "region": "吉林 · 吉林",
    "badge": "省属重点 · 青果",
    "systems": [
      {
        "id": "beihua_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.beihua.edu.cn/",
        "desc": "北华大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "thnu",
    "name": "通化师范学院",
    "shortName": "THNU / 通师",
    "pinyin": "tonghuashifanxueyuan thnu ts tongshi",
    "region": "吉林 · 通化",
    "badge": "师范本科",
    "systems": [
      {
        "id": "thnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.thnu.edu.cn/",
        "desc": "通化师范学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hit",
    "name": "哈尔滨工业大学",
    "shortName": "HIT / 哈工大",
    "pinyin": "haerbingongyedaxue hit hgd hagongda",
    "region": "黑龙江 · 哈尔滨",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "hit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hit.edu.cn/",
        "desc": "哈尔滨工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "heu",
    "name": "哈尔滨工程大学",
    "shortName": "HEU / 哈工程",
    "pinyin": "haerbingongchengdaxue heu hgc hagongcheng",
    "region": "黑龙江 · 哈尔滨",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "heu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://cas.hrbeu.edu.cn/",
        "desc": "哈尔滨工程大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hlju",
    "name": "黑龙江大学",
    "shortName": "HLJU / 黑大",
    "pinyin": "heilongjiangdaxue hlju hd heida",
    "region": "黑龙江 · 哈尔滨",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "hlju_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hlju.edu.cn/",
        "desc": "黑龙江大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nefu",
    "name": "东北林业大学",
    "shortName": "NEFU / 东林",
    "pinyin": "dongbeilinyedaxue nefu dl donglin",
    "region": "黑龙江 · 哈尔滨",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "nefu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwc.nefu.edu.cn/",
        "desc": "东北林业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "neau",
    "name": "东北农业大学",
    "shortName": "NEAU / 东农",
    "pinyin": "dongbeinongyedaxue neau dn dongnong",
    "region": "黑龙江 · 哈尔滨",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "neau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.neau.edu.cn/",
        "desc": "东北农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hrbust",
    "name": "哈尔滨理工大学",
    "shortName": "HRBUST / 哈理工",
    "pinyin": "haerbinligongdaxue hrbust hlg haligong",
    "region": "黑龙江 · 哈尔滨",
    "badge": "省属高水平",
    "systems": [
      {
        "id": "hrbust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwzx.hrbust.edu.cn/",
        "desc": "哈尔滨理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hrbmu",
    "name": "哈尔滨医科大学",
    "shortName": "HMU / 哈医大",
    "pinyin": "haerbinyikedaxue hmu hyd hayida",
    "region": "黑龙江 · 哈尔滨",
    "badge": "医学名校",
    "systems": [
      {
        "id": "hrbmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hrbmu.edu.cn/",
        "desc": "哈尔滨医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hrbnu",
    "name": "哈尔滨师范大学",
    "shortName": "HNU / 哈师大",
    "pinyin": "haerbinshifandaxue hnu hsd hashida",
    "region": "黑龙江 · 哈尔滨",
    "badge": "重点师范",
    "systems": [
      {
        "id": "hrbnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hrbnu.edu.cn/",
        "desc": "哈尔滨师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qqu",
    "name": "齐齐哈尔大学",
    "shortName": "QQU / 齐大",
    "pinyin": "qiqihaerdaxue qqu qd qida qingguo",
    "region": "黑龙江 · 齐齐哈尔",
    "badge": "青果 · 综合大学",
    "systems": [
      {
        "id": "qqu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.qqhru.edu.cn/",
        "desc": "齐齐哈尔大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nepu",
    "name": "东北石油大学",
    "shortName": "NEPU / 东油",
    "pinyin": "dongbeishiyoudaxue nepu dy dongyou",
    "region": "黑龙江 · 大庆",
    "badge": "石油重点",
    "systems": [
      {
        "id": "nepu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nepu.edu.cn/",
        "desc": "东北石油大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "mdjnu",
    "name": "牡丹江师范学院",
    "shortName": "MNU / 牡师院",
    "pinyin": "mudanjiangshifanxueyuan mnu msy mudanjiang qingguo",
    "region": "黑龙江 · 牡丹江",
    "badge": "师范院校 · 青果",
    "systems": [
      {
        "id": "mdjnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.mdjnu.edu.cn/",
        "desc": "牡丹江师范学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "mdjmu",
    "name": "牡丹江医学院",
    "shortName": "MMU / 牡医",
    "pinyin": "mudanjiangyixueyuan mmu my mudanjiangyi",
    "region": "黑龙江 · 牡丹江",
    "badge": "医学本科",
    "systems": [
      {
        "id": "mdjmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.mdjmu.edu.cn/",
        "desc": "牡丹江医学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hrbcu",
    "name": "哈尔滨商业大学",
    "shortName": "HSD / 哈商大",
    "pinyin": "haerbinshangyedaxue hsd hsd hashada",
    "region": "黑龙江 · 哈尔滨",
    "badge": "商科重点",
    "systems": [
      {
        "id": "hrbcu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hrbcu.edu.cn/",
        "desc": "哈尔滨商业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hljucm",
    "name": "黑龙江中医药大学",
    "shortName": "HLJUCM / 龙中医",
    "pinyin": "heilongjiangzhongyiyaodaxue hljucm lzy longzhongyi",
    "region": "黑龙江 · 哈尔滨",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "hljucm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hljucm.net/",
        "desc": "黑龙江中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hljit",
    "name": "黑龙江工程学院",
    "shortName": "HLJIT / 黑工程",
    "pinyin": "heilongjianggongchengxueyuan hljit hgc heigongcheng",
    "region": "黑龙江 · 哈尔滨",
    "badge": "公办工程",
    "systems": [
      {
        "id": "hljit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hljit.edu.cn/",
        "desc": "黑龙江工程学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "shuihua",
    "name": "绥化学院",
    "shortName": "SHU / 绥院",
    "pinyin": "suihuaxueyuan shu sy suihua",
    "region": "黑龙江 · 绥化",
    "badge": "公办本科",
    "systems": [
      {
        "id": "shuihua_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.shxy.edu.cn/",
        "desc": "绥化学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "fdu",
    "name": "复旦大学",
    "shortName": "FDU / 复旦",
    "pinyin": "fudandaxue fdu fd fudan",
    "region": "上海 · 杨浦",
    "badge": "C9 · 985 · 双一流",
    "systems": [
      {
        "id": "fdu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwfw.fudan.edu.cn/eams/",
        "desc": "复旦大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sjtu",
    "name": "上海交通大学",
    "shortName": "SJTU / 上海交大",
    "pinyin": "shanghaijiaotongdaxue sjtu sjd shanghaijiaoda jaccount",
    "region": "上海 · 闵行",
    "badge": "C9 · 985 · 双一流",
    "systems": [
      {
        "id": "sjtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://i.sjtu.edu.cn/",
        "desc": "上海交通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tongji",
    "name": "同济大学",
    "shortName": "Tongji / 同济",
    "pinyin": "tongjidaxue tongji tj tongji",
    "region": "上海 · 杨浦",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "tongji_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://1.tongji.edu.cn/",
        "desc": "同济大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ecnu",
    "name": "华东师范大学",
    "shortName": "ECNU / 华东师大",
    "pinyin": "huadongshifandaxue ecnu hdsd huadongshida",
    "region": "上海 · 闵行",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "ecnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxx.ecnu.edu.cn/",
        "desc": "华东师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ecust",
    "name": "华东理工大学",
    "shortName": "ECUST / 华理",
    "pinyin": "huadongligongdaxue ecust hl huali",
    "region": "上海 · 徐汇",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "ecust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://eams.ecust.edu.cn/",
        "desc": "华东理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "shu",
    "name": "上海大学",
    "shortName": "SHU / 上大",
    "pinyin": "shanghaidaxue shu sd shangda",
    "region": "上海 · 宝山",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "shu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://cj.shu.edu.cn/",
        "desc": "上海大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sufe",
    "name": "上海财经大学",
    "shortName": "SUFE / 上财",
    "pinyin": "shanghaicaijingdaxue sufe sc shangcai",
    "region": "上海 · 杨浦",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "sufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://eams.sufe.edu.cn/",
        "desc": "上海财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dhu",
    "name": "东华大学",
    "shortName": "DHU / 东华",
    "pinyin": "donghuadaxue dhu dh donghua",
    "region": "上海 · 松江",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "dhu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.dhu.edu.cn/",
        "desc": "东华大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "usst",
    "name": "上海理工大学",
    "shortName": "USST / 上理工",
    "pinyin": "shanghailigongdaxue usst slg shangligong",
    "region": "上海 · 杨浦",
    "badge": "市属重点",
    "systems": [
      {
        "id": "usst_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.usst.edu.cn/",
        "desc": "上海理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "shnu",
    "name": "上海师范大学",
    "shortName": "SHNU / 上师大",
    "pinyin": "shanghaishifandaxue shnu ssd shangshida",
    "region": "上海 · 徐汇",
    "badge": "重点师范",
    "systems": [
      {
        "id": "shnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.shnu.edu.cn/",
        "desc": "上海师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sisu",
    "name": "上海外国语大学",
    "shortName": "SISU / 上外",
    "pinyin": "shanghaiwaiguoyudaxue sisu sw shangwai",
    "region": "上海 · 虹口",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "sisu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.shisu.edu.cn/",
        "desc": "上海外国语大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ecupl",
    "name": "华东政法大学",
    "shortName": "ECUPL / 华政",
    "pinyin": "huadongzhengfadaxue ecupl hz huazheng",
    "region": "上海 · 松江",
    "badge": "政法名校",
    "systems": [
      {
        "id": "ecupl_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ecupl.edu.cn/",
        "desc": "华东政法大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "smu_sh",
    "name": "上海海事大学",
    "shortName": "SMU / 上海海事",
    "pinyin": "shanghaihaishidaxue smu shhs shanghaihaishi",
    "region": "上海 · 浦东",
    "badge": "航海特色",
    "systems": [
      {
        "id": "smu_sh_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.shmtu.edu.cn/",
        "desc": "上海海事大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "shou",
    "name": "上海海洋大学",
    "shortName": "SHOU / 上海海洋",
    "pinyin": "shanghaihaiyangdaxue shou shhy shanghaihaiyang",
    "region": "上海 · 浦东",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "shou_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.shou.edu.cn/",
        "desc": "上海海洋大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "shutcm",
    "name": "上海中医药大学",
    "shortName": "SHUTCM / 上中医",
    "pinyin": "shanghaizhongyiyaodaxue shutcm szy shangzhongyi",
    "region": "上海 · 浦东",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "shutcm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.shutcm.edu.cn/",
        "desc": "上海中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sues",
    "name": "上海工程技术大学",
    "shortName": "SUES / 程大",
    "pinyin": "shanghaigongchengjishudaxue sues cd chengda",
    "region": "上海 · 松江",
    "badge": "应用工科",
    "systems": [
      {
        "id": "sues_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sues.edu.cn/",
        "desc": "上海工程技术大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sit",
    "name": "上海应用技术大学",
    "shortName": "SIT / 上应大",
    "pinyin": "shanghaiyingyongjishudaxue sit syd shangyingda",
    "region": "上海 · 奉贤",
    "badge": "公办应用",
    "systems": [
      {
        "id": "sit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sit.edu.cn/",
        "desc": "上海应用技术大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "suep",
    "name": "上海电力大学",
    "shortName": "SUEP / 上电",
    "pinyin": "shanghaidianlidaxue suep sd shangdian",
    "region": "上海 · 浦东",
    "badge": "电力特色",
    "systems": [
      {
        "id": "suep_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.shiep.edu.cn/",
        "desc": "上海电力大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lixin",
    "name": "上海立信会计金融学院",
    "shortName": "SLBF / 立信",
    "pinyin": "shanghailixinhuijijinrongxueyuan slbf lx lixin",
    "region": "上海 · 浦东",
    "badge": "财经特色",
    "systems": [
      {
        "id": "lixin_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lixin.edu.cn/",
        "desc": "上海立信会计金融学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nju",
    "name": "南京大学",
    "shortName": "NJU / 南大",
    "pinyin": "nanjingdaxue nju nd nanda",
    "region": "江苏 · 鼓楼",
    "badge": "C9 · 985 · 双一流",
    "systems": [
      {
        "id": "nju_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.nju.edu.cn/",
        "desc": "南京大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "seu",
    "name": "东南大学",
    "shortName": "SEU / 东大",
    "pinyin": "dongnandaxue seu dd dongnan",
    "region": "江苏 · 玄武",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "seu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.seu.edu.cn/",
        "desc": "东南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nuaa",
    "name": "南京航空航天大学",
    "shortName": "NUAA / 南航",
    "pinyin": "nanjinghangkonghangtiandaxue nuaa nh nanhang",
    "region": "江苏 · 秦淮",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "nuaa_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nuaa.edu.cn/",
        "desc": "南京航空航天大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nust",
    "name": "南京理工大学",
    "shortName": "NUST / 南理工",
    "pinyin": "nanjingligongdaxue nust nlg nanligong",
    "region": "江苏 · 玄武",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "nust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.njust.edu.cn/",
        "desc": "南京理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "suda",
    "name": "苏州大学",
    "shortName": "Soochow / 苏大",
    "pinyin": "suzhoudaxue suda sd suda",
    "region": "江苏 · 苏州",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "suda_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://xk.suda.edu.cn/",
        "desc": "苏州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hhu",
    "name": "河海大学",
    "shortName": "HHU / 河海",
    "pinyin": "hehaidaxue hhu hh hehai",
    "region": "江苏 · 鼓楼",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "hhu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hhu.edu.cn/",
        "desc": "河海大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jiangnan",
    "name": "江南大学",
    "shortName": "Jiangnan / 江大",
    "pinyin": "jiangnandaxue jiangnan jd jiangnan",
    "region": "江苏 · 无锡",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "jiangnan_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.jiangnan.edu.cn/",
        "desc": "江南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "njnu",
    "name": "南京师范大学",
    "shortName": "NNU / 南师大",
    "pinyin": "nanjingshifandaxue nnu nsd nanshida qingguo",
    "region": "江苏 · 栖霞",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "njnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.njnu.edu.cn/",
        "desc": "南京师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ujs",
    "name": "江苏大学",
    "shortName": "UJS / 江大",
    "pinyin": "jiangsudaxue ujs jd jiangda",
    "region": "江苏 · 镇江",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "ujs_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ujs.edu.cn/",
        "desc": "江苏大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "yzu",
    "name": "扬州大学",
    "shortName": "YZU / 扬大",
    "pinyin": "yangzhoudaxue yzu yd yangda",
    "region": "江苏 · 扬州",
    "badge": "省属重点",
    "systems": [
      {
        "id": "yzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.yzu.edu.cn/",
        "desc": "扬州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "njupt",
    "name": "南京邮电大学",
    "shortName": "NJUPT / 南邮",
    "pinyin": "nanjingyoudiandaxue njupt ny nanyou",
    "region": "江苏 · 栖霞",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "njupt_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.njupt.edu.cn/",
        "desc": "南京邮电大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nuist",
    "name": "南京信息工程大学",
    "shortName": "NUIST / 南信大",
    "pinyin": "nanjingxinxigongchengdaxue nuist nxd nanxinda",
    "region": "江苏 · 浦口",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "nuist_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nuist.edu.cn/",
        "desc": "南京信息工程大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "njtech",
    "name": "南京工业大学",
    "shortName": "NJTECH / 南工大",
    "pinyin": "nanjinggongyedaxue njtech ngd nangongda",
    "region": "江苏 · 江北",
    "badge": "省属重点",
    "systems": [
      {
        "id": "njtech_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.njtech.edu.cn/",
        "desc": "南京工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nau",
    "name": "南京审计大学",
    "shortName": "NAU / 南审",
    "pinyin": "nanjingshenjidaxue nau ns nanshen",
    "region": "江苏 · 浦口",
    "badge": "审计特色",
    "systems": [
      {
        "id": "nau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nau.edu.cn/",
        "desc": "南京审计大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cczu",
    "name": "常州大学",
    "shortName": "CZU / 常大",
    "pinyin": "changzhoudaxue czu cd changda",
    "region": "江苏 · 常州",
    "badge": "省部共建",
    "systems": [
      {
        "id": "cczu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cczu.edu.cn/",
        "desc": "常州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nfu",
    "name": "南京林业大学",
    "shortName": "NFU / 南林",
    "pinyin": "nanjinglinyedaxue nfu nl nanlin",
    "region": "江苏 · 玄武",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "nfu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.njfu.edu.cn/",
        "desc": "南京林业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "just",
    "name": "江苏科技大学",
    "shortName": "JUST / 江科大",
    "pinyin": "jiangsukejidaxue just jkd jiangkeda",
    "region": "江苏 · 镇江",
    "badge": "船舶特色",
    "systems": [
      {
        "id": "just_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.just.edu.cn/",
        "desc": "江苏科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ntu",
    "name": "南通大学",
    "shortName": "NTU / 通大",
    "pinyin": "nantongdaxue ntu td tongda",
    "region": "江苏 · 南通",
    "badge": "综合重点",
    "systems": [
      {
        "id": "ntu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ntu.edu.cn/",
        "desc": "南通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xzmu",
    "name": "徐州医科大学",
    "shortName": "XZMU / 徐医大",
    "pinyin": "xuzhouyikedaxue xzmu xyd xuyida",
    "region": "江苏 · 徐州",
    "badge": "医学重点",
    "systems": [
      {
        "id": "xzmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xzhmu.edu.cn/",
        "desc": "徐州医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "njucm",
    "name": "南京中医药大学",
    "shortName": "NJUCM / 南中医",
    "pinyin": "nanjingzhongyiyaodaxue njucm nzy nanzhongyi",
    "region": "江苏 · 栖霞",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "njucm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.njucm.edu.cn/",
        "desc": "南京中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "njmu",
    "name": "南京医科大学",
    "shortName": "NJMU / 南医大",
    "pinyin": "nanjingyikedaxue njmu nyd nanyida",
    "region": "江苏 · 江宁",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "njmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.njmu.edu.cn/",
        "desc": "南京医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nufe",
    "name": "南京财经大学",
    "shortName": "NUFE / 南财",
    "pinyin": "nanjingcaijingdaxue nufe nc nancai",
    "region": "江苏 · 栖霞",
    "badge": "财经重点",
    "systems": [
      {
        "id": "nufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.nufe.edu.cn/",
        "desc": "南京财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "usts",
    "name": "苏州科技大学",
    "shortName": "USTS / 苏科大",
    "pinyin": "suzhoukejidaxue usts skd sukeda",
    "region": "江苏 · 苏州",
    "badge": "公办重点",
    "systems": [
      {
        "id": "usts_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.usts.edu.cn/",
        "desc": "苏州科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xjtlu",
    "name": "西交利物浦大学",
    "shortName": "XJTLU / 西浦",
    "pinyin": "xijiaoliwupudaxue xjtlu xp xipu",
    "region": "江苏 · 苏州",
    "badge": "中外合办名校",
    "systems": [
      {
        "id": "xjtlu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://e-bridge.xjtlu.edu.cn/",
        "desc": "西交利物浦大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "yctu",
    "name": "盐城工学院",
    "shortName": "YCIT / 盐工",
    "pinyin": "yanchenggongxueyuan ycit yg yangong",
    "region": "江苏 · 盐城",
    "badge": "工程本科",
    "systems": [
      {
        "id": "yctu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ycit.edu.cn/",
        "desc": "盐城工学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hyit",
    "name": "淮阴工学院",
    "shortName": "HYIT / 淮工",
    "pinyin": "huaiyingongxueyuan hyit hg huaigong",
    "region": "江苏 · 淮安",
    "badge": "公办工科",
    "systems": [
      {
        "id": "hyit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hyit.edu.cn/",
        "desc": "淮阴工学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cslg",
    "name": "常熟理工学院",
    "shortName": "CSLG / 常熟理工",
    "pinyin": "changshuligongxueyuan cslg cslg changshuligong",
    "region": "江苏 · 苏州",
    "badge": "公办应用",
    "systems": [
      {
        "id": "cslg_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cslg.edu.cn/",
        "desc": "常熟理工学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zju",
    "name": "浙江大学",
    "shortName": "ZJU / 浙大",
    "pinyin": "zhejiangdaxue zju zd zheda",
    "region": "浙江 · 杭州",
    "badge": "C9 · 985 · 双一流",
    "systems": [
      {
        "id": "zju_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwbinfosys.zju.edu.cn/",
        "desc": "浙江大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nbu",
    "name": "宁波大学",
    "shortName": "NBU / 宁大",
    "pinyin": "ningbodaxue nbu nd ningda",
    "region": "浙江 · 宁波",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "nbu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.nbu.edu.cn/",
        "desc": "宁波大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zjut",
    "name": "浙江工业大学",
    "shortName": "ZJUT / 浙工大",
    "pinyin": "zhejianggongyedaxue zjut zgd zhegongda",
    "region": "浙江 · 杭州",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "zjut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://www.gdjw.zjut.edu.cn/",
        "desc": "浙江工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hdu",
    "name": "杭州电子科技大学",
    "shortName": "HDU / 杭电",
    "pinyin": "hangzhoudianzikejidaxue hdu hd hangdian",
    "region": "浙江 · 杭州",
    "badge": "特色高水平",
    "systems": [
      {
        "id": "hdu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.hdu.edu.cn/",
        "desc": "杭州电子科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zstu",
    "name": "浙江理工大学",
    "shortName": "ZSTU / 浙理工",
    "pinyin": "zhejiangligongdaxue zstu zlg zheligong",
    "region": "浙江 · 杭州",
    "badge": "省属重点",
    "systems": [
      {
        "id": "zstu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.zstu.edu.cn/",
        "desc": "浙江理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zafu",
    "name": "浙江农林大学",
    "shortName": "ZAFU / 浙农林",
    "pinyin": "zhejiangnonglindaxue zafu znl zhenonglin",
    "region": "浙江 · 杭州",
    "badge": "特色重点",
    "systems": [
      {
        "id": "zafu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.zafu.edu.cn/",
        "desc": "浙江农林大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zcmu",
    "name": "浙江中医药大学",
    "shortName": "ZCMU / 浙中医",
    "pinyin": "zhejiangzhongyiyaodaxue zcmu zzy zhezhongyi",
    "region": "浙江 · 杭州",
    "badge": "医学高水平",
    "systems": [
      {
        "id": "zcmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.zcmu.edu.cn/",
        "desc": "浙江中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zjnu",
    "name": "浙江师范大学",
    "shortName": "ZJNU / 浙师大",
    "pinyin": "zhejiangshifandaxue zjnu zsd zheshida",
    "region": "浙江 · 金华",
    "badge": "重点师范",
    "systems": [
      {
        "id": "zjnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.zjnu.edu.cn/",
        "desc": "浙江师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "wmu",
    "name": "温州医科大学",
    "shortName": "WMU / 温医大",
    "pinyin": "wenzhouyikedaxue wmu wyd wenyida",
    "region": "浙江 · 温州",
    "badge": "医学名校",
    "systems": [
      {
        "id": "wmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.wmu.edu.cn/",
        "desc": "温州医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "wzu",
    "name": "温州大学",
    "shortName": "WZU / 温大",
    "pinyin": "wenzhoudaxue wzu wd wenda",
    "region": "浙江 · 温州",
    "badge": "省属重点",
    "systems": [
      {
        "id": "wzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.wzu.edu.cn/",
        "desc": "温州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hznu",
    "name": "杭州师范大学",
    "shortName": "HZNU / 杭师大",
    "pinyin": "hangzhoushifandaxue hznu hsd hangshida",
    "region": "浙江 · 杭州",
    "badge": "省属重点",
    "systems": [
      {
        "id": "hznu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hznu.edu.cn/",
        "desc": "杭州师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cjlu",
    "name": "中国计量大学",
    "shortName": "CJLU / 计量",
    "pinyin": "zhongguojiliangdaxue cjlu jl jiliang",
    "region": "浙江 · 杭州",
    "badge": "计量特色重点",
    "systems": [
      {
        "id": "cjlu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cjlu.edu.cn/",
        "desc": "中国计量大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jxu",
    "name": "嘉兴大学",
    "shortName": "JXU / 嘉大",
    "pinyin": "jiaxingdaxue jxu jd jiada",
    "region": "浙江 · 嘉兴",
    "badge": "公办综合",
    "systems": [
      {
        "id": "jxu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.zjxu.edu.cn/",
        "desc": "嘉兴大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "usx",
    "name": "绍兴文理学院",
    "shortName": "USX / 绍文理",
    "pinyin": "shaoxingwenlixueyuan usx swl shaowenli",
    "region": "浙江 · 绍兴",
    "badge": "公办本科",
    "systems": [
      {
        "id": "usx_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.usx.edu.cn/",
        "desc": "绍兴文理学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ustc",
    "name": "中国科学技术大学",
    "shortName": "USTC / 中科大",
    "pinyin": "zhongguokexuejishudaxue ustc zkd ked zhongkeda",
    "region": "安徽 · 合肥",
    "badge": "C9 · 985 · 双一流",
    "systems": [
      {
        "id": "ustc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://jw.ustc.edu.cn/",
        "desc": "中国科学技术大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hfut",
    "name": "合肥工业大学",
    "shortName": "HFUT / 合工大",
    "pinyin": "hefeigongyedaxue hfut hgd hegongda",
    "region": "安徽 · 合肥",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "hfut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.hfut.edu.cn/",
        "desc": "合肥工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ahu",
    "name": "安徽大学",
    "shortName": "AHU / 安大",
    "pinyin": "anhuidaxue ahu ad anda",
    "region": "安徽 · 合肥",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "ahu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.ahu.edu.cn/",
        "desc": "安徽大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ahut",
    "name": "安徽工业大学",
    "shortName": "AHUT / 安工大",
    "pinyin": "anhuigongyedaxue ahut agd angongda",
    "region": "安徽 · 马鞍山",
    "badge": "省属重点",
    "systems": [
      {
        "id": "ahut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ahut.edu.cn/",
        "desc": "安徽工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "aust",
    "name": "安徽理工大学",
    "shortName": "AUST / 安理大",
    "pinyin": "anhuiligongdaxue aust ald anlida",
    "region": "安徽 · 淮南",
    "badge": "煤炭特色",
    "systems": [
      {
        "id": "aust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.aust.edu.cn/",
        "desc": "安徽理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "aau",
    "name": "安徽农业大学",
    "shortName": "AAU / 安农大",
    "pinyin": "anhuinongyedaxue aau and annongda",
    "region": "安徽 · 合肥",
    "badge": "农林重点",
    "systems": [
      {
        "id": "aau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ahau.edu.cn/",
        "desc": "安徽农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ahmu",
    "name": "安徽医科大学",
    "shortName": "AHMU / 安医大",
    "pinyin": "anhuiyikedaxue ahmu ayd anyida",
    "region": "安徽 · 合肥",
    "badge": "医学重点",
    "systems": [
      {
        "id": "ahmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ahmu.edu.cn/",
        "desc": "安徽医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ahtcm",
    "name": "安徽中医药大学",
    "shortName": "AHTCM / 安中医",
    "pinyin": "anhuizhongyiyaodaxue ahtcm azy anzhongyi",
    "region": "安徽 · 合肥",
    "badge": "医学名校",
    "systems": [
      {
        "id": "ahtcm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ahtcm.edu.cn/",
        "desc": "安徽中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ahnu",
    "name": "安徽师范大学",
    "shortName": "AHNU / 安师大",
    "pinyin": "anhuishifandaxue ahnu asd anshida",
    "region": "安徽 · 芜湖",
    "badge": "重点师范",
    "systems": [
      {
        "id": "ahnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ahnu.edu.cn/",
        "desc": "安徽师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "fynu",
    "name": "阜阳师范大学",
    "shortName": "FYNU / 阜师大",
    "pinyin": "fuyangshifandaxue fynu fsd fuyangshida",
    "region": "安徽 · 阜阳",
    "badge": "省属师范",
    "systems": [
      {
        "id": "fynu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.fynu.edu.cn/",
        "desc": "阜阳师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "aqnu",
    "name": "安庆师范大学",
    "shortName": "AQNU / 安庆师大",
    "pinyin": "anqingshifandaxue aqnu aqsd anqingshida",
    "region": "安徽 · 安庆",
    "badge": "省属师范",
    "systems": [
      {
        "id": "aqnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.aqnu.edu.cn/",
        "desc": "安庆师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hbnu_ah",
    "name": "淮北师范大学",
    "shortName": "HBNU / 淮北师大",
    "pinyin": "huaibeishifandaxue hbnu hbsd huaibeishida",
    "region": "安徽 · 淮北",
    "badge": "重点师范",
    "systems": [
      {
        "id": "hbnu_ah_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hbnu.edu.cn/",
        "desc": "淮北师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ahjzu",
    "name": "安徽建筑大学",
    "shortName": "AHJZU / 安建大",
    "pinyin": "anhuijianzhadaxue ahjzu ajd anjianda",
    "region": "安徽 · 合肥",
    "badge": "土木特色",
    "systems": [
      {
        "id": "ahjzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ahjzu.edu.cn/",
        "desc": "安徽建筑大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xmu",
    "name": "厦门大学",
    "shortName": "XMU / 厦大",
    "pinyin": "xiamendaxue xmu xd xiada",
    "region": "福建 · 厦门",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "xmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xmu.edu.cn/",
        "desc": "厦门大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "fzu",
    "name": "福州大学",
    "shortName": "FZU / 福大",
    "pinyin": "fuzhoudaxue fzu fd fuda",
    "region": "福建 · 福州",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "fzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwch.fzu.edu.cn/",
        "desc": "福州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "fafu",
    "name": "福建农林大学",
    "shortName": "FAFU / 福建农林",
    "pinyin": "fujiannonglindaxue fafu fjnl fujiannonglin",
    "region": "福建 · 福州",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "fafu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.fafu.edu.cn/",
        "desc": "福建农林大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "fjnu",
    "name": "福建师范大学",
    "shortName": "FJNU / 福建师大",
    "pinyin": "fujianshifandaxue fjnu fjsd fujianshida",
    "region": "福建 · 福州",
    "badge": "重点师范",
    "systems": [
      {
        "id": "fjnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.fjnu.edu.cn/",
        "desc": "福建师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hqu",
    "name": "华侨大学",
    "shortName": "HQU / 华大",
    "pinyin": "huaqiaodaxue hqu hd huada",
    "region": "福建 · 泉州/厦门",
    "badge": "中央统战部直属",
    "systems": [
      {
        "id": "hqu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hqu.edu.cn/",
        "desc": "华侨大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "fjmu",
    "name": "福建医科大学",
    "shortName": "FJMU / 福医大",
    "pinyin": "fujianyikedaxue fjmu fyd fuyida",
    "region": "福建 · 福州",
    "badge": "医学名校",
    "systems": [
      {
        "id": "fjmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.fjmu.edu.cn/",
        "desc": "福建医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "fjutcm",
    "name": "福建中医药大学",
    "shortName": "FJTCM / 福中医",
    "pinyin": "fujianzhongyiyaodaxue fjtcm fzy fuzhongyi",
    "region": "福建 · 福州",
    "badge": "特色高水平",
    "systems": [
      {
        "id": "fjutcm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.fjtcm.edu.cn/",
        "desc": "福建中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jmu",
    "name": "集美大学",
    "shortName": "JMU / 集大",
    "pinyin": "jimeidaxue jmu jd jida",
    "region": "福建 · 厦门",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "jmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jmu.edu.cn/",
        "desc": "集美大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "mnnu",
    "name": "闽南师范大学",
    "shortName": "MNNU / 闽南师大",
    "pinyin": "minnanshifandaxue mnnu mnsd minnanshida",
    "region": "福建 · 漳州",
    "badge": "省属重点",
    "systems": [
      {
        "id": "mnnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.mnnu.edu.cn/",
        "desc": "闽南师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xmut",
    "name": "厦门理工学院",
    "shortName": "XMUT / 厦理工",
    "pinyin": "xiamenligongxueyuan xmut xlg xialigong",
    "region": "福建 · 厦门",
    "badge": "应用高水平",
    "systems": [
      {
        "id": "xmut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xmut.edu.cn/",
        "desc": "厦门理工学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "mju",
    "name": "闽江学院",
    "shortName": "MJU / 闽院",
    "pinyin": "minjiangxueyuan mju my minyuan",
    "region": "福建 · 福州",
    "badge": "应用本科",
    "systems": [
      {
        "id": "mju_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.mju.edu.cn/",
        "desc": "闽江学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ncu",
    "name": "南昌大学",
    "shortName": "NCU / 昌大",
    "pinyin": "nanchangdaxue ncu cd changda",
    "region": "江西 · 南昌",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "ncu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwc.ncu.edu.cn/",
        "desc": "南昌大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jxnu",
    "name": "江西师范大学",
    "shortName": "JXNU / 江西师大",
    "pinyin": "jiangxishifandaxue jxnu jxsd jiangxishida",
    "region": "江西 · 南昌",
    "badge": "重点师范",
    "systems": [
      {
        "id": "jxnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwc.jxnu.edu.cn/",
        "desc": "江西师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jufe",
    "name": "江西财经大学",
    "shortName": "JUFE / 江财",
    "pinyin": "jiangxicaijingdaxue jufe jc jiangcai",
    "region": "江西 · 南昌",
    "badge": "财经名校",
    "systems": [
      {
        "id": "jufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.jxufe.edu.cn/",
        "desc": "江西财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ecjtu",
    "name": "华东交通大学",
    "shortName": "ECJTU / 华东交大",
    "pinyin": "huadongjiaotongdaxue ecjtu hdjd huadongjiaoda",
    "region": "江西 · 南昌",
    "badge": "轨道交通重点",
    "systems": [
      {
        "id": "ecjtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ecjtu.edu.cn/",
        "desc": "华东交通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nchu",
    "name": "南昌航空大学",
    "shortName": "NCHU / 昌航",
    "pinyin": "nanchanghangkongdaxue nchu ch changhang",
    "region": "江西 · 南昌",
    "badge": "航空航天特色",
    "systems": [
      {
        "id": "nchu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.nchu.edu.cn/",
        "desc": "南昌航空大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ecut",
    "name": "东华理工大学",
    "shortName": "ECUT / 东华理工",
    "pinyin": "donghualigongdaxue ecut dhlg donghualigong",
    "region": "江西 · 南昌",
    "badge": "核工特色",
    "systems": [
      {
        "id": "ecut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ecut.edu.cn/",
        "desc": "东华理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jxust",
    "name": "江西理工大学",
    "shortName": "JXUST / 江理",
    "pinyin": "jiangxiligongdaxue jxust jl jiangli",
    "region": "江西 · 赣州",
    "badge": "有色金属重点",
    "systems": [
      {
        "id": "jxust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jxust.edu.cn/",
        "desc": "江西理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jxau",
    "name": "江西农业大学",
    "shortName": "JXAU / 江农",
    "pinyin": "jiangxinongyedaxue jxau jn jiangnong",
    "region": "江西 · 南昌",
    "badge": "农科高水平",
    "systems": [
      {
        "id": "jxau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jxau.edu.cn/",
        "desc": "江西农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jxutcm",
    "name": "江西中医药大学",
    "shortName": "JXTCM / 江中医",
    "pinyin": "jiangxizhongyiyaodaxue jxtcm jzy jiangzhongyi",
    "region": "江西 · 南昌",
    "badge": "中药名校",
    "systems": [
      {
        "id": "jxutcm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jxutcm.edu.cn/",
        "desc": "江西中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jci",
    "name": "景德镇陶瓷大学",
    "shortName": "JCI / 陶大",
    "pinyin": "jingdezbentaocidaxue jci td taoda",
    "region": "江西 · 景德镇",
    "badge": "陶瓷特色重点",
    "systems": [
      {
        "id": "jci_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jci.edu.cn/",
        "desc": "景德镇陶瓷大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gnnu",
    "name": "赣南师范大学",
    "shortName": "GNNU / 赣南师大",
    "pinyin": "gannanshifandaxue gnnu gnsd gannanshida",
    "region": "江西 · 赣州",
    "badge": "师范重点",
    "systems": [
      {
        "id": "gnnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gnnu.edu.cn/",
        "desc": "赣南师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jju",
    "name": "九江学院",
    "shortName": "JJU / 九院",
    "pinyin": "jiujiangxueyuan jju jy jiuyuan",
    "region": "江西 · 九江",
    "badge": "公办本科",
    "systems": [
      {
        "id": "jju_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jju.edu.cn/",
        "desc": "九江学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ycu",
    "name": "宜春学院",
    "shortName": "YCU / 宜春",
    "pinyin": "yichunxueyuan ycu yc yichun",
    "region": "江西 · 宜春",
    "badge": "综合本科",
    "systems": [
      {
        "id": "ycu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ycu.edu.cn/",
        "desc": "宜春学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jgsu",
    "name": "井冈山大学",
    "shortName": "JGSU / 井大",
    "pinyin": "jinggangshandaxue jgsu jd jingda",
    "region": "江西 · 吉安",
    "badge": "省部共建",
    "systems": [
      {
        "id": "jgsu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jgsu.edu.cn/",
        "desc": "井冈山大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sdu",
    "name": "山东大学",
    "shortName": "SDU / 山大",
    "pinyin": "shandongdaxue sdu sd shanda",
    "region": "山东 · 济南",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "sdu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://bkjw.sdu.edu.cn/",
        "desc": "山东大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ouc",
    "name": "中国海洋大学",
    "shortName": "OUC / 海大",
    "pinyin": "zhongguohaiyangdaxue ouc hd haida haiyang",
    "region": "山东 · 青岛",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "ouc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.ouc.edu.cn/",
        "desc": "中国海洋大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "upc",
    "name": "中国石油大学(华东)",
    "shortName": "UPC / 石大",
    "pinyin": "zhongguoshiyoudaxuehuadong upc sd shida",
    "region": "山东 · 青岛",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "upc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.upc.edu.cn/",
        "desc": "中国石油大学(华东)官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sdust",
    "name": "山东科技大学",
    "shortName": "SDUST / 山科大",
    "pinyin": "shandongkejidaxue sdust skd shankeda",
    "region": "山东 · 青岛",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "sdust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.sdust.edu.cn/",
        "desc": "山东科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qust",
    "name": "青岛科技大学",
    "shortName": "QUST / 青科大",
    "pinyin": "qingdaokejidaxue qust qkd qingkeda",
    "region": "山东 · 青岛",
    "badge": "化工橡胶重点",
    "systems": [
      {
        "id": "qust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.qust.edu.cn/",
        "desc": "青岛科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ujn",
    "name": "济南大学",
    "shortName": "UJN / 济大",
    "pinyin": "jinandaxue ujn jd jida",
    "region": "山东 · 济南",
    "badge": "综合重点",
    "systems": [
      {
        "id": "ujn_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ujn.edu.cn/",
        "desc": "济南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qut",
    "name": "青岛理工大学",
    "shortName": "QUT / 青理工",
    "pinyin": "qingdaoligongdaxue qut qlg qingligong",
    "region": "山东 · 青岛",
    "badge": "土建重点",
    "systems": [
      {
        "id": "qut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.qut.edu.cn/",
        "desc": "青岛理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sdjzu",
    "name": "山东建筑大学",
    "shortName": "SDJZU / 山建大",
    "pinyin": "shandongjianzhadaxue sdjzu sjd shanjianda",
    "region": "山东 · 济南",
    "badge": "建筑特色",
    "systems": [
      {
        "id": "sdjzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sdjzu.edu.cn/",
        "desc": "山东建筑大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qlu",
    "name": "齐鲁工业大学",
    "shortName": "QLU / 齐鲁工大",
    "pinyin": "qilugongyedaxue qlu qlgd qilugongda",
    "region": "山东 · 济南",
    "badge": "科学院融合",
    "systems": [
      {
        "id": "qlu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.qlu.edu.cn/",
        "desc": "齐鲁工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sdau",
    "name": "山东农业大学",
    "shortName": "SDAU / 山农大",
    "pinyin": "shandongnongyedaxue sdau snd shannongda",
    "region": "山东 · 泰安",
    "badge": "百年农业名校",
    "systems": [
      {
        "id": "sdau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sdau.edu.cn/",
        "desc": "山东农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qau",
    "name": "青岛农业大学",
    "shortName": "QAU / 青农大",
    "pinyin": "qingdaonongyedaxue qau qnd qingnongda",
    "region": "山东 · 青岛",
    "badge": "公办重点",
    "systems": [
      {
        "id": "qau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.qau.edu.cn/",
        "desc": "青岛农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sdmu_first",
    "name": "山东第一医科大学",
    "shortName": "SDFMU / 山一大",
    "pinyin": "shandongdiyiyikedaxue sdfmu syd shanyida",
    "region": "山东 · 济南",
    "badge": "医科重点",
    "systems": [
      {
        "id": "sdmu_first_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sdfmu.edu.cn/",
        "desc": "山东第一医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sdutcm",
    "name": "山东中医药大学",
    "shortName": "SDUTCM / 山中医",
    "pinyin": "shandongzhongyiyaodaxue sdutcm szy shanzhongyi",
    "region": "山东 · 济南",
    "badge": "医学名校",
    "systems": [
      {
        "id": "sdutcm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sdutcm.edu.cn/",
        "desc": "山东中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sdnu",
    "name": "山东师范大学",
    "shortName": "SDNU / 山师",
    "pinyin": "shandongshifandaxue sdnu ss shanshi",
    "region": "山东 · 济南",
    "badge": "重点师范",
    "systems": [
      {
        "id": "sdnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sdnu.edu.cn/",
        "desc": "山东师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qfnu",
    "name": "曲阜师范大学",
    "shortName": "QFNU / 曲师大",
    "pinyin": "qufushifandaxue qfnu qsd qushida",
    "region": "山东 · 日照/曲阜",
    "badge": "孔孟圣地名校",
    "systems": [
      {
        "id": "qfnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.qfnu.edu.cn/",
        "desc": "曲阜师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lcu",
    "name": "聊城大学",
    "shortName": "LCU / 聊大",
    "pinyin": "liaochengdaxue lcu ld liaoda",
    "region": "山东 · 聊城",
    "badge": "省属公办",
    "systems": [
      {
        "id": "lcu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lcu.edu.cn/",
        "desc": "聊城大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ldu",
    "name": "鲁东大学",
    "shortName": "LDU / 鲁东",
    "pinyin": "ludongdaxue ldu ld ludong",
    "region": "山东 · 烟台",
    "badge": "综合大学",
    "systems": [
      {
        "id": "ldu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ldu.edu.cn/",
        "desc": "鲁东大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lyu",
    "name": "临沂大学",
    "shortName": "LYU / 临大",
    "pinyin": "linyidaxue lyu ld linda",
    "region": "山东 · 临沂",
    "badge": "综合本科",
    "systems": [
      {
        "id": "lyu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lyu.edu.cn/",
        "desc": "临沂大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qdu",
    "name": "青岛大学",
    "shortName": "QDU / 青大",
    "pinyin": "qingdaodaxue qdu qd qingda",
    "region": "山东 · 青岛",
    "badge": "省属重点",
    "systems": [
      {
        "id": "qdu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.qdu.edu.cn/",
        "desc": "青岛大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ytu",
    "name": "烟台大学",
    "shortName": "YTU / 烟大",
    "pinyin": "yantaidaxue ytu yd yanda",
    "region": "山东 · 烟台",
    "badge": "北京大学清华大学共建",
    "systems": [
      {
        "id": "ytu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ytu.edu.cn/",
        "desc": "烟台大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "wfu",
    "name": "潍坊学院",
    "shortName": "WFU / 潍院",
    "pinyin": "weifangxueyuan wfu wy weiyuan",
    "region": "山东 · 潍坊",
    "badge": "公办本科",
    "systems": [
      {
        "id": "wfu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.wfu.edu.cn/",
        "desc": "潍坊学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zzu",
    "name": "郑州大学",
    "shortName": "ZZU / 郑大",
    "pinyin": "zhengzhoudaxue zzu zd zhengda",
    "region": "河南 · 郑州",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "zzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.zzu.edu.cn/",
        "desc": "郑州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "henu",
    "name": "河南大学",
    "shortName": "HENU / 河大",
    "pinyin": "henandaxue henu hd heda",
    "region": "河南 · 开封/郑州",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "henu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.henu.edu.cn/",
        "desc": "河南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "henannu",
    "name": "河南师范大学",
    "shortName": "HTU / 河师大",
    "pinyin": "henanshifandaxue htu hsd heshida qingguo",
    "region": "河南 · 新乡",
    "badge": "青果 · 重点高校",
    "systems": [
      {
        "id": "henannu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.htu.edu.cn/",
        "desc": "河南师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hpu",
    "name": "河南理工大学",
    "shortName": "HPU / 河南理工",
    "pinyin": "henanligongdaxue hpu hlg henanligong",
    "region": "河南 · 焦作",
    "badge": "煤炭历史名校",
    "systems": [
      {
        "id": "hpu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hpu.edu.cn/",
        "desc": "河南理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "haust",
    "name": "河南科技大学",
    "shortName": "HAUST / 河科大",
    "pinyin": "henankejidaxue haust hkd hekeda",
    "region": "河南 · 洛阳",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "haust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.haust.edu.cn/",
        "desc": "河南科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ncwu",
    "name": "华北水利水电大学",
    "shortName": "NCWU / 华水",
    "pinyin": "huabeishuilishuidiandaxue ncwu hs huashui",
    "region": "河南 · 郑州",
    "badge": "水利特色名校",
    "systems": [
      {
        "id": "ncwu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ncwu.edu.cn/",
        "desc": "华北水利水电大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zzuli",
    "name": "郑州轻工业大学",
    "shortName": "ZZULI / 郑州轻工业",
    "pinyin": "zhengzhouqinggongyedaxue zzuli zzqgy zhengqing",
    "region": "河南 · 郑州",
    "badge": "重点工科",
    "systems": [
      {
        "id": "zzuli_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.zzuli.edu.cn/",
        "desc": "郑州轻工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "henau",
    "name": "河南农业大学",
    "shortName": "HAU / 河南农大",
    "pinyin": "henannongyedaxue hau hnd henannongda",
    "region": "河南 · 郑州",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "henau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.henau.edu.cn/",
        "desc": "河南农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hactcm",
    "name": "河南中医药大学",
    "shortName": "HACTCM / 河中医",
    "pinyin": "henanzhongyiyaodaxue hactcm hzy hezhongyi",
    "region": "河南 · 郑州",
    "badge": "中医药特色",
    "systems": [
      {
        "id": "hactcm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hactcm.edu.cn/",
        "desc": "河南中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xynu",
    "name": "信阳师范大学",
    "shortName": "XYNU / 信阳师大",
    "pinyin": "xinyangshifandaxue xynu xysd xinyangshida",
    "region": "河南 · 信阳",
    "badge": "师范重点",
    "systems": [
      {
        "id": "xynu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xynu.edu.cn/",
        "desc": "信阳师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zut",
    "name": "中原工学院",
    "shortName": "ZUT / 中工",
    "pinyin": "zhongyangongxueyuan zut zg zhonggong",
    "region": "河南 · 郑州",
    "badge": "纺织工程重点",
    "systems": [
      {
        "id": "zut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.zut.edu.cn/",
        "desc": "中原工学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "haut",
    "name": "河南工业大学",
    "shortName": "HAUT / 河南工大",
    "pinyin": "henangongyedaxue haut hgd henangongda",
    "region": "河南 · 郑州",
    "badge": "粮食工程重点",
    "systems": [
      {
        "id": "haut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.haut.edu.cn/",
        "desc": "河南工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nlit",
    "name": "南阳理工学院",
    "shortName": "NYIST / 南阳理工",
    "pinyin": "nanyangligongxueyuan nyist nylg nanyangligong",
    "region": "河南 · 南阳",
    "badge": "工程应用本科",
    "systems": [
      {
        "id": "nlit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.nyist.edu.cn/",
        "desc": "南阳理工学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xxmu",
    "name": "新乡医学院",
    "shortName": "XXMU / 新医",
    "pinyin": "xinxiangyixueyuan xxmu xy xinyi",
    "region": "河南 · 新乡",
    "badge": "独立医学院",
    "systems": [
      {
        "id": "xxmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xxmu.edu.cn/",
        "desc": "新乡医学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "pdsxy",
    "name": "平顶山学院",
    "shortName": "PDSU / 平院",
    "pinyin": "pingdingshanxueyuan pdsu py pingyuan",
    "region": "河南 · 平顶山",
    "badge": "公办应用",
    "systems": [
      {
        "id": "pdsxy_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.pdsu.edu.cn/",
        "desc": "平顶山学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "whu",
    "name": "武汉大学",
    "shortName": "WHU / 武大",
    "pinyin": "wuhandaxue whu wd wuda",
    "region": "湖北 · 武汉",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "whu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://bkzs.whu.edu.cn/",
        "desc": "武汉大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hust",
    "name": "华中科技大学",
    "shortName": "HUST / 华科",
    "pinyin": "huazhongkejidaxue hust hk huake huakeji",
    "region": "湖北 · 武汉",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "hust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://hub.m.hust.edu.cn/",
        "desc": "华中科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "whut",
    "name": "武汉理工大学",
    "shortName": "WUT / 武理工",
    "pinyin": "wuhanligongdaxue wut wlg wuligong",
    "region": "湖北 · 武汉",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "whut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.whut.edu.cn/",
        "desc": "武汉理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hzau",
    "name": "华中农业大学",
    "shortName": "HZAU / 华农",
    "pinyin": "huazhongnongyedaxue hzau hn huanong",
    "region": "湖北 · 武汉",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "hzau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hzau.edu.cn/",
        "desc": "华中农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ccnu",
    "name": "华中师范大学",
    "shortName": "CCNU / 华中师大",
    "pinyin": "huazhongshifandaxue ccnu hzsd huazhongshida",
    "region": "湖北 · 武汉",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "ccnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://xk.ccnu.edu.cn/",
        "desc": "华中师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zuel",
    "name": "中南财经政法大学",
    "shortName": "ZUEL / 中南大",
    "pinyin": "zhongnancaijingzhengfadaxue zuel znd zhongnandaxue",
    "region": "湖北 · 武汉",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "zuel_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.zuel.edu.cn/",
        "desc": "中南财经政法大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cug",
    "name": "中国地质大学(武汉)",
    "shortName": "CUG / 地大",
    "pinyin": "zhongguodizhidaxuewuhan cug dd dida",
    "region": "湖北 · 武汉",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "cug_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.cug.edu.cn/",
        "desc": "中国地质大学(武汉)官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hubu",
    "name": "湖北大学",
    "shortName": "HUBU / 湖大",
    "pinyin": "hubeidaxue hubu hd huda",
    "region": "湖北 · 武汉",
    "badge": "省属重点",
    "systems": [
      {
        "id": "hubu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hubu.edu.cn/",
        "desc": "湖北大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "wust",
    "name": "武汉科技大学",
    "shortName": "WUST / 武科大",
    "pinyin": "wuhankejidaxue wust wkd wukeda",
    "region": "湖北 · 武汉",
    "badge": "冶金特色重点",
    "systems": [
      {
        "id": "wust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.wust.edu.cn/",
        "desc": "武汉科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "yangtzeu",
    "name": "长江大学",
    "shortName": "YU / 长大",
    "pinyin": "changjiangdaxue yu cd changda",
    "region": "湖北 · 荆州/武汉",
    "badge": "石油与农科重点",
    "systems": [
      {
        "id": "yangtzeu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.yangtzeu.edu.cn/",
        "desc": "长江大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jhun",
    "name": "江汉大学",
    "shortName": "JHUN / 江大",
    "pinyin": "jianghandaxue jhun jd jiangda",
    "region": "湖北 · 武汉",
    "badge": "市属高水平",
    "systems": [
      {
        "id": "jhun_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.jhun.edu.cn/",
        "desc": "江汉大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ctgu",
    "name": "三峡大学",
    "shortName": "CTGU / 三大",
    "pinyin": "sanxiadaxue ctgu sd sanda",
    "region": "湖北 · 宜昌",
    "badge": "水利电力重点",
    "systems": [
      {
        "id": "ctgu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ctgu.edu.cn/",
        "desc": "三峡大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "wit",
    "name": "武汉工程大学",
    "shortName": "WIT / 武工大",
    "pinyin": "wuhangongchengdaxue wit wgd wugongda",
    "region": "湖北 · 武汉",
    "badge": "化工特色",
    "systems": [
      {
        "id": "wit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.wit.edu.cn/",
        "desc": "武汉工程大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hbut",
    "name": "湖北工业大学",
    "shortName": "HBUT / 湖工大",
    "pinyin": "hubeigongyedaxue hbut hgd hugongda",
    "region": "湖北 · 武汉",
    "badge": "工程重点",
    "systems": [
      {
        "id": "hbut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hbut.edu.cn/",
        "desc": "湖北工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "wtu",
    "name": "武汉纺织大学",
    "shortName": "WTU / 纺大",
    "pinyin": "wuhanfangzhidaxue wtu fd fangda",
    "region": "湖北 · 武汉",
    "badge": "纺织特色",
    "systems": [
      {
        "id": "wtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.wtu.edu.cn/",
        "desc": "武汉纺织大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hbtcmu",
    "name": "湖北中医药大学",
    "shortName": "HBTCM / 湖中医",
    "pinyin": "hubeizhongyiyaodaxue hbtcm hzy huzhongyi",
    "region": "湖北 · 武汉",
    "badge": "中医药特色",
    "systems": [
      {
        "id": "hbtcmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hbtcm.edu.cn/",
        "desc": "湖北中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hbnu",
    "name": "湖北师范大学",
    "shortName": "HBNU / 湖师大",
    "pinyin": "hubeishifandaxue hbnu hsd hushida",
    "region": "湖北 · 黄石",
    "badge": "重点师范",
    "systems": [
      {
        "id": "hbnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hbnu.edu.cn/",
        "desc": "湖北师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "csu",
    "name": "中南大学",
    "shortName": "CSU / 中南",
    "pinyin": "zhongnandaxue csu zn zhongnan",
    "region": "湖南 · 长沙",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "csu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://csujwc.its.csu.edu.cn/",
        "desc": "中南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hnu",
    "name": "湖南大学",
    "shortName": "HNU / 湖大",
    "pinyin": "hunandaxue hnu hd huda",
    "region": "湖南 · 长沙",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "hnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hnu.edu.cn/",
        "desc": "湖南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hunnu",
    "name": "湖南师范大学",
    "shortName": "HUNNU / 湖师大",
    "pinyin": "hunanshifandaxue hunnu hsd hushida qingguo",
    "region": "湖南 · 长沙",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "hunnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://jw.hunnu.edu.cn/",
        "desc": "湖南师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "csust",
    "name": "长沙理工大学",
    "shortName": "CSUST / 长理",
    "pinyin": "changshaligongdaxue csust cl changli qiangzhi",
    "region": "湖南 · 长沙",
    "badge": "强智系统",
    "systems": [
      {
        "id": "csust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://xk.csust.edu.cn/",
        "desc": "长沙理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hunau",
    "name": "湖南农业大学",
    "shortName": "HUNAU / 湖南农大",
    "pinyin": "hunannongyedaxue hunau hnd hunannongda qiangzhi",
    "region": "湖南 · 长沙",
    "badge": "省属重点",
    "systems": [
      {
        "id": "hunau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hunau.edu.cn/",
        "desc": "湖南农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "csuft",
    "name": "中南林业科技大学",
    "shortName": "CSUFT / 中南林",
    "pinyin": "zhongnanlinyekejidaxue csuft znl zhongnanlin",
    "region": "湖南 · 长沙",
    "badge": "林业高水平",
    "systems": [
      {
        "id": "csuft_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.csuft.edu.cn/",
        "desc": "中南林业科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xtu",
    "name": "湘潭大学",
    "shortName": "XTU / 湘大",
    "pinyin": "xiangtandaxue xtu xd xiangda",
    "region": "湖南 · 湘潭",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "xtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.xtu.edu.cn/",
        "desc": "湘潭大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hnust",
    "name": "湖南科技大学",
    "shortName": "HNUST / 湖科大",
    "pinyin": "hunankejidaxue hnust hkd hukeda qiangzhi",
    "region": "湖南 · 湘潭",
    "badge": "强智系统",
    "systems": [
      {
        "id": "hnust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://kdjw.hnust.edu.cn/",
        "desc": "湖南科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "usc",
    "name": "南华大学",
    "shortName": "USC / 南华",
    "pinyin": "nanhuadaxue usc nh nanhua qiangzhi",
    "region": "湖南 · 衡阳",
    "badge": "核工医学重点",
    "systems": [
      {
        "id": "usc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.usc.edu.cn/",
        "desc": "南华大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jsu_hn",
    "name": "吉首大学",
    "shortName": "JSU / 吉大",
    "pinyin": "jishoudaxue jsu jd jishou qiangzhi",
    "region": "湖南 · 吉首",
    "badge": "民族重点",
    "systems": [
      {
        "id": "jsu_hn_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.jsu.edu.cn/",
        "desc": "吉首大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hut",
    "name": "湖南工业大学",
    "shortName": "HUT / 湖工大",
    "pinyin": "hunangongyedaxue hut hgd hugongda",
    "region": "湖南 · 株洲",
    "badge": "包装特色高水平",
    "systems": [
      {
        "id": "hut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hut.edu.cn/",
        "desc": "湖南工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hnfirstnu",
    "name": "湖南第一师范学院",
    "shortName": "HN1NU / 一师范",
    "pinyin": "hunandiyishifanxueyuan hnnu ysf yishifan",
    "region": "湖南 · 长沙",
    "badge": "师范名校",
    "systems": [
      {
        "id": "hnfirstnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.hnfnu.edu.cn/",
        "desc": "湖南第一师范学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hnu_med",
    "name": "湖南中医药大学",
    "shortName": "HNUCMS / 湖中医",
    "pinyin": "hunanzhongyiyaodaxue hnucms hzy huzhongyi",
    "region": "湖南 · 长沙",
    "badge": "医学特色",
    "systems": [
      {
        "id": "hnu_med_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.hnucm.edu.cn/",
        "desc": "湖南中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "syu_hn",
    "name": "邵阳学院",
    "shortName": "SYU / 邵院",
    "pinyin": "shaoyangxueyuan syu sy shaoyuan",
    "region": "湖南 · 邵阳",
    "badge": "公办应用",
    "systems": [
      {
        "id": "syu_hn_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hnsyu.edu.cn/",
        "desc": "邵阳学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hhu_hn",
    "name": "怀化学院",
    "shortName": "HHU / 怀院",
    "pinyin": "huaihuaxueyuan hhu hy huaiyuan",
    "region": "湖南 · 怀化",
    "badge": "公办本科",
    "systems": [
      {
        "id": "hhu_hn_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hhtc.edu.cn/",
        "desc": "怀化学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xnu_hn",
    "name": "湘南学院",
    "shortName": "XNU / 湘南",
    "pinyin": "xiangnanxueyuan xnu xn xiangnan",
    "region": "湖南 · 郴州",
    "badge": "公办本科",
    "systems": [
      {
        "id": "xnu_hn_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xnu.edu.cn/",
        "desc": "湘南学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "huas",
    "name": "湖南文理学院",
    "shortName": "HUAS / 湖南文理",
    "pinyin": "hunanwenlixueyuan huas hnwl hunanwenli",
    "region": "湖南 · 常德",
    "badge": "公办本科",
    "systems": [
      {
        "id": "huas_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.huas.edu.cn/",
        "desc": "湖南文理学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "huel",
    "name": "湖南人文科技学院",
    "shortName": "HUEL / 人文科技",
    "pinyin": "hunanrenwenkejixueyuan huel rwk j hunanrenwen",
    "region": "湖南 · 娄底",
    "badge": "公办本科",
    "systems": [
      {
        "id": "huel_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.huhst.edu.cn/",
        "desc": "湖南人文科技学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hnie",
    "name": "湖南工程学院",
    "shortName": "HNIE / 湖工院",
    "pinyin": "hunangongchengxueyuan hnie hgy hugongyuan",
    "region": "湖南 · 湘潭",
    "badge": "电气纺织特色",
    "systems": [
      {
        "id": "hnie_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hnie.edu.cn/",
        "desc": "湖南工程学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hynu",
    "name": "衡阳师范学院",
    "shortName": "HYNU / 衡师",
    "pinyin": "hengyangshifanxueyuan hynu hs hengshi",
    "region": "湖南 · 衡阳",
    "badge": "省属师范",
    "systems": [
      {
        "id": "hynu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hynu.edu.cn/",
        "desc": "衡阳师范学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hncu",
    "name": "湖南城市学院",
    "shortName": "HNCU / 城院",
    "pinyin": "hunanchengshixueyuan hncu cy chengyuan",
    "region": "湖南 · 益阳",
    "badge": "规划建筑特色",
    "systems": [
      {
        "id": "hncu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hncu.edu.cn/",
        "desc": "湖南城市学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hnit",
    "name": "湖南工学院",
    "shortName": "HNIT / 湖工",
    "pinyin": "hunangongxueyuan hnit hg hugong",
    "region": "湖南 · 衡阳",
    "badge": "安全工程特色",
    "systems": [
      {
        "id": "hnit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hnit.edu.cn/",
        "desc": "湖南工学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sysu",
    "name": "中山大学",
    "shortName": "SYSU / 中大",
    "pinyin": "zhongshandaxue sysu zd zhongda",
    "region": "广东 · 广州",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "sysu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://jwxt.sysu.edu.cn/jwxt/",
        "desc": "中山大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "scut",
    "name": "华南理工大学",
    "shortName": "SCUT / 华工",
    "pinyin": "huananligongdaxue scut hg huagong",
    "region": "广东 · 广州",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "scut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.scut.edu.cn/",
        "desc": "华南理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "jnu",
    "name": "暨南大学",
    "shortName": "JNU / 暨大",
    "pinyin": "jinandaxue jnu jd jida",
    "region": "广东 · 广州",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "jnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://jw2017.jnu.edu.cn/",
        "desc": "暨南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "szu",
    "name": "深圳大学",
    "shortName": "SZU / 深大",
    "pinyin": "shenzhendaxue szu sd shenda",
    "region": "广东 · 深圳",
    "badge": "特区旗舰高校",
    "systems": [
      {
        "id": "szu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://ehall.szu.edu.cn/jwapp/sys/homeapp/home/index.html",
        "desc": "深圳大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sustech",
    "name": "南方科技大学",
    "shortName": "SUSTech / 南科大",
    "pinyin": "nanfangkejidaxue sustech nkd nankeda",
    "region": "广东 · 深圳",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "sustech_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://jwxt.sustech.edu.cn/",
        "desc": "南方科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gdut",
    "name": "广东工业大学",
    "shortName": "GDUT / 广工",
    "pinyin": "guangdonggongyedaxue gdut gg guanggong qiangzhi",
    "region": "广东 · 广州",
    "badge": "强智系统",
    "systems": [
      {
        "id": "gdut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jxfw.gdut.edu.cn/",
        "desc": "广东工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "scau",
    "name": "华南农业大学",
    "shortName": "SCAU / 华农",
    "pinyin": "huanannongyedaxue scau hn huanong",
    "region": "广东 · 广州",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "scau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.scau.edu.cn/",
        "desc": "华南农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "scnu",
    "name": "华南师范大学",
    "shortName": "SCNU / 华师",
    "pinyin": "huananshifandaxue scnu hs huashi qingguo",
    "region": "广东 · 广州",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "scnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://jwxt.scnu.edu.cn/",
        "desc": "华南师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gdufs",
    "name": "广东外语外贸大学",
    "shortName": "GDUFS / 广外",
    "pinyin": "guangdongwaiyuwaimaodaxue gdufs gw guangwai",
    "region": "广东 · 广州",
    "badge": "外语外贸重点",
    "systems": [
      {
        "id": "gdufs_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gdufs.edu.cn/",
        "desc": "广东外语外贸大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gzhu",
    "name": "广州大学",
    "shortName": "GZHU / 广大",
    "pinyin": "guangzhoudaxue gzhu gd guangda",
    "region": "广东 · 广州",
    "badge": "高水平综合",
    "systems": [
      {
        "id": "gzhu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.gzhu.edu.cn/",
        "desc": "广州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "stu",
    "name": "汕头大学",
    "shortName": "STU / 汕大",
    "pinyin": "shantoudaxue stu sd shanda",
    "region": "广东 · 汕头",
    "badge": "潮汕特色名校",
    "systems": [
      {
        "id": "stu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://credit.stu.edu.cn/",
        "desc": "汕头大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gdmu",
    "name": "广东医科大学",
    "shortName": "GDMU / 广医大",
    "pinyin": "guangdongyikedaxue gdmu gyd guangyida",
    "region": "广东 · 湛江/东莞",
    "badge": "医学高水平",
    "systems": [
      {
        "id": "gdmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gdmu.edu.cn/",
        "desc": "广东医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gdpu",
    "name": "广东药科大学",
    "shortName": "GDPU / 广药大",
    "pinyin": "guangdongyaokedaxue gdpu gyd guangyaoda",
    "region": "广东 · 广州",
    "badge": "医药特色",
    "systems": [
      {
        "id": "gdpu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gdpu.edu.cn/",
        "desc": "广东药科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gzhmu",
    "name": "广州医科大学",
    "shortName": "GMU / 广医",
    "pinyin": "guangzhouyikedaxue gmu gy guangyi",
    "region": "广东 · 广州",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "gzhmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gzhmu.edu.cn/",
        "desc": "广州医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gzucm",
    "name": "广州中医药大学",
    "shortName": "GZUCM / 广中医",
    "pinyin": "guangzhouzhongyiyaodaxue gzucm gzy guangzhongyi",
    "region": "广东 · 广州",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "gzucm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gzucm.edu.cn/",
        "desc": "广州中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gdou",
    "name": "广东海洋大学",
    "shortName": "GDOU / 广海",
    "pinyin": "guangdonghaiyangdaxue gdou gh guanghai",
    "region": "广东 · 湛江",
    "badge": "海洋特色重点",
    "systems": [
      {
        "id": "gdou_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gdou.edu.cn/",
        "desc": "广东海洋大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dgut",
    "name": "东莞理工学院",
    "shortName": "DGUT / 莞工",
    "pinyin": "dongguanligongxueyuan dgut wg wangong",
    "region": "广东 · 东莞",
    "badge": "应用高水平",
    "systems": [
      {
        "id": "dgut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.dgut.edu.cn/",
        "desc": "东莞理工学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sztu",
    "name": "深圳技术大学",
    "shortName": "SZTU / 深技大",
    "pinyin": "shenzhenjishudaxue sztu sjd shenjida",
    "region": "广东 · 深圳",
    "badge": "应用型本科名校",
    "systems": [
      {
        "id": "sztu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sztu.edu.cn/",
        "desc": "深圳技术大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gxu",
    "name": "广西大学",
    "shortName": "GXU / 西大",
    "pinyin": "guangxidaxue gxu xd xida",
    "region": "广西 · 南宁",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "gxu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gxu.edu.cn/",
        "desc": "广西大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "guet",
    "name": "桂林电子科技大学",
    "shortName": "GUET / 桂电",
    "pinyin": "guilindianzikejidaxue guet gd guidian",
    "region": "广西 · 桂林",
    "badge": "电子信息名校",
    "systems": [
      {
        "id": "guet_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.guet.edu.cn/",
        "desc": "桂林电子科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gut",
    "name": "桂林理工大学",
    "shortName": "GUT / 桂工",
    "pinyin": "guilinligongdaxue gut gg guigong",
    "region": "广西 · 桂林",
    "badge": "理工特色重点",
    "systems": [
      {
        "id": "gut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.glut.edu.cn/",
        "desc": "桂林理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gxnu",
    "name": "广西师范大学",
    "shortName": "GXNU / 广西师大",
    "pinyin": "guangxishifandaxue gxnu gxsd guangxishida",
    "region": "广西 · 桂林",
    "badge": "重点师范",
    "systems": [
      {
        "id": "gxnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gxnu.edu.cn/",
        "desc": "广西师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gxmu",
    "name": "广西医科大学",
    "shortName": "GXMU / 广医大",
    "pinyin": "guangxiyikedaxue gxmu gyd guangyida",
    "region": "广西 · 南宁",
    "badge": "医学名校",
    "systems": [
      {
        "id": "gxmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gxmu.edu.cn/",
        "desc": "广西医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gxun",
    "name": "广西民族大学",
    "shortName": "GXUN / 广民大",
    "pinyin": "guangximinzudaxue gxun gmd guangminda",
    "region": "广西 · 南宁",
    "badge": "省部共建",
    "systems": [
      {
        "id": "gxun_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gxun.edu.cn/",
        "desc": "广西民族大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nnnu",
    "name": "南宁师范大学",
    "shortName": "NNNU / 南宁师大",
    "pinyin": "nanningshifandaxue nnnu nnsd nanningshida",
    "region": "广西 · 南宁",
    "badge": "公办师范",
    "systems": [
      {
        "id": "nnnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.nnnu.edu.cn/",
        "desc": "南宁师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hainanu",
    "name": "海南大学",
    "shortName": "HNU / 海大",
    "pinyin": "hainandaxue hnu hd haida hainan",
    "region": "海南 · 海口",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "hainanu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.hainanu.edu.cn/",
        "desc": "海南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "hnnu_hain",
    "name": "海南师范大学",
    "shortName": "HNNU / 海师大",
    "pinyin": "hainanshifandaxue hnnu hsd haishida",
    "region": "海南 · 海口",
    "badge": "省属重点",
    "systems": [
      {
        "id": "hnnu_hain_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hainnu.edu.cn/",
        "desc": "海南师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "mu_hn",
    "name": "海南医学院",
    "shortName": "HNM / 海医",
    "pinyin": "hainanyixueyuan hnm hy haiyi",
    "region": "海南 · 海口",
    "badge": "医药特色",
    "systems": [
      {
        "id": "mu_hn_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.hainmc.edu.cn/",
        "desc": "海南医学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cqu",
    "name": "重庆大学",
    "shortName": "CQU / 重大",
    "pinyin": "chongqingdaxue cqu cd chongda zhongda",
    "region": "重庆 · 沙坪坝",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "cqu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.cqu.edu.cn/",
        "desc": "重庆大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "swu",
    "name": "西南大学",
    "shortName": "SWU / 西大",
    "pinyin": "xinandaxue swu xd xida",
    "region": "重庆 · 北碚",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "swu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.swu.edu.cn/",
        "desc": "西南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cqupt",
    "name": "重庆邮电大学",
    "shortName": "CQUPT / 重邮",
    "pinyin": "chongqingyoudiandaxue cqupt cy chongyou",
    "region": "重庆 · 南岸",
    "badge": "电子信息特色",
    "systems": [
      {
        "id": "cqupt_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.cqupt.edu.cn/",
        "desc": "重庆邮电大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cqjtu",
    "name": "重庆交通大学",
    "shortName": "CQJTU / 重交",
    "pinyin": "chongqingjiaotongdaxue cqjtu cj chongjiao",
    "region": "重庆 · 南岸",
    "badge": "交通重点",
    "systems": [
      {
        "id": "cqjtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cqjtu.edu.cn/",
        "desc": "重庆交通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cqmu",
    "name": "重庆医科大学",
    "shortName": "CQMU / 重医",
    "pinyin": "chongqingyikedaxue cqmu cy chongyi",
    "region": "重庆 · 渝中",
    "badge": "医学重点",
    "systems": [
      {
        "id": "cqmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cqmu.edu.cn/",
        "desc": "重庆医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cqnu",
    "name": "重庆师范大学",
    "shortName": "CQNU / 重师大",
    "pinyin": "chongqingshifandaxue cqnu csd chongshida",
    "region": "重庆 · 沙坪坝",
    "badge": "师范重点",
    "systems": [
      {
        "id": "cqnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cqnu.edu.cn/",
        "desc": "重庆师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ctbu",
    "name": "重庆工商大学",
    "shortName": "CTBU / 重工商",
    "pinyin": "chongqinggongshangdaxue ctbu cgs chonggongshang",
    "region": "重庆 · 南岸",
    "badge": "经管特色",
    "systems": [
      {
        "id": "ctbu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ctbu.edu.cn/",
        "desc": "重庆工商大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cqut",
    "name": "重庆理工大学",
    "shortName": "CQUT / 重理工",
    "pinyin": "chongqingligongdaxue cqut clg chongligong",
    "region": "重庆 · 巴南",
    "badge": "装备工科重点",
    "systems": [
      {
        "id": "cqut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cqut.edu.cn/",
        "desc": "重庆理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sisu_cq",
    "name": "四川外国语大学",
    "shortName": "SISU / 川外",
    "pinyin": "sichuanwaiguoyudaxue sisu cw chuanwai",
    "region": "重庆 · 沙坪坝",
    "badge": "外语名校",
    "systems": [
      {
        "id": "sisu_cq_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sisu.edu.cn/",
        "desc": "四川外国语大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "scu",
    "name": "四川大学",
    "shortName": "SCU / 川大",
    "pinyin": "sichuandaxue scu cd chuanda",
    "region": "四川 · 成都",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "scu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://zhjw.scu.edu.cn/",
        "desc": "四川大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "uestc",
    "name": "电子科技大学",
    "shortName": "UESTC / 成电",
    "pinyin": "dianzikejidaxue uestc cd chengdian",
    "region": "四川 · 成都",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "uestc_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://eams.uestc.edu.cn/eams/",
        "desc": "电子科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "swjtu",
    "name": "西南交通大学",
    "shortName": "SWJTU / 西南交大",
    "pinyin": "xinanjiaotongdaxue swjtu xnjd xinanjiaoda",
    "region": "四川 · 成都",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "swjtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwc.swjtu.edu.cn/",
        "desc": "西南交通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "swufe",
    "name": "西南财经大学",
    "shortName": "SWUFE / 西财",
    "pinyin": "xinancaijingdaxue swufe xc xicai",
    "region": "四川 · 成都",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "swufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.swufe.edu.cn/",
        "desc": "西南财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sicau",
    "name": "四川农业大学",
    "shortName": "SICAU / 川农",
    "pinyin": "sichuannongyedaxue sicau cn chuannong",
    "region": "四川 · 雅安/成都",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "sicau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jiaowu.sicau.edu.cn/",
        "desc": "四川农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cdut",
    "name": "成都理工大学",
    "shortName": "CDUT / 成理",
    "pinyin": "chengduligongdaxue cdut cl chengli",
    "region": "四川 · 成都",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "cdut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cdut.edu.cn/",
        "desc": "成都理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "swpu",
    "name": "西南石油大学",
    "shortName": "SWPU / 西南石大",
    "pinyin": "xinanshiyoudaxue swpu xnsd xinanshida",
    "region": "四川 · 成都",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "swpu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.swpu.edu.cn/",
        "desc": "西南石油大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "swust",
    "name": "西南科技大学",
    "shortName": "SWUST / 西科大",
    "pinyin": "xinankejidaxue swust xkd xikeda",
    "region": "四川 · 绵阳",
    "badge": "国防共建重点",
    "systems": [
      {
        "id": "swust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.swust.edu.cn/",
        "desc": "西南科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cdutcm",
    "name": "成都中医药大学",
    "shortName": "CDTCM / 成中医",
    "pinyin": "chengduzhongyiyaodaxue cdtcm czy chengzhongyi",
    "region": "四川 · 成都",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "cdutcm_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cdutcm.edu.cn/",
        "desc": "成都中医药大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sicnu",
    "name": "四川师范大学",
    "shortName": "SICNU / 川师大",
    "pinyin": "sichuanshifandaxue sicnu csd chuanshida",
    "region": "四川 · 成都",
    "badge": "省属重点",
    "systems": [
      {
        "id": "sicnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sicnu.edu.cn/",
        "desc": "四川师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xhu",
    "name": "西华大学",
    "shortName": "XHU / 西华",
    "pinyin": "xihuadaxue xhu xh xihua",
    "region": "四川 · 成都",
    "badge": "综合工科",
    "systems": [
      {
        "id": "xhu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xhu.edu.cn/",
        "desc": "西华大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cwnu",
    "name": "西华师范大学",
    "shortName": "CWNU / 西华师大",
    "pinyin": "xihuashifandaxue cwnu xhsd xihuashida",
    "region": "四川 · 南充",
    "badge": "省属师范",
    "systems": [
      {
        "id": "cwnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cwnu.edu.cn/",
        "desc": "西华师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cuit",
    "name": "成都信息工程大学",
    "shortName": "CUIT / 成信大",
    "pinyin": "chengduxinxigongchengdaxue cuit cxd chengxinda",
    "region": "四川 · 成都",
    "badge": "气象信息特色",
    "systems": [
      {
        "id": "cuit_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cuit.edu.cn/",
        "desc": "成都信息工程大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "cdu",
    "name": "成都大学",
    "shortName": "CDU / 成大",
    "pinyin": "chengdudaxue cdu cd chengda",
    "region": "四川 · 成都",
    "badge": "综合高水平",
    "systems": [
      {
        "id": "cdu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.cdu.edu.cn/",
        "desc": "成都大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gzu",
    "name": "贵州大学",
    "shortName": "GZU / 贵大",
    "pinyin": "guizhoudaxue gzu gd guida",
    "region": "贵州 · 贵阳",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "gzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwgl.gzu.edu.cn/",
        "desc": "贵州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gzmu",
    "name": "贵州医科大学",
    "shortName": "GZMU / 贵医大",
    "pinyin": "guizhouyikedaxue gzmu gyd guiyida",
    "region": "贵州 · 贵阳",
    "badge": "医学重点",
    "systems": [
      {
        "id": "gzmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gmc.edu.cn/",
        "desc": "贵州医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "zmu",
    "name": "遵义医科大学",
    "shortName": "ZMU / 遵医大",
    "pinyin": "zunyiyikedaxue zmu zyd zunyida",
    "region": "贵州 · 遵义",
    "badge": "医学名校",
    "systems": [
      {
        "id": "zmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.zmu.edu.cn/",
        "desc": "遵义医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gznu",
    "name": "贵州师范大学",
    "shortName": "GZNU / 贵师大",
    "pinyin": "guizhoushifandaxue gznu gsd guishida",
    "region": "贵州 · 贵阳",
    "badge": "省属重点",
    "systems": [
      {
        "id": "gznu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gznu.edu.cn/",
        "desc": "贵州师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gzfe",
    "name": "贵州财经大学",
    "shortName": "GZFE / 贵财",
    "pinyin": "guizhoucaijingdaxue gzfe gc guicai",
    "region": "贵州 · 贵阳",
    "badge": "财经特色",
    "systems": [
      {
        "id": "gzfe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gufe.edu.cn/",
        "desc": "贵州财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ynu",
    "name": "云南大学",
    "shortName": "YNU / 云大",
    "pinyin": "yunnandaxue ynu yd yunda",
    "region": "云南 · 昆明",
    "badge": "双一流高校",
    "systems": [
      {
        "id": "ynu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ynu.edu.cn/",
        "desc": "云南大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "kust",
    "name": "昆明理工大学",
    "shortName": "KUST / 昆工",
    "pinyin": "kunmingligongdaxue kust kg kungong",
    "region": "云南 · 昆明",
    "badge": "省属重点高水平",
    "systems": [
      {
        "id": "kust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.kust.edu.cn/",
        "desc": "昆明理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ynau",
    "name": "云南农业大学",
    "shortName": "YNAU / 云农",
    "pinyin": "yunnannongyedaxue ynau yn yunnong",
    "region": "云南 · 昆明",
    "badge": "省属重点",
    "systems": [
      {
        "id": "ynau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ynau.edu.cn/",
        "desc": "云南农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "swfu",
    "name": "西南林业大学",
    "shortName": "SWFU / 西南林",
    "pinyin": "xinanlinyedaxue swfu xnl xinanlin",
    "region": "云南 · 昆明",
    "badge": "林业高水平",
    "systems": [
      {
        "id": "swfu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.swfu.edu.cn/",
        "desc": "西南林业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "kmu",
    "name": "昆明医科大学",
    "shortName": "KMU / 昆医大",
    "pinyin": "kunmingyikedaxue kmu kyd kunyida",
    "region": "云南 · 昆明",
    "badge": "医学名校",
    "systems": [
      {
        "id": "kmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.kmu.edu.cn/",
        "desc": "昆明医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ynnu",
    "name": "云南师范大学",
    "shortName": "YNNU / 云师大",
    "pinyin": "yunnanshifandaxue ynnu ysd yunshida",
    "region": "云南 · 昆明",
    "badge": "重点师范",
    "systems": [
      {
        "id": "ynnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ynnu.edu.cn/",
        "desc": "云南师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ynfe",
    "name": "云南财经大学",
    "shortName": "YUFE / 云财",
    "pinyin": "yunnancaijingdaxue yufe yc yuncai",
    "region": "云南 · 昆明",
    "badge": "财经特色",
    "systems": [
      {
        "id": "ynfe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ynufe.edu.cn/",
        "desc": "云南财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "dali",
    "name": "大理大学",
    "shortName": "DLU / 理大",
    "pinyin": "dalidaxue dlu ld lida",
    "region": "云南 · 大理",
    "badge": "综合本科",
    "systems": [
      {
        "id": "dali_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.dlu.edu.cn/",
        "desc": "大理大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "utibet",
    "name": "西藏大学",
    "shortName": "UTIBET / 藏大",
    "pinyin": "xicangdaxue utibet cd zangda qingguo",
    "region": "西藏 · 拉萨",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "utibet_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.utibet.edu.cn/",
        "desc": "西藏大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "tibet_au",
    "name": "西藏农牧学院",
    "shortName": "XAU / 藏农牧",
    "pinyin": "xicangnongmuxueyuan xau znm zangnongmu",
    "region": "西藏 · 林芝",
    "badge": "特色重点",
    "systems": [
      {
        "id": "tibet_au_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xza.edu.cn/",
        "desc": "西藏农牧学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xjtu",
    "name": "西安交通大学",
    "shortName": "XJTU / 西安交大",
    "pinyin": "xianjiaotongdaxue xjtu xajd xianjiaoda",
    "region": "陕西 · 西安",
    "badge": "C9 · 985 · 双一流",
    "systems": [
      {
        "id": "xjtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.xjtu.edu.cn/",
        "desc": "西安交通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nwpu",
    "name": "西北工业大学",
    "shortName": "NPU / 西工大",
    "pinyin": "xibeigongyedaxue nwpu npu xgd xigongda",
    "region": "陕西 · 西安",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "nwpu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nwpu.edu.cn/",
        "desc": "西北工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xidian",
    "name": "西安电子科技大学",
    "shortName": "Xidian / 西电",
    "pinyin": "xiandianzikejidaxue xidian xd xidian",
    "region": "陕西 · 西安",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "xidian_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.xidian.edu.cn/",
        "desc": "西安电子科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nwu",
    "name": "西北大学",
    "shortName": "NWU / 西大",
    "pinyin": "xibeidaxue nwu xd xida",
    "region": "陕西 · 西安",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "nwu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nwu.edu.cn/",
        "desc": "西北大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "chd",
    "name": "长安大学",
    "shortName": "CHD / 长大",
    "pinyin": "changandaxue chd cd changda",
    "region": "陕西 · 西安",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "chd_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.chd.edu.cn/",
        "desc": "长安大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "snnu",
    "name": "陕西师范大学",
    "shortName": "SNNU / 陕师大",
    "pinyin": "shanxishifandaxue snnu ssd shanshida",
    "region": "陕西 · 西安",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "snnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.snnu.edu.cn/",
        "desc": "陕西师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xaut",
    "name": "西安理工大学",
    "shortName": "XAUT / 西理工",
    "pinyin": "xianligongdaxue xaut xlg xianligong",
    "region": "陕西 · 西安",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "xaut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xaut.edu.cn/",
        "desc": "西安理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xatu",
    "name": "西安工业大学",
    "shortName": "XATU / 西工",
    "pinyin": "xiangongyedaxue xatu xg xiangong",
    "region": "陕西 · 西安",
    "badge": "兵工特色",
    "systems": [
      {
        "id": "xatu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xatu.edu.cn/",
        "desc": "西安工业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xauat",
    "name": "西安建筑科技大学",
    "shortName": "XAUAT / 西建大",
    "pinyin": "xianjianzhadaxue xauat xjd xianjianda",
    "region": "陕西 · 西安",
    "badge": "建筑老八校",
    "systems": [
      {
        "id": "xauat_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xauat.edu.cn/",
        "desc": "西安建筑科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xust",
    "name": "西安科技大学",
    "shortName": "XUST / 西科大",
    "pinyin": "xiankejidaxue xust xkd xiankeda",
    "region": "陕西 · 西安",
    "badge": "煤炭地质高水平",
    "systems": [
      {
        "id": "xust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xust.edu.cn/",
        "desc": "西安科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xupt_oil",
    "name": "西安石油大学",
    "shortName": "XSYU / 西石大",
    "pinyin": "xianshiyoudaxue xsyu xsd xianshida",
    "region": "陕西 · 西安",
    "badge": "石油特色重点",
    "systems": [
      {
        "id": "xupt_oil_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xsyu.edu.cn/",
        "desc": "西安石油大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "sust",
    "name": "陕西科技大学",
    "shortName": "SUST / 陕科大",
    "pinyin": "shanxikejidaxue sust skd shankeda",
    "region": "陕西 · 西安",
    "badge": "轻工名校",
    "systems": [
      {
        "id": "sust_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.sust.edu.cn/",
        "desc": "陕西科技大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "yau",
    "name": "延安大学",
    "shortName": "YAU / 延大",
    "pinyin": "yanandaxue yau yd yanda",
    "region": "陕西 · 延安",
    "badge": "省部共建重点",
    "systems": [
      {
        "id": "yau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.yau.edu.cn/",
        "desc": "延安大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xupt",
    "name": "西安邮电大学",
    "shortName": "XUPT / 西邮",
    "pinyin": "xianyoudiandaxue xupt xy xianyou",
    "region": "陕西 · 西安",
    "badge": "信息特色重点",
    "systems": [
      {
        "id": "xupt_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.xupt.edu.cn/",
        "desc": "西安邮电大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lzu",
    "name": "兰州大学",
    "shortName": "LZU / 兰大",
    "pinyin": "lanzhoudaxue lzu ld landa",
    "region": "甘肃 · 兰州",
    "badge": "985 · 双一流",
    "systems": [
      {
        "id": "lzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lzu.edu.cn/",
        "desc": "兰州大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lut",
    "name": "兰州理工大学",
    "shortName": "LUT / 兰理工",
    "pinyin": "lanzhouligongdaxue lut llg lanligong qingguo",
    "region": "甘肃 · 兰州",
    "badge": "青果 · 省部共建",
    "systems": [
      {
        "id": "lut_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lut.edu.cn/",
        "desc": "兰州理工大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lzjtu",
    "name": "兰州交通大学",
    "shortName": "LZJTU / 兰州交大",
    "pinyin": "lanzhoujiaotongdaxue lzjtu lzjd lanzhoujiaoda",
    "region": "甘肃 · 兰州",
    "badge": "铁道交通名校",
    "systems": [
      {
        "id": "lzjtu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lzjtu.edu.cn/",
        "desc": "兰州交通大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "gsau",
    "name": "甘肃农业大学",
    "shortName": "GSAU / 甘农大",
    "pinyin": "gansunongyedaxue gsau gnd gannongda",
    "region": "甘肃 · 兰州",
    "badge": "省属重点",
    "systems": [
      {
        "id": "gsau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.gsau.edu.cn/",
        "desc": "甘肃农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nwnu",
    "name": "西北师范大学",
    "shortName": "NWNU / 西北师大",
    "pinyin": "xibeishifandaxue nwnu xbsd xibeishida",
    "region": "甘肃 · 兰州",
    "badge": "重点师范",
    "systems": [
      {
        "id": "nwnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.nwnu.edu.cn/",
        "desc": "西北师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "lzufe",
    "name": "兰州财经大学",
    "shortName": "LZFE / 兰财",
    "pinyin": "lanzhoucaijingdaxue lzfe lc lancai",
    "region": "甘肃 · 兰州",
    "badge": "经管重点",
    "systems": [
      {
        "id": "lzufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.lzufe.edu.cn/",
        "desc": "兰州财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qhu",
    "name": "青海大学",
    "shortName": "QHU / 青大",
    "pinyin": "qinghaidaxue qhu qd qingda",
    "region": "青海 · 西宁",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "qhu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.qhu.edu.cn/",
        "desc": "青海大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qhnu",
    "name": "青海师范大学",
    "shortName": "QHNU / 青师大",
    "pinyin": "qinghaishifandaxue qhnu qsd qingshida",
    "region": "青海 · 西宁",
    "badge": "重点师范",
    "systems": [
      {
        "id": "qhnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.qhnu.edu.cn/",
        "desc": "青海师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "qhmu",
    "name": "青海民族大学",
    "shortName": "QHMU / 青民大",
    "pinyin": "qinghaiminzudaxue qhmu qmd qingminda",
    "region": "青海 · 西宁",
    "badge": "民族重点",
    "systems": [
      {
        "id": "qhmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.qhmu.edu.cn/",
        "desc": "青海民族大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nxu",
    "name": "宁夏大学",
    "shortName": "NXU / 宁大",
    "pinyin": "ningxiadaxue nxu nd ningda",
    "region": "宁夏 · 银川",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "nxu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.nxu.edu.cn/",
        "desc": "宁夏大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nxmu",
    "name": "宁夏医科大学",
    "shortName": "NXMU / 宁医大",
    "pinyin": "ningxiayikedaxue nxmu nyd ningyida",
    "region": "宁夏 · 银川",
    "badge": "重点医科",
    "systems": [
      {
        "id": "nxmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.nxmu.edu.cn/",
        "desc": "宁夏医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "nxnu",
    "name": "宁夏师范学院",
    "shortName": "NXNU / 宁师",
    "pinyin": "ningxiashifanxueyuan nxnu ns ningshi",
    "region": "宁夏 · 固原",
    "badge": "六盘山区名校",
    "systems": [
      {
        "id": "nxnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.nxtc.edu.cn/",
        "desc": "宁夏师范学院官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xju",
    "name": "新疆大学",
    "shortName": "XJU / 新大",
    "pinyin": "xinjiangdaxue xju xd xinda",
    "region": "新疆 · 乌鲁木齐",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "xju_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.xju.edu.cn/",
        "desc": "新疆大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "shzu",
    "name": "石河子大学",
    "shortName": "SHZU / 石大",
    "pinyin": "shihezidaxue shzu sd shida",
    "region": "新疆 · 石河子",
    "badge": "211 · 双一流",
    "systems": [
      {
        "id": "shzu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jwxt.shzu.edu.cn/",
        "desc": "石河子大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "taru",
    "name": "塔里木大学",
    "shortName": "TARU / 塔大",
    "pinyin": "talimudaxue taru td tada",
    "region": "新疆 · 阿拉尔",
    "badge": "兵团重点",
    "systems": [
      {
        "id": "taru_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.taru.edu.cn/",
        "desc": "塔里木大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xjau",
    "name": "新疆农业大学",
    "shortName": "XJAU / 新农大",
    "pinyin": "xinjiangnongyedaxue xjau xnd xinnongda",
    "region": "新疆 · 乌鲁木齐",
    "badge": "农科高水平",
    "systems": [
      {
        "id": "xjau_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xjau.edu.cn/",
        "desc": "新疆农业大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xjmu",
    "name": "新疆医科大学",
    "shortName": "XJMU / 新医大",
    "pinyin": "xinjiangyikedaxue xjmu xyd xinyida",
    "region": "新疆 · 乌鲁木齐",
    "badge": "医学高水平",
    "systems": [
      {
        "id": "xjmu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xjmu.edu.cn/",
        "desc": "新疆医科大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xjnu",
    "name": "新疆师范大学",
    "shortName": "XJNU / 新师大",
    "pinyin": "xinjiangshifandaxue xjnu xsd xinshida",
    "region": "新疆 · 乌鲁木齐",
    "badge": "重点师范",
    "systems": [
      {
        "id": "xjnu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xjnu.edu.cn/",
        "desc": "新疆师范大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "xjufe",
    "name": "新疆财经大学",
    "shortName": "XJUFE / 新财",
    "pinyin": "xinjiangcaijingdaxue xjufe xc xincai",
    "region": "新疆 · 乌鲁木齐",
    "badge": "财经特色",
    "systems": [
      {
        "id": "xjufe_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.xjufe.edu.cn/",
        "desc": "新疆财经大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "ksu",
    "name": "喀什大学",
    "shortName": "KSU / 喀大",
    "pinyin": "kashidaxue ksu kd kada",
    "region": "新疆 · 喀什",
    "badge": "南疆重点",
    "systems": [
      {
        "id": "ksu_jw",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "http://jw.ksu.edu.cn/",
        "desc": "喀什大学官方教务系统登录入口，登录后一键提取课表"
      }
    ]
  },
  {
    "id": "custom_general",
    "name": "全国高校通用通道 (支持任何大学)",
    "shortName": "自定义教务系统",
    "pinyin": "quanguogaoxiaotongyong quanguo zidingyi tongyong ranyi ranyidaxue",
    "region": "全国 · 任意高校",
    "badge": "万能导入",
    "systems": [
      {
        "id": "generic_direct",
        "name": "教务系统登录",
        "level": "全校师生通用",
        "url": "https://",
        "desc": "支持全国 3000+ 高校，输入教务系统网址登录后一键提取"
      }
    ]
  }
];
