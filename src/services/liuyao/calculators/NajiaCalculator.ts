/**
 * 納甲計算器
 * 
 * 京房納甲體系：
 * - 根據卦象確定每爻的地支
 * - 地支決定五行屬性
 */

import { BaGua, DiZhi, WuXing, YaoValue, YinYang } from '../types';
import { NAJIA_TABLE, DIZHI_WUXING, BAGUA_BINARY, BINARY_TO_BAGUA } from '../data/guagong';

export interface NaJiaResult {
  /** 地支 */
  diZhi: DiZhi;
  /** 五行 */
  wuXing: WuXing;
}

export class NajiaCalculator {
  /**
   * 計算單爻的納甲
   * @param position 爻位（1-6，自下而上）
   * @param upperGua 上卦
   * @param lowerGua 下卦
   */
  static calculate(position: number, upperGua: BaGua, lowerGua: BaGua): NaJiaResult {
    const isOuter = position > 3;
    const gua = isOuter ? upperGua : lowerGua;
    const positionInGua = isOuter ? position - 3 : position;
    
    const naJiaData = NAJIA_TABLE[gua];
    const arr = isOuter ? naJiaData.outer : naJiaData.inner;
    const diZhi = arr[positionInGua - 1];
    
    return {
      diZhi,
      wuXing: DIZHI_WUXING[diZhi],
    };
  }

  /**
   * 計算全卦六爻的納甲
   * @param upperGua 上卦
   * @param lowerGua 下卦
   * @returns 六爻納甲結果（自下而上）
   */
  static calculateAll(upperGua: BaGua, lowerGua: BaGua): NaJiaResult[] {
    const results: NaJiaResult[] = [];
    for (let i = 1; i <= 6; i++) {
      results.push(this.calculate(i, upperGua, lowerGua));
    }
    return results;
  }

  /**
   * 根據爻值數組獲取上下卦
   * @param yaoValues 六爻值（自下而上）
   * 
   * 注意：BINARY_TO_BAGUA 的定義是"下爻是最高位"
   * 例如：震 = 0b100 = 4，表示下爻阳(1)、中爻阴(0)、上爻阴(0)
   * 計算方式：下爻*4 + 中爻*2 + 上爻*1
   */
  static getGuaFromYaoValues(yaoValues: YaoValue[]): { upper: BaGua; lower: BaGua } {
    // 將爻值轉換為陰陽（6,8=陰，7,9=陽）
    const yinYang = yaoValues.map(v => v === 7 || v === 9);
    
    // 計算下卦（初爻到三爻）- 初爻(下爻)是最高位 (bit 2)
    const lowerBinary = (yinYang[0] ? 4 : 0) + (yinYang[1] ? 2 : 0) + (yinYang[2] ? 1 : 0);
    // 計算上卦（四爻到上爻）- 四爻(下爻)是最高位 (bit 2)
    const upperBinary = (yinYang[3] ? 4 : 0) + (yinYang[4] ? 2 : 0) + (yinYang[5] ? 1 : 0);
    
    return {
      upper: BINARY_TO_BAGUA[upperBinary],
      lower: BINARY_TO_BAGUA[lowerBinary],
    };
  }

  /**
   * 獲取爻的陰陽
   */
  static getYinYang(yaoValue: YaoValue): YinYang {
    return (yaoValue === 7 || yaoValue === 9) ? '陽' : '陰';
  }

  /**
   * 判斷是否為動爻
   */
  static isMoving(yaoValue: YaoValue): boolean {
    return yaoValue === 6 || yaoValue === 9;
  }

  /**
   * 獲取動爻變化後的陰陽
   */
  static getChangedYinYang(yaoValue: YaoValue): YinYang | undefined {
    if (!this.isMoving(yaoValue)) return undefined;
    // 動爻陰陽反轉
    return yaoValue === 9 ? '陰' : '陽';
  }
}
