/**
 * 梅花易數類型定義
 */

/** 八卦名稱 */
export type BaGuaName = '乾' | '兌' | '離' | '震' | '巽' | '坎' | '艮' | '坤';

/** 五行 */
export type WuXing = '金' | '木' | '水' | '火' | '土';

/** 起卦方式 */
export type QiGuaMethod = 'time' | 'number';

/** 梅花易數輸入 */
export interface MeihuaInput {
  /** 起卦方式 */
  method: QiGuaMethod;
  
  // time 模式（公曆輸入，內部轉農曆計算）
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  isLunar?: boolean;
  
  // number 模式
  upperNumber?: number;
  lowerNumber?: number;
  yaoNumber?: number;
}

/** 八卦信息 */
export interface BaGuaInfo {
  name: BaGuaName;
  symbol: string;
  wuXing: WuXing;
  number: number;  // 先天數
}

/** 卦象信息 */
export interface GuaXiang {
  name: string;           // 卦名（如「地水師」）
  upperGua: BaGuaInfo;    // 上卦
  lowerGua: BaGuaInfo;    // 下卦
}

/** 體用關係 */
export type TiYongRelation = '生' | '剋' | '比和' | '洩' | '耗';

/** 體用分析 */
export interface TiYongAnalysis {
  tiGua: 'upper' | 'lower';  // 體卦位置
  yongGua: 'upper' | 'lower'; // 用卦位置
  tiWuXing: WuXing;
  yongWuXing: WuXing;
  relation: TiYongRelation;
  description: string;
}

/** 起卦數據 */
export interface QiGuaData {
  upperNumber: number;
  lowerNumber: number;
  yaoNumber: number;
  upperGuaIndex: number;  // 1-8
  lowerGuaIndex: number;  // 1-8
  movingYao: number;      // 1-6
}

/** 時間起卦詳情 */
export interface TimeQiGuaDetail {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  shiChenIndex: number;     // 時辰地支序數 1-12
  yearZhiIndex: number;     // 年地支序數 1-12（標準梅花口徑）
  sumForUpper: number;
  sumForLower: number;
}

/** 梅花易數結果 */
export interface MeihuaResult {
  /** 起卦方式 */
  method: QiGuaMethod;
  
  /** 起卦數據 */
  qiGuaData: QiGuaData;
  
  /** 時間起卦詳情（僅 time 模式） */
  timeDetail?: TimeQiGuaDetail;
  
  /** 時間信息 */
  timeInfo: {
    solarDate: string;
    lunarDate: string;
    yearGanZhi: string;
  };
  
  /** 本卦 */
  benGua: GuaXiang;
  
  /** 變卦 */
  bianGua: GuaXiang;
  
  /** 互卦 */
  huGua: GuaXiang;
  
  /** 動爻位置（1-6，自下而上） */
  movingYao: number;
  
  /** 體用分析 */
  tiYong: TiYongAnalysis;
}

/** 服務配置 */
export interface MeihuaServiceConfig {
  debug?: boolean;
}
