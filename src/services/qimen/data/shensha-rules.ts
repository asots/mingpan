/**
 * 神煞规则配置
 *
 * 定义各类神煞的查表规则和计算方法
 * 参考《协纪辨方书》、《神奇之门》等经典著作
 */

import type { DiZhi, TianGan, GongWei, ShenShaType } from '../types';

// ============= 类型定义 =============

/** 神煞定义 */
export interface ShenShaDef {
  /** 神煞名称 */
  name: string;
  /** 吉凶属性 */
  type: ShenShaType;
  /** 简要说明 */
  description: string;
}

// ============= 天乙贵人 =============

/**
 * 天乙贵人查表
 *
 * 由日干查天乙贵人落宫地支
 * 规则：甲戊庚牛羊（丑未），乙己鼠猴乡（子申），
 *       丙丁猪鸡位（亥酉），壬癸兔蛇藏（卯巳），
 *       六辛逢马虎（午寅）
 */
export const TIANYI_GUIREN: Record<TianGan, [DiZhi, DiZhi]> = {
  甲: ['丑', '未'],
  戊: ['丑', '未'],
  庚: ['丑', '未'],
  乙: ['子', '申'],
  己: ['子', '申'],
  丙: ['亥', '酉'],
  丁: ['亥', '酉'],
  壬: ['卯', '巳'],
  癸: ['卯', '巳'],
  辛: ['午', '寅'],
};

/**
 * 天乙贵人神煞定义
 */
export const TIANYI_DEF: ShenShaDef = {
  name: '天乙贵人',
  type: '吉',
  description: '最尊贵之神，主贵人相助、逢凶化吉',
};

// ============= 驿马 =============

/**
 * 驿马查表
 *
 * 由日支三合局冲位查驿马
 * 寅午戌见申，申子辰见寅，亥卯未见巳，巳酉丑见亥
 */
export const YIMA: Record<DiZhi, DiZhi> = {
  寅: '申',
  午: '申',
  戌: '申',
  申: '寅',
  子: '寅',
  辰: '寅',
  亥: '巳',
  卯: '巳',
  未: '巳',
  巳: '亥',
  酉: '亥',
  丑: '亥',
};

/**
 * 驿马神煞定义
 */
export const YIMA_DEF: ShenShaDef = {
  name: '驿马',
  type: '中性',
  description: '主迁动变化，出行奔波，求财谋事有动象',
};

// ============= 华盖 =============

/**
 * 华盖查表
 *
 * 由年支或日支三合局墓库位查华盖
 * 寅午戌见戌，申子辰见辰，亥卯未见未，巳酉丑见丑
 */
export const HUAGAI: Record<DiZhi, DiZhi> = {
  寅: '戌',
  午: '戌',
  戌: '戌',
  申: '辰',
  子: '辰',
  辰: '辰',
  亥: '未',
  卯: '未',
  未: '未',
  巳: '丑',
  酉: '丑',
  丑: '丑',
};

/**
 * 华盖神煞定义
 */
export const HUAGAI_DEF: ShenShaDef = {
  name: '华盖',
  type: '中性',
  description: '主聪明、艺术、孤高，利宗教修行、艺术创作',
};

// ============= 天德/月德 =============

/**
 * 天德值类型
 *
 * 天德可以是天干或地支（历史上部分月份取地支）
 */
export type TianDeValue = TianGan | DiZhi;

/**
 * 天德查表
 *
 * 由月支查天德
 * 注：卯月见申（地支）、午月见亥（地支）、酉月见寅（地支）、子月见巳（地支）
 */
export const TIANDE: Record<DiZhi, TianDeValue> = {
  寅: '丁',
  卯: '申', // 申为地支
  辰: '壬',
  巳: '辛',
  午: '亥', // 亥为地支
  未: '甲',
  申: '癸',
  酉: '寅', // 寅为地支
  戌: '丙',
  亥: '乙',
  子: '巳', // 巳为地支
  丑: '庚',
};

/**
 * 月德查表
 *
 * 由月支查月德
 */
export const YUEDE: Record<DiZhi, TianGan> = {
  寅: '丙',
  午: '丙',
  戌: '丙',
  申: '壬',
  子: '壬',
  辰: '壬',
  亥: '甲',
  卯: '甲',
  未: '甲',
  巳: '庚',
  酉: '庚',
  丑: '庚',
};

/**
 * 天德神煞定义
 */
export const TIANDE_DEF: ShenShaDef = {
  name: '天德',
  type: '吉',
  description: '化凶为吉，主有天助，逢难呈祥',
};

/**
 * 月德神煞定义
 */
export const YUEDE_DEF: ShenShaDef = {
  name: '月德',
  type: '吉',
  description: '化凶为吉，主有贵人暗助',
};

// ============= 禄神 =============

/**
 * 禄神查表
 *
 * 由日干查禄神落宫地支
 * 甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，
 * 庚禄在申，辛禄在酉，壬禄在亥，癸禄在子
 */
export const LUSHEN: Record<TianGan, DiZhi> = {
  甲: '寅',
  乙: '卯',
  丙: '巳',
  丁: '午',
  戊: '巳',
  己: '午',
  庚: '申',
  辛: '酉',
  壬: '亥',
  癸: '子',
};

/**
 * 禄神神煞定义
 */
export const LUSHEN_DEF: ShenShaDef = {
  name: '禄神',
  type: '吉',
  description: '主财禄、俸禄，利求财求官',
};

// ============= 桃花（咸池） =============

/**
 * 桃花（咸池）查表
 *
 * 由日支三合局首位之冲位查桃花
 * 寅午戌见卯，申子辰见酉，亥卯未见子，巳酉丑见午
 */
export const TAOHUA: Record<DiZhi, DiZhi> = {
  寅: '卯',
  午: '卯',
  戌: '卯',
  申: '酉',
  子: '酉',
  辰: '酉',
  亥: '子',
  卯: '子',
  未: '子',
  巳: '午',
  酉: '午',
  丑: '午',
};

/**
 * 桃花神煞定义
 */
export const TAOHUA_DEF: ShenShaDef = {
  name: '桃花',
  type: '中性',
  description: '主姻缘、人缘、桃色，婚恋类事重点参考',
};

// ============= 天医 =============

/**
 * 天医查表
 *
 * 由月支后一位查天医
 * 正月见丑，二月见寅，...依次类推
 */
export const TIANYI_YIZHI: Record<DiZhi, DiZhi> = {
  寅: '丑', // 正月见丑
  卯: '寅', // 二月见寅
  辰: '卯',
  巳: '辰',
  午: '巳',
  未: '午',
  申: '未',
  酉: '申',
  戌: '酉',
  亥: '戌',
  子: '亥',
  丑: '子',
};

/**
 * 天医神煞定义
 */
export const TIANYI_SHEN_DEF: ShenShaDef = {
  name: '天医',
  type: '吉',
  description: '主医药、治疗，疾病类事重点参考',
};

// ============= 太岁 =============

/**
 * 太岁神煞定义
 */
export const TAISUI_DEF: ShenShaDef = {
  name: '太岁',
  type: '中性',
  description: '岁君所在，宜静不宜动，择日参考',
};

// ============= 羊刃 =============

/**
 * 羊刃查表
 *
 * 由日干阳刃位查羊刃
 * 甲刃在卯，乙刃在寅（或不取），丙戊刃在午，丁己刃在巳（或不取），
 * 庚刃在酉，辛刃在申（或不取），壬刃在子，癸刃在亥（或不取）
 *
 * 注：阴干是否取羊刃有争议，这里采用阴干不取的主流做法
 */
export const YANGREN: Record<TianGan, DiZhi | null> = {
  甲: '卯',
  乙: null, // 阴干不取
  丙: '午',
  丁: null,
  戊: '午',
  己: null,
  庚: '酉',
  辛: null,
  壬: '子',
  癸: null,
};

/**
 * 羊刃神煞定义
 */
export const YANGREN_DEF: ShenShaDef = {
  name: '羊刃',
  type: '凶',
  description: '主刚烈、冲动，凶煞之一，主意外伤灾',
};

// ============= 马星（整合） =============

/**
 * 日马查表（同驿马）
 */
export const RIMA = YIMA;

/**
 * 日马神煞定义
 */
export const RIMA_DEF: ShenShaDef = {
  name: '日马',
  type: '中性',
  description: '由日支定马星，主当日迁动奔波',
};

/**
 * 丁马神煞定义
 */
export const DINGMA_DEF: ShenShaDef = {
  name: '丁马',
  type: '吉',
  description: '丁奇落宫，主文书信息，利考试文章',
};

// ============= 地支到宫位映射 =============

/**
 * 地支到宫位映射
 */
export const DIZHI_TO_GONG: Record<DiZhi, GongWei> = {
  子: 1, // 坎宫
  丑: 8, // 艮宫
  寅: 8, // 艮宫（寅在东北偏东）
  卯: 3, // 震宫
  辰: 4, // 巽宫（辰在东南偏东）
  巳: 4, // 巽宫
  午: 9, // 离宫
  未: 2, // 坤宫（未在西南偏南）
  申: 2, // 坤宫
  酉: 7, // 兑宫
  戌: 6, // 乾宫（戌在西北偏西）
  亥: 6, // 乾宫
};

// ============= 神煞列表 =============

/**
 * 所有神煞定义列表
 */
export const ALL_SHENSHA_DEFS: ShenShaDef[] = [
  TIANYI_DEF,
  YIMA_DEF,
  HUAGAI_DEF,
  TIANDE_DEF,
  YUEDE_DEF,
  LUSHEN_DEF,
  TAOHUA_DEF,
  TIANYI_SHEN_DEF,
  TAISUI_DEF,
  YANGREN_DEF,
  RIMA_DEF,
  DINGMA_DEF,
];

// ============= 评分权重 =============

/**
 * 神煞评分权重
 */
export const SHENSHA_SCORE_WEIGHTS: Record<string, number> = {
  // 吉神
  '天乙贵人': 15,
  '禄神': 10,
  '天德': 10,
  '月德': 8,
  '天医': 8,
  '丁马': 5,

  // 凶神
  '羊刃': -10,

  // 中性（视情况）
  '驿马': 3,
  '日马': 3,
  '华盖': 0,
  '桃花': 0, // 婚恋类为吉，其他为中性
  '太岁': -5,
};

// ============= 岁破/月破规则 =============

/**
 * 六冲对照表
 *
 * 用于计算岁破、月破
 */
export const LIU_CHONG: Record<DiZhi, DiZhi> = {
  子: '午',
  丑: '未',
  寅: '申',
  卯: '酉',
  辰: '戌',
  巳: '亥',
  午: '子',
  未: '丑',
  申: '寅',
  酉: '卯',
  戌: '辰',
  亥: '巳',
};

/**
 * 检测岁破
 *
 * @param yearZhi 年支（太岁）
 * @param dayZhi 日支
 * @returns 是否为岁破日
 */
export function checkSuiPo(yearZhi: DiZhi, dayZhi: DiZhi): boolean {
  return LIU_CHONG[yearZhi] === dayZhi;
}

/**
 * 检测月破
 *
 * @param monthZhi 月支
 * @param dayZhi 日支
 * @returns 是否为月破日
 */
export function checkYuePo(monthZhi: DiZhi, dayZhi: DiZhi): boolean {
  return LIU_CHONG[monthZhi] === dayZhi;
}
