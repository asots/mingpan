/**
 * 用神规则配置
 *
 * 定义不同事类的用神选取规则
 * 参考《神奇之门》、《奇门遁甲实践指南》等经典著作
 */

import type { ShiLei, YongShenType, BaMen, BaShen, JiuXing, TianGan, WuXing } from '../types';

// ============= 类型定义 =============

/** 用神规则项 */
export interface YongShenRule {
  /** 用神类型 */
  type: YongShenType;
  /** 用神名称（标准名称） */
  name: string;
  /** 备注说明 */
  note?: string;
}

/** 事类用神配置 */
export interface ShiLeiYongShenConfig {
  /** 主用神列表（核心用神） */
  zhuyong: YongShenRule[];
  /** 辅用神列表（参考用神） */
  fuyong: YongShenRule[];
  /** 是否涉及双方（需要主客分析） */
  needZhuKe: boolean;
  /** 简要说明 */
  description: string;
}

// ============= 用神规则映射 =============

/**
 * 事类用神规则表
 *
 * 每个事类定义：
 * - zhuyong: 主用神，断卦核心
 * - fuyong: 辅用神，参考分析
 * - needZhuKe: 是否需要主客分析（涉及双方的事类）
 */
export const YONGSHEN_RULES: Record<ShiLei, ShiLeiYongShenConfig> = {
  求财: {
    zhuyong: [
      { type: '门', name: '生门', note: '生门主财源生发' },
      { type: '仪', name: '戊', note: '戊为财星，甲遁之首' },
    ],
    fuyong: [
      { type: '门', name: '开门', note: '开门主通达' },
      { type: '奇', name: '日干', note: '日干代表求测者' },
    ],
    needZhuKe: false,
    description: '求财以生门、戊为主用神，开门为辅',
  },

  婚姻: {
    zhuyong: [
      { type: '神', name: '六合', note: '六合主和合婚配' },
      { type: '奇', name: '乙', note: '乙奇为日奇，主阴柔美丽' },
    ],
    fuyong: [
      { type: '门', name: '开门', note: '开门主婚事开成' },
      { type: '神', name: '天后', note: '天后主女性、婚配' },
    ],
    needZhuKe: true,
    description: '婚姻以六合、乙奇为主，日干（我方）、时干（对方）主客分析',
  },

  疾病: {
    zhuyong: [
      { type: '星', name: '天芮', note: '天芮为病符星' },
      { type: '门', name: '死门', note: '死门主病势' },
    ],
    fuyong: [
      { type: '奇', name: '日干', note: '日干代表求医者' },
      { type: '奇', name: '时干', note: '时干代表病人' },
    ],
    needZhuKe: true,
    description: '疾病以天芮、死门看病情，日干（求医者）、时干（病人）',
  },

  出行: {
    zhuyong: [
      { type: '奇', name: '日干', note: '日干代表出行者' },
      { type: '门', name: '开门', note: '开门主通达顺利' },
    ],
    fuyong: [
      { type: '奇', name: '马星', note: '马星主迁动出行' },
      { type: '星', name: '天冲', note: '天冲主动，利出行' },
    ],
    needZhuKe: false,
    description: '出行以日干、开门为主，马星临宫为吉',
  },

  诉讼: {
    zhuyong: [
      { type: '门', name: '开门', note: '开门主官司开解' },
      { type: '仪', name: '庚', note: '庚为仇敌、对手' },
    ],
    fuyong: [
      { type: '门', name: '惊门', note: '惊门主惊恐官非' },
      { type: '奇', name: '日干', note: '日干代表我方' },
    ],
    needZhuKe: true,
    description: '诉讼以开门断胜负，庚看对手，日干（我）、时干（对方）',
  },

  考试: {
    zhuyong: [
      { type: '奇', name: '丁', note: '丁奇为玉女，主文书考试' },
      { type: '门', name: '景门', note: '景门主文章光彩' },
    ],
    fuyong: [
      { type: '星', name: '天辅', note: '天辅主文化学业' },
      { type: '奇', name: '日干', note: '日干代表考生' },
    ],
    needZhuKe: false,
    description: '考试以丁奇、景门为主，天辅利文',
  },

  工作: {
    zhuyong: [
      { type: '门', name: '开门', note: '开门主事业开创' },
      { type: '奇', name: '日干', note: '日干代表求职者' },
    ],
    fuyong: [
      { type: '门', name: '生门', note: '生门主生发' },
      { type: '神', name: '值符', note: '值符代表领导贵人' },
    ],
    needZhuKe: false,
    description: '工作以开门、日干为主，值符看领导',
  },

  失物: {
    zhuyong: [
      { type: '神', name: '玄武', note: '玄武主盗贼失物' },
      { type: '奇', name: '时干', note: '时干代表失物或盗贼' },
    ],
    fuyong: [
      { type: '仪', name: '六仪', note: '六仪据失物类型定' },
      { type: '门', name: '杜门', note: '杜门主藏匿' },
    ],
    needZhuKe: false,
    description: '失物以玄武、时干为主，看物品方位',
  },

  置业: {
    zhuyong: [
      { type: '门', name: '生门', note: '生门主不动产' },
      { type: '仪', name: '戊', note: '戊为土地财产' },
    ],
    fuyong: [
      { type: '仪', name: '天盘戊', note: '天盘戊看交易' },
      { type: '奇', name: '日干', note: '日干代表买方' },
    ],
    needZhuKe: true,
    description: '置业以生门、戊为主，日干（买方）、时干（卖方）',
  },

  求官: {
    zhuyong: [
      { type: '门', name: '开门', note: '开门主官位' },
      { type: '神', name: '值符', note: '值符代表上级领导' },
    ],
    fuyong: [
      { type: '奇', name: '日干', note: '日干代表求官者' },
      { type: '门', name: '景门', note: '景门主名声' },
    ],
    needZhuKe: false,
    description: '求官以开门、值符为主，看与日干关系',
  },

  孕产: {
    zhuyong: [
      { type: '星', name: '天芮', note: '天芮主生育' },
      { type: '神', name: '六合', note: '六合主生育和合' },
    ],
    fuyong: [
      { type: '奇', name: '日干', note: '日干代表孕妇或求子者' },
      { type: '神', name: '天后', note: '天后主女性生育' },
    ],
    needZhuKe: false,
    description: '孕产以天芮、六合为主，看日干状态',
  },

  寻人: {
    zhuyong: [
      { type: '奇', name: '时干', note: '时干代表被寻者' },
      { type: '奇', name: '日干', note: '日干代表寻人者' },
    ],
    fuyong: [
      { type: '门', name: '开门', note: '开门主能找到' },
      { type: '神', name: '玄武', note: '玄武主逃匿' },
    ],
    needZhuKe: true,
    description: '寻人以时干（被寻者）、日干（寻者）主客分析',
  },

  合作: {
    zhuyong: [
      { type: '奇', name: '日干', note: '日干代表我方' },
      { type: '奇', name: '时干', note: '时干代表对方' },
    ],
    fuyong: [
      { type: '神', name: '六合', note: '六合主合作和谐' },
      { type: '门', name: '开门', note: '开门主合作成功' },
    ],
    needZhuKe: true,
    description: '合作以日干（我）、时干（彼）主客分析为主',
  },

  其他: {
    zhuyong: [
      { type: '奇', name: '日干', note: '日干代表求测者' },
      { type: '奇', name: '时干', note: '时干代表所测之事' },
    ],
    fuyong: [
      { type: '门', name: '开门', note: '开门主通达' },
      { type: '门', name: '生门', note: '生门主生发' },
    ],
    needZhuKe: false,
    description: '其他事类以日干、时干为主，综合分析',
  },
};

// ============= 旺相休囚死规则 =============

/**
 * 五行旺相休囚死对照表
 *
 * 季节（月支）决定五行的旺衰状态
 * - 旺：当令，力量最强
 * - 相：得生，力量次强
 * - 休：生当令者，力量平和
 * - 囚：克当令者，力量衰弱
 * - 死：被当令者克，力量最弱
 */
export const WANGXIANG_TABLE: Record<string, Record<WuXing, '旺' | '相' | '休' | '囚' | '死'>> = {
  // 春季（寅卯月）- 木旺
  寅: { 木: '旺', 火: '相', 土: '死', 金: '囚', 水: '休' },
  卯: { 木: '旺', 火: '相', 土: '死', 金: '囚', 水: '休' },

  // 夏季（巳午月）- 火旺
  巳: { 木: '休', 火: '旺', 土: '相', 金: '死', 水: '囚' },
  午: { 木: '休', 火: '旺', 土: '相', 金: '死', 水: '囚' },

  // 秋季（申酉月）- 金旺
  申: { 木: '死', 火: '囚', 土: '休', 金: '旺', 水: '相' },
  酉: { 木: '死', 火: '囚', 土: '休', 金: '旺', 水: '相' },

  // 冬季（亥子月）- 水旺
  亥: { 木: '相', 火: '死', 土: '囚', 金: '休', 水: '旺' },
  子: { 木: '相', 火: '死', 土: '囚', 金: '休', 水: '旺' },

  // 四季土旺（辰戌丑未月）- 土旺
  辰: { 木: '囚', 火: '休', 土: '旺', 金: '相', 水: '死' },
  戌: { 木: '囚', 火: '休', 土: '旺', 金: '相', 水: '死' },
  丑: { 木: '囚', 火: '休', 土: '旺', 金: '相', 水: '死' },
  未: { 木: '囚', 火: '休', 土: '旺', 金: '相', 水: '死' },
};

// ============= 入墓规则 =============

/**
 * 五行入墓地支对照表
 *
 * 天干五行落入墓库地支，为入墓，主事物受困
 */
export const RUMU_TABLE: Record<WuXing, string> = {
  木: '未', // 木墓在未
  火: '戌', // 火墓在戌
  土: '戌', // 土墓在戌（有说法土墓在辰）
  金: '丑', // 金墓在丑
  水: '辰', // 水墓在辰
};

// ============= 击刑规则 =============

/**
 * 地支相刑对照表
 *
 * 天干落宫地支与日支/时支相刑，为击刑
 */
export const XING_TABLE: Record<string, string[]> = {
  // 三刑
  寅: ['巳', '申'], // 寅巳申三刑（无恩之刑）
  巳: ['寅', '申'],
  申: ['寅', '巳'],
  丑: ['戌', '未'], // 丑戌未三刑（持势之刑）
  戌: ['丑', '未'],
  未: ['丑', '戌'],
  子: ['卯'], // 子卯相刑（无礼之刑）
  卯: ['子'],
  // 自刑
  辰: ['辰'],
  午: ['午'],
  酉: ['酉'],
  亥: ['亥'],
};

// ============= 五行生克关系 =============

/**
 * 五行相生关系
 */
export const WUXING_SHENG: Record<WuXing, WuXing> = {
  木: '火', // 木生火
  火: '土', // 火生土
  土: '金', // 土生金
  金: '水', // 金生水
  水: '木', // 水生木
};

/**
 * 五行相克关系
 */
export const WUXING_KE: Record<WuXing, WuXing> = {
  木: '土', // 木克土
  火: '金', // 火克金
  土: '水', // 土克水
  金: '木', // 金克木
  水: '火', // 水克火
};

/**
 * 天干五行对照表
 */
export const GAN_WUXING: Record<TianGan, WuXing> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

// ============= 八门五行 =============

/**
 * 八门五行对照表
 */
export const MEN_WUXING: Record<BaMen, WuXing> = {
  休: '水', // 休门属水
  生: '土', // 生门属土
  伤: '木', // 伤门属木
  杜: '木', // 杜门属木
  景: '火', // 景门属火
  死: '土', // 死门属土
  惊: '金', // 惊门属金
  开: '金', // 开门属金
};

// ============= 九星五行 =============

/**
 * 九星五行对照表
 */
export const XING_WUXING: Record<JiuXing, WuXing> = {
  蓬: '水', // 天蓬属水
  芮: '土', // 天芮属土
  冲: '木', // 天冲属木
  辅: '木', // 天辅属木
  禽: '土', // 天禽属土
  心: '金', // 天心属金
  柱: '金', // 天柱属金
  任: '土', // 天任属土
  英: '火', // 天英属火
};

// ============= 八神五行 =============

/**
 * 八神五行对照表
 */
export const SHEN_WUXING: Record<BaShen, WuXing> = {
  符: '土', // 值符属土
  蛇: '火', // 腾蛇属火
  阴: '金', // 太阴属金
  合: '木', // 六合属木
  虎: '金', // 白虎属金
  武: '水', // 玄武属水
  地: '土', // 九地属土
  天: '金', // 九天属金
};

// ============= 评分权重 =============

/**
 * 用神评分权重配置
 */
export const YONGSHEN_SCORE_WEIGHTS = {
  /** 旺相休囚死权重 */
  wangXiang: {
    旺: 25,
    相: 20,
    休: 10,
    囚: 5,
    死: 0,
  },

  /** 空亡减分 */
  kongWang: -20,

  /** 入墓减分 */
  ruMu: -15,

  /** 击刑减分 */
  jiXing: -10,

  /** 吉格加分 */
  jiGe: 15,

  /** 凶格减分 */
  xiongGe: -15,

  /** 与日干关系权重 */
  dayRelation: {
    生: 10, // 用神生日干
    克: -10, // 用神克日干
    比: 5, // 同五行
    泄: -5, // 日干生用神
    耗: -8, // 日干克用神
  },
};
