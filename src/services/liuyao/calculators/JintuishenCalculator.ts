/**
 * 進神/退神計算器
 * 
 * 理論來源：《增刪卜易》第36章「進神退神章」
 * 
 * 核心規則：
 * - 進神：動爻變化後地支順進（如亥化子、寅化卯）
 * - 退神：動爻變化後地支逆退（如子化亥、卯化寅）
 * 
 * 進神規則（地支順進）：
 * - 亥化子、寅化卯、巳化午、申化酉（四正進）
 * - 丑化辰、辰化未、未化戌、戌化丑（四墓進）
 * 
 * 退神規則（地支逆退）：
 * - 子化亥、卯化寅、午化巳、酉化申（四正退）
 * - 辰化丑、未化辰、戌化未、丑化戌（四墓退）
 */

import { DiZhi, JinTuiShenType } from '../types';

/** 進神對照表：原地支 -> 變化後地支 */
const JIN_SHEN_MAP: Record<DiZhi, DiZhi> = {
  '亥': '子',
  '寅': '卯',
  '巳': '午',
  '申': '酉',
  '丑': '辰',
  '辰': '未',
  '未': '戌',
  '戌': '丑',
  // 以下不構成進神
  '子': '子', // placeholder
  '卯': '卯',
  '午': '午',
  '酉': '酉',
};

/** 退神對照表：原地支 -> 變化後地支 */
const TUI_SHEN_MAP: Record<DiZhi, DiZhi> = {
  '子': '亥',
  '卯': '寅',
  '午': '巳',
  '酉': '申',
  '辰': '丑',
  '未': '辰',
  '戌': '未',
  '丑': '戌',
  // 以下不構成退神
  '亥': '亥', // placeholder
  '寅': '寅',
  '巳': '巳',
  '申': '申',
};

export class JintuishenCalculator {
  /**
   * 判斷動爻變化是否為進神或退神
   * 
   * @param originalDiZhi 原地支（本卦納甲）
   * @param changedDiZhi 變化後地支（變卦納甲）
   * @returns 進神/退神/null
   */
  static calculate(originalDiZhi: DiZhi, changedDiZhi: DiZhi): JinTuiShenType {
    // 檢查是否為進神
    if (JIN_SHEN_MAP[originalDiZhi] === changedDiZhi) {
      return '進神';
    }
    
    // 檢查是否為退神
    if (TUI_SHEN_MAP[originalDiZhi] === changedDiZhi) {
      return '退神';
    }
    
    return null;
  }
  
  /**
   * 獲取進神說明
   */
  static getJinShenDescription(): string {
    return '進神：亥→子、寅→卯、巳→午、申→酉、丑→辰、辰→未、未→戌、戌→丑';
  }
  
  /**
   * 獲取退神說明
   */
  static getTuiShenDescription(): string {
    return '退神：子→亥、卯→寅、午→巳、酉→申、辰→丑、未→辰、戌→未、丑→戌';
  }
}
