/**
 * 洛书飞宫规则
 * Luoshu flying rules for nine-palace calculations
 */

import type { GongWei } from './types';

/**
 * 洛书飞布顺序 (顺飞) - 8宫版本（不含中宫）
 * 从任意宫开始，按此顺序飞布
 * 1(坎) -> 8(艮) -> 3(震) -> 4(巽) -> 9(离) -> 2(坤) -> 7(兑) -> 6(乾)
 */
export const LUOSHU_ORDER: GongWei[] = [1, 8, 3, 4, 9, 2, 7, 6];

/**
 * 洛书飞布顺序 (顺飞) - 9宫版本（含中宫）
 * 用于三奇六仪天盘飞布
 * 1(坎) -> 8(艮) -> 3(震) -> 4(巽) -> 5(中) -> 9(离) -> 2(坤) -> 7(兑) -> 6(乾)
 */
export const LUOSHU_ORDER_9: GongWei[] = [1, 8, 3, 4, 5, 9, 2, 7, 6];

/**
 * 中宫寄宫 (天禽寄坤二)
 */
export const ZHONG_GONG_JI: GongWei = 2;

/**
 * 根据宫位获取飞布顺序中的索引
 * @param gong 宫位 (1-9)
 * @returns 索引 (0-7)，中宫返回 -1
 */
export function getLuoShuIndex(gong: GongWei): number {
  if (gong === 5) return -1; // 中宫不在飞布顺序中
  return LUOSHU_ORDER.indexOf(gong);
}

/**
 * 根据索引获取飞布宫位
 * @param index 索引（可以超过7，会自动取模）
 * @returns 宫位
 */
export function getLuoShuGong(index: number): GongWei {
  const normalizedIndex = ((index % 8) + 8) % 8;
  return LUOSHU_ORDER[normalizedIndex];
}

/**
 * 根据宫位获取9宫飞布顺序中的索引
 * @param gong 宫位 (1-9)
 * @returns 索引 (0-8)
 */
export function getLuoShuIndex9(gong: GongWei): number {
  return LUOSHU_ORDER_9.indexOf(gong);
}

/**
 * 根据索引获取9宫飞布宫位
 * @param index 索引（可以超过8，会自动取模）
 * @returns 宫位
 */
export function getLuoShuGong9(index: number): GongWei {
  const normalizedIndex = ((index % 9) + 9) % 9;
  return LUOSHU_ORDER_9[normalizedIndex];
}

/**
 * 顺飞：从某宫开始顺时针飞布
 * @param startGong 起始宫位
 * @param steps 步数
 * @returns 目标宫位
 */
export function flyForward(startGong: GongWei, steps: number): GongWei {
  let actualStart = startGong;
  if (actualStart === 5) {
    actualStart = ZHONG_GONG_JI; // 中宫寄坤二
  }
  const startIdx = getLuoShuIndex(actualStart);
  return getLuoShuGong(startIdx + steps);
}

/**
 * 逆飞：从某宫开始逆时针飞布
 * @param startGong 起始宫位
 * @param steps 步数
 * @returns 目标宫位
 */
export function flyBackward(startGong: GongWei, steps: number): GongWei {
  let actualStart = startGong;
  if (actualStart === 5) {
    actualStart = ZHONG_GONG_JI; // 中宫寄坤二
  }
  const startIdx = getLuoShuIndex(actualStart);
  return getLuoShuGong(startIdx - steps);
}
