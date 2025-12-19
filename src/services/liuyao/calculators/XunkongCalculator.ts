/**
 * 旬空計算器
 * 
 * 旬空（空亡）規則：
 * - 六十甲子分為六旬，每旬十天
 * - 每旬有兩個地支輪空（因為天干10個，地支12個）
 * 
 * 六旬空亡表：
 * - 甲子旬：戌亥空
 * - 甲戌旬：申酉空
 * - 甲申旬：午未空
 * - 甲午旬：辰巳空
 * - 甲辰旬：寅卯空
 * - 甲寅旬：子丑空
 */

import { TianGan, DiZhi } from '../types';

/** 天干索引 */
const TIANGAN_INDEX: Record<TianGan, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9,
};

/** 地支索引 */
const DIZHI_INDEX: Record<DiZhi, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
};

/** 地支數組 */
const DIZHI_ARRAY: DiZhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export class XunkongCalculator {
  /**
   * 計算旬空
   * @param dayStem 日干
   * @param dayBranch 日支
   * @returns 空亡的兩個地支
   */
  static calculate(dayStem: TianGan, dayBranch: DiZhi): [DiZhi, DiZhi] {
    const stemIndex = TIANGAN_INDEX[dayStem];
    const branchIndex = DIZHI_INDEX[dayBranch];
    
    // 計算該日所在旬的起始地支索引
    // 旬首的地支索引 = (日支索引 - 日干索引 + 12) % 12
    const xunStartBranchIndex = (branchIndex - stemIndex + 12) % 12;
    
    // 空亡的兩個地支是旬首地支往前數10和11位
    // 即 (旬首索引 + 10) % 12 和 (旬首索引 + 11) % 12
    const kong1Index = (xunStartBranchIndex + 10) % 12;
    const kong2Index = (xunStartBranchIndex + 11) % 12;
    
    return [DIZHI_ARRAY[kong1Index], DIZHI_ARRAY[kong2Index]];
  }

  /**
   * 判斷某地支是否空亡
   */
  static isKong(diZhi: DiZhi, xunKong: [DiZhi, DiZhi]): boolean {
    return xunKong.includes(diZhi);
  }
}
