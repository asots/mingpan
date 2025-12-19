/**
 * 旺衰計算器
 * 
 * 理論來源：五行旺相休囚死（《淮南子》以來的傳統理論）
 * 
 * 核心規則（以月令/日辰地支所屬五行為基準）：
 * - 旺：與月令/日辰同五行
 * - 相：月令/日辰所生之五行
 * - 休：生月令/日辰之五行
 * - 囚：克月令/日辰之五行
 * - 死：被月令/日辰所克之五行
 * 
 * 簡化口訣：
 * - 臨我者旺（同我）
 * - 我生者相
 * - 生我者休
 * - 克我者囚
 * - 我克者死
 */

import { DiZhi, WuXing, WangShuaiState } from '../types';
import { DIZHI_WUXING } from '../data/guagong';

/** 五行相生：A 生 B */
const SHENG: Record<WuXing, WuXing> = {
  '金': '水',
  '水': '木',
  '木': '火',
  '火': '土',
  '土': '金',
};

/** 五行相剋：A 克 B */
const KE: Record<WuXing, WuXing> = {
  '金': '木',
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
};

export class WangshuaiCalculator {
  /**
   * 計算爻的旺衰狀態
   * 
   * @param yaoWuXing 爻的五行
   * @param lingDiZhi 月令或日辰的地支
   * @returns 旺衰狀態
   */
  static calculate(yaoWuXing: WuXing, lingDiZhi: DiZhi): WangShuaiState {
    const lingWuXing = DIZHI_WUXING[lingDiZhi];
    
    // 同五行 = 旺
    if (yaoWuXing === lingWuXing) {
      return '旺';
    }
    
    // 令生爻 = 相（爻得生）
    if (SHENG[lingWuXing] === yaoWuXing) {
      return '相';
    }
    
    // 爻生令 = 休（爻洩氣）
    if (SHENG[yaoWuXing] === lingWuXing) {
      return '休';
    }
    
    // 爻克令 = 囚（爻耗力）
    if (KE[yaoWuXing] === lingWuXing) {
      return '囚';
    }
    
    // 令克爻 = 死（爻受制）
    if (KE[lingWuXing] === yaoWuXing) {
      return '死';
    }
    
    // 不應該到這裡
    return '休';
  }
  
  /**
   * 獲取旺衰說明
   */
  static getDescription(state: WangShuaiState): string {
    const descriptions: Record<WangShuaiState, string> = {
      '旺': '當令，力量最強',
      '相': '得生，力量次強',
      '休': '洩氣，力量平平',
      '囚': '耗力，力量較弱',
      '死': '受制，力量最弱',
    };
    return descriptions[state];
  }
  
  /**
   * 判斷是否為旺相（有力）
   */
  static isStrong(state: WangShuaiState): boolean {
    return state === '旺' || state === '相';
  }
  
  /**
   * 判斷是否為休囚死（無力）
   */
  static isWeak(state: WangShuaiState): boolean {
    return state === '休' || state === '囚' || state === '死';
  }
}
