/**
 * 用神计算器
 *
 * 负责根据事类选取用神并分析用神状态
 */

import type {
  ShiLei,
  YongShenItem,
  YongShenAnalysis,
  YongShenInfo,
  ZhuKeAnalysis,
  NianMingInfo,
  WangXiangState,
  DayGanRelation,
  QimenResult,
  GongWei,
  TianGan,
  DiZhi,
  WuXing,
} from '../types';
import {
  YONGSHEN_RULES,
  WANGXIANG_TABLE,
  RUMU_TABLE,
  XING_TABLE,
  GAN_WUXING,
  MEN_WUXING,
  XING_WUXING,
  SHEN_WUXING,
  WUXING_SHENG,
  WUXING_KE,
  YONGSHEN_SCORE_WEIGHTS,
  type YongShenRule,
} from '../data/yongshen-rules';
import { GONG_WUXING, DI_ZHI_GONG } from '../data/constants';
import {
  findGanGong,
  findTianPanGanGong,
  findMenGong,
  findXingGong,
  findShenGong,
  getGongDiZhi,
  parseMenName,
  parseXingName,
  SHEN_NAME_MAP,
} from '../utils/gongUtils';

// ============= 辅助类型 =============

interface YongShenContext {
  result: QimenResult;
  monthZhi: DiZhi;
  dayGan: TianGan;
  dayZhi: DiZhi;
  hourGan: TianGan;
  nianGan?: TianGan;
}

// ============= 用神计算器 =============

export class YongShenCalculator {
  /**
   * 分析用神
   *
   * @param result 奇门盘结果
   * @param shiLei 事类
   * @param nianGan 可选年干（用于年命分析）
   * @returns 用神分析信息
   */
  static analyze(
    result: QimenResult,
    shiLei: ShiLei,
    nianGan?: TianGan
  ): YongShenInfo {
    const config = YONGSHEN_RULES[shiLei];
    const siZhu = result.timeInfo.siZhu;

    // 构建上下文
    const context: YongShenContext = {
      result,
      monthZhi: siZhu.monthGanZhi.charAt(1) as DiZhi,
      dayGan: siZhu.dayGan,
      dayZhi: siZhu.dayZhi,
      hourGan: siZhu.hourGan,
      nianGan,
    };

    // 解析主用神
    const zhuyong = this.resolveYongShenItems(config.zhuyong, context);

    // 解析辅用神
    const fuyong = this.resolveYongShenItems(config.fuyong, context);

    // 分析每个用神
    const analysis = this.analyzeYongShenItems([...zhuyong, ...fuyong], context);

    // 主客分析（如果需要）
    let zhuKe: ZhuKeAnalysis | undefined;
    if (config.needZhuKe) {
      zhuKe = this.analyzeZhuKe(context);
    }

    // 年命分析（如果提供了年干）
    let nianMingInfo: NianMingInfo | undefined;
    if (nianGan) {
      nianMingInfo = this.analyzeNianMing(nianGan, context);
    }

    return {
      shiLei,
      zhuyong,
      fuyong,
      analysis,
      zhuKe,
      nianMing: nianMingInfo,
    };
  }

  /**
   * 解析用神项列表
   */
  private static resolveYongShenItems(
    rules: YongShenRule[],
    context: YongShenContext
  ): YongShenItem[] {
    const items: YongShenItem[] = [];

    for (const rule of rules) {
      const resolved = this.resolveYongShenRule(rule, context);
      if (resolved) {
        items.push(resolved);
      }
    }

    return items;
  }

  /**
   * 解析单个用神规则
   */
  private static resolveYongShenRule(
    rule: YongShenRule,
    context: YongShenContext
  ): YongShenItem | null {
    const { result } = context;

    switch (rule.type) {
      case '门': {
        // 使用安全的门名解析
        const men = parseMenName(rule.name);
        if (!men) return null;
        const gong = findMenGong(result, men);
        if (!gong) return null;
        return {
          type: '门',
          name: rule.name,
          gong,
          state: this.getGongWangXiang(gong, context),
        };
      }

      case '星': {
        // 使用安全的星名解析
        const xing = parseXingName(rule.name);
        if (!xing) return null;
        const gong = findXingGong(result, xing);
        if (!gong) return null;
        return {
          type: '星',
          name: rule.name,
          gong,
          state: this.getGongWangXiang(gong, context),
        };
      }

      case '神': {
        const gong = findShenGong(result, rule.name);
        if (!gong) return null;
        return {
          type: '神',
          name: rule.name,
          gong,
          state: this.getGongWangXiang(gong, context),
        };
      }

      case '奇': {
        // 日干、时干、马星等特殊用神
        if (rule.name === '日干') {
          return {
            type: '奇',
            name: `日干(${context.dayGan})`,
            gong: result.dayGanGong,
            state: this.getGongWangXiang(result.dayGanGong, context),
          };
        }
        if (rule.name === '时干') {
          return {
            type: '奇',
            name: `时干(${context.hourGan})`,
            gong: result.hourGanGong,
            state: this.getGongWangXiang(result.hourGanGong, context),
          };
        }
        if (rule.name === '马星') {
          const maGong = this.findMaXingGong(result, context.dayZhi);
          if (!maGong) return null;
          return {
            type: '奇',
            name: '马星',
            gong: maGong,
            state: this.getGongWangXiang(maGong, context),
          };
        }
        // 三奇（乙丙丁）
        if (['乙', '丙', '丁'].includes(rule.name)) {
          const gan = rule.name as TianGan;
          const gong = findGanGong(result, gan);
          if (!gong) return null;
          return {
            type: '奇',
            name: `${gan}奇`,
            gong,
            state: this.getGongWangXiang(gong, context),
          };
        }
        return null;
      }

      case '仪': {
        // 六仪（戊己庚辛壬癸）
        if (rule.name === '六仪') {
          // 特殊处理：返回戊仪作为代表
          const gong = findGanGong(result, '戊');
          if (!gong) return null;
          return {
            type: '仪',
            name: '戊仪',
            gong,
            state: this.getGongWangXiang(gong, context),
          };
        }
        if (rule.name === '天盘戊') {
          // 天盘戊的位置
          const gong = findTianPanGanGong(result, '戊');
          if (!gong) return null;
          return {
            type: '仪',
            name: '天盘戊',
            gong,
            state: this.getGongWangXiang(gong, context),
          };
        }
        // 具体六仪
        const gan = rule.name as TianGan;
        if (['戊', '己', '庚', '辛', '壬', '癸'].includes(gan)) {
          const gong = findGanGong(result, gan);
          if (!gong) return null;
          return {
            type: '仪',
            name: `${gan}仪`,
            gong,
            state: this.getGongWangXiang(gong, context),
          };
        }
        return null;
      }

      default:
        return null;
    }
  }

  /**
   * 分析用神项列表
   */
  private static analyzeYongShenItems(
    items: YongShenItem[],
    context: YongShenContext
  ): YongShenAnalysis[] {
    return items.map(item => this.analyzeYongShenItem(item, context));
  }

  /**
   * 分析单个用神
   */
  private static analyzeYongShenItem(
    item: YongShenItem,
    context: YongShenContext
  ): YongShenAnalysis {
    const { result } = context;
    const gong = item.gong;
    const gongInfo = result.gongs[gong];

    // 检测空亡
    const isKong = gongInfo.isKong;

    // 检测入墓
    const isRuMu = this.checkRuMu(item, gong, context);

    // 检测击刑
    const isJiXing = this.checkJiXing(gong, context);

    // 与日干关系
    const relationToDay = this.calcDayGanRelation(item, context);

    // 受格局影响
    const geJuEffects = this.getGeJuEffects(gong, result);

    // 计算评分
    const score = this.calcYongShenScore(
      item.state,
      isKong,
      isRuMu,
      isJiXing,
      relationToDay,
      geJuEffects
    );

    return {
      yongshen: item.name,
      gong,
      isKong,
      isRuMu,
      isJiXing,
      relationToDay,
      geJuEffects,
      score,
    };
  }

  /**
   * 主客分析
   */
  private static analyzeZhuKe(context: YongShenContext): ZhuKeAnalysis {
    const { result, dayGan, hourGan } = context;

    const zhuGong = result.dayGanGong;
    const keGong = result.hourGanGong;

    const zhuState = this.getGongWangXiang(zhuGong, context);
    const keState = this.getGongWangXiang(keGong, context);

    // 计算主客关系
    const zhuWuXing = GAN_WUXING[dayGan];
    const keWuXing = GAN_WUXING[hourGan];
    const relation = this.calcZhuKeRelation(zhuWuXing, keWuXing);

    // 生成简要结论
    const summary = this.generateZhuKeSummary(zhuState, keState, relation);

    return {
      zhu: { gong: zhuGong, state: zhuState },
      ke: { gong: keGong, state: keState },
      relation,
      summary,
    };
  }

  /**
   * 年命分析
   */
  private static analyzeNianMing(
    nianGan: TianGan,
    context: YongShenContext
  ): NianMingInfo {
    const { result } = context;

    // 找年干落宫
    const gong = findGanGong(result, nianGan);
    const actualGong = gong || result.dayGanGong; // 如果找不到，默认日干落宫

    return {
      nianGan,
      gong: actualGong,
      state: this.getGongWangXiang(actualGong, context),
    };
  }

  // ============= 辅助方法 =============

  /**
   * 找马星落宫
   */
  private static findMaXingGong(result: QimenResult, dayZhi: DiZhi): GongWei | null {
    // 马星地支
    const MA_XING: Record<DiZhi, DiZhi> = {
      '申': '寅', '子': '寅', '辰': '寅',
      '寅': '申', '午': '申', '戌': '申',
      '亥': '巳', '卯': '巳', '未': '巳',
      '巳': '亥', '酉': '亥', '丑': '亥',
    };

    const maZhi = MA_XING[dayZhi];
    if (!maZhi) return null;

    const maGong = DI_ZHI_GONG[maZhi];
    return maGong || null;
  }

  /**
   * 获取宫位旺相休囚死状态
   */
  private static getGongWangXiang(gong: GongWei, context: YongShenContext): WangXiangState {
    const gongWuXing = GONG_WUXING[gong];
    const table = WANGXIANG_TABLE[context.monthZhi];
    return table ? table[gongWuXing] : '休';
  }

  /**
   * 检测入墓
   */
  private static checkRuMu(
    item: YongShenItem,
    gong: GongWei,
    context: YongShenContext
  ): boolean {
    // 获取用神五行
    let wuXing: WuXing | null = null;

    if (item.type === '奇' || item.type === '仪') {
      // 从名称提取天干
      const ganMatch = item.name.match(/([甲乙丙丁戊己庚辛壬癸])/);
      if (ganMatch) {
        wuXing = GAN_WUXING[ganMatch[1] as TianGan];
      }
    } else if (item.type === '门') {
      const men = parseMenName(item.name);
      if (men) wuXing = MEN_WUXING[men];
    } else if (item.type === '星') {
      const xing = parseXingName(item.name);
      if (xing) wuXing = XING_WUXING[xing];
    } else if (item.type === '神') {
      // 使用共享的 SHEN_NAME_MAP
      const shen = SHEN_NAME_MAP[item.name];
      if (shen) {
        wuXing = SHEN_WUXING[shen];
      }
    }

    if (!wuXing) return false;

    // 获取宫位对应地支
    const gongZhi = getGongDiZhi(gong);

    // 检查是否落入墓库
    return RUMU_TABLE[wuXing] === gongZhi;
  }

  /**
   * 检测击刑
   */
  private static checkJiXing(gong: GongWei, context: YongShenContext): boolean {
    const gongZhi = getGongDiZhi(gong);
    const xingList = XING_TABLE[context.dayZhi] || [];
    return xingList.includes(gongZhi);
  }

  /**
   * 计算与日干关系
   */
  private static calcDayGanRelation(
    item: YongShenItem,
    context: YongShenContext
  ): DayGanRelation {
    const dayWuXing = GAN_WUXING[context.dayGan];

    // 获取用神五行
    let yongWuXing: WuXing | null = null;

    if (item.type === '奇' || item.type === '仪') {
      const ganMatch = item.name.match(/([甲乙丙丁戊己庚辛壬癸])/);
      if (ganMatch) {
        yongWuXing = GAN_WUXING[ganMatch[1] as TianGan];
      }
    } else if (item.type === '门') {
      const men = parseMenName(item.name);
      if (men) yongWuXing = MEN_WUXING[men];
    } else if (item.type === '星') {
      const xing = parseXingName(item.name);
      if (xing) yongWuXing = XING_WUXING[xing];
    } else if (item.type === '神') {
      // 使用共享的 SHEN_NAME_MAP
      const shen = SHEN_NAME_MAP[item.name];
      if (shen) yongWuXing = SHEN_WUXING[shen];
    }

    if (!yongWuXing) return '比';

    // 判断关系
    if (yongWuXing === dayWuXing) return '比';
    if (WUXING_SHENG[yongWuXing] === dayWuXing) return '生'; // 用神生日干
    if (WUXING_KE[yongWuXing] === dayWuXing) return '克'; // 用神克日干
    if (WUXING_SHENG[dayWuXing] === yongWuXing) return '泄'; // 日干生用神
    if (WUXING_KE[dayWuXing] === yongWuXing) return '耗'; // 日干克用神

    return '比';
  }

  /**
   * 获取格局影响
   */
  private static getGeJuEffects(gong: GongWei, result: QimenResult): string[] {
    const effects: string[] = [];

    for (const geJu of result.geJu) {
      if (geJu.gongs.includes(gong)) {
        effects.push(`${geJu.name}(${geJu.type})`);
      }
    }

    return effects;
  }

  /**
   * 计算用神评分
   */
  private static calcYongShenScore(
    state: WangXiangState,
    isKong: boolean,
    isRuMu: boolean,
    isJiXing: boolean,
    relation: DayGanRelation,
    geJuEffects: string[]
  ): number {
    const weights = YONGSHEN_SCORE_WEIGHTS;

    let score = 50; // 基础分

    // 旺相休囚死
    score += weights.wangXiang[state];

    // 空亡
    if (isKong) score += weights.kongWang;

    // 入墓
    if (isRuMu) score += weights.ruMu;

    // 击刑
    if (isJiXing) score += weights.jiXing;

    // 与日干关系
    score += weights.dayRelation[relation];

    // 格局影响
    for (const effect of geJuEffects) {
      if (effect.includes('吉格')) {
        score += weights.jiGe;
      } else if (effect.includes('凶格')) {
        score += weights.xiongGe;
      }
    }

    // 限制范围
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算主客关系
   */
  private static calcZhuKeRelation(
    zhuWuXing: WuXing,
    keWuXing: WuXing
  ): ZhuKeAnalysis['relation'] {
    if (zhuWuXing === keWuXing) return '比和';
    if (WUXING_KE[zhuWuXing] === keWuXing) return '我克彼';
    if (WUXING_KE[keWuXing] === zhuWuXing) return '彼克我';
    if (WUXING_SHENG[zhuWuXing] === keWuXing) return '我生彼';
    if (WUXING_SHENG[keWuXing] === zhuWuXing) return '彼生我';
    return '比和';
  }

  /**
   * 生成主客分析结论
   */
  private static generateZhuKeSummary(
    zhuState: WangXiangState,
    keState: WangXiangState,
    relation: ZhuKeAnalysis['relation']
  ): string {
    const stateScore = (s: WangXiangState): number => {
      const scores: Record<WangXiangState, number> = { '旺': 5, '相': 4, '休': 3, '囚': 2, '死': 1 };
      return scores[s];
    };

    const zhuScore = stateScore(zhuState);
    const keScore = stateScore(keState);

    let summary = '';

    // 状态对比
    if (zhuScore > keScore) {
      summary = '我方状态优于对方';
    } else if (zhuScore < keScore) {
      summary = '对方状态优于我方';
    } else {
      summary = '双方状态相当';
    }

    // 关系补充
    switch (relation) {
      case '我克彼':
        summary += '，我方占主动';
        break;
      case '彼克我':
        summary += '，对方占主动';
        break;
      case '比和':
        summary += '，双方势均力敌';
        break;
      case '我生彼':
        summary += '，我方有付出之象';
        break;
      case '彼生我':
        summary += '，对方有付出之象';
        break;
    }

    return summary;
  }
}
