/**
 * 六親計算器
 * 
 * 六親推導規則（以卦宮五行為「我」）：
 * - 生我者為父母
 * - 我生者為子孫
 * - 克我者為官鬼
 * - 我克者為妻財
 * - 同我者為兄弟
 */

import { WuXing, LiuQin } from '../types';

/** 五行相生關係：key 生 value */
const WUXING_SHENG: Record<WuXing, WuXing> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木',
};

/** 五行相剋關係：key 剋 value */
const WUXING_KE: Record<WuXing, WuXing> = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木',
};

export class LiuqinCalculator {
  /**
   * 計算六親
   * @param gongWuXing 卦宮五行（作為「我」）
   * @param yaoWuXing 爻的五行
   */
  static calculate(gongWuXing: WuXing, yaoWuXing: WuXing): LiuQin {
    // 同我者為兄弟
    if (gongWuXing === yaoWuXing) {
      return '兄弟';
    }
    
    // 生我者為父母
    if (WUXING_SHENG[yaoWuXing] === gongWuXing) {
      return '父母';
    }
    
    // 我生者為子孫
    if (WUXING_SHENG[gongWuXing] === yaoWuXing) {
      return '子孫';
    }
    
    // 克我者為官鬼
    if (WUXING_KE[yaoWuXing] === gongWuXing) {
      return '官鬼';
    }
    
    // 我克者為妻財
    if (WUXING_KE[gongWuXing] === yaoWuXing) {
      return '妻財';
    }
    
    // 理論上不會到這裡
    return '兄弟';
  }

  /**
   * 獲取六親簡稱
   */
  static getShortName(liuQin: LiuQin): string {
    const SHORT_NAMES: Record<LiuQin, string> = {
      '父母': '父',
      '兄弟': '兄',
      '子孫': '子',
      '妻財': '財',
      '官鬼': '官',
    };
    return SHORT_NAMES[liuQin];
  }
}
