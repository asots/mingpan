/**
 * 六神計算器
 * 
 * 六神（六獸）按日干起：
 * - 甲乙日：青龍起初爻
 * - 丙丁日：朱雀起初爻
 * - 戊日：勾陳起初爻
 * - 己日：螣蛇起初爻
 * - 庚辛日：白虎起初爻
 * - 壬癸日：玄武起初爻
 * 
 * 順序：青龍 → 朱雀 → 勾陳 → 螣蛇 → 白虎 → 玄武
 */

import { TianGan, LiuShen } from '../types';

/** 六神順序 */
const LIUSHEN_ORDER: LiuShen[] = ['青龍', '朱雀', '勾陳', '螣蛇', '白虎', '玄武'];

/** 日干對應的起始六神索引 */
const STEM_TO_START_INDEX: Record<TianGan, number> = {
  '甲': 0, // 青龍
  '乙': 0, // 青龍
  '丙': 1, // 朱雀
  '丁': 1, // 朱雀
  '戊': 2, // 勾陳
  '己': 3, // 螣蛇
  '庚': 4, // 白虎
  '辛': 4, // 白虎
  '壬': 5, // 玄武
  '癸': 5, // 玄武
};

export class LiushenCalculator {
  /**
   * 計算某爻的六神
   * @param dayStem 日干
   * @param position 爻位（1-6，自下而上）
   */
  static calculate(dayStem: TianGan, position: number): LiuShen {
    const startIndex = STEM_TO_START_INDEX[dayStem];
    // 初爻為起始六神，依次向上
    const index = (startIndex + position - 1) % 6;
    return LIUSHEN_ORDER[index];
  }

  /**
   * 計算全卦六爻的六神
   * @param dayStem 日干
   * @returns 六爻六神（自下而上）
   */
  static calculateAll(dayStem: TianGan): LiuShen[] {
    const results: LiuShen[] = [];
    for (let i = 1; i <= 6; i++) {
      results.push(this.calculate(dayStem, i));
    }
    return results;
  }
}
