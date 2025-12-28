/**
 * 局数计算器
 * 根据节气和置闰法确定阴阳遁和局数
 */

import type { DiZhi, GongWei, JuShu, TianGan, YinYangDun, YuanType, ZhiRunMethod } from '../types';
import {
  JIEQI_JU_MAP,
  JIA_ZI_60,
  getXunShou,
  getYuanIndex,
} from '../data/constants';

export interface JuShuResult {
  /** 阴阳遁 */
  yinYangDun: YinYangDun;
  /** 局数 (1-9) */
  juShu: JuShu;
  /** 上中下元 */
  yuan: YuanType;
}

/**
 * 局数计算器
 */
export class JuShuCalculator {
  /**
   * 计算局数
   * @param jieQi 当前节气名称
   * @param dayGanZhi 日干支
   * @param method 置闰方法
   * @param jieQiDate 节气开始日期 (茅山法需要)
   * @param currentDate 当前日期 (茅山法需要)
   */
  static calculate(
    jieQi: string,
    dayGanZhi: string,
    method: ZhiRunMethod,
    jieQiDate?: Date,
    currentDate?: Date
  ): JuShuResult {
    // 获取节气对应的阴阳遁和局数表
    const jieQiInfo = JIEQI_JU_MAP[jieQi];
    if (!jieQiInfo) {
      throw new Error(`未知节气: ${jieQi}`);
    }

    const { dun, ju } = jieQiInfo;
    const yinYangDun: YinYangDun = dun;

    // 根据置闰方法计算元
    let yuan: YuanType;
    if (method === 'chaibu') {
      yuan = this.calculateYuanChaibu(dayGanZhi);
    } else {
      yuan = this.calculateYuanMaoshan(jieQiDate!, currentDate!);
    }

    // 根据元获取对应局数
    const yuanIdx = getYuanIndex(yuan);
    const juShu = ju[yuanIdx];

    return {
      yinYangDun,
      juShu,
      yuan,
    };
  }

  /**
   * 拆补法计算上中下元
   * 根据日干支确定符头，从而确定上中下元
   *
   * 原理：
   * - 每个节气 15 天分为三元，每元 5 天
   * - 上元：符头为甲子、甲午（甲子旬或甲午旬的开头）
   * - 中元：符头为甲戌、甲辰
   * - 下元：符头为甲申、甲寅
   */
  private static calculateYuanChaibu(dayGanZhi: string): YuanType {
    const xunShou = getXunShou(dayGanZhi);

    // 根据旬首判断上中下元
    switch (xunShou) {
      case '甲子':
      case '甲午':
        return '上元';
      case '甲戌':
      case '甲辰':
        return '中元';
      case '甲申':
      case '甲寅':
        return '下元';
      default:
        return '上元';
    }
  }

  /**
   * 茅山法计算上中下元
   * 根据节气交节后的天数确定
   *
   * 原理：
   * - 节气交节后 1-5 天为上元
   * - 节气交节后 6-10 天为中元
   * - 节气交节后 11-15 天为下元
   */
  private static calculateYuanMaoshan(jieQiDate: Date, currentDate: Date): YuanType {
    // 使用 UTC 日期避免时区和时间精度问题
    const jieQiDay = Date.UTC(jieQiDate.getFullYear(), jieQiDate.getMonth(), jieQiDate.getDate());
    const currentDay = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const diffDays = Math.floor((currentDay - jieQiDay) / (1000 * 60 * 60 * 24)) + 1; // 交节当天算第1天

    // 处理边界情况
    if (diffDays < 1) {
      return '上元'; // 节气当天之前，默认上元
    } else if (diffDays <= 5) {
      return '上元';
    } else if (diffDays <= 10) {
      return '中元';
    } else {
      return '下元';
    }
  }

  /**
   * 根据日干支获取其在六十甲子中的索引
   */
  static getGanZhiIndex(ganZhi: string): number {
    return JIA_ZI_60.indexOf(ganZhi);
  }

  /**
   * 判断是否为阳遁
   */
  static isYangDun(yinYangDun: YinYangDun): boolean {
    return yinYangDun === '阳遁';
  }
}
