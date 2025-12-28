/**
 * 格局计算器
 * 识别奇门遁甲中的吉格和凶格
 */

import type {
  GongWei,
  GongInfo,
  TianGan,
  DiZhi,
  GeJuInfo,
  XunShouInfo,
  YinYangDun,
  BaMen,
} from '../types';
import { getLiuYiGan } from '../data/constants';

/**
 * 格局计算器
 */
export class GeJuCalculator {
  /**
   * 计算所有格局
   */
  static calculate(
    gongs: Record<GongWei, GongInfo>,
    yinYangDun: YinYangDun,
    dayGan: TianGan,
    hourGan: TianGan,
    hourZhi: DiZhi,
    xunShou: XunShouInfo
  ): GeJuInfo[] {
    const geJuList: GeJuInfo[] = [];

    // 检查各类格局
    geJuList.push(...this.checkSanQiGeJu(gongs));
    geJuList.push(...this.checkJiuDunGeJu(gongs));
    geJuList.push(...this.checkMenPoGeJu(gongs));
    geJuList.push(...this.checkRuMuGeJu(gongs));
    geJuList.push(...this.checkJiXingGeJu(gongs));
    geJuList.push(...this.checkWuBuYuShiGeJu(dayGan, hourGan));
    geJuList.push(...this.checkFuYinFanYinGeJu(gongs, xunShou));
    geJuList.push(...this.checkQingLongTaoGeJu(gongs));
    geJuList.push(...this.checkBaiHuChangKuangGeJu(gongs));

    // 新增格局检测
    geJuList.push(...this.checkFanYinGeJu(gongs, xunShou));
    geJuList.push(...this.checkQiYiXiangHeGeJu(gongs));
    geJuList.push(...this.checkFeiGanFuGanGeJu(gongs, dayGan, hourGan, xunShou));
    geJuList.push(...this.checkTianXianShiGeJu(gongs, hourZhi));
    geJuList.push(...this.checkDiSiMenGeJu(gongs, hourZhi));
    geJuList.push(...this.checkWangGaiGeJu(gongs));
    geJuList.push(...this.checkTianLaoGeJu(gongs));

    return geJuList;
  }

  /**
   * 三奇格局（乙丙丁为三奇）
   */
  private static checkSanQiGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];
    const sanQi: TianGan[] = ['乙', '丙', '丁'];
    const jiMen: BaMen[] = ['开', '休', '生'];

    for (const gong of Object.values(gongs)) {
      // 三奇得使：乙丙丁临开休生三吉门
      if (sanQi.includes(gong.tianPanGan) && jiMen.includes(gong.men)) {
        results.push({
          name: '三奇得使',
          type: '吉格',
          description: `${gong.tianPanGan}奇临${gong.men}门于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 三奇贵人：乙丙丁遇值符
      if (sanQi.includes(gong.tianPanGan) && gong.shen === '符') {
        results.push({
          name: '三奇贵人',
          type: '吉格',
          description: `${gong.tianPanGan}奇遇值符于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 九遁格局
   */
  private static checkJiuDunGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    for (const gong of Object.values(gongs)) {
      // 天遁：丙+生门+天心
      if (gong.tianPanGan === '丙' && gong.men === '生' && gong.xing === '心') {
        results.push({
          name: '天遁',
          type: '吉格',
          description: `丙奇临生门天心于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 地遁：乙+开门+地盘己
      if (gong.tianPanGan === '乙' && gong.men === '开' && gong.diPanGan === '己') {
        results.push({
          name: '地遁',
          type: '吉格',
          description: `乙奇临开门遇地盘己于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 人遁：丁+休门+太阴
      if (gong.tianPanGan === '丁' && gong.men === '休' && gong.shen === '阴') {
        results.push({
          name: '人遁',
          type: '吉格',
          description: `丁奇临休门遇太阴于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 神遁：丙+生门+九天
      if (gong.tianPanGan === '丙' && gong.men === '生' && gong.shen === '天') {
        results.push({
          name: '神遁',
          type: '吉格',
          description: `丙奇临生门遇九天于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 鬼遁：乙+生门+九地
      if (gong.tianPanGan === '乙' && gong.men === '生' && gong.shen === '地') {
        results.push({
          name: '鬼遁',
          type: '吉格',
          description: `乙奇临生门遇九地于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 龙遁：乙+休门+六合（合为六合）
      if (gong.tianPanGan === '乙' && gong.men === '休' && gong.shen === '合') {
        results.push({
          name: '龙遁',
          type: '吉格',
          description: `乙奇临休门遇六合于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 虎遁：乙+开门+太阴
      if (gong.tianPanGan === '乙' && gong.men === '开' && gong.shen === '阴') {
        results.push({
          name: '虎遁',
          type: '吉格',
          description: `乙奇临开门遇太阴于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 风遁：乙+开门+天辅
      if (gong.tianPanGan === '乙' && gong.men === '开' && gong.xing === '辅') {
        results.push({
          name: '风遁',
          type: '吉格',
          description: `乙奇临开门天辅于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }

      // 云遁：乙+休门+六合+天芮
      if (gong.tianPanGan === '乙' && gong.men === '休' && gong.shen === '合' && gong.xing === '芮') {
        results.push({
          name: '云遁',
          type: '吉格',
          description: `乙奇临休门遇六合天芮于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 门迫格局（凶格）
   */
  private static checkMenPoGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    // 门克宫为门迫
    const menWuXing: Record<BaMen, string> = {
      '休': '水',
      '生': '土',
      '伤': '木',
      '杜': '木',
      '景': '火',
      '死': '土',
      '惊': '金',
      '开': '金',
    };

    const keMap: Record<string, string[]> = {
      '木': ['土'],
      '火': ['金'],
      '土': ['水'],
      '金': ['木'],
      '水': ['火'],
    };

    for (const gong of Object.values(gongs)) {
      if (gong.gong === 5) continue; // 中宫跳过

      const menWX = menWuXing[gong.men];
      const gongWX = gong.wuXing;

      // 门克宫
      if (keMap[menWX]?.includes(gongWX)) {
        results.push({
          name: '门迫',
          type: '凶格',
          description: `${gong.men}门克${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 入墓格局（凶格）
   * 注：甲遁于六仪，不会出现在天盘，故不检测甲入墓
   */
  private static checkRuMuGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    // 天干入墓宫位（三奇六仪）- 采用传统五行墓库
    // 木墓未(坤2)，火土墓戌(乾6)，金墓丑(艮8)，水墓辰(巽4)
    const ganMuGong: Record<string, GongWei> = {
      '乙': 2, // 乙(木)墓在坤（未）
      '丙': 6, // 丙(火)墓在乾（戌）
      '丁': 6, // 丁(火)墓在乾（戌）
      '戊': 6, // 戊(土)墓在乾（戌）
      '己': 6, // 己(土)墓在乾（戌）
      '庚': 8, // 庚(金)墓在艮（丑）
      '辛': 8, // 辛(金)墓在艮（丑）
      '壬': 4, // 壬(水)墓在巽（辰）
      '癸': 4, // 癸(水)墓在巽（辰）
    };

    for (const gong of Object.values(gongs)) {
      const muGong = ganMuGong[gong.tianPanGan];
      if (muGong && gong.gong === muGong) {
        // 三奇入墓尤为严重
        const isSanQi = ['乙', '丙', '丁'].includes(gong.tianPanGan);
        results.push({
          name: isSanQi ? '三奇入墓' : '入墓',
          type: '凶格',
          description: `${gong.tianPanGan}入墓于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 六仪击刑格局（凶格）
   */
  private static checkJiXingGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    // 六仪所临刑宫（基于地支三刑）
    // 六仪对应旬首：戊(甲子)、己(甲戌)、庚(甲申)、辛(甲午)、壬(甲辰)、癸(甲寅)
    // 三刑规则：子刑卯、寅巳申三刑、丑戌未三刑、辰午酉亥自刑
    const liuYiXingGong: Record<string, GongWei> = {
      '戊': 3, // 戊(甲子)：子刑卯 → 震3宫
      '己': 2, // 己(甲戌)：戌刑未 → 坤2宫
      '庚': 8, // 庚(甲申)：申刑寅 → 艮8宫
      '辛': 9, // 辛(甲午)：午自刑 → 离9宫
      '壬': 4, // 壬(甲辰)：辰自刑 → 巽4宫
      '癸': 4, // 癸(甲寅)：寅刑巳 → 巽4宫
    };

    for (const gong of Object.values(gongs)) {
      const xingGong = liuYiXingGong[gong.tianPanGan];
      if (xingGong && gong.gong === xingGong) {
        results.push({
          name: '六仪击刑',
          type: '凶格',
          description: `${gong.tianPanGan}击刑于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 五不遇时（凶格）
   * 时干克日干，且阴阳属性相同（同性相克）
   *
   * 口诀：
   * 甲日最怕庚午时，乙日忌见辛巳知，
   * 丙日壬辰最难当，丁日癸卯必须防，
   * 戊日甲寅时上忌，己日乙丑最为凶，
   * 庚日丙子不为良，辛日丁酉时中藏，
   * 壬日戊申时上忌，癸日己未定不昌。
   */
  private static checkWuBuYuShiGeJu(dayGan: TianGan, hourGan: TianGan): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    // 五不遇时映射：日干 → 所忌时干
    const wuBuYuShiMap: Record<TianGan, TianGan> = {
      '甲': '庚', // 甲日庚时（阳木被阳金克）
      '乙': '辛', // 乙日辛时（阴木被阴金克）
      '丙': '壬', // 丙日壬时（阳火被阳水克）
      '丁': '癸', // 丁日癸时（阴火被阴水克）
      '戊': '甲', // 戊日甲时（阳土被阳木克）
      '己': '乙', // 己日乙时（阴土被阴木克）
      '庚': '丙', // 庚日丙时（阳金被阳火克）
      '辛': '丁', // 辛日丁时（阴金被阴火克）
      '壬': '戊', // 壬日戊时（阳水被阳土克）
      '癸': '己', // 癸日己时（阴水被阴土克）
    };

    if (wuBuYuShiMap[dayGan] === hourGan) {
      results.push({
        name: '五不遇时',
        type: '凶格',
        description: `时干${hourGan}克日干${dayGan}`,
        gongs: [],
      });
    }

    return results;
  }

  /**
   * 伏吟/反吟格局
   */
  private static checkFuYinFanYinGeJu(
    gongs: Record<GongWei, GongInfo>,
    xunShou: XunShouInfo
  ): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    // 星门伏吟：值符临本宫
    if (xunShou.zhiFuGong === xunShou.zhiFuLuoGong) {
      results.push({
        name: '星伏吟',
        type: '中性',
        description: '值符星临本宫',
        gongs: [xunShou.zhiFuGong],
      });
    }

    // 门伏吟：值使临本宫
    if (xunShou.zhiShiGong === xunShou.zhiShiLuoGong) {
      results.push({
        name: '门伏吟',
        type: '中性',
        description: '值使门临本宫',
        gongs: [xunShou.zhiShiGong],
      });
    }

    // 天盘地盘相同为伏吟
    let fuYinCount = 0;
    for (const gong of Object.values(gongs)) {
      if (gong.tianPanGan === gong.diPanGan) {
        fuYinCount++;
      }
    }
    if (fuYinCount >= 8) {
      results.push({
        name: '天地伏吟',
        type: '中性',
        description: '天盘地盘干支相同',
        gongs: [],
      });
    }

    return results;
  }

  /**
   * 青龙逃走（吉格）
   */
  private static checkQingLongTaoGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    for (const gong of Object.values(gongs)) {
      // 日干临生门逢六合
      if (gong.men === '生' && gong.shen === '合') {
        results.push({
          name: '青龙逃走',
          type: '吉格',
          description: `生门遇六合于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 白虎猖狂（凶格）
   */
  private static checkBaiHuChangKuangGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    for (const gong of Object.values(gongs)) {
      // 庚临开门逢白虎
      if (gong.tianPanGan === '庚' && gong.men === '开' && gong.shen === '虎') {
        results.push({
          name: '白虎猖狂',
          type: '凶格',
          description: `庚临开门遇白虎于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  // ============= 新增格局检测方法 =============

  /**
   * 宫位冲对映射表
   */
  private static readonly CHONG_GONG_MAP: Record<GongWei, GongWei> = {
    1: 9, // 坎 ↔ 离
    9: 1,
    3: 7, // 震 ↔ 兑
    7: 3,
    4: 6, // 巽 ↔ 乾
    6: 4,
    2: 8, // 坤 ↔ 艮
    8: 2,
    5: 5, // 中宫无对冲
  };

  /**
   * 时支对应宫位映射表
   */
  private static readonly DI_ZHI_GONG_MAP: Record<DiZhi, GongWei> = {
    '子': 1, // 坎
    '丑': 8, // 艮
    '寅': 8, // 艮
    '卯': 3, // 震
    '辰': 4, // 巽
    '巳': 4, // 巽
    '午': 9, // 离
    '未': 2, // 坤
    '申': 2, // 坤
    '酉': 7, // 兑
    '戌': 6, // 乾
    '亥': 6, // 乾
  };

  /**
   * 天干五合映射表（奇仪相合）
   * 注：甲己合不在此表中，因为甲遁于六仪，不会出现在盘面上
   */
  private static readonly GAN_HE_MAP: Partial<Record<TianGan, TianGan>> = {
    '乙': '庚',
    '庚': '乙',
    '丙': '辛',
    '辛': '丙',
    '丁': '壬',
    '壬': '丁',
    '戊': '癸',
    '癸': '戊',
  };

  /**
   * 反吟格局检测
   */
  private static checkFanYinGeJu(
    gongs: Record<GongWei, GongInfo>,
    xunShou: XunShouInfo
  ): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    // 星反吟：值符星落对宫
    const zhiFuChongGong = this.CHONG_GONG_MAP[xunShou.zhiFuGong];
    if (zhiFuChongGong && xunShou.zhiFuLuoGong === zhiFuChongGong) {
      results.push({
        name: '星反吟',
        type: '中性',
        description: '值符星落对冲宫',
        gongs: [xunShou.zhiFuLuoGong],
      });
    }

    // 门反吟：值使门落对宫
    const zhiShiChongGong = this.CHONG_GONG_MAP[xunShou.zhiShiGong];
    if (zhiShiChongGong && xunShou.zhiShiLuoGong === zhiShiChongGong) {
      results.push({
        name: '门反吟',
        type: '中性',
        description: '值使门落对冲宫',
        gongs: [xunShou.zhiShiLuoGong],
      });
    }

    // 天地反吟（传统定义）：某宫的天盘干 = 该宫对冲宫的地盘干
    // 即天盘干落到了地盘干的对冲位置
    let fanYinCount = 0;
    for (const gong of Object.values(gongs)) {
      if (gong.gong === 5) continue; // 跳过中宫
      const chongGong = this.CHONG_GONG_MAP[gong.gong];
      if (chongGong && chongGong !== 5) {
        // 获取对冲宫的地盘干
        const chongGongInfo = gongs[chongGong];
        // 检查当前宫的天盘干是否等于对冲宫的地盘干
        if (chongGongInfo && gong.tianPanGan === chongGongInfo.diPanGan) {
          fanYinCount++;
        }
      }
    }
    // 当大多数宫位（6宫以上）符合反吟条件时，判定为天地反吟
    if (fanYinCount >= 6) {
      results.push({
        name: '天地反吟',
        type: '中性',
        description: '天盘干多落对冲宫地盘干位',
        gongs: [],
      });
    }

    return results;
  }

  /**
   * 查找干所在的宫位（辅助方法）
   */
  private static findGanGong(gan: TianGan, gongs: Record<GongWei, GongInfo>): GongWei | null {
    for (const gong of Object.values(gongs)) {
      if (gong.diPanGan === gan) {
        return gong.gong;
      }
    }
    return null;
  }

  /**
   * 奇仪相合格局检测
   */
  private static checkQiYiXiangHeGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    for (const gong of Object.values(gongs)) {
      if (gong.gong === 5) continue; // 跳过中宫

      const tianGan = gong.tianPanGan;
      const diGan = gong.diPanGan;

      // 检查天盘干与地盘干是否相合
      if (this.GAN_HE_MAP[tianGan] === diGan) {
        const heName = `${tianGan}${diGan}合`;
        results.push({
          name: heName,
          type: '吉格',
          description: `${tianGan}与${diGan}相合于${gong.gongName}宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 飞干格/伏干格检测
   */
  private static checkFeiGanFuGanGeJu(
    gongs: Record<GongWei, GongInfo>,
    dayGan: TianGan,
    hourGan: TianGan,
    xunShou: XunShouInfo
  ): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    // 处理甲干：甲遁于六仪，需要找到对应的六仪
    const effectiveDayGan = dayGan === '甲' ? getLiuYiGan(xunShou.xunShou) : dayGan;
    const effectiveHourGan = hourGan === '甲' ? getLiuYiGan(xunShou.xunShou) : hourGan;

    // 找日干在地盘的位置
    const dayGanDiPanGong = this.findGanGong(effectiveDayGan, gongs);
    // 找时干在地盘的位置
    const hourGanDiPanGong = this.findGanGong(effectiveHourGan, gongs);

    // 找日干在天盘的位置
    let dayGanTianPanGong: GongWei | null = null;
    let hourGanTianPanGong: GongWei | null = null;

    for (const gong of Object.values(gongs)) {
      if (gong.tianPanGan === effectiveDayGan) {
        dayGanTianPanGong = gong.gong;
      }
      if (gong.tianPanGan === effectiveHourGan) {
        hourGanTianPanGong = gong.gong;
      }
    }

    // 飞干格：时干天盘落日干地盘宫
    if (hourGanTianPanGong && dayGanDiPanGong && hourGanTianPanGong === dayGanDiPanGong) {
      const dayGanDesc = dayGan === '甲' ? `甲(遁${effectiveDayGan})` : dayGan;
      const hourGanDesc = hourGan === '甲' ? `甲(遁${effectiveHourGan})` : hourGan;
      results.push({
        name: '飞干格',
        type: '凶格',
        description: `时干${hourGanDesc}飞临日干${dayGanDesc}地盘宫`,
        gongs: [hourGanTianPanGong],
      });
    }

    // 伏干格：日干天盘落时干地盘宫
    if (dayGanTianPanGong && hourGanDiPanGong && dayGanTianPanGong === hourGanDiPanGong) {
      const dayGanDesc = dayGan === '甲' ? `甲(遁${effectiveDayGan})` : dayGan;
      const hourGanDesc = hourGan === '甲' ? `甲(遁${effectiveHourGan})` : hourGan;
      results.push({
        name: '伏干格',
        type: '凶格',
        description: `日干${dayGanDesc}伏于时干${hourGanDesc}地盘宫`,
        gongs: [dayGanTianPanGong],
      });
    }

    return results;
  }

  /**
   * 天显时格检测
   */
  private static checkTianXianShiGeJu(
    gongs: Record<GongWei, GongInfo>,
    hourZhi: DiZhi
  ): GeJuInfo[] {
    const results: GeJuInfo[] = [];
    const sanQi: TianGan[] = ['乙', '丙', '丁'];
    const jiMen: BaMen[] = ['开', '休', '生'];

    const hourGong = this.DI_ZHI_GONG_MAP[hourZhi];

    for (const gong of Object.values(gongs)) {
      if (gong.gong !== hourGong) continue;

      // 三奇落时支宫位且逢吉门
      if (sanQi.includes(gong.tianPanGan) && jiMen.includes(gong.men)) {
        results.push({
          name: '天显时格',
          type: '吉格',
          description: `${gong.tianPanGan}奇临${gong.men}门于${hourZhi}时宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 地私门格检测
   */
  private static checkDiSiMenGeJu(
    gongs: Record<GongWei, GongInfo>,
    hourZhi: DiZhi
  ): GeJuInfo[] {
    const results: GeJuInfo[] = [];
    const liuYi: TianGan[] = ['戊', '己', '庚', '辛', '壬', '癸'];
    const xiongMen: BaMen[] = ['死', '惊', '杜'];

    const hourGong = this.DI_ZHI_GONG_MAP[hourZhi];

    for (const gong of Object.values(gongs)) {
      if (gong.gong !== hourGong) continue;

      // 六仪落时支宫位且逢凶门
      if (liuYi.includes(gong.tianPanGan) && xiongMen.includes(gong.men)) {
        results.push({
          name: '地私门格',
          type: '凶格',
          description: `${gong.tianPanGan}临${gong.men}门于${hourZhi}时宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 网盖格检测
   */
  private static checkWangGaiGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    for (const gong of Object.values(gongs)) {
      // 天网四张：戊落乾6宫逢死/惊门
      if (gong.gong === 6 && gong.tianPanGan === '戊' && (gong.men === '死' || gong.men === '惊')) {
        results.push({
          name: '天网四张',
          type: '凶格',
          description: `戊临${gong.men}门于乾宫`,
          gongs: [gong.gong],
        });
      }

      // 地网盖：癸落巽4宫逢凶门/凶神
      if (gong.gong === 4 && gong.tianPanGan === '癸' && (gong.men === '死' || gong.men === '杜')) {
        results.push({
          name: '地网盖',
          type: '凶格',
          description: `癸临${gong.men}门于巽宫`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }

  /**
   * 天牢格检测
   * 注：庚+开门+白虎 同时触发"白虎猖狂"和"天牢"
   *   - 白虎猖狂：侧重凶暴、攻击之象
   *   - 天牢：侧重禁锢、囚禁之象，主官司牢狱
   */
  private static checkTianLaoGeJu(gongs: Record<GongWei, GongInfo>): GeJuInfo[] {
    const results: GeJuInfo[] = [];

    for (const gong of Object.values(gongs)) {
      // 庚+开门+白虎 = 天牢（与白虎猖狂同现，侧重不同）
      if (gong.tianPanGan === '庚' && gong.men === '开' && gong.shen === '虎') {
        results.push({
          name: '天牢',
          type: '凶格',
          description: `庚临开门遇白虎于${gong.gongName}宫，主官司牢狱`,
          gongs: [gong.gong],
        });
      }

      // 庚+杜门 = 天牢变体（独立格局）
      if (gong.tianPanGan === '庚' && gong.men === '杜') {
        results.push({
          name: '天牢',
          type: '凶格',
          description: `庚临杜门于${gong.gongName}宫，主阻滞闭塞`,
          gongs: [gong.gong],
        });
      }
    }

    return results;
  }
}
