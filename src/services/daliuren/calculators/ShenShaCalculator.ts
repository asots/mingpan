/**
 * 神煞計算器
 * 
 * 計算大六壬中的各種神煞
 */

import type { DiZhi, ShenSha } from '../types';
import { DI_ZHI, RI_MA, YUE_MA_MAP, JIA_ZI_60, XUN_KONG } from '../data/constants';

export class ShenShaCalculator {
  /**
   * 計算神煞
   */
  static calculate(dayGanZhi: string): ShenSha {
    const dayZhi = dayGanZhi[1] as DiZhi;
    
    return {
      riMa: this.getRiMa(dayZhi),
      yueMa: this.getYueMa(dayZhi),
      dingMa: this.getDingMa(dayGanZhi),
      huaGai: this.getHuaGai(dayZhi),
      shanDian: this.getShanDian(dayZhi),
    };
  }
  
  /**
   * 日馬
   */
  private static getRiMa(dayZhi: DiZhi): DiZhi {
    return RI_MA[dayZhi];
  }
  
  /**
   * 月馬
   */
  private static getYueMa(dayZhi: DiZhi): DiZhi {
    // 根據日支所屬三合局確定月馬
    const sanHeMap: Record<string, DiZhi[]> = {
      '寅申': ['寅', '申'],
      '卯酉': ['卯', '酉'],
      '辰戌': ['辰', '戌'],
      '巳亥': ['巳', '亥'],
      '午子': ['午', '子'],
      '丑未': ['丑', '未'],
    };
    
    for (const [key, zhis] of Object.entries(sanHeMap)) {
      if (zhis.includes(dayZhi)) {
        return YUE_MA_MAP[key];
      }
    }
    
    return '寅';  // 默認
  }
  
  /**
   * 丁馬（根據旬首）
   */
  private static getDingMa(dayGanZhi: string): DiZhi {
    // 找到日干支所在的旬
    const dayIndex = JIA_ZI_60.indexOf(dayGanZhi);
    const xunStart = Math.floor(dayIndex / 10) * 10;
    
    // 丁馬對應表
    const dingMaMap: Record<number, DiZhi> = {
      0: '卯',   // 甲子旬
      10: '丑',  // 甲戌旬
      20: '亥',  // 甲申旬
      30: '酉',  // 甲午旬
      40: '未',  // 甲辰旬
      50: '巳',  // 甲寅旬
    };
    
    return dingMaMap[xunStart] || '卯';
  }
  
  /**
   * 華蓋
   */
  private static getHuaGai(dayZhi: DiZhi): DiZhi {
    const huaGaiMap: Record<DiZhi, DiZhi> = {
      '子': '戌', '丑': '丑', '寅': '戌', '卯': '未',
      '辰': '戌', '巳': '丑', '午': '戌', '未': '未',
      '申': '戌', '酉': '丑', '戌': '戌', '亥': '未',
    };
    return huaGaiMap[dayZhi];
  }
  
  /**
   * 閃電
   */
  private static getShanDian(dayZhi: DiZhi): DiZhi {
    const shanDianMap: Record<DiZhi, DiZhi> = {
      '子': '辰', '丑': '辰', '寅': '未', '卯': '未',
      '辰': '戌', '巳': '戌', '午': '丑', '未': '丑',
      '申': '寅', '酉': '寅', '戌': '卯', '亥': '卯',
    };
    return shanDianMap[dayZhi];
  }
}
