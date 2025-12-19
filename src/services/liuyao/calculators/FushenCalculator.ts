/**
 * 伏神/飛神計算器
 * 
 * 理論來源：《增刪卜易》第35章「飛伏神章」、《卜筮正宗》
 * 
 * 核心規則：
 * - 用神不現於卦中時，從本宮首卦（八純卦）尋找伏神
 * - 飛神 = 本卦該爻位的納甲地支
 * - 伏神 = 本宮首卦該爻位的納甲地支
 * - 飛伏關係：飛生伏（吉）、飛克伏（凶）、伏生飛（洩）、伏克飛（有力）
 */

import { BaGua, DiZhi, WuXing, LiuQin, FeiShenRelation, FuShenInfo, WangShuaiState } from '../types';
import { NAJIA_TABLE, DIZHI_WUXING, BAGUA_WUXING } from '../data/guagong';
import { LiuqinCalculator } from './LiuqinCalculator';
import { WangshuaiCalculator } from './WangshuaiCalculator';

/** 六親列表 */
const ALL_LIUQIN: LiuQin[] = ['父母', '兄弟', '子孫', '妻財', '官鬼'];

export class FushenCalculator {
  /**
   * 計算伏神列表
   * 
   * @param gongWuXing 卦宮五行（用於計算六親）
   * @param gong 卦宮（用於找本宮首卦）
   * @param presentLiuQin 卦中已出現的六親列表（每爻的六親）
   * @param benGuaNaJia 本卦六爻納甲（作為飛神）
   * @param monthBranch 月建地支（用於旺衰計算）
   * @param dayBranch 日辰地支（用於旺衰計算）
   */
  static calculate(
    gongWuXing: WuXing,
    gong: BaGua,
    presentLiuQin: LiuQin[],
    benGuaNaJia: { diZhi: DiZhi; wuXing: WuXing }[],
    monthBranch?: DiZhi,
    dayBranch?: DiZhi
  ): FuShenInfo[] {
    // 找出卦中缺失的六親
    const presentSet = new Set(presentLiuQin);
    const missingLiuQin = ALL_LIUQIN.filter(lq => !presentSet.has(lq));
    
    if (missingLiuQin.length === 0) {
      return []; // 六親俱全，無伏神
    }
    
    // 獲取本宮首卦（八純卦）的納甲
    const shouGuaNaJia = this.getShouGuaNaJia(gong);
    
    // 計算本宮首卦每爻的六親
    const shouGuaLiuQin = shouGuaNaJia.map(nj => 
      LiuqinCalculator.calculate(gongWuXing, nj.wuXing)
    );
    
    const fuShenList: FuShenInfo[] = [];
    
    for (const missingLq of missingLiuQin) {
      // 在本宮首卦中找到該六親的位置
      const position = shouGuaLiuQin.findIndex(lq => lq === missingLq);
      
      if (position === -1) {
        // 理論上不應該發生，因為八純卦六親必定俱全
        continue;
      }
      
      const fuShenNaJia = shouGuaNaJia[position];
      const feiShenNaJia = benGuaNaJia[position];
      
      // 計算飛伏關係
      const relation = this.calculateRelation(feiShenNaJia.wuXing, fuShenNaJia.wuXing);
      
      const fuShenInfo: FuShenInfo = {
        liuQin: missingLq,
        diZhi: fuShenNaJia.diZhi,
        wuXing: fuShenNaJia.wuXing,
        position: position + 1, // 轉為 1-6
        feiShenDiZhi: feiShenNaJia.diZhi,
        feiShenWuXing: feiShenNaJia.wuXing,
        relation,
      };
      
      // 計算旺衰
      if (monthBranch) {
        fuShenInfo.wangShuaiByMonth = WangshuaiCalculator.calculate(fuShenNaJia.wuXing, monthBranch);
      }
      if (dayBranch) {
        fuShenInfo.wangShuaiByDay = WangshuaiCalculator.calculate(fuShenNaJia.wuXing, dayBranch);
      }
      
      fuShenList.push(fuShenInfo);
    }
    
    return fuShenList;
  }
  
  /**
   * 獲取本宮首卦（八純卦）的納甲
   */
  private static getShouGuaNaJia(gong: BaGua): { diZhi: DiZhi; wuXing: WuXing }[] {
    const naJiaData = NAJIA_TABLE[gong];
    const result: { diZhi: DiZhi; wuXing: WuXing }[] = [];
    
    // 內卦（初爻到三爻）
    for (const dz of naJiaData.inner) {
      result.push({ diZhi: dz, wuXing: DIZHI_WUXING[dz] });
    }
    // 外卦（四爻到上爻）
    for (const dz of naJiaData.outer) {
      result.push({ diZhi: dz, wuXing: DIZHI_WUXING[dz] });
    }
    
    return result;
  }
  
  /**
   * 計算飛伏關係
   * 
   * @param feiWuXing 飛神五行
   * @param fuWuXing 伏神五行
   */
  private static calculateRelation(feiWuXing: WuXing, fuWuXing: WuXing): FeiShenRelation {
    if (feiWuXing === fuWuXing) {
      return '比和';
    }
    
    // 五行生剋關係
    const SHENG: Record<WuXing, WuXing> = {
      '金': '水', '水': '木', '木': '火', '火': '土', '土': '金',
    };
    const KE: Record<WuXing, WuXing> = {
      '金': '木', '木': '土', '土': '水', '水': '火', '火': '金',
    };
    
    if (SHENG[feiWuXing] === fuWuXing) {
      return '飛生伏'; // 飛神生伏神，伏神得生，吉
    }
    if (KE[feiWuXing] === fuWuXing) {
      return '飛克伏'; // 飛神克伏神，伏神受制，凶
    }
    if (SHENG[fuWuXing] === feiWuXing) {
      return '伏生飛'; // 伏神生飛神，伏神洩氣
    }
    if (KE[fuWuXing] === feiWuXing) {
      return '伏克飛'; // 伏神克飛神，伏神有力
    }
    
    // 不應該到這裡
    return '比和';
  }
}
