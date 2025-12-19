/**
 * 四課計算器
 * 
 * 四課由日干支推演：
 * - 一課：日干上神（日干寄宮的天盤地支）加日干
 * - 二課：一課上神的天盤地支加一課上神
 * - 三課：日支上神（日支的天盤地支）加日支
 * - 四課：三課上神的天盤地支加三課上神
 */

import type { DiZhi, TianGan, TianJiangShort, SiKe, SiKeInfo, TianDiPan, WuXing } from '../types';
import {
  GAN_JI_GONG,
  GAN_WUXING,
  ZHI_WUXING,
  WUXING_RELATION,
} from '../data/constants';

export class SiKeCalculator {
  /**
   * 計算四課
   */
  static calculate(
    dayGan: TianGan,
    dayZhi: DiZhi,
    tianDiPan: TianDiPan
  ): SiKeInfo {
    const { diToTian, diToJiang } = tianDiPan;
    
    // 日干寄宮
    const dayGanJiGong = GAN_JI_GONG[dayGan];
    
    // 一課：日干上神加日干
    const yiKeShang = diToTian[dayGanJiGong];
    const yiKe = this.buildSiKe(1, yiKeShang, dayGan, diToJiang[dayGanJiGong]);
    
    // 二課：一課上神的天盤地支加一課上神
    const erKeShang = diToTian[yiKeShang];
    const erKe = this.buildSiKe(2, erKeShang, yiKeShang, diToJiang[yiKeShang]);
    
    // 三課：日支上神加日支
    const sanKeShang = diToTian[dayZhi];
    const sanKe = this.buildSiKe(3, sanKeShang, dayZhi, diToJiang[dayZhi]);
    
    // 四課：三課上神的天盤地支加三課上神
    const siKeShang = diToTian[sanKeShang];
    const siKe = this.buildSiKe(4, siKeShang, sanKeShang, diToJiang[sanKeShang]);
    
    return {
      list: [yiKe, erKe, sanKe, siKe],
      dayGan,
      dayZhi,
      dayGanJiGong,
    };
  }
  
  /**
   * 構建單個課
   */
  private static buildSiKe(
    position: 1 | 2 | 3 | 4,
    shangShen: DiZhi,
    xiaShen: string,
    tianJiang: TianJiangShort
  ): SiKe {
    // 計算上下關係
    const relation = this.calculateRelation(shangShen, xiaShen);
    
    return {
      position,
      shangShen,
      xiaShen,
      tianJiang,
      relation,
    };
  }
  
  /**
   * 計算上下神關係
   */
  private static calculateRelation(
    shangShen: DiZhi,
    xiaShen: string
  ): '上尅下' | '下賊上' | '比和' | '上生下' | '下生上' {
    // 獲取五行
    const shangWuXing = ZHI_WUXING[shangShen];
    let xiaWuXing: WuXing;
    
    // 下神可能是天干（日干）或地支
    if (xiaShen in GAN_WUXING) {
      xiaWuXing = GAN_WUXING[xiaShen as TianGan];
    } else {
      xiaWuXing = ZHI_WUXING[xiaShen as DiZhi];
    }
    
    // 查找關係
    const relationKey = shangWuXing + xiaWuXing;
    const relation = WUXING_RELATION[relationKey];
    
    switch (relation) {
      case '尅':
        return '上尅下';
      case '被尅':
        return '下賊上';
      case '比和':
        return '比和';
      case '生':
        return '上生下';
      case '被生':
        return '下生上';
      default:
        return '比和';
    }
  }
  
  /**
   * 分析四課關係統計
   */
  static analyzeRelations(siKe: SiKeInfo): {
    shangKeXia: number;  // 上尅下數量
    xiaZeiShang: number; // 下賊上數量
    biHe: number;        // 比和數量
    shangShengXia: number; // 上生下數量
    xiaShengShang: number; // 下生上數量
  } {
    const stats = {
      shangKeXia: 0,
      xiaZeiShang: 0,
      biHe: 0,
      shangShengXia: 0,
      xiaShengShang: 0,
    };
    
    for (const ke of siKe.list) {
      switch (ke.relation) {
        case '上尅下':
          stats.shangKeXia++;
          break;
        case '下賊上':
          stats.xiaZeiShang++;
          break;
        case '比和':
          stats.biHe++;
          break;
        case '上生下':
          stats.shangShengXia++;
          break;
        case '下生上':
          stats.xiaShengShang++;
          break;
      }
    }
    
    return stats;
  }
}
