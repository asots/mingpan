/**
 * 转盘式奇门计算器
 * Rotating style Qimen calculator (following《神奇之门》)
 *
 * 转盘式核心规则：
 * 1. 三奇六仪按物理方向旋转（非洛书飞布）
 * 2. 阳遁顺转（物理顺时针）：1→8→3→4→9→2→7→6
 * 3. 阴遁逆转（物理逆时针）：1→6→7→2→9→4→3→8
 * 4. 八门、九星同样按物理方向转动
 * 5. 中宫寄坤二
 * 6. 天禽星随天芮星（寄坤二宫）
 */

import type { GongWei, TianGan, DiZhi, BaMen, JiuXing, YinYangDun } from '../types';
import {
  SAN_QI_LIU_YI,
  BA_MEN_ORDER,
  BA_MEN_GONG,
  JIU_XING_GONG,
  DI_ZHI,
  getXunShou,
  getLiuYiGan,
  rotate,
  getRotationSteps,
  ZHONG_GONG_JI_ZHUAN,
  getPhysicalClockwiseIndex,
  getPhysicalClockwiseGong,
  getPhysicalCounterClockwiseIndex,
  getPhysicalCounterClockwiseGong,
} from '../data/constants';

// ============= 类型定义 =============

export interface ZhuanPanTianPanResult {
  gongGan: Record<GongWei, TianGan>;
  ganGong: Record<TianGan, GongWei>;
}

export interface ZhuanPanBaMenResult {
  gongMen: Record<GongWei, BaMen>;
  zhiShiMen: BaMen;
  zhiShiGong: GongWei;
  zhiShiLuoGong: GongWei;
}

export interface ZhuanPanJiuXingResult {
  gongXing: Record<GongWei, JiuXing>;
  zhiFuXing: JiuXing;
  zhiFuGong: GongWei;
  zhiFuLuoGong: GongWei;
}

// ============= 转盘式计算器 =============

/**
 * 转盘式奇门计算器
 * 实现《神奇之门》中的转盘式排盘法
 */
export class ZhuanPanCalculator {
  /**
   * 计算转盘式天盘布局
   * @param diPanGanGong 地盘干->宫位映射
   * @param ganZhi 时干支（时盘）、日干支（日盘）、月干支（月盘）或年干支（年盘）
   * @param yinYangDun 阴阳遁
   * @returns 天盘各宫的干
   *
   * 原理（转盘式）：
   * 1. 找到时干（或日干/月干/年干）在地盘的落宫
   * 2. 计算该宫到值符星原始宫的旋转步数
   * 3. 将整个地盘旋转相应步数
   * 4. 阳遁顺时针旋转，阴遁逆时针旋转
   */
  static calculateTianPan(
    diPanGanGong: Record<TianGan, GongWei>,
    ganZhi: string,
    yinYangDun: YinYangDun
  ): ZhuanPanTianPanResult {
    const isYang = yinYangDun === '阳遁';
    const gan = ganZhi.charAt(0) as TianGan;

    // 时干对应的遁甲干
    const dunGan = this.getDunGan(gan, ganZhi);

    // 找到遁甲干在地盘的落宫
    let startGong = diPanGanGong[dunGan];
    if (startGong === 5) {
      startGong = ZHONG_GONG_JI_ZHUAN;
    }

    // 转盘式：整体旋转
    // 计算需要旋转的步数：从遁甲干原始宫位到当前地盘落宫的步数
    const gongGan: Record<GongWei, TianGan> = {} as Record<GongWei, TianGan>;
    const ganGong: Record<TianGan, GongWei> = {} as Record<TianGan, GongWei>;

    // 转盘式布局：从起始宫开始，按物理方向旋转布入三奇六仪
    for (let i = 0; i < 9; i++) {
      const currentGan = SAN_QI_LIU_YI[i];
      const gong = this.getGongByRotation(startGong, i, isYang);
      gongGan[gong] = currentGan;
      ganGong[currentGan] = gong;
    }

    return { gongGan, ganGong };
  }

  /**
   * 计算转盘式八门布局
   * @param zhiFuGong 值符星落宫（旬首遁干在地盘的宫位）
   * @param hourZhi 时支
   * @param yinYangDun 阴阳遁
   * @returns 八门布局
   *
   * 原理（转盘式）：
   * 1. 确定值使门（值符星原始宫位对应的门）
   * 2. 值使门从值符星落宫起，按时辰数旋转
   * 3. 阳遁顺时针，阴遁逆时针
   * 4. 其他七门依次排列（按物理方向旋转）
   */
  static calculateBaMen(
    zhiFuGong: GongWei,
    hourZhi: DiZhi,
    yinYangDun: YinYangDun
  ): ZhuanPanBaMenResult {
    const isYang = yinYangDun === '阳遁';

    // 1. 确定值使门（值符星原始宫位对应的门）
    const zhiShiMen = this.getMenByGong(zhiFuGong);
    const zhiShiGong = BA_MEN_GONG[zhiShiMen];

    // 2. 计算时辰数（子时为1）
    const hourNum = DI_ZHI.indexOf(hourZhi) + 1;

    // 3. 计算值使门落宫（转盘式旋转）
    const zhiShiLuoGong = rotate(zhiFuGong, hourNum - 1, isYang);

    // 4. 计算所有八门的落宫（转盘式）
    const gongMen = this.calculateAllMenZhuanPan(zhiShiMen, zhiShiLuoGong, isYang);

    return {
      gongMen,
      zhiShiMen,
      zhiShiGong,
      zhiShiLuoGong,
    };
  }

  /**
   * 计算转盘式九星布局
   * @param xunShouGong 旬首遁干在地盘的宫位
   * @param hourZhi 时支
   * @param yinYangDun 阴阳遁
   * @returns 九星布局
   *
   * 原理（转盘式）：
   * 1. 确定值符星（旬首落宫对应的星）
   * 2. 值符星从地盘旬首落宫起，按时辰数旋转
   * 3. 阳遁顺时针，阴遁逆时针
   * 4. 天禽星（中五宫）随天芮星，或寄坤二
   */
  static calculateJiuXing(
    xunShouGong: GongWei,
    hourZhi: DiZhi,
    yinYangDun: YinYangDun
  ): ZhuanPanJiuXingResult {
    const isYang = yinYangDun === '阳遁';

    // 1. 确定值符星（旬首落宫对应的星）
    const zhiFuXing = this.getXingByGong(xunShouGong);
    const zhiFuGong = JIU_XING_GONG[zhiFuXing];

    // 2. 计算时辰数（子时为1）
    const hourNum = DI_ZHI.indexOf(hourZhi) + 1;

    // 3. 计算值符星落宫（转盘式旋转）
    const zhiFuLuoGong = rotate(xunShouGong, hourNum - 1, isYang);

    // 4. 计算所有九星的落宫（转盘式）
    const gongXing = this.calculateAllXingZhuanPan(zhiFuXing, zhiFuLuoGong, isYang);

    return {
      gongXing,
      zhiFuXing,
      zhiFuGong,
      zhiFuLuoGong,
    };
  }

  // ============= 私有辅助方法 =============

  /**
   * 获取遁甲干
   * 甲遁于六仪之下，需要根据干支确定
   */
  private static getDunGan(gan: TianGan, ganZhi: string): TianGan {
    if (gan !== '甲') {
      return gan;
    }

    // 甲时，需要找到旬首对应的六仪
    const xunShou = getXunShou(ganZhi);
    return getLiuYiGan(xunShou);
  }

  /**
   * 根据起始宫位和步数计算目标宫位（转盘式9宫旋转）
   * 包含中宫处理
   */
  private static getGongByRotation(startGong: GongWei, steps: number, isYang: boolean): GongWei {
    // 中宫寄坤二
    if (startGong === 5) {
      startGong = ZHONG_GONG_JI_ZHUAN;
    }

    // 对于9宫布局（含中宫），需要特殊处理
    // 前4步走外圈前半，第5步到中宫，后4步走外圈后半
    if (steps === 4) {
      return 5; // 第5个位置是中宫
    }

    // 调整步数：跳过中宫的计算
    const adjustedSteps = steps > 4 ? steps - 1 : steps;

    if (isYang) {
      const startIdx = getPhysicalClockwiseIndex(startGong);
      return getPhysicalClockwiseGong(startIdx + adjustedSteps);
    } else {
      const startIdx = getPhysicalCounterClockwiseIndex(startGong);
      return getPhysicalCounterClockwiseGong(startIdx + adjustedSteps);
    }
  }

  /**
   * 根据宫位获取原始门
   */
  private static getMenByGong(gong: GongWei): BaMen {
    const actualGong = gong === 5 ? ZHONG_GONG_JI_ZHUAN : gong;

    for (const [men, menGong] of Object.entries(BA_MEN_GONG)) {
      if (menGong === actualGong) {
        return men as BaMen;
      }
    }

    return '死'; // 坤二宫默认死门
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
   * 计算所有八门的落宫（转盘式）
   * 整体按物理方向旋转
   */
  private static calculateAllMenZhuanPan(
    zhiShiMen: BaMen,
    zhiShiLuoGong: GongWei,
    isYang: boolean
  ): Record<GongWei, BaMen> {
    const gongMen: Record<GongWei, BaMen> = {} as Record<GongWei, BaMen>;

    // 找到值使门在八门顺序中的索引
    const zhiShiIdx = BA_MEN_ORDER.indexOf(zhiShiMen);

    // 获取值使门落宫索引
    let actualLuoGong = zhiShiLuoGong === 5 ? ZHONG_GONG_JI_ZHUAN : zhiShiLuoGong;

    // 转盘式：依次排列八门，按物理方向旋转
    for (let i = 0; i < 8; i++) {
      const menIdx = (zhiShiIdx + i) % 8;
      const men = BA_MEN_ORDER[menIdx];

      // 转盘式旋转
      const gong = rotate(actualLuoGong, i, isYang);
      gongMen[gong] = men;
    }

    // 中宫寄坤二，使用坤二的门
    gongMen[5] = gongMen[ZHONG_GONG_JI_ZHUAN];

    return gongMen;
  }

  /**
   * 计算所有九星的落宫（转盘式）
   * 整体按物理方向旋转，天禽星随天芮星
   */
  private static calculateAllXingZhuanPan(
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

    // 获取值符星落宫
    let actualLuoGong = zhiFuLuoGong === 5 ? ZHONG_GONG_JI_ZHUAN : zhiFuLuoGong;

    // 转盘式：依次排列八星，按物理方向旋转
    for (let i = 0; i < 8; i++) {
      const xingIdx = (zhiFuIdx + i) % 8;
      const xing = xingOrderWithoutQin[xingIdx];

      // 转盘式旋转
      const gong = rotate(actualLuoGong, i, isYang);
      gongXing[gong] = xing;
    }

    // 天禽星寄中宫，实际显示时随天芮
    gongXing[5] = '禽';

    return gongXing;
  }

  /**
   * 根据宫位找门
   */
  static findMenByGong(gongMen: Record<GongWei, BaMen>, gong: GongWei): BaMen {
    return gongMen[gong === 5 ? ZHONG_GONG_JI_ZHUAN : gong];
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

  /**
   * 根据天干找天盘落宫
   */
  static findGongByGan(ganGong: Record<TianGan, GongWei>, gan: TianGan): GongWei {
    const gong = ganGong[gan];
    return gong === 5 ? ZHONG_GONG_JI_ZHUAN : gong;
  }
}
