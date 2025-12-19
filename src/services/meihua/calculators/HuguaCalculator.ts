/**
 * 互卦計算器
 * 
 * 互卦取法：
 * - 下卦：本卦 2、3、4 爻（自下而上）
 * - 上卦：本卦 3、4、5 爻（自下而上）
 */

import { BaGuaName } from '../types';
import { BAGUA_BINARY, binaryToBaGua } from '../data/bagua';

export class HuguaCalculator {
  /**
   * 計算互卦
   * 
   * @param upperGua 上卦
   * @param lowerGua 下卦
   * @returns 互卦的上下卦
   */
  static calculate(upperGua: BaGuaName, lowerGua: BaGuaName): { upper: BaGuaName; lower: BaGuaName } {
    // 獲取六爻的陰陽（自下而上：1-6 爻）
    const lowerBits = BAGUA_BINARY[lowerGua]; // [1爻, 2爻, 3爻]
    const upperBits = BAGUA_BINARY[upperGua]; // [4爻, 5爻, 6爻]
    
    // 組合成六爻數組
    const sixYao: boolean[] = [...lowerBits, ...upperBits];
    // sixYao[0] = 初爻, sixYao[1] = 二爻, ..., sixYao[5] = 上爻
    
    // 互卦下卦：2、3、4 爻（索引 1、2、3）
    const huLowerBits: [boolean, boolean, boolean] = [
      sixYao[1], // 二爻
      sixYao[2], // 三爻
      sixYao[3], // 四爻
    ];
    
    // 互卦上卦：3、4、5 爻（索引 2、3、4）
    const huUpperBits: [boolean, boolean, boolean] = [
      sixYao[2], // 三爻
      sixYao[3], // 四爻
      sixYao[4], // 五爻
    ];
    
    return {
      upper: binaryToBaGua(huUpperBits),
      lower: binaryToBaGua(huLowerBits),
    };
  }
}
