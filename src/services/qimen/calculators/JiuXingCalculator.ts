/**
 * 九星计算器
 * 计算九星在九宫中的分布
 */

import type { DiZhi, GongWei, JiuXing, TianGan, YinYangDun } from '../types';
import {
  JIU_XING_GONG,
  JIU_XING_ORDER,
  LUOSHU_ORDER,
  ZHONG_GONG_JI,
  DI_ZHI,
  getLuoShuIndex,
  getLuoShuGong,
} from '../data/constants';

export interface JiuXingResult {
  /** 各宫九星 (宫位 -> 星) */
  gongXing: Record<GongWei, JiuXing>;
  /** 值符星 */
  zhiFuXing: JiuXing;
  /** 值符星原始宫位 */
  zhiFuGong: GongWei;
  /** 值符星落宫 */
  zhiFuLuoGong: GongWei;
}

/**
 * 九星计算器
 * 负责计算九星的飞布
 */
export class JiuXingCalculator {
  /**
   * 计算九星布局
   * @param xunShouGong 旬首遁干在地盘的宫位
   * @param hourZhi 时支
   * @param yinYangDun 阴阳遁
   * @returns 九星布局
   *
   * 原理：
   * 1. 确定值符星：旬首遁干落宫对应的星就是值符星
   * 2. 值符星随时干飞布，从地盘旬首落宫起，按时辰数飞布
   * 3. 阳遁顺飞，阴遁逆飞
   * 4. 天禽星（中五宫）随天芮星，或寄坤二
   */
  static calculate(
    xunShouGong: GongWei,
    hourZhi: DiZhi,
    yinYangDun: YinYangDun
  ): JiuXingResult {
    const isYang = yinYangDun === '阳遁';

    // 1. 确定值符星（旬首落宫对应的星）
    const zhiFuXing = this.getXingByGong(xunShouGong);
    const zhiFuGong = JIU_XING_GONG[zhiFuXing];

    // 2. 计算时辰数（子时为1）
    const hourNum = DI_ZHI.indexOf(hourZhi) + 1;

    // 3. 计算值符星落宫
    // 值符星随时干，从旬首落宫起飞布
    const zhiFuLuoGong = this.flyXing(xunShouGong, hourNum - 1, isYang);

    // 4. 计算所有九星的落宫
    const gongXing = this.calculateAllXing(zhiFuXing, zhiFuLuoGong, isYang);

    return {
      gongXing,
      zhiFuXing,
      zhiFuGong,
      zhiFuLuoGong,
    };
  }

  /**
   * 根据宫位获取原始星
   */
  private static getXingByGong(gong: GongWei): JiuXing {
    for (const [xing, xingGong] of Object.entries(JIU_XING_GONG)) {
      if (xingGong === gong) {
        return xing as JiuXing;
      }
    }

    // 中宫为天禽
    if (gong === 5) {
      return '禽';
    }

    return '芮'; // 默认天芮
  }

  /**
   * 飞星：从某宫开始飞布指定步数
   */
  private static flyXing(startGong: GongWei, steps: number, isYang: boolean): GongWei {
    let actualStart = startGong;
    if (actualStart === 5) {
      actualStart = ZHONG_GONG_JI; // 中宫寄坤二
    }

    const startIdx = getLuoShuIndex(actualStart);

    const targetIdx = isYang
      ? (startIdx + steps) % 8
      : ((startIdx - steps) % 8 + 8) % 8;

    return getLuoShuGong(targetIdx);
  }

  /**
   * 计算所有九星的落宫
   * 从值符星落宫开始，按洛书顺序排列其他八星
   * 天禽星随天芮星
   */
  private static calculateAllXing(
    zhiFuXing: JiuXing,
    zhiFuLuoGong: GongWei,
    isYang: boolean
  ): Record<GongWei, JiuXing> {
    const gongXing: Record<GongWei, JiuXing> = {} as Record<GongWei, JiuXing>;

    // 九星顺序（不含天禽，因为天禽随天芮）
    const xingOrderWithoutQin: JiuXing[] = ['蓬', '芮', '冲', '辅', '心', '柱', '任', '英'];

    // 找到值符星在顺序中的索引
    let zhiFuIdx = xingOrderWithoutQin.indexOf(zhiFuXing);
    if (zhiFuIdx === -1) {
      // 如果值符星是天禽，则以天芮为准
      zhiFuIdx = xingOrderWithoutQin.indexOf('芮');
    }

    // 获取值符星落宫在洛书中的索引
    let startIdx = getLuoShuIndex(zhiFuLuoGong === 5 ? ZHONG_GONG_JI : zhiFuLuoGong);

    // 依次排列八星（不含天禽）
    for (let i = 0; i < 8; i++) {
      const xingIdx = (zhiFuIdx + i) % 8;
      const xing = xingOrderWithoutQin[xingIdx];

      const gongIdx = isYang
        ? (startIdx + i) % 8
        : ((startIdx - i) % 8 + 8) % 8;

      const gong = getLuoShuGong(gongIdx);
      gongXing[gong] = xing;
    }

    // 天禽星寄中宫，实际显示时随天芮
    gongXing[5] = '禽';

    return gongXing;
  }

  /**
   * 根据宫位找星
   */
  static findXingByGong(gongXing: Record<GongWei, JiuXing>, gong: GongWei): JiuXing {
    if (gong === 5) {
      return '禽';
    }
    return gongXing[gong];
  }
}
