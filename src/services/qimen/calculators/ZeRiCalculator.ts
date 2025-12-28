/**
 * 择日计算器
 *
 * 负责根据事类筛选吉时，实现奇门择日功能
 */

import type {
  ZeRiInput,
  ZeRiResult,
  ZeRiScore,
  ZeRiGrade,
  DirectionInfo,
  Direction,
  QimenResult,
  ShiLei,
  GongWei,
  DiZhi,
  BaMen,
} from '../types';
import { YongShenCalculator } from './YongShenCalculator';
import { ShenShaCalculator } from './ShenShaCalculator';
import { checkSuiPo, checkYuePo } from '../data/shensha-rules';

// ============= 常量定义 =============

/** 三吉门 */
const SAN_JI_MEN: BaMen[] = ['开', '休', '生'];

/** 宫位到方位映射 */
const GONG_TO_DIRECTION: Record<GongWei, Direction> = {
  1: '北',    // 坎宫
  2: '西南',  // 坤宫
  3: '东',    // 震宫
  4: '东南',  // 巽宫
  5: '中',    // 中宫
  6: '西北',  // 乾宫
  7: '西',    // 兑宫
  8: '东北',  // 艮宫
  9: '南',    // 离宫
};

/** 评分权重 */
const SCORE_WEIGHTS = {
  geJu: 0.35,      // 格局权重
  yongShen: 0.40,  // 用神权重
  shenSha: 0.25,   // 神煞权重
};

/** 评分相关常量 */
const SCORE_CONSTANTS = {
  /** 基础分 */
  BASE_SCORE: 60,
  /** 吉格加分 */
  JI_GE_BONUS: 10,
  /** 凶格扣分 */
  XIONG_GE_PENALTY: 15,
  /** 三吉门得位加分 */
  SAN_JI_MEN_BONUS: 5,
  /** 默认用神分 */
  DEFAULT_YONGSHEN_SCORE: 50,
  /** 神煞基础分 */
  SHENSHA_BASE_SCORE: 50,
  /** 用神状态良好阈值 */
  YONGSHEN_GOOD_THRESHOLD: 70,
  /** 优秀评分阈值 */
  GRADE_EXCELLENT: 80,
  /** 良好评分阈值 */
  GRADE_GOOD: 65,
  /** 中等评分阈值 */
  GRADE_MEDIUM: 50,
};

/** 输出限制常量 */
const OUTPUT_LIMITS = {
  /** 最大亮点数 */
  MAX_HIGHLIGHTS: 5,
  /** 最大警告数 */
  MAX_WARNINGS: 5,
};

/** 最大日期范围（天） */
const MAX_DATE_RANGE_DAYS = 365;

// ============= LRU 缓存实现 =============

interface CacheEntry {
  result: QimenResult;
  timestamp: number;
}

class LRUCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;

  constructor(maxSize: number = 500) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): QimenResult | null {
    const entry = this.cache.get(key);
    if (entry) {
      // 更新访问顺序（移到末尾）
      this.cache.delete(key);
      this.cache.set(key, entry);
      return entry.result;
    }
    return null;
  }

  set(key: string, result: QimenResult): void {
    if (this.cache.size >= this.maxSize) {
      // 删除最老的条目
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// ============= 择日计算器 =============

export class ZeRiCalculator {
  /** 排盘缓存 */
  private static cache = new LRUCache(500);

  /** 排盘函数（由外部注入） */
  private static calculateFn: ((input: {
    year: number;
    month: number;
    day: number;
    hour: number;
    panType?: string;
    zhiRunMethod?: string;
  }) => QimenResult) | null = null;

  /**
   * 注入排盘函数
   *
   * @param fn 排盘函数
   */
  static setCalculateFn(fn: typeof ZeRiCalculator.calculateFn): void {
    this.calculateFn = fn;
  }

  /**
   * 查找吉时
   *
   * @param input 择日输入
   * @returns 择日结果列表
   */
  static findAuspiciousTimes(input: ZeRiInput): ZeRiResult[] {
    if (!this.calculateFn) {
      throw new Error('ZeRiCalculator: calculateFn not set. Call setCalculateFn first.');
    }

    const results: ZeRiResult[] = [];
    const {
      startDate,
      endDate,
      shiLei,
      limit = 10,
      minScore = 60,
      includeDirection = false,
      excludeJieQiDay = false,
      excludeSuiPo = false,
      excludeYuePo = false,
      panType = '时盘',
      zhiRunMethod = 'chaibu',
    } = input;

    // 日期范围验证
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 验证日期有效性
    if (isNaN(current.getTime()) || isNaN(end.getTime())) {
      throw new Error('ZeRiCalculator: Invalid date input');
    }

    // 验证结束日期不早于开始日期
    if (end < current) {
      throw new Error('ZeRiCalculator: endDate must not be earlier than startDate');
    }

    // 验证日期范围不超过最大限制
    const diffDays = Math.ceil((end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > MAX_DATE_RANGE_DAYS) {
      throw new Error(`ZeRiCalculator: Date range exceeds maximum of ${MAX_DATE_RANGE_DAYS} days`);
    }

    while (current <= end) {
      // 遍历12时辰
      for (let hourIdx = 0; hourIdx < 12; hourIdx++) {
        const hour = hourIdx * 2; // 子时=0, 丑时=2, ...

        // 计算排盘
        const qimenResult = this.getCachedResult(
          current.getFullYear(),
          current.getMonth() + 1,
          current.getDate(),
          hour,
          panType,
          zhiRunMethod
        );

        // 应用过滤条件
        if (!this.passFilters(qimenResult, {
          excludeJieQiDay,
          excludeSuiPo,
          excludeYuePo,
        })) {
          continue;
        }

        // 缓存用神分析结果，避免重复计算
        const yongShenInfo = YongShenCalculator.analyze(qimenResult, shiLei);

        // 计算评分
        const scoreResult = this.calculateScoreWithCache(qimenResult, yongShenInfo);

        // 最小评分过滤
        if (scoreResult.totalScore < minScore) {
          continue;
        }

        // 构建结果
        const datetime = new Date(current);
        datetime.setHours(hour, 0, 0, 0);

        const zeRiResult: ZeRiResult = {
          datetime,
          score: scoreResult,
          grade: this.getGrade(scoreResult.totalScore),
          highlights: this.getHighlightsWithCache(qimenResult, yongShenInfo),
          warnings: this.getWarnings(qimenResult),
          qimenResult,
        };

        // 方位信息
        if (includeDirection) {
          zeRiResult.direction = this.calcDirectionInfoWithCache(qimenResult, yongShenInfo);
        }

        results.push(zeRiResult);

        // 早期终止：找到足够多高分结果
        if (results.length >= limit * 2 && results[results.length - 1].score.totalScore >= 80) {
          break;
        }
      }

      // 移动到下一天
      current.setDate(current.getDate() + 1);
    }

    // 排序（按评分降序）
    results.sort((a, b) => b.score.totalScore - a.score.totalScore);

    // 限制返回数量
    return results.slice(0, limit);
  }

  /**
   * 获取缓存的排盘结果
   */
  private static getCachedResult(
    year: number,
    month: number,
    day: number,
    hour: number,
    panType: string,
    zhiRunMethod: string
  ): QimenResult {
    const key = `${year}-${month}-${day}-${hour}-${panType}-${zhiRunMethod}`;
    let result = this.cache.get(key);

    if (!result) {
      result = this.calculateFn!({
        year,
        month,
        day,
        hour,
        panType,
        zhiRunMethod,
      });
      this.cache.set(key, result);
    }

    return result;
  }

  /**
   * 应用过滤条件
   */
  private static passFilters(
    result: QimenResult,
    filters: {
      excludeJieQiDay: boolean;
      excludeSuiPo: boolean;
      excludeYuePo: boolean;
    }
  ): boolean {
    const siZhu = result.timeInfo.siZhu;
    const yearZhi = siZhu.yearGanZhi.charAt(1) as DiZhi;
    const monthZhi = siZhu.monthGanZhi.charAt(1) as DiZhi;
    const dayZhi = siZhu.dayZhi;

    // 节气交接日过滤
    if (filters.excludeJieQiDay) {
      // 简化判断：检查是否在节气当天（需要更精确实现）
      // 这里暂时跳过，因为需要节气精确时间
    }

    // 岁破过滤
    if (filters.excludeSuiPo && checkSuiPo(yearZhi, dayZhi)) {
      return false;
    }

    // 月破过滤
    if (filters.excludeYuePo && checkYuePo(monthZhi, dayZhi)) {
      return false;
    }

    return true;
  }

  /**
   * 计算评分（使用缓存的用神信息）
   */
  private static calculateScoreWithCache(
    result: QimenResult,
    yongShenInfo: ReturnType<typeof YongShenCalculator.analyze>
  ): ZeRiScore {
    // 格局评分
    const geJuScore = this.calcGeJuScore(result);

    // 用神评分（使用缓存）
    const yongShenScore = this.calcYongShenScoreFromInfo(yongShenInfo);

    // 神煞评分
    const shenShaScore = this.calcShenShaScore(result);

    // 综合评分
    const totalScore = Math.round(
      geJuScore * SCORE_WEIGHTS.geJu +
      yongShenScore * SCORE_WEIGHTS.yongShen +
      shenShaScore * SCORE_WEIGHTS.shenSha
    );

    // 生成推荐理由
    const recommendation = this.generateRecommendation(result, yongShenInfo.shiLei, totalScore);

    return {
      totalScore: Math.max(0, Math.min(100, totalScore)),
      geJuScore,
      yongShenScore,
      shenShaScore,
      recommendation,
    };
  }

  /**
   * 格局评分
   */
  private static calcGeJuScore(result: QimenResult): number {
    let score = SCORE_CONSTANTS.BASE_SCORE;

    for (const geJu of result.geJu) {
      if (geJu.type === '吉格') {
        score += SCORE_CONSTANTS.JI_GE_BONUS;
      } else if (geJu.type === '凶格') {
        score -= SCORE_CONSTANTS.XIONG_GE_PENALTY;
      }
    }

    // 检查三吉门是否当令
    for (const men of SAN_JI_MEN) {
      for (const gong of [1, 2, 3, 4, 6, 7, 8, 9] as GongWei[]) {
        if (result.gongs[gong].men === men && !result.gongs[gong].isKong) {
          score += SCORE_CONSTANTS.SAN_JI_MEN_BONUS;
          break;
        }
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 用神评分（使用缓存的用神信息）
   */
  private static calcYongShenScoreFromInfo(yongShenInfo: ReturnType<typeof YongShenCalculator.analyze>): number {
    if (yongShenInfo.analysis.length === 0) {
      return SCORE_CONSTANTS.DEFAULT_YONGSHEN_SCORE;
    }

    // 计算所有用神的平均分
    const avgScore = yongShenInfo.analysis.reduce(
      (sum, a) => sum + a.score,
      0
    ) / yongShenInfo.analysis.length;

    return Math.round(avgScore);
  }

  /**
   * 神煞评分
   */
  private static calcShenShaScore(result: QimenResult): number {
    const shenShaList = ShenShaCalculator.calculateAll(result);
    const shenShaScore = ShenShaCalculator.calcTotalScore(shenShaList);

    return Math.max(0, Math.min(100, SCORE_CONSTANTS.SHENSHA_BASE_SCORE + shenShaScore));
  }

  /**
   * 获取评级
   */
  private static getGrade(score: number): ZeRiGrade {
    if (score >= SCORE_CONSTANTS.GRADE_EXCELLENT) return '优';
    if (score >= SCORE_CONSTANTS.GRADE_GOOD) return '良';
    if (score >= SCORE_CONSTANTS.GRADE_MEDIUM) return '中';
    return '差';
  }

  /**
   * 获取有利因素（使用缓存的用神信息）
   */
  private static getHighlightsWithCache(
    result: QimenResult,
    yongShenInfo: ReturnType<typeof YongShenCalculator.analyze>
  ): string[] {
    const highlights: string[] = [];

    // 吉格
    for (const geJu of result.geJu) {
      if (geJu.type === '吉格') {
        highlights.push(`${geJu.name}`);
      }
    }

    // 三吉门不空
    for (const men of SAN_JI_MEN) {
      for (const gong of [1, 2, 3, 4, 6, 7, 8, 9] as GongWei[]) {
        if (result.gongs[gong].men === men && !result.gongs[gong].isKong) {
          highlights.push(`${men}门得位`);
          break;
        }
      }
    }

    // 用神状态好（使用缓存）
    for (const analysis of yongShenInfo.analysis) {
      if (analysis.score >= SCORE_CONSTANTS.YONGSHEN_GOOD_THRESHOLD && !analysis.isKong && !analysis.isRuMu) {
        highlights.push(`${analysis.yongshen}状态佳`);
      }
    }

    // 马星临宫
    for (const gong of [1, 2, 3, 4, 6, 7, 8, 9] as GongWei[]) {
      if (result.gongs[gong].isMa && !result.gongs[gong].isKong) {
        highlights.push('马星临宫');
        break;
      }
    }

    return highlights.slice(0, OUTPUT_LIMITS.MAX_HIGHLIGHTS);
  }

  /**
   * 获取注意事项
   */
  private static getWarnings(result: QimenResult): string[] {
    const warnings: string[] = [];

    // 凶格
    for (const geJu of result.geJu) {
      if (geJu.type === '凶格') {
        warnings.push(`${geJu.name}`);
      }
    }

    // 日干空亡
    if (result.gongs[result.dayGanGong].isKong) {
      warnings.push('日干落空');
    }

    // 时干空亡
    if (result.gongs[result.hourGanGong].isKong) {
      warnings.push('时干落空');
    }

    return warnings.slice(0, OUTPUT_LIMITS.MAX_WARNINGS);
  }

  /**
   * 生成推荐理由
   */
  private static generateRecommendation(
    _result: QimenResult,
    shiLei: ShiLei,
    score: number
  ): string {
    if (score >= SCORE_CONSTANTS.GRADE_EXCELLENT) {
      return `此时${shiLei}大吉，格局上佳，用神得位`;
    } else if (score >= SCORE_CONSTANTS.GRADE_GOOD) {
      return `此时${shiLei}较宜，整体格局良好`;
    } else if (score >= SCORE_CONSTANTS.GRADE_MEDIUM) {
      return `此时${shiLei}中平，可酌情选用`;
    } else {
      return `此时${shiLei}不宜，建议另择吉时`;
    }
  }

  /**
   * 计算方位信息（使用缓存的用神信息）
   */
  private static calcDirectionInfoWithCache(
    result: QimenResult,
    yongShenInfo: ReturnType<typeof YongShenCalculator.analyze>
  ): DirectionInfo {
    // 三吉门方位
    const sanJiMen: DirectionInfo['sanJiMen'] = [];
    for (const men of SAN_JI_MEN) {
      for (const gong of [1, 2, 3, 4, 6, 7, 8, 9] as GongWei[]) {
        if (result.gongs[gong].men === men) {
          sanJiMen.push({
            men,
            gong,
            direction: GONG_TO_DIRECTION[gong],
          });
          break;
        }
      }
    }

    // 用神方位（使用缓存）
    const yongShen: DirectionInfo['yongShen'] = [];
    for (const item of yongShenInfo.zhuyong) {
      yongShen.push({
        name: item.name,
        gong: item.gong,
        direction: GONG_TO_DIRECTION[item.gong],
      });
    }

    return { sanJiMen, yongShen };
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  static getCacheSize(): number {
    return this.cache.size;
  }
}
