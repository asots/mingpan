/**
 * 宫位相关工具函数
 *
 * 提供共享的宫位查找和映射方法
 */

import type {
  QimenResult,
  GongWei,
  TianGan,
  DiZhi,
  BaMen,
  JiuXing,
  BaShen,
} from '../types';

/** 所有宫位列表 */
export const ALL_GONGS: GongWei[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** 除中宫外的宫位列表 */
export const OUTER_GONGS: GongWei[] = [1, 2, 3, 4, 6, 7, 8, 9];

/** 八神名称映射表 */
export const SHEN_NAME_MAP: Record<string, BaShen> = {
  '值符': '符',
  '腾蛇': '蛇',
  '太阴': '阴',
  '六合': '合',
  '白虎': '虎',
  '玄武': '武',
  '九地': '地',
  '九天': '天',
  '天后': '阴', // 天后即太阴
};

/** 八门名称列表 */
export const VALID_MEN: BaMen[] = ['休', '生', '伤', '杜', '景', '死', '惊', '开'];

/** 九星名称列表 */
export const VALID_XING: JiuXing[] = ['蓬', '芮', '冲', '辅', '禽', '心', '柱', '任', '英'];

/** 宫位对应地支映射 */
export const GONG_DIZHI: Record<GongWei, DiZhi> = {
  1: '子', // 坎
  2: '未', // 坤（取西南，近似未）
  3: '卯', // 震
  4: '辰', // 巽（取东南，近似辰）
  5: '辰', // 中宫寄坤
  6: '戌', // 乾（取西北，戌）
  7: '酉', // 兑
  8: '丑', // 艮（取东北，丑）
  9: '午', // 离
};

/**
 * 找天干落宫（地盘干）
 *
 * @param result 奇门盘结果
 * @param gan 天干
 * @returns 落宫位置，未找到返回 null
 */
export function findGanGong(result: QimenResult, gan: TianGan): GongWei | null {
  for (const gong of ALL_GONGS) {
    if (result.gongs[gong].diPanGan === gan) {
      return gong;
    }
  }
  return null;
}

/**
 * 找天盘干落宫
 *
 * @param result 奇门盘结果
 * @param gan 天干
 * @returns 落宫位置，未找到返回 null
 */
export function findTianPanGanGong(result: QimenResult, gan: TianGan): GongWei | null {
  for (const gong of ALL_GONGS) {
    if (result.gongs[gong].tianPanGan === gan) {
      return gong;
    }
  }
  return null;
}

/**
 * 找门落宫
 *
 * @param result 奇门盘结果
 * @param men 八门
 * @returns 落宫位置，未找到返回 null
 */
export function findMenGong(result: QimenResult, men: BaMen): GongWei | null {
  for (const gong of ALL_GONGS) {
    if (result.gongs[gong].men === men) {
      return gong;
    }
  }
  return null;
}

/**
 * 找星落宫
 *
 * @param result 奇门盘结果
 * @param xing 九星
 * @returns 落宫位置，未找到返回 null
 */
export function findXingGong(result: QimenResult, xing: JiuXing): GongWei | null {
  for (const gong of ALL_GONGS) {
    if (result.gongs[gong].xing === xing) {
      return gong;
    }
  }
  return null;
}

/**
 * 找神落宫
 *
 * @param result 奇门盘结果
 * @param shenName 八神名称（全称或简称）
 * @returns 落宫位置，未找到返回 null
 */
export function findShenGong(result: QimenResult, shenName: string): GongWei | null {
  const shen = SHEN_NAME_MAP[shenName] || shenName as BaShen;

  for (const gong of ALL_GONGS) {
    if (result.gongs[gong].shen === shen) {
      return gong;
    }
  }
  return null;
}

/**
 * 获取宫位对应地支
 *
 * @param gong 宫位
 * @returns 对应地支
 */
export function getGongDiZhi(gong: GongWei): DiZhi {
  return GONG_DIZHI[gong];
}

/**
 * 解析门名，提取门的简称
 *
 * @param menName 门名（如"开门"或"开"）
 * @returns 门的简称，无效返回 null
 */
export function parseMenName(menName: string): BaMen | null {
  const men = menName.endsWith('门')
    ? menName.slice(0, -1)
    : menName;

  if (VALID_MEN.includes(men as BaMen)) {
    return men as BaMen;
  }
  return null;
}

/**
 * 解析星名，提取星的简称
 *
 * @param xingName 星名（如"天蓬"或"蓬"）
 * @returns 星的简称，无效返回 null
 */
export function parseXingName(xingName: string): JiuXing | null {
  const xing = xingName.startsWith('天')
    ? xingName.slice(1)
    : xingName;

  if (VALID_XING.includes(xing as JiuXing)) {
    return xing as JiuXing;
  }
  return null;
}
