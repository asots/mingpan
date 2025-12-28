/**
 * 神煞计算器
 *
 * 负责计算奇门盘中的各类神煞
 */

import type {
  ShenShaInfo,
  QimenResult,
  GongWei,
  TianGan,
  DiZhi,
} from '../types';
import {
  TIANYI_GUIREN,
  TIANYI_DEF,
  YIMA,
  YIMA_DEF,
  HUAGAI,
  HUAGAI_DEF,
  YUEDE,
  YUEDE_DEF,
  LUSHEN,
  LUSHEN_DEF,
  TAOHUA,
  TAOHUA_DEF,
  TIANYI_YIZHI,
  TIANYI_SHEN_DEF,
  TAISUI_DEF,
  YANGREN,
  YANGREN_DEF,
  RIMA_DEF,
  DINGMA_DEF,
  DIZHI_TO_GONG,
} from '../data/shensha-rules';
import { findGanGong } from '../utils/gongUtils';

// ============= 辅助类型 =============

interface ShenShaContext {
  result: QimenResult;
  yearZhi: DiZhi;
  monthZhi: DiZhi;
  dayGan: TianGan;
  dayZhi: DiZhi;
}

// ============= 神煞计算器 =============

export class ShenShaCalculator {
  /**
   * 计算所有神煞
   *
   * @param result 奇门盘结果
   * @returns 神煞信息列表
   */
  static calculateAll(result: QimenResult): ShenShaInfo[] {
    const siZhu = result.timeInfo.siZhu;
    const yearGanZhi = siZhu.yearGanZhi;
    const monthGanZhi = siZhu.monthGanZhi;

    const context: ShenShaContext = {
      result,
      yearZhi: yearGanZhi.charAt(1) as DiZhi,
      monthZhi: monthGanZhi.charAt(1) as DiZhi,
      dayGan: siZhu.dayGan,
      dayZhi: siZhu.dayZhi,
    };

    const shenShaList: ShenShaInfo[] = [];

    // 计算各类神煞
    shenShaList.push(...this.calcTianYiGuiRen(context));
    shenShaList.push(...this.calcYiMa(context));
    shenShaList.push(...this.calcHuaGai(context));
    shenShaList.push(...this.calcYueDe(context));
    shenShaList.push(...this.calcLuShen(context));
    shenShaList.push(...this.calcTaoHua(context));
    shenShaList.push(...this.calcTianYi(context));
    shenShaList.push(...this.calcTaiSui(context));
    shenShaList.push(...this.calcYangRen(context));
    shenShaList.push(...this.calcDingMa(context));

    return shenShaList;
  }

  /**
   * 将神煞分配到各宫
   *
   * @param shenShaList 神煞列表
   * @returns 按宫位分组的神煞
   */
  static distributeToGongs(
    shenShaList: ShenShaInfo[]
  ): Record<GongWei, ShenShaInfo[]> {
    const gongShenSha: Record<GongWei, ShenShaInfo[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [],
    };

    for (const ss of shenShaList) {
      gongShenSha[ss.gong].push(ss);
    }

    return gongShenSha;
  }

  // ============= 各神煞计算方法 =============

  /**
   * 计算天乙贵人
   */
  private static calcTianYiGuiRen(context: ShenShaContext): ShenShaInfo[] {
    const result: ShenShaInfo[] = [];
    const guiRenZhi = TIANYI_GUIREN[context.dayGan];

    if (guiRenZhi) {
      for (const zhi of guiRenZhi) {
        const gong = DIZHI_TO_GONG[zhi];
        if (gong) {
          result.push({
            name: TIANYI_DEF.name,
            type: TIANYI_DEF.type,
            gong,
            description: `${TIANYI_DEF.description}（${zhi}位）`,
          });
        }
      }
    }

    return result;
  }

  /**
   * 计算驿马
   */
  private static calcYiMa(context: ShenShaContext): ShenShaInfo[] {
    const maZhi = YIMA[context.dayZhi];
    if (!maZhi) return [];

    const gong = DIZHI_TO_GONG[maZhi];
    if (!gong) return [];

    return [{
      name: RIMA_DEF.name, // 使用"日马"更准确
      type: YIMA_DEF.type,
      gong,
      description: `${YIMA_DEF.description}（${maZhi}位）`,
    }];
  }

  /**
   * 计算华盖
   */
  private static calcHuaGai(context: ShenShaContext): ShenShaInfo[] {
    const result: ShenShaInfo[] = [];

    // 按年支查
    const yearHuaGai = HUAGAI[context.yearZhi];
    if (yearHuaGai) {
      const gong = DIZHI_TO_GONG[yearHuaGai];
      if (gong) {
        result.push({
          name: HUAGAI_DEF.name,
          type: HUAGAI_DEF.type,
          gong,
          description: `年华盖（${yearHuaGai}位）`,
        });
      }
    }

    // 按日支查（如果不同于年支）
    if (context.dayZhi !== context.yearZhi) {
      const dayHuaGai = HUAGAI[context.dayZhi];
      if (dayHuaGai && dayHuaGai !== yearHuaGai) {
        const gong = DIZHI_TO_GONG[dayHuaGai];
        if (gong) {
          result.push({
            name: HUAGAI_DEF.name,
            type: HUAGAI_DEF.type,
            gong,
            description: `日华盖（${dayHuaGai}位）`,
          });
        }
      }
    }

    return result;
  }

  /**
   * 计算月德
   */
  private static calcYueDe(context: ShenShaContext): ShenShaInfo[] {
    const yueDeGan = YUEDE[context.monthZhi];
    if (!yueDeGan) return [];

    // 找月德天干在地盘的落宫
    const gong = findGanGong(context.result, yueDeGan);
    if (!gong) return [];

    return [{
      name: YUEDE_DEF.name,
      type: YUEDE_DEF.type,
      gong,
      description: YUEDE_DEF.description,
    }];
  }

  /**
   * 计算禄神
   */
  private static calcLuShen(context: ShenShaContext): ShenShaInfo[] {
    const luZhi = LUSHEN[context.dayGan];
    if (!luZhi) return [];

    const gong = DIZHI_TO_GONG[luZhi];
    if (!gong) return [];

    return [{
      name: LUSHEN_DEF.name,
      type: LUSHEN_DEF.type,
      gong,
      description: `${LUSHEN_DEF.description}（${luZhi}位）`,
    }];
  }

  /**
   * 计算桃花（咸池）
   */
  private static calcTaoHua(context: ShenShaContext): ShenShaInfo[] {
    const taoHuaZhi = TAOHUA[context.dayZhi];
    if (!taoHuaZhi) return [];

    const gong = DIZHI_TO_GONG[taoHuaZhi];
    if (!gong) return [];

    return [{
      name: TAOHUA_DEF.name,
      type: TAOHUA_DEF.type,
      gong,
      description: `${TAOHUA_DEF.description}（${taoHuaZhi}位）`,
    }];
  }

  /**
   * 计算天医
   */
  private static calcTianYi(context: ShenShaContext): ShenShaInfo[] {
    const tianYiZhi = TIANYI_YIZHI[context.monthZhi];
    if (!tianYiZhi) return [];

    const gong = DIZHI_TO_GONG[tianYiZhi];
    if (!gong) return [];

    return [{
      name: '天医',
      type: TIANYI_SHEN_DEF.type,
      gong,
      description: `${TIANYI_SHEN_DEF.description}（${tianYiZhi}位）`,
    }];
  }

  /**
   * 计算太岁
   */
  private static calcTaiSui(context: ShenShaContext): ShenShaInfo[] {
    const gong = DIZHI_TO_GONG[context.yearZhi];
    if (!gong) return [];

    return [{
      name: TAISUI_DEF.name,
      type: TAISUI_DEF.type,
      gong,
      description: `${TAISUI_DEF.description}（${context.yearZhi}年）`,
    }];
  }

  /**
   * 计算羊刃
   */
  private static calcYangRen(context: ShenShaContext): ShenShaInfo[] {
    const yangRenZhi = YANGREN[context.dayGan];
    if (!yangRenZhi) return [];

    const gong = DIZHI_TO_GONG[yangRenZhi];
    if (!gong) return [];

    return [{
      name: YANGREN_DEF.name,
      type: YANGREN_DEF.type,
      gong,
      description: `${YANGREN_DEF.description}（${yangRenZhi}位）`,
    }];
  }

  /**
   * 计算丁马
   *
   * 丁奇落宫即为丁马
   */
  private static calcDingMa(context: ShenShaContext): ShenShaInfo[] {
    const gong = findGanGong(context.result, '丁');
    if (!gong) return [];

    return [{
      name: DINGMA_DEF.name,
      type: DINGMA_DEF.type,
      gong,
      description: DINGMA_DEF.description,
    }];
  }

  /**
   * 计算神煞总评分
   *
   * @param shenShaList 神煞列表
   * @returns 总评分
   */
  static calcTotalScore(shenShaList: ShenShaInfo[]): number {
    const WEIGHTS: Record<string, number> = {
      '天乙贵人': 15,
      '禄神': 10,
      '天德': 10,
      '月德': 8,
      '天医': 8,
      '丁马': 5,
      '羊刃': -10,
      '驿马': 3,
      '日马': 3,
      '华盖': 0,
      '桃花': 0,
      '太岁': -5,
    };

    let score = 0;
    for (const ss of shenShaList) {
      score += WEIGHTS[ss.name] || 0;
    }

    return score;
  }

  /**
   * 按吉凶类型分组神煞
   */
  static groupByType(shenShaList: ShenShaInfo[]): {
    ji: ShenShaInfo[];
    xiong: ShenShaInfo[];
    zhongxing: ShenShaInfo[];
  } {
    const ji: ShenShaInfo[] = [];
    const xiong: ShenShaInfo[] = [];
    const zhongxing: ShenShaInfo[] = [];

    for (const ss of shenShaList) {
      switch (ss.type) {
        case '吉':
          ji.push(ss);
          break;
        case '凶':
          xiong.push(ss);
          break;
        case '中性':
          zhongxing.push(ss);
          break;
      }
    }

    return { ji, xiong, zhongxing };
  }
}
