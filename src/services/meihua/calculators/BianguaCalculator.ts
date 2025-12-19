/**
 * 變卦計算器
 * 
 * 變卦：動爻陰陽反轉
 */

import { BaGuaName } from '../types';
import { BAGUA_BINARY, binaryToBaGua } from '../data/bagua';

export class BianguaCalculator {
  /**
   * 計算變卦
   * 
   * @param upperGua 上卦
   * @param lowerGua 下卦
   * @param movingYao 動爻位置（1-6，自下而上）
   * @returns 變卦的上下卦
   */
  static calculate(
    upperGua: BaGuaName,
    lowerGua: BaGuaName,
    movingYao: number
  ): { upper: BaGuaName; lower: BaGuaName } {
    // 獲取六爻的陰陽
    const lowerBits = [...BAGUA_BINARY[lowerGua]];
    const upperBits = [...BAGUA_BINARY[upperGua]];
    
    // 組合成六爻數組
    const sixYao: boolean[] = [...lowerBits, ...upperBits];
    
    // 動爻反轉（movingYao 是 1-6，索引是 0-5）
    const yaoIndex = movingYao - 1;
    sixYao[yaoIndex] = !sixYao[yaoIndex];
    
    // 拆分回上下卦
    const newLowerBits: [boolean, boolean, boolean] = [
      sixYao[0],
      sixYao[1],
      sixYao[2],
    ];
    const newUpperBits: [boolean, boolean, boolean] = [
      sixYao[3],
      sixYao[4],
      sixYao[5],
    ];
    
    return {
      upper: binaryToBaGua(newUpperBits),
      lower: binaryToBaGua(newLowerBits),
    };
  }
}
