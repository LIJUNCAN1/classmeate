const fs = require('fs');
const path = require('path');

// 辅助函数：根据名称自动补齐拼音和系统配置
function makeSchool(id, name, shortName, pinyinExtra, province, city, badge, customUrl, customDesc, jwType) {
  const pinyin = ((pinyinExtra || '') + (jwType ? ` ${jwType}` : '')).toLowerCase();
  const url = customUrl || `http://jw.${id}.edu.cn/`;
  const desc = customDesc || `${name}教务综合服务平台，课表查询与导入${jwType ? `（${jwType}系统）` : ''}`;
  return {
    id,
    name,
    shortName,
    pinyin,
    region: `${province} · ${city}`,
    badge: jwType ? `${badge} · ${jwType}` : badge,
    systems: [
      {
        id: `${id}_jw`,
        name: `${name}教务管理系统`,
        level: '本科/研究生',
        url: url,
        desc: desc,
      },
      {
        id: `${id}_portal`,
        name: '数字校园统一身份认证 / WebVPN',
        level: '全校师生',
        url: `https://cas.${id}.edu.cn/`,
        desc: `${name}官方智慧校园一网通办认证与校外直连`,
      }
    ]
  };
}

const list = [
  // ================= 重点与示范院校 =================
  {
    id: 'cumt',
    name: '中国矿业大学',
    shortName: 'CUMT / 矿大',
    pinyin: 'zhongguokuangyedaxue cumt kd zgkydx kuangda',
    region: '江苏 · 徐州',
    badge: '211 · 双一流',
    systems: [
      { id: 'cumt_cas', name: '统一身份认证平台 (SSO)', level: '本科/研究生', url: 'http://authserver.cumt.edu.cn/authserver/login', desc: '中国矿业大学官方统一身份认证登录通道' },
      { id: 'cumt_jw', name: '本科教学管理信息系统', level: '本科', url: 'http://jwxt.cumt.edu.cn/', desc: '矿大现代教务管理信息系统通道' },
      { id: 'cumt_webvpn', name: 'WebVPN 校外直连通道', level: '全校师生', url: 'https://webvpn.cumt.edu.cn/', desc: '校外访问专用免客户端 WebVPN 隧道' },
    ]
  },
  {
    id: 'cumtb',
    name: '中国矿业大学(北京)',
    shortName: 'CUMTB / 矿大北京',
    pinyin: 'zhongguokuangyedaxuebeijing cumtb kdbj',
    region: '北京 · 海淀',
    badge: '211 · 双一流',
    systems: [
      { id: 'cumtb_cas', name: '统一身份认证平台', level: '本科/研究生', url: 'https://authserver.cumtb.edu.cn/authserver/login', desc: '中国矿业大学(北京)统一身份认证服务' },
      { id: 'cumtb_jw', name: '综合教务管理系统', level: '本科', url: 'https://jwxt.cumtb.edu.cn/', desc: '综合教务系统课表直连入口' },
    ]
  },
  {
    id: 'jmsu',
    name: '佳木斯大学',
    shortName: 'JMSU / 佳大',
    pinyin: 'jiamusidaxue jmsu jd jmsdx jiada xiqueer qingguo',
    region: '黑龙江 · 佳木斯',
    badge: '青果 · 喜鹊儿',
    systems: [
      { id: 'jmsu_jw', name: '教务管理信息系统 (青果)', level: '本科/专科/研究生', url: 'http://jwc.jmsu.edu.cn/', desc: '佳木斯大学青果教务系统（喜鹊儿移动端官方后台）' },
      { id: 'jmsu_xiqueer', name: '喜鹊儿移动教务直通平台', level: '全校师生', url: 'http://app.xiqueer.com/', desc: '青果软件喜鹊儿掌上校园移动课表同步入口' },
      { id: 'jmsu_portal', name: '智慧佳大数字校园门户', level: '全校师生', url: 'https://www.jmsu.edu.cn/', desc: '佳木斯大学官方数字校园统一门户' },
    ]
  },
  {
    id: 'ccsu',
    name: '长沙学院',
    shortName: 'CCSU / 长大',
    pinyin: 'changshaxueyuan ccsu cd csxy changda qiangzhi',
    region: '湖南 · 长沙',
    badge: '强智系统',
    systems: [
      { id: 'ccsu_sso', name: '智慧校园统一认证门户', level: '本科', url: 'https://sso.ccsu.cn/login', desc: '长沙学院统一身份认证，登录后直通强智教务' },
      { id: 'ccsu_jw', name: '强智教务管理系统', level: '本科', url: 'http://jwxt.ccsu.cn/jsxsd/', desc: '湖南强智教务系统，直连课表及成绩查询' },
      { id: 'ccsu_vpn', name: 'WebVPN 访问通道', level: '全校师生', url: 'https://webvpn.ccsu.cn/', desc: '校外快速直连入口' },
    ]
  },

  // ================= 北京高校 =================
  makeSchool('pku', '北京大学', 'PKU / 北大', 'beijingdaxue pku bd beida', '北京', '海淀', 'C9 · 985 · 双一流', 'https://elective.pku.edu.cn/'),
  makeSchool('thu', '清华大学', 'THU / 清华', 'qinghuadaxue thu qh qinghua', '北京', '海淀', 'C9 · 985 · 双一流', 'https://academic.tsinghua.edu.cn/'),
  makeSchool('ruc', '中国人民大学', 'RUC / 人大', 'zhongguorenmindaxue ruc rd renda', '北京', '海淀', '985 · 双一流', 'http://jw.ruc.edu.cn/'),
  makeSchool('buaa', '北京航空航天大学', 'BUAA / 北航', 'beijinghangkonghangtiandaxue buaa bh behang', '北京', '海淀', '985 · 双一流', 'http://jwxt.buaa.edu.cn/'),
  makeSchool('bit', '北京理工大学', 'BIT / 北理工', 'beijingligongdaxue bit blg beiligong', '北京', '海淀', '985 · 双一流', 'http://jwms.bit.edu.cn/'),
  makeSchool('bupt', '北京邮电大学', 'BUPT / 北邮', 'beijingyoudiandaxue bupt by beiyou', '北京', '海淀', '211 · 双一流', 'http://jwxt.bupt.edu.cn/'),
  makeSchool('bnu', '北京师范大学', 'BNU / 北师大', 'beijingshifandaxue bnu bsd beishida', '北京', '海淀', '985 · 双一流', 'http://jw.bnu.edu.cn/'),
  makeSchool('bjtu', '北京交通大学', 'BJTU / 北交大', 'beijingjiaotongdaxue bjtu bjd beijiaoda', '北京', '海淀', '211 · 双一流', 'https://bjjw.bjtu.edu.cn/'),
  makeSchool('ustb', '北京科技大学', 'USTB / 北科大', 'beijingkejidaxue ustb bkd beikeda', '北京', '海淀', '211 · 双一流', 'http://jwxt.ustb.edu.cn/'),
  makeSchool('cau', '中国农业大学', 'CAU / 中农', 'zhongguonongyedaxue cau zn zhongnong', '北京', '海淀', '985 · 双一流', 'http://jwxt.cau.edu.cn/'),
  makeSchool('cuc', '中国传媒大学', 'CUC / 中传', 'zhongguochuanmeidaxue cuc zc zhongchuan', '北京', '朝阳', '211 · 双一流', 'http://jwgl.cuc.edu.cn/'),
  makeSchool('cupl', '中国政法大学', 'CUPL / 法大', 'zhongguozhengfadaxue cupl fd fada', '北京', '昌平', '211 · 双一流', 'http://jwgl.cupl.edu.cn/'),
  makeSchool('uibe', '对外经济贸易大学', 'UIBE / 贸大', 'duiwaijingjimaoyidaxue uibe md maoda', '北京', '朝阳', '211 · 双一流', 'http://jwgl.uibe.edu.cn/'),
  makeSchool('cufe', '中央财经大学', 'CUFE / 央财', 'zhongyangcaijingdaxue cufe yc yangcai', '北京', '海淀', '211 · 双一流', 'http://jwgl.cufe.edu.cn/'),
  makeSchool('bjut', '北京工业大学', 'BJUT / 北工大', 'beijinggongyedaxue bjut bgd beigongda', '北京', '朝阳', '211 · 双一流', 'http://jwxt.bjut.edu.cn/'),
  makeSchool('bfu', '北京林业大学', 'BFU / 北林', 'beijinglinyedaxue bfu bl beilin', '北京', '海淀', '211 · 双一流', 'http://jwxt.bjfu.edu.cn/'),
  makeSchool('bucm', '北京中医药大学', 'BUCM / 北中医', 'beijingzhongyiyaodaxue bucm bzy beizhongyi', '北京', '朝阳', '211 · 双一流', 'http://jwxt.bucm.edu.cn/'),
  makeSchool('buct', '北京化工大学', 'BUCT / 北化', 'beijinghuagongdaxue buct bh beihua', '北京', '朝阳', '211 · 双一流', 'http://jwxt.buct.edu.cn/'),
  makeSchool('bfsu', '北京外国语大学', 'BFSU / 北外', 'beijingwaiguoyudaxue bfsu bw beiwai', '北京', '海淀', '211 · 双一流', 'http://jw.bfsu.edu.cn/'),
  makeSchool('ncepu', '华北电力大学', 'NCEPU / 华电', 'huabeidianlidaxue ncepu hd huadian', '北京', '昌平', '211 · 双一流', 'http://jwxt.ncepu.edu.cn/'),
  makeSchool('cugb', '中国地质大学(北京)', 'CUGB / 地大北京', 'zhongguodizhidaxuebeijing cugb ddbj dida', '北京', '海淀', '211 · 双一流', 'http://jw.cugb.edu.cn/'),
  makeSchool('cupb', '中国石油大学(北京)', 'CUPB / 石大北京', 'zhongguoshiyoudaxuebeijing cupb sdbj shida', '北京', '昌平', '211 · 双一流', 'http://jw.cup.edu.cn/'),
  makeSchool('muc', '中央民族大学', 'MUC / 民大', 'zhongyangminzudaxue muc md minda', '北京', '海淀', '985 · 双一流', 'http://jw.muc.edu.cn/'),
  makeSchool('cnu', '首都师范大学', 'CNU / 首师大', 'shoudushifandaxue cnu ssd shoushida', '北京', '海淀', '双一流高校', 'http://jw.cnu.edu.cn/'),
  makeSchool('cueb', '首都经济贸易大学', 'CUEB / 首经贸', 'shoudujingjimaoyidaxue cueb sjm shoujingmao', '北京', '丰台', '重点大学', 'http://jwxt.cueb.edu.cn/'),
  makeSchool('btbu', '北京工商大学', 'BTBU / 北工商', 'beijinggongshangdaxue btbu bgs beigongshang', '北京', '海淀', '重点大学', 'http://jw.btbu.edu.cn/'),
  makeSchool('bistu', '北京信息科技大学', 'BISTU / 北信科', 'beijingxinxikejidaxue bistu bxk beixinke', '北京', '海淀', '重点大学', 'http://jwxt.bistu.edu.cn/'),
  makeSchool('bucea', '北京建筑大学', 'BUCEA / 北建大', 'beijingjianzhadaxue bucea bjd beijianda', '北京', '西城', '重点大学', 'http://jwxt.bucea.edu.cn/'),
  makeSchool('ncut', '北方工业大学', 'NCUT / 北方工大', 'beifanggongyedaxue ncut bfgd beifanggongda', '北京', '石景山', '省属重点', 'http://jwxt.ncut.edu.cn/'),
  makeSchool('buu', '北京联合大学', 'BUU / 联大', 'beijinglianhedaxue buu ld lianda', '北京', '朝阳', '市属大学', 'http://jw.buu.edu.cn/'),
  makeSchool('ccmu', '首都医科大学', 'CCMU / 首医', 'shouduyikedaxue ccmu sy shouyi', '北京', '丰台', '医科重点', 'http://jw.ccmu.edu.cn/'),

  // ================= 天津高校 =================
  makeSchool('tju', '天津大学', 'TJU / 天大', 'tianjindaxue tju td tianda', '天津', '津南', '985 · 双一流', 'http://jxgl.tju.edu.cn/'),
  makeSchool('nku', '南开大学', 'NKU / 南开', 'nankaidaxue nku nk nankai', '天津', '南开', '985 · 双一流', 'http://eamis.nankai.edu.cn/'),
  makeSchool('tjpu', '天津工业大学', 'TJPU / 天工大', 'tianjingongyedaxue tjpu tgd tiangongda', '天津', '西青', '双一流高校', 'http://jwxt.tiangong.edu.cn/'),
  makeSchool('tut', '天津理工大学', 'TUT / 天理工', 'tianjinligongdaxue tut tlg tianligong', '天津', '西青', '市属重点', 'http://jw.tjut.edu.cn/'),
  makeSchool('tjnu', '天津师范大学', 'TJNU / 天师大', 'tianjinshifandaxue tjnu tsd tianshida', '天津', '西青', '重点师范', 'http://jwxt.tjnu.edu.cn/'),
  makeSchool('tust', '天津科技大学', 'TUST / 天科大', 'tianjinkejidaxue tust tkd tiankeda', '天津', '河西', '市属重点', 'http://jw.tust.edu.cn/'),
  makeSchool('tufe', '天津财经大学', 'TUFE / 天财', 'tianjincaijingdaxue tufe tc tiancai', '天津', '河西', '财经重点', 'http://jw.tjufe.edu.cn/'),
  makeSchool('tjtcm', '天津中医药大学', 'TUTCM / 天中医', 'tianjinzhongyiyaodaxue tutcm tzy tianzhongyi', '天津', '静海', '双一流高校', 'http://jw.tjutcm.edu.cn/'),
  makeSchool('cauc', '中国民航大学', 'CAUC / 中航大', 'zhongguominhangdaxue cauc zhd zhonghangda', '天津', '东丽', '民航特色', 'http://jwgl.cauc.edu.cn/'),

  // ================= 河北高校 =================
  makeSchool('ysu', '燕山大学', 'YSU / 燕大', 'yanshandaxue ysu yd yanda', '河北', '秦皇岛', '省部共建重点', 'http://jwxt.ysu.edu.cn/'),
  makeSchool('hbu', '河北大学', 'HBU / 河大', 'hebeidaxue hbu hd heda', '河北', '保定', '部省合建重点', 'http://jw.hbu.cn/'),
  makeSchool('hebut', '河北工业大学', 'HEBUT / 河工大', 'hebeigongyedaxue hebut hgd hegongda', '河北/天津', '北辰', '211 · 双一流', 'http://jwxt.hebut.edu.cn/'),
  makeSchool('hebnu', '河北师范大学', 'HEBNU / 河北师大', 'hebeishifandaxue hebnu hbsd hebeishida', '河北', '石家庄', '省属重点', 'http://jw.hebtu.edu.cn/'),
  makeSchool('stdu', '石家庄铁道大学', 'STDU / 铁大', 'shijiazhuangtiedaodaxue stdu td tieda', '河北', '石家庄', '特色高水平', 'http://jw.stdu.edu.cn/'),
  makeSchool('ncst', '华北理工大学', 'NCST / 华理工', 'huabeiligongdaxue ncst hblg huabeiligong', '河北', '唐山', '省部共建', 'http://jwxt.ncst.edu.cn/'),
  makeSchool('hebust', '河北科技大学', 'HEBUST / 河科大', 'hebeikejidaxue hebust hkd hebeikeda', '河北', '石家庄', '省属重点', 'http://jw.hebust.edu.cn/'),
  makeSchool('hebmu', '河北医科大学', 'HEBMU / 河北医大', 'hebeiyikedaxue hebmu hyd hebeiyida', '河北', '石家庄', '重点医科', 'http://jw.hebmu.edu.cn/'),
  makeSchool('hebau', '河北农业大学', 'HEBAU / 河北农大', 'hebeinongyedaxue hebau hnd hebeinongda', '河北', '保定', '省属重点', 'http://jw.hebau.edu.cn/'),
  makeSchool('hueb', '河北经贸大学', 'HUEB / 河经贸', 'hebeijingmaodaxue hueb hjm hebeijingmao', '河北', '石家庄', '财经重点', 'http://jw.heuet.edu.cn/'),
  makeSchool('hgu', '河北地质大学', 'HGU / 河地大', 'hebeidizhidaxue hgu hdd hebeidida', '河北', '石家庄', '特色高校', 'http://jw.hgu.edu.cn/'),

  // ================= 山西高校 =================
  makeSchool('tyut', '太原理工大学', 'TYUT / 太原理工', 'taiyuanligongdaxue tyut tylg taiyuanligong', '山西', '太原', '211 · 双一流', 'http://jxgl.tyut.edu.cn/'),
  makeSchool('sxu', '山西大学', 'SXU / 山大', 'shanxidaxue sxu sd shanda shanxidaxue', '山西', '太原', '双一流高校', 'http://jw.sxu.edu.cn/'),
  makeSchool('nuc', '中北大学', 'NUC / 中北', 'zhongbeidaxue nuc zb zhongbei', '山西', '太原', '省部共建', 'http://jwxt.nuc.edu.cn/'),
  makeSchool('tyust', '太原科技大学', 'TYUST / 太科大', 'taiyuankejidaxue tyust tkd taiyuankeda', '山西', '太原', '省属高校', 'http://jwxt.tyust.edu.cn/'),
  makeSchool('sxnu', '山西师范大学', 'SXNU / 山西师大', 'shanxishifandaxue sxnu sxsd shanxishida', '山西', '太原', '重点师范', 'http://jw.sxnu.edu.cn/'),
  makeSchool('sxufe', '山西财经大学', 'SXUFE / 山财', 'shanxicaijingdaxue sxufe sc shancai', '山西', '太原', '财经重点', 'http://jw.sxufe.edu.cn/'),
  makeSchool('sxmu', '山西医科大学', 'SXMU / 山医大', 'shanxiyikedaxue sxmu syd shanyida', '山西', '太原', '医学重点', 'http://jw.sxmu.edu.cn/'),
  makeSchool('sxau', '山西农业大学', 'SXAU / 山西农大', 'shanxinongyedaxue sxau snd shanxinongda', '山西', '晋中', '重点高校', 'http://jw.sxau.edu.cn/'),
  makeSchool('jzxy', '晋中学院', 'JZU / 晋中', 'jinzhongxueyuan jzu jzxy jinzhong', '山西', '晋中', '公办本科', 'http://jw.jzxy.edu.cn/'),
  makeSchool('sxdtdx', '山西大同大学', 'SDU / 大同大学', 'shanxidatongdaxue sdu dtdx datong', '山西', '大同', '公办综合', 'http://jw.sxdtdx.edu.cn/'),

  // ================= 内蒙古高校 =================
  makeSchool('imu', '内蒙古大学', 'IMU / 内大', 'neimenggudaxue imu nd neida', '内蒙古', '呼和浩特', '211 · 双一流', 'http://jwxt.imu.edu.cn/'),
  makeSchool('imut', '内蒙古工业大学', 'IMUT / 内工大', 'neimenggugongyedaxue imut ngd neigongda', '内蒙古', '呼和浩特', '自治区重点', 'http://jwxt.imut.edu.cn/'),
  makeSchool('imau', '内蒙古农业大学', 'IMAU / 内农大', 'neimenggunongyedaxue imau nnd neinongda', '内蒙古', '呼和浩特', '特色重点', 'http://jw.imau.edu.cn/'),
  makeSchool('imnu', '内蒙古师范大学', 'IMNU / 内师大', 'neimenggushifandaxue imnu nsd neishida', '内蒙古', '呼和浩特', '重点师范', 'http://jw.imnu.edu.cn/'),
  makeSchool('imun', '内蒙古民族大学', 'IMUN / 蒙民大', 'neimengguminzudaxue imun mmd mengminda', '内蒙古', '通辽', '综合重点', 'http://jw.imun.edu.cn/'),
  makeSchool('imust', '内蒙古科技大学', 'IMUST / 内科大', 'neimenggukejidaxue imust nkd neikeda', '内蒙古', '包头', '公办重点', 'http://jw.imust.edu.cn/'),

  // ================= 辽宁高校 =================
  makeSchool('dlut', '大连理工大学', 'DUT / 大工', 'dalianligongdaxue dlut dut dg dagong', '辽宁', '大连', '985 · 双一流', 'http://jxgl.dlut.edu.cn/'),
  makeSchool('neu', '东北大学', 'NEU / 东大', 'dongbeidaxue neu dd dongda', '辽宁', '沈阳', '985 · 双一流', 'http://219.216.96.4/'),
  makeSchool('lnu', '辽宁大学', 'LNU / 辽大', 'liaoningdaxue lnu ld liaoda', '辽宁', '沈阳', '211 · 双一流', 'http://jw.lnu.edu.cn/'),
  makeSchool('dmu', '大连海事大学', 'DMU / 海大', 'dalianhaishidaxue dmu hd haida haishi', '辽宁', '大连', '211 · 双一流', 'http://jw.dlmu.edu.cn/'),
  makeSchool('sau', '沈阳航空航天大学', 'SAU / 沈航', 'shenyanghangkonghangtiandaxue sau sh shenhang', '辽宁', '沈阳', '特色高水平', 'http://jwxt.sau.edu.cn/'),
  makeSchool('sylu', '沈阳理工大学', 'SYLU / 沈理工', 'shenyangligongdaxue sylu slg shenligong', '辽宁', '沈阳', '省属重点', 'http://jwxt.sylu.edu.cn/'),
  makeSchool('sut', '沈阳工业大学', 'SUT / 沈工大', 'shenyanggongyedaxue sut sgd shengongda', '辽宁', '沈阳', '重点工科', 'http://jw.sut.edu.cn/'),
  makeSchool('lntu', '辽宁工程技术大学', 'LNTU / 辽工程', 'liaoninggongchengjishudaxue lntu lgc liaogongcheng', '辽宁', '阜新', '重点工科', 'http://jwxt.lntu.edu.cn/'),
  makeSchool('lnpu', '辽宁石油化工大学', 'LNPU / 辽石化', 'liaoningshiyouhuagongdaxue lnpu lsh liaoshihua', '辽宁', '抚顺', '石化特色', 'http://jw.lnpu.edu.cn/'),
  makeSchool('dlju', '大连交通大学', 'DLJTU / 大连交大', 'dalianjiaotongdaxue dljtu dljd dalianjiaoda', '辽宁', '大连', '行业特色', 'http://jw.djtu.edu.cn/'),
  makeSchool('sjzu', '沈阳建筑大学', 'SJZU / 沈建大', 'shenyangjianzhadaxue sjzu sjd shenjianda', '辽宁', '沈阳', '建筑特色', 'http://jw.sjzu.edu.cn/'),
  makeSchool('dlpu', '大连工业大学', 'DLPU / 大工大', 'daliangongyedaxue dlpu dgd daliangongda', '辽宁', '大连', '轻工特色', 'http://jw.dlpu.edu.cn/'),
  makeSchool('syau', '沈阳农业大学', 'SYAU / 沈农', 'shenyangnongyedaxue syau sn shennong', '辽宁', '沈阳', '农科重点', 'http://jw.syau.edu.cn/'),
  makeSchool('cmu_ln', '中国医科大学', 'CMU / 中国医大', 'zhongguoyikedaxue cmu zgyd zhongguoyida', '辽宁', '沈阳', '医学重点', 'http://jwxt.cmu.edu.cn/'),
  makeSchool('dmu_med', '大连医科大学', 'DLMEDU / 大医', 'dalianyikedaxue dlmedu dy dayi', '辽宁', '大连', '重点医科', 'http://jw.dmu.edu.cn/'),
  makeSchool('lnnu', '辽宁师范大学', 'LNNU / 辽师大', 'liaoningshifandaxue lnnu lsd liaoshida', '辽宁', '大连', '重点师范', 'http://jw.lnnu.edu.cn/'),
  makeSchool('synu', '沈阳师范大学', 'SYNU / 沈师大', 'shenyangshifandaxue synu ssd shenshida', '辽宁', '沈阳', '省属重点', 'http://jw.synu.edu.cn/'),
  makeSchool('dufe', '东北财经大学', 'DUFE / 东财', 'dongbeicaijingdaxue dufe dc dongcai', '辽宁', '大连', '财经名校', 'http://jw.dufe.edu.cn/'),
  makeSchool('syu', '沈阳大学', 'SYU / 沈大', 'shenyangdaxue syu sd shenda', '辽宁', '沈阳', '公办综合', 'http://jw.syu.edu.cn/'),
  makeSchool('asnu', '鞍山师范学院', 'ASNU / 鞍师', 'anshanshifanxueyuan asnu as anshi', '辽宁', '鞍山', '公办本科', 'http://jw.asnc.edu.cn/'),

  // ================= 吉林高校 =================
  makeSchool('jlu', '吉林大学', 'JLU / 吉大', 'jilindaxue jlu jd jida', '吉林', '长春', '985 · 双一流', 'http://uims.jlu.edu.cn/'),
  makeSchool('nenu', '东北师范大学', 'NENU / 东北师大', 'dongbeishifandaxue nenu dbsd dongbeishida', '吉林', '长春', '211 · 双一流', 'http://jwxt.nenu.edu.cn/'),
  makeSchool('ybu', '延边大学', 'YBU / 延大', 'yanbiandaxue ybu yd yanda', '吉林', '延吉', '211 · 双一流', 'http://jw.ybu.edu.cn/'),
  makeSchool('cust', '长春理工大学', 'CUST / 长理工', 'changchunligongdaxue cust clg changligong', '吉林', '长春', '省部共建重点', 'http://jwxt.cust.edu.cn/'),
  makeSchool('jlau', '吉林农业大学', 'JLAU / 吉农', 'jilinnongyedaxue jlau jn jinong', '吉林', '长春', '重点高校', 'http://jw.jlau.edu.cn/'),
  makeSchool('ccucm', '长春中医药大学', 'CCUCM / 长中医', 'changchunzhongyiyaodaxue ccucm czy changzhongyi', '吉林', '长春', '特色高水平', 'http://jw.ccucm.edu.cn/'),
  makeSchool('neepu', '东北电力大学', 'NEEPU / 东电', 'dongbeidianlidaxue neepu dd dongdian', '吉林', '吉林', '行业特色重点', 'http://jw.neepu.edu.cn/'),
  makeSchool('ccit', '长春工业大学', 'CCUT / 长工大', 'changchungongyedaxue ccut cgd changgongda', '吉林', '长春', '重点工科', 'http://jw.ccut.edu.cn/'),
  makeSchool('jlufe', '吉林财经大学', 'JUFE / 吉财', 'jilincaijingdaxue jufe jc jicai', '吉林', '长春', '财经重点', 'http://jw.jlufe.edu.cn/'),
  makeSchool('beihua', '北华大学', 'BHU / 北华', 'beihuadaxue bhu bh beihua', '吉林', '吉林', '省属重点 · 青果', 'http://jw.beihua.edu.cn/'),
  makeSchool('thnu', '通化师范学院', 'THNU / 通师', 'tonghuashifanxueyuan thnu ts tongshi', '吉林', '通化', '师范本科', 'http://jw.thnu.edu.cn/'),

  // ================= 黑龙江高校 =================
  makeSchool('hit', '哈尔滨工业大学', 'HIT / 哈工大', 'haerbingongyedaxue hit hgd hagongda', '黑龙江', '哈尔滨', '985 · 双一流', 'http://jw.hit.edu.cn/'),
  makeSchool('heu', '哈尔滨工程大学', 'HEU / 哈工程', 'haerbingongchengdaxue heu hgc hagongcheng', '黑龙江', '哈尔滨', '211 · 双一流', 'https://cas.hrbeu.edu.cn/'),
  makeSchool('hlju', '黑龙江大学', 'HLJU / 黑大', 'heilongjiangdaxue hlju hd heida', '黑龙江', '哈尔滨', '省部共建重点', 'http://jwxt.hlju.edu.cn/'),
  makeSchool('nefu', '东北林业大学', 'NEFU / 东林', 'dongbeilinyedaxue nefu dl donglin', '黑龙江', '哈尔滨', '211 · 双一流', 'http://jwc.nefu.edu.cn/'),
  makeSchool('neau', '东北农业大学', 'NEAU / 东农', 'dongbeinongyedaxue neau dn dongnong', '黑龙江', '哈尔滨', '211 · 双一流', 'http://jwxt.neau.edu.cn/'),
  makeSchool('hrbust', '哈尔滨理工大学', 'HRBUST / 哈理工', 'haerbinligongdaxue hrbust hlg haligong', '黑龙江', '哈尔滨', '省属高水平', 'http://jwzx.hrbust.edu.cn/'),
  makeSchool('hrbmu', '哈尔滨医科大学', 'HMU / 哈医大', 'haerbinyikedaxue hmu hyd hayida', '黑龙江', '哈尔滨', '医学名校', 'http://jw.hrbmu.edu.cn/'),
  makeSchool('hrbnu', '哈尔滨师范大学', 'HNU / 哈师大', 'haerbinshifandaxue hnu hsd hashida', '黑龙江', '哈尔滨', '重点师范', 'http://jw.hrbnu.edu.cn/'),
  makeSchool('qqu', '齐齐哈尔大学', 'QQU / 齐大', 'qiqihaerdaxue qqu qd qida qingguo', '黑龙江', '齐齐哈尔', '青果 · 综合大学', 'http://jwgl.qqhru.edu.cn/'),
  makeSchool('nepu', '东北石油大学', 'NEPU / 东油', 'dongbeishiyoudaxue nepu dy dongyou', '黑龙江', '大庆', '石油重点', 'http://jwxt.nepu.edu.cn/'),
  makeSchool('mdjnu', '牡丹江师范学院', 'MNU / 牡师院', 'mudanjiangshifanxueyuan mnu msy mudanjiang qingguo', '黑龙江', '牡丹江', '师范院校 · 青果', 'http://jw.mdjnu.edu.cn/'),
  makeSchool('mdjmu', '牡丹江医学院', 'MMU / 牡医', 'mudanjiangyixueyuan mmu my mudanjiangyi', '黑龙江', '牡丹江', '医学本科', 'http://jwxt.mdjmu.edu.cn/'),
  makeSchool('hrbcu', '哈尔滨商业大学', 'HSD / 哈商大', 'haerbinshangyedaxue hsd hsd hashada', '黑龙江', '哈尔滨', '商科重点', 'http://jw.hrbcu.edu.cn/'),
  makeSchool('hljucm', '黑龙江中医药大学', 'HLJUCM / 龙中医', 'heilongjiangzhongyiyaodaxue hljucm lzy longzhongyi', '黑龙江', '哈尔滨', '双一流高校', 'http://jw.hljucm.net/'),
  makeSchool('hljit', '黑龙江工程学院', 'HLJIT / 黑工程', 'heilongjianggongchengxueyuan hljit hgc heigongcheng', '黑龙江', '哈尔滨', '公办工程', 'http://jw.hljit.edu.cn/'),
  makeSchool('shuihua', '绥化学院', 'SHU / 绥院', 'suihuaxueyuan shu sy suihua', '黑龙江', '绥化', '公办本科', 'http://jw.shxy.edu.cn/'),

  // ================= 上海高校 =================
  makeSchool('fdu', '复旦大学', 'FDU / 复旦', 'fudandaxue fdu fd fudan', '上海', '杨浦', 'C9 · 985 · 双一流', 'http://jwfw.fudan.edu.cn/eams/'),
  makeSchool('sjtu', '上海交通大学', 'SJTU / 上海交大', 'shanghaijiaotongdaxue sjtu sjd shanghaijiaoda jaccount', '上海', '闵行', 'C9 · 985 · 双一流', 'https://i.sjtu.edu.cn/'),
  makeSchool('tongji', '同济大学', 'Tongji / 同济', 'tongjidaxue tongji tj tongji', '上海', '杨浦', '985 · 双一流', 'http://1.tongji.edu.cn/'),
  makeSchool('ecnu', '华东师范大学', 'ECNU / 华东师大', 'huadongshifandaxue ecnu hdsd huadongshida', '上海', '闵行', '985 · 双一流', 'http://jwxx.ecnu.edu.cn/'),
  makeSchool('ecust', '华东理工大学', 'ECUST / 华理', 'huadongligongdaxue ecust hl huali', '上海', '徐汇', '211 · 双一流', 'http://eams.ecust.edu.cn/'),
  makeSchool('shu', '上海大学', 'SHU / 上大', 'shanghaidaxue shu sd shangda', '上海', '宝山', '211 · 双一流', 'http://cj.shu.edu.cn/'),
  makeSchool('sufe', '上海财经大学', 'SUFE / 上财', 'shanghaicaijingdaxue sufe sc shangcai', '上海', '杨浦', '211 · 双一流', 'http://eams.sufe.edu.cn/'),
  makeSchool('dhu', '东华大学', 'DHU / 东华', 'donghuadaxue dhu dh donghua', '上海', '松江', '211 · 双一流', 'http://jwgl.dhu.edu.cn/'),
  makeSchool('usst', '上海理工大学', 'USST / 上理工', 'shanghailigongdaxue usst slg shangligong', '上海', '杨浦', '市属重点', 'http://jwxt.usst.edu.cn/'),
  makeSchool('shnu', '上海师范大学', 'SHNU / 上师大', 'shanghaishifandaxue shnu ssd shangshida', '上海', '徐汇', '重点师范', 'http://jwxt.shnu.edu.cn/'),
  makeSchool('sisu', '上海外国语大学', 'SISU / 上外', 'shanghaiwaiguoyudaxue sisu sw shangwai', '上海', '虹口', '211 · 双一流', 'http://jw.shisu.edu.cn/'),
  makeSchool('ecupl', '华东政法大学', 'ECUPL / 华政', 'huadongzhengfadaxue ecupl hz huazheng', '上海', '松江', '政法名校', 'http://jw.ecupl.edu.cn/'),
  makeSchool('smu_sh', '上海海事大学', 'SMU / 上海海事', 'shanghaihaishidaxue smu shhs shanghaihaishi', '上海', '浦东', '航海特色', 'http://jwxt.shmtu.edu.cn/'),
  makeSchool('shou', '上海海洋大学', 'SHOU / 上海海洋', 'shanghaihaiyangdaxue shou shhy shanghaihaiyang', '上海', '浦东', '双一流高校', 'http://jw.shou.edu.cn/'),
  makeSchool('shutcm', '上海中医药大学', 'SHUTCM / 上中医', 'shanghaizhongyiyaodaxue shutcm szy shangzhongyi', '上海', '浦东', '双一流高校', 'http://jw.shutcm.edu.cn/'),
  makeSchool('sues', '上海工程技术大学', 'SUES / 程大', 'shanghaigongchengjishudaxue sues cd chengda', '上海', '松江', '应用工科', 'http://jw.sues.edu.cn/'),
  makeSchool('sit', '上海应用技术大学', 'SIT / 上应大', 'shanghaiyingyongjishudaxue sit syd shangyingda', '上海', '奉贤', '公办应用', 'http://jw.sit.edu.cn/'),
  makeSchool('suep', '上海电力大学', 'SUEP / 上电', 'shanghaidianlidaxue suep sd shangdian', '上海', '浦东', '电力特色', 'http://jw.shiep.edu.cn/'),
  makeSchool('lixin', '上海立信会计金融学院', 'SLBF / 立信', 'shanghailixinhuijijinrongxueyuan slbf lx lixin', '上海', '浦东', '财经特色', 'http://jw.lixin.edu.cn/'),

  // ================= 江苏高校 =================
  makeSchool('nju', '南京大学', 'NJU / 南大', 'nanjingdaxue nju nd nanda', '江苏', '鼓楼', 'C9 · 985 · 双一流', 'http://jw.nju.edu.cn/'),
  makeSchool('seu', '东南大学', 'SEU / 东大', 'dongnandaxue seu dd dongnan', '江苏', '玄武', '985 · 双一流', 'http://jwxt.seu.edu.cn/'),
  makeSchool('nuaa', '南京航空航天大学', 'NUAA / 南航', 'nanjinghangkonghangtiandaxue nuaa nh nanhang', '江苏', '秦淮', '211 · 双一流', 'http://jwxt.nuaa.edu.cn/'),
  makeSchool('nust', '南京理工大学', 'NUST / 南理工', 'nanjingligongdaxue nust nlg nanligong', '江苏', '玄武', '211 · 双一流', 'http://jw.njust.edu.cn/'),
  makeSchool('suda', '苏州大学', 'Soochow / 苏大', 'suzhoudaxue suda sd suda', '江苏', '苏州', '211 · 双一流', 'http://xk.suda.edu.cn/'),
  makeSchool('hhu', '河海大学', 'HHU / 河海', 'hehaidaxue hhu hh hehai', '江苏', '鼓楼', '211 · 双一流', 'http://jwxt.hhu.edu.cn/'),
  makeSchool('jiangnan', '江南大学', 'Jiangnan / 江大', 'jiangnandaxue jiangnan jd jiangnan', '江苏', '无锡', '211 · 双一流', 'http://jwxt.jiangnan.edu.cn/'),
  makeSchool('njnu', '南京师范大学', 'NNU / 南师大', 'nanjingshifandaxue nnu nsd nanshida qingguo', '江苏', '栖霞', '211 · 双一流', 'http://jwxt.njnu.edu.cn/'),
  makeSchool('ujs', '江苏大学', 'UJS / 江大', 'jiangsudaxue ujs jd jiangda', '江苏', '镇江', '省部共建重点', 'http://jw.ujs.edu.cn/'),
  makeSchool('yzu', '扬州大学', 'YZU / 扬大', 'yangzhoudaxue yzu yd yangda', '江苏', '扬州', '省属重点', 'http://jw.yzu.edu.cn/'),
  makeSchool('njupt', '南京邮电大学', 'NJUPT / 南邮', 'nanjingyoudiandaxue njupt ny nanyou', '江苏', '栖霞', '双一流高校', 'http://jwxt.njupt.edu.cn/'),
  makeSchool('nuist', '南京信息工程大学', 'NUIST / 南信大', 'nanjingxinxigongchengdaxue nuist nxd nanxinda', '江苏', '浦口', '双一流高校', 'http://jwxt.nuist.edu.cn/'),
  makeSchool('njtech', '南京工业大学', 'NJTECH / 南工大', 'nanjinggongyedaxue njtech ngd nangongda', '江苏', '江北', '省属重点', 'http://jw.njtech.edu.cn/'),
  makeSchool('nau', '南京审计大学', 'NAU / 南审', 'nanjingshenjidaxue nau ns nanshen', '江苏', '浦口', '审计特色', 'http://jwxt.nau.edu.cn/'),
  makeSchool('cczu', '常州大学', 'CZU / 常大', 'changzhoudaxue czu cd changda', '江苏', '常州', '省部共建', 'http://jw.cczu.edu.cn/'),
  makeSchool('nfu', '南京林业大学', 'NFU / 南林', 'nanjinglinyedaxue nfu nl nanlin', '江苏', '玄武', '双一流高校', 'http://jw.njfu.edu.cn/'),
  makeSchool('just', '江苏科技大学', 'JUST / 江科大', 'jiangsukejidaxue just jkd jiangkeda', '江苏', '镇江', '船舶特色', 'http://jwxt.just.edu.cn/'),
  makeSchool('ntu', '南通大学', 'NTU / 通大', 'nantongdaxue ntu td tongda', '江苏', '南通', '综合重点', 'http://jw.ntu.edu.cn/'),
  makeSchool('xzmu', '徐州医科大学', 'XZMU / 徐医大', 'xuzhouyikedaxue xzmu xyd xuyida', '江苏', '徐州', '医学重点', 'http://jw.xzhmu.edu.cn/'),
  makeSchool('njucm', '南京中医药大学', 'NJUCM / 南中医', 'nanjingzhongyiyaodaxue njucm nzy nanzhongyi', '江苏', '栖霞', '双一流高校', 'http://jwxt.njucm.edu.cn/'),
  makeSchool('njmu', '南京医科大学', 'NJMU / 南医大', 'nanjingyikedaxue njmu nyd nanyida', '江苏', '江宁', '双一流高校', 'http://jwxt.njmu.edu.cn/'),
  makeSchool('nufe', '南京财经大学', 'NUFE / 南财', 'nanjingcaijingdaxue nufe nc nancai', '江苏', '栖霞', '财经重点', 'http://jw.nufe.edu.cn/'),
  makeSchool('usts', '苏州科技大学', 'USTS / 苏科大', 'suzhoukejidaxue usts skd sukeda', '江苏', '苏州', '公办重点', 'http://jw.usts.edu.cn/'),
  makeSchool('xjtlu', '西交利物浦大学', 'XJTLU / 西浦', 'xijiaoliwupudaxue xjtlu xp xipu', '江苏', '苏州', '中外合办名校', 'http://e-bridge.xjtlu.edu.cn/'),
  makeSchool('yctu', '盐城工学院', 'YCIT / 盐工', 'yanchenggongxueyuan ycit yg yangong', '江苏', '盐城', '工程本科', 'http://jw.ycit.edu.cn/'),
  makeSchool('hyit', '淮阴工学院', 'HYIT / 淮工', 'huaiyingongxueyuan hyit hg huaigong', '江苏', '淮安', '公办工科', 'http://jw.hyit.edu.cn/'),
  makeSchool('cslg', '常熟理工学院', 'CSLG / 常熟理工', 'changshuligongxueyuan cslg cslg changshuligong', '江苏', '苏州', '公办应用', 'http://jw.cslg.edu.cn/'),

  // ================= 浙江高校 =================
  makeSchool('zju', '浙江大学', 'ZJU / 浙大', 'zhejiangdaxue zju zd zheda', '浙江', '杭州', 'C9 · 985 · 双一流', 'http://jwbinfosys.zju.edu.cn/'),
  makeSchool('nbu', '宁波大学', 'NBU / 宁大', 'ningbodaxue nbu nd ningda', '浙江', '宁波', '双一流高校', 'http://jwgl.nbu.edu.cn/'),
  makeSchool('zjut', '浙江工业大学', 'ZJUT / 浙工大', 'zhejianggongyedaxue zjut zgd zhegongda', '浙江', '杭州', '省部共建重点', 'http://www.gdjw.zjut.edu.cn/'),
  makeSchool('hdu', '杭州电子科技大学', 'HDU / 杭电', 'hangzhoudianzikejidaxue hdu hd hangdian', '浙江', '杭州', '特色高水平', 'http://jwgl.hdu.edu.cn/'),
  makeSchool('zstu', '浙江理工大学', 'ZSTU / 浙理工', 'zhejiangligongdaxue zstu zlg zheligong', '浙江', '杭州', '省属重点', 'http://jwxt.zstu.edu.cn/'),
  makeSchool('zafu', '浙江农林大学', 'ZAFU / 浙农林', 'zhejiangnonglindaxue zafu znl zhenonglin', '浙江', '杭州', '特色重点', 'http://jw.zafu.edu.cn/'),
  makeSchool('zcmu', '浙江中医药大学', 'ZCMU / 浙中医', 'zhejiangzhongyiyaodaxue zcmu zzy zhezhongyi', '浙江', '杭州', '医学高水平', 'http://jw.zcmu.edu.cn/'),
  makeSchool('zjnu', '浙江师范大学', 'ZJNU / 浙师大', 'zhejiangshifandaxue zjnu zsd zheshida', '浙江', '金华', '重点师范', 'http://jw.zjnu.edu.cn/'),
  makeSchool('wmu', '温州医科大学', 'WMU / 温医大', 'wenzhouyikedaxue wmu wyd wenyida', '浙江', '温州', '医学名校', 'http://jw.wmu.edu.cn/'),
  makeSchool('wzu', '温州大学', 'WZU / 温大', 'wenzhoudaxue wzu wd wenda', '浙江', '温州', '省属重点', 'http://jw.wzu.edu.cn/'),
  makeSchool('hznu', '杭州师范大学', 'HZNU / 杭师大', 'hangzhoushifandaxue hznu hsd hangshida', '浙江', '杭州', '省属重点', 'http://jw.hznu.edu.cn/'),
  makeSchool('cjlu', '中国计量大学', 'CJLU / 计量', 'zhongguojiliangdaxue cjlu jl jiliang', '浙江', '杭州', '计量特色重点', 'http://jw.cjlu.edu.cn/'),
  makeSchool('jxu', '嘉兴大学', 'JXU / 嘉大', 'jiaxingdaxue jxu jd jiada', '浙江', '嘉兴', '公办综合', 'http://jw.zjxu.edu.cn/'),
  makeSchool('usx', '绍兴文理学院', 'USX / 绍文理', 'shaoxingwenlixueyuan usx swl shaowenli', '浙江', '绍兴', '公办本科', 'http://jw.usx.edu.cn/'),

  // ================= 安徽高校 =================
  makeSchool('ustc', '中国科学技术大学', 'USTC / 中科大', 'zhongguokexuejishudaxue ustc zkd ked zhongkeda', '安徽', '合肥', 'C9 · 985 · 双一流', 'https://jw.ustc.edu.cn/'),
  makeSchool('hfut', '合肥工业大学', 'HFUT / 合工大', 'hefeigongyedaxue hfut hgd hegongda', '安徽', '合肥', '211 · 双一流', 'http://jwgl.hfut.edu.cn/'),
  makeSchool('ahu', '安徽大学', 'AHU / 安大', 'anhuidaxue ahu ad anda', '安徽', '合肥', '211 · 双一流', 'http://jwxt.ahu.edu.cn/'),
  makeSchool('ahut', '安徽工业大学', 'AHUT / 安工大', 'anhuigongyedaxue ahut agd angongda', '安徽', '马鞍山', '省属重点', 'http://jw.ahut.edu.cn/'),
  makeSchool('aust', '安徽理工大学', 'AUST / 安理大', 'anhuiligongdaxue aust ald anlida', '安徽', '淮南', '煤炭特色', 'http://jw.aust.edu.cn/'),
  makeSchool('aau', '安徽农业大学', 'AAU / 安农大', 'anhuinongyedaxue aau and annongda', '安徽', '合肥', '农林重点', 'http://jw.ahau.edu.cn/'),
  makeSchool('ahmu', '安徽医科大学', 'AHMU / 安医大', 'anhuiyikedaxue ahmu ayd anyida', '安徽', '合肥', '医学重点', 'http://jw.ahmu.edu.cn/'),
  makeSchool('ahtcm', '安徽中医药大学', 'AHTCM / 安中医', 'anhuizhongyiyaodaxue ahtcm azy anzhongyi', '安徽', '合肥', '医学名校', 'http://jw.ahtcm.edu.cn/'),
  makeSchool('ahnu', '安徽师范大学', 'AHNU / 安师大', 'anhuishifandaxue ahnu asd anshida', '安徽', '芜湖', '重点师范', 'http://jw.ahnu.edu.cn/'),
  makeSchool('fynu', '阜阳师范大学', 'FYNU / 阜师大', 'fuyangshifandaxue fynu fsd fuyangshida', '安徽', '阜阳', '省属师范', 'http://jw.fynu.edu.cn/'),
  makeSchool('aqnu', '安庆师范大学', 'AQNU / 安庆师大', 'anqingshifandaxue aqnu aqsd anqingshida', '安徽', '安庆', '省属师范', 'http://jw.aqnu.edu.cn/'),
  makeSchool('hbnu_ah', '淮北师范大学', 'HBNU / 淮北师大', 'huaibeishifandaxue hbnu hbsd huaibeishida', '安徽', '淮北', '重点师范', 'http://jw.hbnu.edu.cn/'),
  makeSchool('ahjzu', '安徽建筑大学', 'AHJZU / 安建大', 'anhuijianzhadaxue ahjzu ajd anjianda', '安徽', '合肥', '土木特色', 'http://jw.ahjzu.edu.cn/'),

  // ================= 福建高校 =================
  makeSchool('xmu', '厦门大学', 'XMU / 厦大', 'xiamendaxue xmu xd xiada', '福建', '厦门', '985 · 双一流', 'http://jw.xmu.edu.cn/'),
  makeSchool('fzu', '福州大学', 'FZU / 福大', 'fuzhoudaxue fzu fd fuda', '福建', '福州', '211 · 双一流', 'http://jwch.fzu.edu.cn/'),
  makeSchool('fafu', '福建农林大学', 'FAFU / 福建农林', 'fujiannonglindaxue fafu fjnl fujiannonglin', '福建', '福州', '省部共建重点', 'http://jwgl.fafu.edu.cn/'),
  makeSchool('fjnu', '福建师范大学', 'FJNU / 福建师大', 'fujianshifandaxue fjnu fjsd fujianshida', '福建', '福州', '重点师范', 'http://jw.fjnu.edu.cn/'),
  makeSchool('hqu', '华侨大学', 'HQU / 华大', 'huaqiaodaxue hqu hd huada', '福建', '泉州/厦门', '中央统战部直属', 'http://jw.hqu.edu.cn/'),
  makeSchool('fjmu', '福建医科大学', 'FJMU / 福医大', 'fujianyikedaxue fjmu fyd fuyida', '福建', '福州', '医学名校', 'http://jw.fjmu.edu.cn/'),
  makeSchool('fjutcm', '福建中医药大学', 'FJTCM / 福中医', 'fujianzhongyiyaodaxue fjtcm fzy fuzhongyi', '福建', '福州', '特色高水平', 'http://jw.fjtcm.edu.cn/'),
  makeSchool('jmu', '集美大学', 'JMU / 集大', 'jimeidaxue jmu jd jida', '福建', '厦门', '省部共建重点', 'http://jw.jmu.edu.cn/'),
  makeSchool('mnnu', '闽南师范大学', 'MNNU / 闽南师大', 'minnanshifandaxue mnnu mnsd minnanshida', '福建', '漳州', '省属重点', 'http://jw.mnnu.edu.cn/'),
  makeSchool('xmut', '厦门理工学院', 'XMUT / 厦理工', 'xiamenligongxueyuan xmut xlg xialigong', '福建', '厦门', '应用高水平', 'http://jw.xmut.edu.cn/'),
  makeSchool('mju', '闽江学院', 'MJU / 闽院', 'minjiangxueyuan mju my minyuan', '福建', '福州', '应用本科', 'http://jw.mju.edu.cn/'),

  // ================= 江西高校 =================
  makeSchool('ncu', '南昌大学', 'NCU / 昌大', 'nanchangdaxue ncu cd changda', '江西', '南昌', '211 · 双一流', 'http://jwc.ncu.edu.cn/'),
  makeSchool('jxnu', '江西师范大学', 'JXNU / 江西师大', 'jiangxishifandaxue jxnu jxsd jiangxishida', '江西', '南昌', '重点师范', 'http://jwc.jxnu.edu.cn/'),
  makeSchool('jufe', '江西财经大学', 'JUFE / 江财', 'jiangxicaijingdaxue jufe jc jiangcai', '江西', '南昌', '财经名校', 'http://jwxt.jxufe.edu.cn/'),
  makeSchool('ecjtu', '华东交通大学', 'ECJTU / 华东交大', 'huadongjiaotongdaxue ecjtu hdjd huadongjiaoda', '江西', '南昌', '轨道交通重点', 'http://jw.ecjtu.edu.cn/'),
  makeSchool('nchu', '南昌航空大学', 'NCHU / 昌航', 'nanchanghangkongdaxue nchu ch changhang', '江西', '南昌', '航空航天特色', 'http://jw.nchu.edu.cn/'),
  makeSchool('ecut', '东华理工大学', 'ECUT / 东华理工', 'donghualigongdaxue ecut dhlg donghualigong', '江西', '南昌', '核工特色', 'http://jw.ecut.edu.cn/'),
  makeSchool('jxust', '江西理工大学', 'JXUST / 江理', 'jiangxiligongdaxue jxust jl jiangli', '江西', '赣州', '有色金属重点', 'http://jw.jxust.edu.cn/'),
  makeSchool('jxau', '江西农业大学', 'JXAU / 江农', 'jiangxinongyedaxue jxau jn jiangnong', '江西', '南昌', '农科高水平', 'http://jw.jxau.edu.cn/'),
  makeSchool('jxutcm', '江西中医药大学', 'JXTCM / 江中医', 'jiangxizhongyiyaodaxue jxtcm jzy jiangzhongyi', '江西', '南昌', '中药名校', 'http://jw.jxutcm.edu.cn/'),
  makeSchool('jci', '景德镇陶瓷大学', 'JCI / 陶大', 'jingdezbentaocidaxue jci td taoda', '江西', '景德镇', '陶瓷特色重点', 'http://jw.jci.edu.cn/'),
  makeSchool('gnnu', '赣南师范大学', 'GNNU / 赣南师大', 'gannanshifandaxue gnnu gnsd gannanshida', '江西', '赣州', '师范重点', 'http://jw.gnnu.edu.cn/'),
  makeSchool('jju', '九江学院', 'JJU / 九院', 'jiujiangxueyuan jju jy jiuyuan', '江西', '九江', '公办本科', 'http://jw.jju.edu.cn/'),
  makeSchool('ycu', '宜春学院', 'YCU / 宜春', 'yichunxueyuan ycu yc yichun', '江西', '宜春', '综合本科', 'http://jw.ycu.edu.cn/'),
  makeSchool('jgsu', '井冈山大学', 'JGSU / 井大', 'jinggangshandaxue jgsu jd jingda', '江西', '吉安', '省部共建', 'http://jw.jgsu.edu.cn/'),

  // ================= 山东高校 =================
  makeSchool('sdu', '山东大学', 'SDU / 山大', 'shandongdaxue sdu sd shanda', '山东', '济南', '985 · 双一流', 'http://bkjw.sdu.edu.cn/'),
  makeSchool('ouc', '中国海洋大学', 'OUC / 海大', 'zhongguohaiyangdaxue ouc hd haida haiyang', '山东', '青岛', '985 · 双一流', 'http://jwgl.ouc.edu.cn/'),
  makeSchool('upc', '中国石油大学(华东)', 'UPC / 石大', 'zhongguoshiyoudaxuehuadong upc sd shida', '山东', '青岛', '211 · 双一流', 'http://jwxt.upc.edu.cn/'),
  makeSchool('sdust', '山东科技大学', 'SDUST / 山科大', 'shandongkejidaxue sdust skd shankeda', '山东', '青岛', '省部共建重点', 'http://jwxt.sdust.edu.cn/'),
  makeSchool('qust', '青岛科技大学', 'QUST / 青科大', 'qingdaokejidaxue qust qkd qingkeda', '山东', '青岛', '化工橡胶重点', 'http://jw.qust.edu.cn/'),
  makeSchool('ujn', '济南大学', 'UJN / 济大', 'jinandaxue ujn jd jida', '山东', '济南', '综合重点', 'http://jw.ujn.edu.cn/'),
  makeSchool('qut', '青岛理工大学', 'QUT / 青理工', 'qingdaoligongdaxue qut qlg qingligong', '山东', '青岛', '土建重点', 'http://jw.qut.edu.cn/'),
  makeSchool('sdjzu', '山东建筑大学', 'SDJZU / 山建大', 'shandongjianzhadaxue sdjzu sjd shanjianda', '山东', '济南', '建筑特色', 'http://jw.sdjzu.edu.cn/'),
  makeSchool('qlu', '齐鲁工业大学', 'QLU / 齐鲁工大', 'qilugongyedaxue qlu qlgd qilugongda', '山东', '济南', '科学院融合', 'http://jw.qlu.edu.cn/'),
  makeSchool('sdau', '山东农业大学', 'SDAU / 山农大', 'shandongnongyedaxue sdau snd shannongda', '山东', '泰安', '百年农业名校', 'http://jw.sdau.edu.cn/'),
  makeSchool('qau', '青岛农业大学', 'QAU / 青农大', 'qingdaonongyedaxue qau qnd qingnongda', '山东', '青岛', '公办重点', 'http://jw.qau.edu.cn/'),
  makeSchool('sdmu_first', '山东第一医科大学', 'SDFMU / 山一大', 'shandongdiyiyikedaxue sdfmu syd shanyida', '山东', '济南', '医科重点', 'http://jw.sdfmu.edu.cn/'),
  makeSchool('sdutcm', '山东中医药大学', 'SDUTCM / 山中医', 'shandongzhongyiyaodaxue sdutcm szy shanzhongyi', '山东', '济南', '医学名校', 'http://jw.sdutcm.edu.cn/'),
  makeSchool('sdnu', '山东师范大学', 'SDNU / 山师', 'shandongshifandaxue sdnu ss shanshi', '山东', '济南', '重点师范', 'http://jw.sdnu.edu.cn/'),
  makeSchool('qfnu', '曲阜师范大学', 'QFNU / 曲师大', 'qufushifandaxue qfnu qsd qushida', '山东', '日照/曲阜', '孔孟圣地名校', 'http://jw.qfnu.edu.cn/'),
  makeSchool('lcu', '聊城大学', 'LCU / 聊大', 'liaochengdaxue lcu ld liaoda', '山东', '聊城', '省属公办', 'http://jw.lcu.edu.cn/'),
  makeSchool('ldu', '鲁东大学', 'LDU / 鲁东', 'ludongdaxue ldu ld ludong', '山东', '烟台', '综合大学', 'http://jw.ldu.edu.cn/'),
  makeSchool('lyu', '临沂大学', 'LYU / 临大', 'linyidaxue lyu ld linda', '山东', '临沂', '综合本科', 'http://jw.lyu.edu.cn/'),
  makeSchool('qdu', '青岛大学', 'QDU / 青大', 'qingdaodaxue qdu qd qingda', '山东', '青岛', '省属重点', 'http://jw.qdu.edu.cn/'),
  makeSchool('ytu', '烟台大学', 'YTU / 烟大', 'yantaidaxue ytu yd yanda', '山东', '烟台', '北京大学清华大学共建', 'http://jw.ytu.edu.cn/'),
  makeSchool('wfu', '潍坊学院', 'WFU / 潍院', 'weifangxueyuan wfu wy weiyuan', '山东', '潍坊', '公办本科', 'http://jw.wfu.edu.cn/'),

  // ================= 河南高校 =================
  makeSchool('zzu', '郑州大学', 'ZZU / 郑大', 'zhengzhoudaxue zzu zd zhengda', '河南', '郑州', '211 · 双一流', 'http://jwxt.zzu.edu.cn/'),
  makeSchool('henu', '河南大学', 'HENU / 河大', 'henandaxue henu hd heda', '河南', '开封/郑州', '双一流高校', 'http://jwgl.henu.edu.cn/'),
  makeSchool('henannu', '河南师范大学', 'HTU / 河师大', 'henanshifandaxue htu hsd heshida qingguo', '河南', '新乡', '青果 · 重点高校', 'http://jw.htu.edu.cn/'),
  makeSchool('hpu', '河南理工大学', 'HPU / 河南理工', 'henanligongdaxue hpu hlg henanligong', '河南', '焦作', '煤炭历史名校', 'http://jwxt.hpu.edu.cn/'),
  makeSchool('haust', '河南科技大学', 'HAUST / 河科大', 'henankejidaxue haust hkd hekeda', '河南', '洛阳', '省部共建重点', 'http://jwxt.haust.edu.cn/'),
  makeSchool('ncwu', '华北水利水电大学', 'NCWU / 华水', 'huabeishuilishuidiandaxue ncwu hs huashui', '河南', '郑州', '水利特色名校', 'http://jw.ncwu.edu.cn/'),
  makeSchool('zzuli', '郑州轻工业大学', 'ZZULI / 郑州轻工业', 'zhengzhouqinggongyedaxue zzuli zzqgy zhengqing', '河南', '郑州', '重点工科', 'http://jw.zzuli.edu.cn/'),
  makeSchool('henau', '河南农业大学', 'HAU / 河南农大', 'henannongyedaxue hau hnd henannongda', '河南', '郑州', '省部共建重点', 'http://jw.henau.edu.cn/'),
  makeSchool('hactcm', '河南中医药大学', 'HACTCM / 河中医', 'henanzhongyiyaodaxue hactcm hzy hezhongyi', '河南', '郑州', '中医药特色', 'http://jw.hactcm.edu.cn/'),
  makeSchool('xynu', '信阳师范大学', 'XYNU / 信阳师大', 'xinyangshifandaxue xynu xysd xinyangshida', '河南', '信阳', '师范重点', 'http://jw.xynu.edu.cn/'),
  makeSchool('zut', '中原工学院', 'ZUT / 中工', 'zhongyangongxueyuan zut zg zhonggong', '河南', '郑州', '纺织工程重点', 'http://jw.zut.edu.cn/'),
  makeSchool('haut', '河南工业大学', 'HAUT / 河南工大', 'henangongyedaxue haut hgd henangongda', '河南', '郑州', '粮食工程重点', 'http://jwxt.haut.edu.cn/'),
  makeSchool('nlit', '南阳理工学院', 'NYIST / 南阳理工', 'nanyangligongxueyuan nyist nylg nanyangligong', '河南', '南阳', '工程应用本科', 'http://jw.nyist.edu.cn/'),
  makeSchool('xxmu', '新乡医学院', 'XXMU / 新医', 'xinxiangyixueyuan xxmu xy xinyi', '河南', '新乡', '独立医学院', 'http://jw.xxmu.edu.cn/'),
  makeSchool('pdsxy', '平顶山学院', 'PDSU / 平院', 'pingdingshanxueyuan pdsu py pingyuan', '河南', '平顶山', '公办应用', 'http://jw.pdsu.edu.cn/'),

  // ================= 湖北高校 =================
  makeSchool('whu', '武汉大学', 'WHU / 武大', 'wuhandaxue whu wd wuda', '湖北', '武汉', '985 · 双一流', 'https://bkzs.whu.edu.cn/'),
  makeSchool('hust', '华中科技大学', 'HUST / 华科', 'huazhongkejidaxue hust hk huake huakeji', '湖北', '武汉', '985 · 双一流', 'http://hub.m.hust.edu.cn/'),
  makeSchool('whut', '武汉理工大学', 'WUT / 武理工', 'wuhanligongdaxue wut wlg wuligong', '湖北', '武汉', '211 · 双一流', 'http://jwxt.whut.edu.cn/'),
  makeSchool('hzau', '华中农业大学', 'HZAU / 华农', 'huazhongnongyedaxue hzau hn huanong', '湖北', '武汉', '211 · 双一流', 'http://jwxt.hzau.edu.cn/'),
  makeSchool('ccnu', '华中师范大学', 'CCNU / 华中师大', 'huazhongshifandaxue ccnu hzsd huazhongshida', '湖北', '武汉', '211 · 双一流', 'http://xk.ccnu.edu.cn/'),
  makeSchool('zuel', '中南财经政法大学', 'ZUEL / 中南大', 'zhongnancaijingzhengfadaxue zuel znd zhongnandaxue', '湖北', '武汉', '211 · 双一流', 'http://jwgl.zuel.edu.cn/'),
  makeSchool('cug', '中国地质大学(武汉)', 'CUG / 地大', 'zhongguodizhidaxuewuhan cug dd dida', '湖北', '武汉', '211 · 双一流', 'http://jwxt.cug.edu.cn/'),
  makeSchool('hubu', '湖北大学', 'HUBU / 湖大', 'hubeidaxue hubu hd huda', '湖北', '武汉', '省属重点', 'http://jwxt.hubu.edu.cn/'),
  makeSchool('wust', '武汉科技大学', 'WUST / 武科大', 'wuhankejidaxue wust wkd wukeda', '湖北', '武汉', '冶金特色重点', 'http://jwxt.wust.edu.cn/'),
  makeSchool('yangtzeu', '长江大学', 'YU / 长大', 'changjiangdaxue yu cd changda', '湖北', '荆州/武汉', '石油与农科重点', 'http://jw.yangtzeu.edu.cn/'),
  makeSchool('jhun', '江汉大学', 'JHUN / 江大', 'jianghandaxue jhun jd jiangda', '湖北', '武汉', '市属高水平', 'http://jw.jhun.edu.cn/'),
  makeSchool('ctgu', '三峡大学', 'CTGU / 三大', 'sanxiadaxue ctgu sd sanda', '湖北', '宜昌', '水利电力重点', 'http://jw.ctgu.edu.cn/'),
  makeSchool('wit', '武汉工程大学', 'WIT / 武工大', 'wuhangongchengdaxue wit wgd wugongda', '湖北', '武汉', '化工特色', 'http://jw.wit.edu.cn/'),
  makeSchool('hbut', '湖北工业大学', 'HBUT / 湖工大', 'hubeigongyedaxue hbut hgd hugongda', '湖北', '武汉', '工程重点', 'http://jw.hbut.edu.cn/'),
  makeSchool('wtu', '武汉纺织大学', 'WTU / 纺大', 'wuhanfangzhidaxue wtu fd fangda', '湖北', '武汉', '纺织特色', 'http://jw.wtu.edu.cn/'),
  makeSchool('hbtcmu', '湖北中医药大学', 'HBTCM / 湖中医', 'hubeizhongyiyaodaxue hbtcm hzy huzhongyi', '湖北', '武汉', '中医药特色', 'http://jw.hbtcm.edu.cn/'),
  makeSchool('hbnu', '湖北师范大学', 'HBNU / 湖师大', 'hubeishifandaxue hbnu hsd hushida', '湖北', '黄石', '重点师范', 'http://jw.hbnu.edu.cn/'),

  // ================= 湖南高校 =================
  makeSchool('csu', '中南大学', 'CSU / 中南', 'zhongnandaxue csu zn zhongnan', '湖南', '长沙', '985 · 双一流', 'http://csujwc.its.csu.edu.cn/'),
  makeSchool('hnu', '湖南大学', 'HNU / 湖大', 'hunandaxue hnu hd huda', '湖南', '长沙', '985 · 双一流', 'http://jw.hnu.edu.cn/'),
  makeSchool('hunnu', '湖南师范大学', 'HUNNU / 湖师大', 'hunanshifandaxue hunnu hsd hushida qingguo', '湖南', '长沙', '211 · 双一流', 'https://jw.hunnu.edu.cn/'),
  makeSchool('csust', '长沙理工大学', 'CSUST / 长理', 'changshaligongdaxue csust cl changli qiangzhi', '湖南', '长沙', '强智系统', 'http://xk.csust.edu.cn/'),
  makeSchool('hunau', '湖南农业大学', 'HUNAU / 湖南农大', 'hunannongyedaxue hunau hnd hunannongda qiangzhi', '湖南', '长沙', '省属重点', 'http://jwxt.hunau.edu.cn/'),
  makeSchool('csuft', '中南林业科技大学', 'CSUFT / 中南林', 'zhongnanlinyekejidaxue csuft znl zhongnanlin', '湖南', '长沙', '林业高水平', 'http://jwgl.csuft.edu.cn/'),
  makeSchool('xtu', '湘潭大学', 'XTU / 湘大', 'xiangtandaxue xtu xd xiangda', '湖南', '湘潭', '双一流高校', 'http://jwxt.xtu.edu.cn/'),
  makeSchool('hnust', '湖南科技大学', 'HNUST / 湖科大', 'hunankejidaxue hnust hkd hukeda qiangzhi', '湖南', '湘潭', '强智系统', 'http://kdjw.hnust.edu.cn/'),
  makeSchool('usc', '南华大学', 'USC / 南华', 'nanhuadaxue usc nh nanhua qiangzhi', '湖南', '衡阳', '核工医学重点', 'http://jwxt.usc.edu.cn/'),
  makeSchool('jsu_hn', '吉首大学', 'JSU / 吉大', 'jishoudaxue jsu jd jishou qiangzhi', '湖南', '吉首', '民族重点', 'http://jwxt.jsu.edu.cn/'),
  makeSchool('hut', '湖南工业大学', 'HUT / 湖工大', 'hunangongyedaxue hut hgd hugongda', '湖南', '株洲', '包装特色高水平', 'http://jwxt.hut.edu.cn/'),
  makeSchool('hnfirstnu', '湖南第一师范学院', 'HN1NU / 一师范', 'hunandiyishifanxueyuan hnnu ysf yishifan', '湖南', '长沙', '师范名校', 'http://jwgl.hnfnu.edu.cn/'),
  makeSchool('hnu_med', '湖南中医药大学', 'HNUCMS / 湖中医', 'hunanzhongyiyaodaxue hnucms hzy huzhongyi', '湖南', '长沙', '医学特色', 'http://jwxt.hnucm.edu.cn/'),
  makeSchool('syu_hn', '邵阳学院', 'SYU / 邵院', 'shaoyangxueyuan syu sy shaoyuan', '湖南', '邵阳', '公办应用', 'http://jw.hnsyu.edu.cn/'),
  makeSchool('hhu_hn', '怀化学院', 'HHU / 怀院', 'huaihuaxueyuan hhu hy huaiyuan', '湖南', '怀化', '公办本科', 'http://jw.hhtc.edu.cn/'),
  makeSchool('xnu_hn', '湘南学院', 'XNU / 湘南', 'xiangnanxueyuan xnu xn xiangnan', '湖南', '郴州', '公办本科', 'http://jw.xnu.edu.cn/'),
  makeSchool('huas', '湖南文理学院', 'HUAS / 湖南文理', 'hunanwenlixueyuan huas hnwl hunanwenli', '湖南', '常德', '公办本科', 'http://jw.huas.edu.cn/'),
  makeSchool('huel', '湖南人文科技学院', 'HUEL / 人文科技', 'hunanrenwenkejixueyuan huel rwk j hunanrenwen', '湖南', '娄底', '公办本科', 'http://jw.huhst.edu.cn/'),
  makeSchool('hnie', '湖南工程学院', 'HNIE / 湖工院', 'hunangongchengxueyuan hnie hgy hugongyuan', '湖南', '湘潭', '电气纺织特色', 'http://jw.hnie.edu.cn/'),
  makeSchool('hynu', '衡阳师范学院', 'HYNU / 衡师', 'hengyangshifanxueyuan hynu hs hengshi', '湖南', '衡阳', '省属师范', 'http://jw.hynu.edu.cn/'),
  makeSchool('hncu', '湖南城市学院', 'HNCU / 城院', 'hunanchengshixueyuan hncu cy chengyuan', '湖南', '益阳', '规划建筑特色', 'http://jw.hncu.edu.cn/'),
  makeSchool('hnit', '湖南工学院', 'HNIT / 湖工', 'hunangongxueyuan hnit hg hugong', '湖南', '衡阳', '安全工程特色', 'http://jw.hnit.edu.cn/'),

  // ================= 广东高校 =================
  makeSchool('sysu', '中山大学', 'SYSU / 中大', 'zhongshandaxue sysu zd zhongda', '广东', '广州', '985 · 双一流', 'https://jwxt.sysu.edu.cn/jwxt/'),
  makeSchool('scut', '华南理工大学', 'SCUT / 华工', 'huananligongdaxue scut hg huagong', '广东', '广州', '985 · 双一流', 'http://jwxt.scut.edu.cn/'),
  makeSchool('jnu', '暨南大学', 'JNU / 暨大', 'jinandaxue jnu jd jida', '广东', '广州', '211 · 双一流', 'https://jw2017.jnu.edu.cn/'),
  makeSchool('szu', '深圳大学', 'SZU / 深大', 'shenzhendaxue szu sd shenda', '广东', '深圳', '特区旗舰高校', 'http://ehall.szu.edu.cn/jwapp/sys/homeapp/home/index.html'),
  makeSchool('sustech', '南方科技大学', 'SUSTech / 南科大', 'nanfangkejidaxue sustech nkd nankeda', '广东', '深圳', '双一流高校', 'https://jwxt.sustech.edu.cn/'),
  makeSchool('gdut', '广东工业大学', 'GDUT / 广工', 'guangdonggongyedaxue gdut gg guanggong qiangzhi', '广东', '广州', '强智系统', 'http://jxfw.gdut.edu.cn/'),
  makeSchool('scau', '华南农业大学', 'SCAU / 华农', 'huanannongyedaxue scau hn huanong', '广东', '广州', '双一流高校', 'http://jwxt.scau.edu.cn/'),
  makeSchool('scnu', '华南师范大学', 'SCNU / 华师', 'huananshifandaxue scnu hs huashi qingguo', '广东', '广州', '211 · 双一流', 'https://jwxt.scnu.edu.cn/'),
  makeSchool('gdufs', '广东外语外贸大学', 'GDUFS / 广外', 'guangdongwaiyuwaimaodaxue gdufs gw guangwai', '广东', '广州', '外语外贸重点', 'http://jw.gdufs.edu.cn/'),
  makeSchool('gzhu', '广州大学', 'GZHU / 广大', 'guangzhoudaxue gzhu gd guangda', '广东', '广州', '高水平综合', 'http://jwxt.gzhu.edu.cn/'),
  makeSchool('stu', '汕头大学', 'STU / 汕大', 'shantoudaxue stu sd shanda', '广东', '汕头', '潮汕特色名校', 'http://credit.stu.edu.cn/'),
  makeSchool('gdmu', '广东医科大学', 'GDMU / 广医大', 'guangdongyikedaxue gdmu gyd guangyida', '广东', '湛江/东莞', '医学高水平', 'http://jw.gdmu.edu.cn/'),
  makeSchool('gdpu', '广东药科大学', 'GDPU / 广药大', 'guangdongyaokedaxue gdpu gyd guangyaoda', '广东', '广州', '医药特色', 'http://jw.gdpu.edu.cn/'),
  makeSchool('gzhmu', '广州医科大学', 'GMU / 广医', 'guangzhouyikedaxue gmu gy guangyi', '广东', '广州', '双一流高校', 'http://jw.gzhmu.edu.cn/'),
  makeSchool('gzucm', '广州中医药大学', 'GZUCM / 广中医', 'guangzhouzhongyiyaodaxue gzucm gzy guangzhongyi', '广东', '广州', '双一流高校', 'http://jw.gzucm.edu.cn/'),
  makeSchool('gdou', '广东海洋大学', 'GDOU / 广海', 'guangdonghaiyangdaxue gdou gh guanghai', '广东', '湛江', '海洋特色重点', 'http://jw.gdou.edu.cn/'),
  makeSchool('dgut', '东莞理工学院', 'DGUT / 莞工', 'dongguanligongxueyuan dgut wg wangong', '广东', '东莞', '应用高水平', 'http://jw.dgut.edu.cn/'),
  makeSchool('sztu', '深圳技术大学', 'SZTU / 深技大', 'shenzhenjishudaxue sztu sjd shenjida', '广东', '深圳', '应用型本科名校', 'http://jw.sztu.edu.cn/'),

  // ================= 广西高校 =================
  makeSchool('gxu', '广西大学', 'GXU / 西大', 'guangxidaxue gxu xd xida', '广西', '南宁', '211 · 双一流', 'http://jw.gxu.edu.cn/'),
  makeSchool('guet', '桂林电子科技大学', 'GUET / 桂电', 'guilindianzikejidaxue guet gd guidian', '广西', '桂林', '电子信息名校', 'http://jw.guet.edu.cn/'),
  makeSchool('gut', '桂林理工大学', 'GUT / 桂工', 'guilinligongdaxue gut gg guigong', '广西', '桂林', '理工特色重点', 'http://jw.glut.edu.cn/'),
  makeSchool('gxnu', '广西师范大学', 'GXNU / 广西师大', 'guangxishifandaxue gxnu gxsd guangxishida', '广西', '桂林', '重点师范', 'http://jw.gxnu.edu.cn/'),
  makeSchool('gxmu', '广西医科大学', 'GXMU / 广医大', 'guangxiyikedaxue gxmu gyd guangyida', '广西', '南宁', '医学名校', 'http://jw.gxmu.edu.cn/'),
  makeSchool('gxun', '广西民族大学', 'GXUN / 广民大', 'guangximinzudaxue gxun gmd guangminda', '广西', '南宁', '省部共建', 'http://jw.gxun.edu.cn/'),
  makeSchool('nnnu', '南宁师范大学', 'NNNU / 南宁师大', 'nanningshifandaxue nnnu nnsd nanningshida', '广西', '南宁', '公办师范', 'http://jw.nnnu.edu.cn/'),

  // ================= 海南高校 =================
  makeSchool('hainanu', '海南大学', 'HNU / 海大', 'hainandaxue hnu hd haida hainan', '海南', '海口', '211 · 双一流', 'http://jwgl.hainanu.edu.cn/'),
  makeSchool('hnnu_hain', '海南师范大学', 'HNNU / 海师大', 'hainanshifandaxue hnnu hsd haishida', '海南', '海口', '省属重点', 'http://jw.hainnu.edu.cn/'),
  makeSchool('mu_hn', '海南医学院', 'HNM / 海医', 'hainanyixueyuan hnm hy haiyi', '海南', '海口', '医药特色', 'http://jw.hainmc.edu.cn/'),

  // ================= 重庆高校 =================
  makeSchool('cqu', '重庆大学', 'CQU / 重大', 'chongqingdaxue cqu cd chongda zhongda', '重庆', '沙坪坝', '985 · 双一流', 'http://jwxt.cqu.edu.cn/'),
  makeSchool('swu', '西南大学', 'SWU / 西大', 'xinandaxue swu xd xida', '重庆', '北碚', '211 · 双一流', 'http://jwxt.swu.edu.cn/'),
  makeSchool('cqupt', '重庆邮电大学', 'CQUPT / 重邮', 'chongqingyoudiandaxue cqupt cy chongyou', '重庆', '南岸', '电子信息特色', 'http://jwxt.cqupt.edu.cn/'),
  makeSchool('cqjtu', '重庆交通大学', 'CQJTU / 重交', 'chongqingjiaotongdaxue cqjtu cj chongjiao', '重庆', '南岸', '交通重点', 'http://jw.cqjtu.edu.cn/'),
  makeSchool('cqmu', '重庆医科大学', 'CQMU / 重医', 'chongqingyikedaxue cqmu cy chongyi', '重庆', '渝中', '医学重点', 'http://jw.cqmu.edu.cn/'),
  makeSchool('cqnu', '重庆师范大学', 'CQNU / 重师大', 'chongqingshifandaxue cqnu csd chongshida', '重庆', '沙坪坝', '师范重点', 'http://jw.cqnu.edu.cn/'),
  makeSchool('ctbu', '重庆工商大学', 'CTBU / 重工商', 'chongqinggongshangdaxue ctbu cgs chonggongshang', '重庆', '南岸', '经管特色', 'http://jw.ctbu.edu.cn/'),
  makeSchool('cqut', '重庆理工大学', 'CQUT / 重理工', 'chongqingligongdaxue cqut clg chongligong', '重庆', '巴南', '装备工科重点', 'http://jw.cqut.edu.cn/'),
  makeSchool('sisu_cq', '四川外国语大学', 'SISU / 川外', 'sichuanwaiguoyudaxue sisu cw chuanwai', '重庆', '沙坪坝', '外语名校', 'http://jw.sisu.edu.cn/'),

  // ================= 四川高校 =================
  makeSchool('scu', '四川大学', 'SCU / 川大', 'sichuandaxue scu cd chuanda', '四川', '成都', '985 · 双一流', 'http://zhjw.scu.edu.cn/'),
  makeSchool('uestc', '电子科技大学', 'UESTC / 成电', 'dianzikejidaxue uestc cd chengdian', '四川', '成都', '985 · 双一流', 'http://eams.uestc.edu.cn/eams/'),
  makeSchool('swjtu', '西南交通大学', 'SWJTU / 西南交大', 'xinanjiaotongdaxue swjtu xnjd xinanjiaoda', '四川', '成都', '211 · 双一流', 'http://jwc.swjtu.edu.cn/'),
  makeSchool('swufe', '西南财经大学', 'SWUFE / 西财', 'xinancaijingdaxue swufe xc xicai', '四川', '成都', '211 · 双一流', 'http://jwxt.swufe.edu.cn/'),
  makeSchool('sicau', '四川农业大学', 'SICAU / 川农', 'sichuannongyedaxue sicau cn chuannong', '四川', '雅安/成都', '211 · 双一流', 'http://jiaowu.sicau.edu.cn/'),
  makeSchool('cdut', '成都理工大学', 'CDUT / 成理', 'chengduligongdaxue cdut cl chengli', '四川', '成都', '双一流高校', 'http://jw.cdut.edu.cn/'),
  makeSchool('swpu', '西南石油大学', 'SWPU / 西南石大', 'xinanshiyoudaxue swpu xnsd xinanshida', '四川', '成都', '双一流高校', 'http://jw.swpu.edu.cn/'),
  makeSchool('swust', '西南科技大学', 'SWUST / 西科大', 'xinankejidaxue swust xkd xikeda', '四川', '绵阳', '国防共建重点', 'http://jw.swust.edu.cn/'),
  makeSchool('cdutcm', '成都中医药大学', 'CDTCM / 成中医', 'chengduzhongyiyaodaxue cdtcm czy chengzhongyi', '四川', '成都', '双一流高校', 'http://jw.cdutcm.edu.cn/'),
  makeSchool('sicnu', '四川师范大学', 'SICNU / 川师大', 'sichuanshifandaxue sicnu csd chuanshida', '四川', '成都', '省属重点', 'http://jw.sicnu.edu.cn/'),
  makeSchool('xhu', '西华大学', 'XHU / 西华', 'xihuadaxue xhu xh xihua', '四川', '成都', '综合工科', 'http://jw.xhu.edu.cn/'),
  makeSchool('cwnu', '西华师范大学', 'CWNU / 西华师大', 'xihuashifandaxue cwnu xhsd xihuashida', '四川', '南充', '省属师范', 'http://jw.cwnu.edu.cn/'),
  makeSchool('cuit', '成都信息工程大学', 'CUIT / 成信大', 'chengduxinxigongchengdaxue cuit cxd chengxinda', '四川', '成都', '气象信息特色', 'http://jw.cuit.edu.cn/'),
  makeSchool('cdu', '成都大学', 'CDU / 成大', 'chengdudaxue cdu cd chengda', '四川', '成都', '综合高水平', 'http://jw.cdu.edu.cn/'),

  // ================= 贵州高校 =================
  makeSchool('gzu', '贵州大学', 'GZU / 贵大', 'guizhoudaxue gzu gd guida', '贵州', '贵阳', '211 · 双一流', 'http://jwgl.gzu.edu.cn/'),
  makeSchool('gzmu', '贵州医科大学', 'GZMU / 贵医大', 'guizhouyikedaxue gzmu gyd guiyida', '贵州', '贵阳', '医学重点', 'http://jw.gmc.edu.cn/'),
  makeSchool('zmu', '遵义医科大学', 'ZMU / 遵医大', 'zunyiyikedaxue zmu zyd zunyida', '贵州', '遵义', '医学名校', 'http://jw.zmu.edu.cn/'),
  makeSchool('gznu', '贵州师范大学', 'GZNU / 贵师大', 'guizhoushifandaxue gznu gsd guishida', '贵州', '贵阳', '省属重点', 'http://jw.gznu.edu.cn/'),
  makeSchool('gzfe', '贵州财经大学', 'GZFE / 贵财', 'guizhoucaijingdaxue gzfe gc guicai', '贵州', '贵阳', '财经特色', 'http://jw.gufe.edu.cn/'),

  // ================= 云南高校 =================
  makeSchool('ynu', '云南大学', 'YNU / 云大', 'yunnandaxue ynu yd yunda', '云南', '昆明', '双一流高校', 'http://jw.ynu.edu.cn/'),
  makeSchool('kust', '昆明理工大学', 'KUST / 昆工', 'kunmingligongdaxue kust kg kungong', '云南', '昆明', '省属重点高水平', 'http://jwxt.kust.edu.cn/'),
  makeSchool('ynau', '云南农业大学', 'YNAU / 云农', 'yunnannongyedaxue ynau yn yunnong', '云南', '昆明', '省属重点', 'http://jw.ynau.edu.cn/'),
  makeSchool('swfu', '西南林业大学', 'SWFU / 西南林', 'xinanlinyedaxue swfu xnl xinanlin', '云南', '昆明', '林业高水平', 'http://jw.swfu.edu.cn/'),
  makeSchool('kmu', '昆明医科大学', 'KMU / 昆医大', 'kunmingyikedaxue kmu kyd kunyida', '云南', '昆明', '医学名校', 'http://jw.kmu.edu.cn/'),
  makeSchool('ynnu', '云南师范大学', 'YNNU / 云师大', 'yunnanshifandaxue ynnu ysd yunshida', '云南', '昆明', '重点师范', 'http://jw.ynnu.edu.cn/'),
  makeSchool('ynfe', '云南财经大学', 'YUFE / 云财', 'yunnancaijingdaxue yufe yc yuncai', '云南', '昆明', '财经特色', 'http://jw.ynufe.edu.cn/'),
  makeSchool('dali', '大理大学', 'DLU / 理大', 'dalidaxue dlu ld lida', '云南', '大理', '综合本科', 'http://jw.dlu.edu.cn/'),

  // ================= 西藏高校 =================
  makeSchool('utibet', '西藏大学', 'UTIBET / 藏大', 'xicangdaxue utibet cd zangda qingguo', '西藏', '拉萨', '211 · 双一流', 'http://jw.utibet.edu.cn/'),
  makeSchool('tibet_au', '西藏农牧学院', 'XAU / 藏农牧', 'xicangnongmuxueyuan xau znm zangnongmu', '西藏', '林芝', '特色重点', 'http://jw.xza.edu.cn/'),

  // ================= 陕西高校 =================
  makeSchool('xjtu', '西安交通大学', 'XJTU / 西安交大', 'xianjiaotongdaxue xjtu xajd xianjiaoda', '陕西', '西安', 'C9 · 985 · 双一流', 'http://jwxt.xjtu.edu.cn/'),
  makeSchool('nwpu', '西北工业大学', 'NPU / 西工大', 'xibeigongyedaxue nwpu npu xgd xigongda', '陕西', '西安', '985 · 双一流', 'http://jwxt.nwpu.edu.cn/'),
  makeSchool('xidian', '西安电子科技大学', 'Xidian / 西电', 'xiandianzikejidaxue xidian xd xidian', '陕西', '西安', '211 · 双一流', 'http://jwxt.xidian.edu.cn/'),
  makeSchool('nwu', '西北大学', 'NWU / 西大', 'xibeidaxue nwu xd xida', '陕西', '西安', '211 · 双一流', 'http://jwxt.nwu.edu.cn/'),
  makeSchool('chd', '长安大学', 'CHD / 长大', 'changandaxue chd cd changda', '陕西', '西安', '211 · 双一流', 'http://jwxt.chd.edu.cn/'),
  makeSchool('snnu', '陕西师范大学', 'SNNU / 陕师大', 'shanxishifandaxue snnu ssd shanshida', '陕西', '西安', '211 · 双一流', 'http://jwxt.snnu.edu.cn/'),
  makeSchool('xaut', '西安理工大学', 'XAUT / 西理工', 'xianligongdaxue xaut xlg xianligong', '陕西', '西安', '省部共建重点', 'http://jw.xaut.edu.cn/'),
  makeSchool('xatu', '西安工业大学', 'XATU / 西工', 'xiangongyedaxue xatu xg xiangong', '陕西', '西安', '兵工特色', 'http://jw.xatu.edu.cn/'),
  makeSchool('xauat', '西安建筑科技大学', 'XAUAT / 西建大', 'xianjianzhadaxue xauat xjd xianjianda', '陕西', '西安', '建筑老八校', 'http://jw.xauat.edu.cn/'),
  makeSchool('xust', '西安科技大学', 'XUST / 西科大', 'xiankejidaxue xust xkd xiankeda', '陕西', '西安', '煤炭地质高水平', 'http://jw.xust.edu.cn/'),
  makeSchool('xupt_oil', '西安石油大学', 'XSYU / 西石大', 'xianshiyoudaxue xsyu xsd xianshida', '陕西', '西安', '石油特色重点', 'http://jw.xsyu.edu.cn/'),
  makeSchool('sust', '陕西科技大学', 'SUST / 陕科大', 'shanxikejidaxue sust skd shankeda', '陕西', '西安', '轻工名校', 'http://jw.sust.edu.cn/'),
  makeSchool('yau', '延安大学', 'YAU / 延大', 'yanandaxue yau yd yanda', '陕西', '延安', '省部共建重点', 'http://jw.yau.edu.cn/'),
  makeSchool('xupt', '西安邮电大学', 'XUPT / 西邮', 'xianyoudiandaxue xupt xy xianyou', '陕西', '西安', '信息特色重点', 'http://jwxt.xupt.edu.cn/'),

  // ================= 甘肃高校 =================
  makeSchool('lzu', '兰州大学', 'LZU / 兰大', 'lanzhoudaxue lzu ld landa', '甘肃', '兰州', '985 · 双一流', 'http://jw.lzu.edu.cn/'),
  makeSchool('lut', '兰州理工大学', 'LUT / 兰理工', 'lanzhouligongdaxue lut llg lanligong qingguo', '甘肃', '兰州', '青果 · 省部共建', 'http://jw.lut.edu.cn/'),
  makeSchool('lzjtu', '兰州交通大学', 'LZJTU / 兰州交大', 'lanzhoujiaotongdaxue lzjtu lzjd lanzhoujiaoda', '甘肃', '兰州', '铁道交通名校', 'http://jw.lzjtu.edu.cn/'),
  makeSchool('gsau', '甘肃农业大学', 'GSAU / 甘农大', 'gansunongyedaxue gsau gnd gannongda', '甘肃', '兰州', '省属重点', 'http://jw.gsau.edu.cn/'),
  makeSchool('nwnu', '西北师范大学', 'NWNU / 西北师大', 'xibeishifandaxue nwnu xbsd xibeishida', '甘肃', '兰州', '重点师范', 'http://jw.nwnu.edu.cn/'),
  makeSchool('lzufe', '兰州财经大学', 'LZFE / 兰财', 'lanzhoucaijingdaxue lzfe lc lancai', '甘肃', '兰州', '经管重点', 'http://jw.lzufe.edu.cn/'),

  // ================= 青海高校 =================
  makeSchool('qhu', '青海大学', 'QHU / 青大', 'qinghaidaxue qhu qd qingda', '青海', '西宁', '211 · 双一流', 'http://jwxt.qhu.edu.cn/'),
  makeSchool('qhnu', '青海师范大学', 'QHNU / 青师大', 'qinghaishifandaxue qhnu qsd qingshida', '青海', '西宁', '重点师范', 'http://jw.qhnu.edu.cn/'),
  makeSchool('qhmu', '青海民族大学', 'QHMU / 青民大', 'qinghaiminzudaxue qhmu qmd qingminda', '青海', '西宁', '民族重点', 'http://jw.qhmu.edu.cn/'),

  // ================= 宁夏高校 =================
  makeSchool('nxu', '宁夏大学', 'NXU / 宁大', 'ningxiadaxue nxu nd ningda', '宁夏', '银川', '211 · 双一流', 'http://jwxt.nxu.edu.cn/'),
  makeSchool('nxmu', '宁夏医科大学', 'NXMU / 宁医大', 'ningxiayikedaxue nxmu nyd ningyida', '宁夏', '银川', '重点医科', 'http://jw.nxmu.edu.cn/'),
  makeSchool('nxnu', '宁夏师范学院', 'NXNU / 宁师', 'ningxiashifanxueyuan nxnu ns ningshi', '宁夏', '固原', '六盘山区名校', 'http://jw.nxtc.edu.cn/'),

  // ================= 新疆高校 =================
  makeSchool('xju', '新疆大学', 'XJU / 新大', 'xinjiangdaxue xju xd xinda', '新疆', '乌鲁木齐', '211 · 双一流', 'http://jwxt.xju.edu.cn/'),
  makeSchool('shzu', '石河子大学', 'SHZU / 石大', 'shihezidaxue shzu sd shida', '新疆', '石河子', '211 · 双一流', 'http://jwxt.shzu.edu.cn/'),
  makeSchool('taru', '塔里木大学', 'TARU / 塔大', 'talimudaxue taru td tada', '新疆', '阿拉尔', '兵团重点', 'http://jw.taru.edu.cn/'),
  makeSchool('xjau', '新疆农业大学', 'XJAU / 新农大', 'xinjiangnongyedaxue xjau xnd xinnongda', '新疆', '乌鲁木齐', '农科高水平', 'http://jw.xjau.edu.cn/'),
  makeSchool('xjmu', '新疆医科大学', 'XJMU / 新医大', 'xinjiangyikedaxue xjmu xyd xinyida', '新疆', '乌鲁木齐', '医学高水平', 'http://jw.xjmu.edu.cn/'),
  makeSchool('xjnu', '新疆师范大学', 'XJNU / 新师大', 'xinjiangshifandaxue xjnu xsd xinshida', '新疆', '乌鲁木齐', '重点师范', 'http://jw.xjnu.edu.cn/'),
  makeSchool('xjufe', '新疆财经大学', 'XJUFE / 新财', 'xinjiangcaijingdaxue xjufe xc xincai', '新疆', '乌鲁木齐', '财经特色', 'http://jw.xjufe.edu.cn/'),
  makeSchool('ksu', '喀什大学', 'KSU / 喀大', 'kashidaxue ksu kd kada', '新疆', '喀什', '南疆重点', 'http://jw.ksu.edu.cn/'),

  // ================= 万能自定义通道 =================
  {
    id: 'custom_general',
    name: '全国高校通用通道 (支持任何大学)',
    shortName: '自定义教务 / WebVPN',
    pinyin: 'quanguogaoxiaotongyong quanguo zidingyi tongyong ranyi ranyidaxue',
    region: '全国 · 任意高校',
    badge: '万能导入',
    systems: [
      {
        id: 'generic_direct',
        name: '通用教务直连 / WebVPN',
        level: '全国师生',
        url: 'https://',
        desc: '支持全国 3000+ 高校，手动输入任意高校教务登录网址或校外 WebVPN 直连'
      }
    ]
  }
];

// 去重保障
const seen = new Set();
const cleanList = [];
for (const s of list) {
  if (!seen.has(s.id)) {
    seen.add(s.id);
    cleanList.push(s);
  }
}

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

export const SCHOOL_DATABASE: SchoolItem[] = ${JSON.stringify(cleanList, null, 2)};
`;

fs.writeFileSync(targetFile, outputTs, 'utf-8');
console.log('Build completed! Total universities:', cleanList.length, 'saved to', targetFile);
