/**
 * 三傳計算器
 * 
 * 三傳是大六壬的核心，由四課通過九宗門推演：
 * 
 * 九宗門（取初傳的方法）：
 * 1. 賊尅：有一個下賊上或上尅下，取之為初傳
 * 2. 比用：有多個賊尅，取與日干陰陽相同者
 * 3. 涉害：比用不能決，看涉害深淺
 * 4. 遙尅：四課無賊尅，看遙尅
 * 5. 昴星：無賊尅無遙尅，陽日取酉上神，陰日取從魁（酉）
 * 6. 別責：昴星不能用，陽日取日干合神，陰日取日支三合
 * 7. 八專：日干支同位，特殊處理
 * 8. 伏吟：月將與時辰相同
 * 9. 返吟：天地盤對沖
 * 
 * 中傳、末傳：初傳的天盤地支為中傳，中傳的天盤地支為末傳
 * 
 * 特殊情況：
 * - 返吟八專（絕嗣）：日干支同位 + 四課全是下賊上
 */

import type { DiZhi, TianGan, TianJiangShort, SiKeInfo, SanChuan, ChuanInfo, TianDiPan, GeJu, GeJuDetail } from '../types';
import { SiKeCalculator } from './SiKeCalculator';
import {
  DI_ZHI,
  TIAN_GAN,
  GAN_WUXING,
  ZHI_WUXING,
  LIUQIN_MAP,
  WUXING_RELATION,
  JIA_ZI_60,
  XUN_KONG,
  ZHI_CHONG,
  GAN_JI_GONG,
  BA_ZHUAN_DAYS,
  GAN_ZHI_SAME_POSITION,
} from '../data/constants';

export class SanChuanCalculator {
  /**
   * 計算三傳
   */
  static calculate(
    siKe: SiKeInfo,
    tianDiPan: TianDiPan,
    dayGanZhi: string,
    hourZhi: DiZhi
  ): SanChuan {
    const { diToTian, diToJiang, yueJiang } = tianDiPan;
    const dayGan = dayGanZhi[0] as TianGan;
    const dayZhi = dayGanZhi[1] as DiZhi;
    
    // 分析四課關係
    const stats = SiKeCalculator.analyzeRelations(siKe);
    
    // 判斷特殊情況
    const isFuYin = yueJiang === hourZhi;  // 伏吟
    const isFanYin = this.checkFanYin(tianDiPan);  // 返吟
    const isBaZhuan = BA_ZHUAN_DAYS.includes(dayGanZhi);  // 八專
    const isGanZhiSamePos = GAN_ZHI_SAME_POSITION.includes(dayGanZhi);
    
    // 確定初傳和格局
    let chuChuanZhi: DiZhi;
    let geJu: GeJu;
    let geJuDetail: GeJuDetail;
    
    // 特殊情況：返吟八專（絕嗣）
    // 日干支同位 + 四課全是下賊上 -> 返吟·絕嗣
    const isFanYinBaZhuan = isGanZhiSamePos && stats.xiaZeiShang === 4;
    
    // 九宗門判斷
    if (isFanYin || isFanYinBaZhuan) {
      // 返吟課（包括返吟八專）
      const result = this.handleFanYin(siKe, tianDiPan, dayGan, dayZhi, stats, isFanYinBaZhuan);
      chuChuanZhi = result.chuChuan;
      geJu = '返吟';
      geJuDetail = result.detail;
    } else if (isFuYin) {
      // 伏吟課
      const result = this.handleFuYin(siKe, tianDiPan, dayGan, dayZhi, stats);
      chuChuanZhi = result.chuChuan;
      geJu = '伏吟';
      geJuDetail = result.detail;
    } else if (isBaZhuan && stats.shangKeXia === 0 && stats.xiaZeiShang === 0) {
      // 八專課
      const result = this.handleBaZhuan(siKe, tianDiPan, dayGan, dayZhi);
      chuChuanZhi = result.chuChuan;
      geJu = '八專';
      geJuDetail = result.detail;
    } else if (stats.xiaZeiShang === 1 && stats.shangKeXia === 0) {
      // 賊尅（重審）：只有一個下賊上
      const ke = siKe.list.find(k => k.relation === '下賊上')!;
      chuChuanZhi = ke.shangShen;
      geJu = '賊尅';
      geJuDetail = '重審';
    } else if (stats.shangKeXia === 1 && stats.xiaZeiShang === 0) {
      // 賊尅（元首）：只有一個上尅下
      const ke = siKe.list.find(k => k.relation === '上尅下')!;
      chuChuanZhi = ke.shangShen;
      geJu = '賊尅';
      geJuDetail = '元首';
    } else if (stats.xiaZeiShang >= 1) {
      // 有下賊上，優先取下賊上
      const result = this.handleMultipleZeiKe(siKe, tianDiPan, dayGan, dayZhi, '下賊上');
      chuChuanZhi = result.chuChuan;
      geJu = result.geJu;
      geJuDetail = result.detail;
    } else if (stats.shangKeXia >= 2) {
      // 多個上尅下
      const result = this.handleMultipleZeiKe(siKe, tianDiPan, dayGan, dayZhi, '上尅下');
      chuChuanZhi = result.chuChuan;
      geJu = result.geJu;
      geJuDetail = result.detail;
    } else if (stats.shangKeXia === 0 && stats.xiaZeiShang === 0) {
      // 無賊尅，嘗試遙尅、昴星、別責
      const result = this.handleNoZeiKe(siKe, tianDiPan, dayGan, dayZhi);
      chuChuanZhi = result.chuChuan;
      geJu = result.geJu;
      geJuDetail = result.detail;
    } else {
      // 默認取第一課上神
      chuChuanZhi = siKe.list[0].shangShen;
      geJu = '賊尅';
      geJuDetail = '元首';
    }
    
    // 計算中傳、末傳
    let zhongChuanZhi: DiZhi;
    let moChuanZhi: DiZhi;
    
    if (isFanYin) {
      // 返吟課：中傳以初沖，末傳用中沖
      zhongChuanZhi = ZHI_CHONG[chuChuanZhi];
      moChuanZhi = ZHI_CHONG[zhongChuanZhi];
    } else {
      // 普通課：用天盤推演
      zhongChuanZhi = diToTian[chuChuanZhi];
      moChuanZhi = diToTian[zhongChuanZhi];
    }
    
    // 構建三傳信息
    const chuChuan = this.buildChuanInfo('初傳', chuChuanZhi, diToJiang, dayGan, dayGanZhi);
    const zhongChuan = this.buildChuanInfo('中傳', zhongChuanZhi, diToJiang, dayGan, dayGanZhi);
    const moChuan = this.buildChuanInfo('末傳', moChuanZhi, diToJiang, dayGan, dayGanZhi);
    
    return {
      chuChuan,
      zhongChuan,
      moChuan,
      geJu,
      geJuDetail,
    };
  }
  
  /**
   * 構建傳信息
   */
  private static buildChuanInfo(
    position: '初傳' | '中傳' | '末傳',
    diZhi: DiZhi,
    diToJiang: Record<DiZhi, TianJiangShort>,
    dayGan: TianGan,
    dayGanZhi: string
  ): ChuanInfo {
    // 計算六親
    const dayWuXing = GAN_WUXING[dayGan];
    const chuanWuXing = ZHI_WUXING[diZhi];
    const relationKey = dayWuXing + chuanWuXing;
    const relation = WUXING_RELATION[relationKey] || '比和';
    const liuQin = LIUQIN_MAP[relation] || '兄弟';
    
    // 計算旬空
    const xunKong = this.getXunKong(dayGanZhi, diZhi);
    
    return {
      position,
      diZhi,
      tianJiang: diToJiang[diZhi],
      liuQin,
      xunKong,
    };
  }
  
  /**
   * 獲取旬空
   */
  private static getXunKong(dayGanZhi: string, diZhi: DiZhi): string | null {
    // 找到日干支所在的旬
    const dayIndex = JIA_ZI_60.indexOf(dayGanZhi);
    const xunStart = Math.floor(dayIndex / 10) * 10;
    const xunHead = JIA_ZI_60[xunStart];
    
    const kongPair = XUN_KONG[xunHead];
    if (kongPair && kongPair.includes(diZhi)) {
      return TIAN_GAN[DI_ZHI.indexOf(diZhi) % 10] || diZhi;
    }
    return null;
  }
  
  /**
   * 檢查是否返吟
   */
  private static checkFanYin(tianDiPan: TianDiPan): boolean {
    // 天地盤對沖：每個地支上的天盤地支都是其對沖
    let chongCount = 0;
    for (let i = 0; i < 12; i++) {
      const diZhi = DI_ZHI[i];
      const tianZhi = tianDiPan.diToTian[diZhi];
      if (ZHI_CHONG[diZhi] === tianZhi) {
        chongCount++;
      }
    }
    return chongCount >= 6;  // 至少一半對沖
  }
  
  /**
   * 處理多個賊尅
   */
  private static handleMultipleZeiKe(
    siKe: SiKeInfo,
    tianDiPan: TianDiPan,
    dayGan: TianGan,
    dayZhi: DiZhi,
    targetRelation: '下賊上' | '上尅下'
  ): { chuChuan: DiZhi; geJu: GeJu; detail: GeJuDetail } {
    const matchingKe = siKe.list.filter(k => k.relation === targetRelation);
    
    if (matchingKe.length === 1) {
      return {
        chuChuan: matchingKe[0].shangShen,
        geJu: '賊尅',
        detail: targetRelation === '下賊上' ? '重審' : '元首',
      };
    }
    
    // 比用：取與日干陰陽相同者
    const dayGanYinYang = this.getYinYang(dayGan);
    const sameYinYangKe = matchingKe.filter(k => 
      this.getYinYang(k.shangShen) === dayGanYinYang
    );
    
    if (sameYinYangKe.length === 1) {
      return {
        chuChuan: sameYinYangKe[0].shangShen,
        geJu: '比用',
        detail: '知一',
      };
    }
    
    // 涉害：看涉害深淺
    // 從上神的地盤位置數到上神本身，計算經過的尅數
    const candidates = sameYinYangKe.length > 0 ? sameYinYangKe : matchingKe;
    const sheHaiResults = candidates.map(ke => {
      const depth = this.calculateSheHaiDepth(ke.shangShen, ke.xiaShen as DiZhi, tianDiPan);
      return { ke, depth };
    });
    
    // 取涉害最深者
    sheHaiResults.sort((a, b) => b.depth - a.depth);
    
    // 確定細分格局
    let detail: GeJuDetail = '涉害';
    if (sheHaiResults.length >= 2 && sheHaiResults[0].depth === sheHaiResults[1].depth) {
      // 涉害相同，取先見者（課序靠前）
      detail = '察微';
    } else {
      detail = '見機';
    }
    
    return {
      chuChuan: sheHaiResults[0].ke.shangShen,
      geJu: '涉害',
      detail,
    };
  }
  
  /**
   * 計算涉害深度
   * 從上神的地盤位置開始，逆數到上神本身，計算經過的尅數
   * 
   * 涉害深淺算法：
   * 1. 找到上神在地盤的位置（即上神本身的地支）
   * 2. 從該位置逆時針數到上神，計算途中被上神所尅的地支數量
   */
  private static calculateSheHaiDepth(
    shangShen: DiZhi,
    xiaShen: DiZhi,
    tianDiPan: TianDiPan
  ): number {
    // 上神的五行
    const shangWuXing = ZHI_WUXING[shangShen];
    
    // 從上神的地盤位置（即上神本身）開始，逆數到上神在天盤的位置
    // 實際上是從 xiaShen（下神，即上神所臨的地盤位置）逆數到 shangShen
    const startIndex = DI_ZHI.indexOf(xiaShen);
    const endIndex = DI_ZHI.indexOf(shangShen);
    
    let count = 0;
    let currentIndex = startIndex;
    
    // 逆時針數（從地盤位置數到上神）
    while (currentIndex !== endIndex) {
      const currentZhi = DI_ZHI[currentIndex];
      const currentWuXing = ZHI_WUXING[currentZhi];
      
      // 檢查上神是否尅當前地支
      const relationKey = shangWuXing + currentWuXing;
      if (WUXING_RELATION[relationKey] === '尅') {
        count++;
      }
      
      // 逆時針移動
      currentIndex = (currentIndex - 1 + 12) % 12;
    }
    
    return count;
  }
  
  /**
   * 處理無賊尅情況
   */
  private static handleNoZeiKe(
    siKe: SiKeInfo,
    tianDiPan: TianDiPan,
    dayGan: TianGan,
    dayZhi: DiZhi
  ): { chuChuan: DiZhi; geJu: GeJu; detail: GeJuDetail } {
    const dayGanYinYang = this.getYinYang(dayGan);
    
    // 遙尅：四課上神與日干有尅的關係
    const dayWuXing = GAN_WUXING[dayGan];
    for (const ke of siKe.list) {
      const keWuXing = ZHI_WUXING[ke.shangShen];
      const relation = WUXING_RELATION[keWuXing + dayWuXing];
      if (relation === '尅') {
        return {
          chuChuan: ke.shangShen,
          geJu: '遙尅',
          detail: '蒿矢',
        };
      }
      if (relation === '被尅') {
        return {
          chuChuan: ke.shangShen,
          geJu: '遙尅',
          detail: '彈射',
        };
      }
    }
    
    // 昴星：陽日取酉上神，陰日取從魁
    if (dayGanYinYang === '陽') {
      return {
        chuChuan: tianDiPan.diToTian['酉'],
        geJu: '昴星',
        detail: '虎視',
      };
    } else {
      return {
        chuChuan: tianDiPan.diToTian['酉'],
        geJu: '昴星',
        detail: '冬蛇掩目',
      };
    }
  }
  
  /**
   * 處理返吟
   * 
   * 返吟課取三傳規則：
   * 1. 有賊尅用賊尅，中傳以初沖，末傳用中沖
   * 2. 無賊尅，取驛馬為初傳，支上神為中傳，干上神為末傳
   * 
   * 返吟八專（絕嗣）：
   * - 日干支同位 + 四課全是下賊上
   * - 取驛馬為初傳
   */
  private static handleFanYin(
    siKe: SiKeInfo,
    tianDiPan: TianDiPan,
    dayGan: TianGan,
    dayZhi: DiZhi,
    stats: ReturnType<typeof SiKeCalculator.analyzeRelations>,
    isFanYinBaZhuan: boolean = false
  ): { chuChuan: DiZhi; detail: GeJuDetail } {
    // 返吟八專（絕嗣）：直接取驛馬
    if (isFanYinBaZhuan) {
      const yiMa = this.getYiMa(dayZhi);
      return {
        chuChuan: yiMa,
        detail: '絕嗣',
      };
    }
    
    // 有賊尅（下賊上）用賊尅
    if (stats.xiaZeiShang > 0) {
      const matchingKe = siKe.list.filter(k => k.relation === '下賊上');
      if (matchingKe.length === 1) {
        return {
          chuChuan: matchingKe[0].shangShen,
          detail: '無依',
        };
      }
      // 多個下賊上，取與日干陰陽相同者
      const dayGanYinYang = this.getYinYang(dayGan);
      const sameYinYangKe = matchingKe.filter(k => 
        this.getYinYang(k.shangShen) === dayGanYinYang
      );
      if (sameYinYangKe.length >= 1) {
        return {
          chuChuan: sameYinYangKe[0].shangShen,
          detail: '無依',
        };
      }
      return {
        chuChuan: matchingKe[0].shangShen,
        detail: '無依',
      };
    }
    
    // 有上尅下用上尅下
    if (stats.shangKeXia > 0) {
      const matchingKe = siKe.list.filter(k => k.relation === '上尅下');
      if (matchingKe.length === 1) {
        return {
          chuChuan: matchingKe[0].shangShen,
          detail: '無依',
        };
      }
      // 多個上尅下，取與日干陰陽相同者
      const dayGanYinYang = this.getYinYang(dayGan);
      const sameYinYangKe = matchingKe.filter(k => 
        this.getYinYang(k.shangShen) === dayGanYinYang
      );
      if (sameYinYangKe.length >= 1) {
        return {
          chuChuan: sameYinYangKe[0].shangShen,
          detail: '無依',
        };
      }
      return {
        chuChuan: matchingKe[0].shangShen,
        detail: '無依',
      };
    }
    
    // 無賊尅，取驛馬為初傳
    // 驛馬：寅午戌馬在申，申子辰馬在寅，巳酉丑馬在亥，亥卯未馬在巳
    const yiMa = this.getYiMa(dayZhi);
    return {
      chuChuan: yiMa,
      detail: '無親',
    };
  }
  
  /**
   * 獲取驛馬
   * 寅午戌馬在申，申子辰馬在寅，巳酉丑馬在亥，亥卯未馬在巳
   */
  private static getYiMa(dayZhi: DiZhi): DiZhi {
    const yiMaMap: Record<DiZhi, DiZhi> = {
      '寅': '申', '午': '申', '戌': '申',
      '申': '寅', '子': '寅', '辰': '寅',
      '巳': '亥', '酉': '亥', '丑': '亥',
      '亥': '巳', '卯': '巳', '未': '巳',
    };
    return yiMaMap[dayZhi];
  }
  
  /**
   * 處理伏吟
   */
  private static handleFuYin(
    siKe: SiKeInfo,
    tianDiPan: TianDiPan,
    dayGan: TianGan,
    dayZhi: DiZhi,
    stats: ReturnType<typeof SiKeCalculator.analyzeRelations>
  ): { chuChuan: DiZhi; detail: GeJuDetail } {
    const dayGanYinYang = this.getYinYang(dayGan);
    const dayGanJiGong = GAN_JI_GONG[dayGan];
    
    // 伏吟課：陽日取日干寄宮刑神，陰日取日支刑神
    if (dayGanYinYang === '陽') {
      return {
        chuChuan: dayGanJiGong,
        detail: '自任',
      };
    } else {
      return {
        chuChuan: dayZhi,
        detail: '杜傳',
      };
    }
  }
  
  /**
   * 處理八專
   */
  private static handleBaZhuan(
    siKe: SiKeInfo,
    tianDiPan: TianDiPan,
    dayGan: TianGan,
    dayZhi: DiZhi
  ): { chuChuan: DiZhi; detail: GeJuDetail } {
    const dayGanYinYang = this.getYinYang(dayGan);
    
    // 八專課：陽日順數兩位，陰日逆數兩位
    const dayZhiIndex = DI_ZHI.indexOf(dayZhi);
    let targetIndex: number;
    
    if (dayGanYinYang === '陽') {
      targetIndex = (dayZhiIndex + 2) % 12;
    } else {
      targetIndex = (dayZhiIndex - 2 + 12) % 12;
    }
    
    return {
      chuChuan: DI_ZHI[targetIndex],
      detail: '帷簿',
    };
  }
  
  /**
   * 獲取陰陽
   */
  private static getYinYang(ganOrZhi: string): '陽' | '陰' {
    const yangGan = ['甲', '丙', '戊', '庚', '壬'];
    const yangZhi = ['子', '寅', '辰', '午', '申', '戌'];
    
    if (yangGan.includes(ganOrZhi) || yangZhi.includes(ganOrZhi)) {
      return '陽';
    }
    return '陰';
  }
}
