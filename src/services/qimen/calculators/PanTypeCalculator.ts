/**
 * 盘类型计算器
 * 处理年盘、月盘的特殊计算逻辑
 *
 * 年盘规则：
 * 1. 阴阳遁：冬至后到夏至前为阳遁，夏至后到冬至前为阴遁
 * 2. 三元：按年支确定 (子午卯酉→上元, 寅申巳亥→中元, 辰戌丑未→下元)
 * 3. 局数：(年干支序数 % 9) + 1
 * 4. 旬首：基于年干支
 * 5. 天盘旋转：值符飞到年干所在宫
 *
 * 月盘规则：
 * 1. 阴阳遁：按月建对应的节气确定
 * 2. 三元：按月支确定（规则同年盘）
 * 3. 局数：使用节气局数表
 * 4. 旬首：基于月干支
 * 5. 天盘旋转：值符飞到月干所在宫
 */

import type { DiZhi, JuShu, YinYangDun, YuanType } from '../types';
import { DI_ZHI, JIA_ZI_60, JIEQI_JU_MAP } from '../data/constants';

// ============= 常量定义 =============

/**
 * 月建对应的节气映射
 * 月建（地支）-> 对应的节气
 */
export const MONTH_JIEQI_MAP: Record<DiZhi, string> = {
  '寅': '立春',   // 正月
  '卯': '惊蛰',   // 二月
  '辰': '清明',   // 三月
  '巳': '立夏',   // 四月
  '午': '芒种',   // 五月
  '未': '小暑',   // 六月
  '申': '立秋',   // 七月
  '酉': '白露',   // 八月
  '戌': '寒露',   // 九月
  '亥': '立冬',   // 十月
  '子': '大雪',   // 十一月
  '丑': '小寒',   // 十二月
};

/**
 * 三元判定表：地支 -> 三元
 * 子午卯酉 → 上元
 * 寅申巳亥 → 中元
 * 辰戌丑未 → 下元
 */
export const DI_ZHI_YUAN_MAP: Record<DiZhi, YuanType> = {
  '子': '上元',
  '午': '上元',
  '卯': '上元',
  '酉': '上元',
  '寅': '中元',
  '申': '中元',
  '巳': '中元',
  '亥': '中元',
  '辰': '下元',
  '戌': '下元',
  '丑': '下元',
  '未': '下元',
};

/**
 * 阳遁节气列表（冬至到芒种）
 */
const YANG_DUN_JIEQI = [
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰',
  '春分', '清明', '谷雨', '立夏', '小满', '芒种'
];

/**
 * 阴遁节气列表（夏至到大雪）
 */
const YIN_DUN_JIEQI = [
  '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
  '秋分', '寒露', '霜降', '立冬', '小雪', '大雪'
];

// ============= 年盘计算 =============

/**
 * 年盘阴阳遁判断
 * 冬至当天为阳遁起始，夏至当天为阴遁起始
 * @param currentJieQi 当前节气
 * @returns 阴阳遁
 */
export function getYearPanYinYangDun(currentJieQi: string): YinYangDun {
  if (YANG_DUN_JIEQI.includes(currentJieQi)) {
    return '阳遁';
  }
  if (YIN_DUN_JIEQI.includes(currentJieQi)) {
    return '阴遁';
  }
  // 默认返回阳遁（不应该发生）
  return '阳遁';
}

/**
 * 年盘三元判断
 * 根据年支确定三元
 * @param yearZhi 年支
 * @returns 三元
 */
export function getYearPanYuan(yearZhi: DiZhi): YuanType {
  return DI_ZHI_YUAN_MAP[yearZhi];
}

/**
 * 年盘局数计算
 * 公式：(年干支在六十甲子中的序数 % 9) + 1
 * 注意：序数从0开始，所以甲子=0, 乙丑=1, ...
 * @param yearGanZhi 年干支（如 "甲辰"）
 * @returns 局数 (1-9)
 */
export function getYearPanJuShu(yearGanZhi: string): JuShu {
  const index = JIA_ZI_60.indexOf(yearGanZhi);
  if (index === -1) {
    throw new Error(`无效的年干支: ${yearGanZhi}`);
  }
  // 公式: (index % 9) + 1，确保结果在 1-9 之间
  const ju = (index % 9) + 1;
  return ju as JuShu;
}

// ============= 月盘计算 =============

/**
 * 月盘阴阳遁判断
 * 根据月建对应的节气确定
 * @param monthZhi 月支（月建）
 * @returns 阴阳遁
 */
export function getMonthPanYinYangDun(monthZhi: DiZhi): YinYangDun {
  const jieQi = MONTH_JIEQI_MAP[monthZhi];
  const jieQiInfo = JIEQI_JU_MAP[jieQi];
  if (!jieQiInfo) {
    throw new Error(`无法找到节气信息: ${jieQi}`);
  }
  return jieQiInfo.dun;
}

/**
 * 月盘三元判断
 * 根据月支确定三元（规则同年盘）
 * @param monthZhi 月支
 * @returns 三元
 */
export function getMonthPanYuan(monthZhi: DiZhi): YuanType {
  return DI_ZHI_YUAN_MAP[monthZhi];
}

/**
 * 月盘局数计算
 * 使用月建对应的节气，结合三元查找局数
 * @param monthZhi 月支（月建）
 * @returns 局数 (1-9)
 */
export function getMonthPanJuShu(monthZhi: DiZhi): JuShu {
  const jieQi = MONTH_JIEQI_MAP[monthZhi];
  const yuan = getMonthPanYuan(monthZhi);

  const jieQiInfo = JIEQI_JU_MAP[jieQi];
  if (!jieQiInfo) {
    throw new Error(`无法找到节气信息: ${jieQi}`);
  }

  const yuanIndex = getYuanIndex(yuan);
  return jieQiInfo.ju[yuanIndex];
}

// ============= 辅助函数 =============

/**
 * 获取元索引
 */
function getYuanIndex(yuan: YuanType): 0 | 1 | 2 {
  switch (yuan) {
    case '上元': return 0;
    case '中元': return 1;
    case '下元': return 2;
  }
}

/**
 * 从干支字符串提取地支
 * @param ganZhi 干支字符串（如 "甲子"）
 * @returns 地支
 */
export function extractZhi(ganZhi: string): DiZhi {
  if (ganZhi.length !== 2) {
    throw new Error(`无效的干支格式: ${ganZhi}`);
  }
  return ganZhi.charAt(1) as DiZhi;
}

/**
 * 验证干支是否有效
 * @param ganZhi 干支字符串
 * @returns 是否有效
 */
export function isValidGanZhi(ganZhi: string): boolean {
  return JIA_ZI_60.includes(ganZhi);
}

// ============= 盘类型计算器类 =============

export interface YearPanParams {
  yearGanZhi: string;
  currentJieQi: string;
}

export interface MonthPanParams {
  monthGanZhi: string;
}

export interface PanTypeResult {
  yinYangDun: YinYangDun;
  yuan: YuanType;
  juShu: JuShu;
}

/**
 * 盘类型计算器
 * 统一处理年盘、月盘的阴阳遁、三元、局数计算
 */
export class PanTypeCalculator {
  /**
   * 计算年盘参数
   * @param params 年盘参数
   * @returns 阴阳遁、三元、局数
   */
  static calculateYearPan(params: YearPanParams): PanTypeResult {
    const { yearGanZhi, currentJieQi } = params;

    if (!isValidGanZhi(yearGanZhi)) {
      throw new Error(`无效的年干支: ${yearGanZhi}`);
    }

    const yearZhi = extractZhi(yearGanZhi);

    return {
      yinYangDun: getYearPanYinYangDun(currentJieQi),
      yuan: getYearPanYuan(yearZhi),
      juShu: getYearPanJuShu(yearGanZhi),
    };
  }

  /**
   * 计算月盘参数
   * @param params 月盘参数
   * @returns 阴阳遁、三元、局数
   */
  static calculateMonthPan(params: MonthPanParams): PanTypeResult {
    const { monthGanZhi } = params;

    if (!isValidGanZhi(monthGanZhi)) {
      throw new Error(`无效的月干支: ${monthGanZhi}`);
    }

    const monthZhi = extractZhi(monthGanZhi);

    return {
      yinYangDun: getMonthPanYinYangDun(monthZhi),
      yuan: getMonthPanYuan(monthZhi),
      juShu: getMonthPanJuShu(monthZhi),
    };
  }
}
