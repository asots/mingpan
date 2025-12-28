/**
 * 转盘式旋转规则
 * Rotating rules for Zhuan Pan style Qimen calculations
 *
 * 转盘式与飞盘式的区别：
 * - 飞盘式：按洛书数字顺序飞布 (1→8→3→4→9→2→7→6)
 * - 转盘式：按物理方向旋转（九宫格上顺/逆时针）
 *
 * 九宫格物理布局：
 * ```
 * 巽4  离9  坤2
 * 震3  中5  兑7
 * 艮8  坎1  乾6
 * ```
 *
 * 物理顺时针顺序（从坎1开始）：
 * 1(坎) → 8(艮) → 3(震) → 4(巽) → 9(离) → 2(坤) → 7(兑) → 6(乾) → 回到1
 *
 * 参考：《神奇之门》（张志春著）
 */

import type { GongWei } from './types';

/**
 * 物理顺时针旋转顺序 - 8宫版本（不含中宫）
 * 从坎1开始，顺时针：坎→艮→震→巽→离→坤→兑→乾
 */
export const PHYSICAL_CLOCKWISE_ORDER: GongWei[] = [1, 8, 3, 4, 9, 2, 7, 6];

/**
 * 物理逆时针旋转顺序 - 8宫版本（不含中宫）
 * 从坎1开始，逆时针：坎→乾→兑→坤→离→巽→震→艮
 */
export const PHYSICAL_COUNTER_CLOCKWISE_ORDER: GongWei[] = [1, 6, 7, 2, 9, 4, 3, 8];

/**
 * 中宫寄宫 (天禽寄坤二)
 */
export const ZHONG_GONG_JI_ZHUAN: GongWei = 2;

/**
 * 根据宫位获取物理顺时针顺序中的索引
 * @param gong 宫位 (1-9)
 * @returns 索引 (0-7)，中宫返回 -1
 */
export function getPhysicalClockwiseIndex(gong: GongWei): number {
  if (gong === 5) return -1;
  return PHYSICAL_CLOCKWISE_ORDER.indexOf(gong);
}

/**
 * 根据索引获取物理顺时针方向的宫位
 * @param index 索引（可以超过7，会自动取模）
 * @returns 宫位
 */
export function getPhysicalClockwiseGong(index: number): GongWei {
  const normalizedIndex = ((index % 8) + 8) % 8;
  return PHYSICAL_CLOCKWISE_ORDER[normalizedIndex];
}

/**
 * 根据宫位获取物理逆时针顺序中的索引
 * @param gong 宫位 (1-9)
 * @returns 索引 (0-7)，中宫返回 -1
 */
export function getPhysicalCounterClockwiseIndex(gong: GongWei): number {
  if (gong === 5) return -1;
  return PHYSICAL_COUNTER_CLOCKWISE_ORDER.indexOf(gong);
}

/**
 * 根据索引获取物理逆时针方向的宫位
 * @param index 索引（可以超过7，会自动取模）
 * @returns 宫位
 */
export function getPhysicalCounterClockwiseGong(index: number): GongWei {
  const normalizedIndex = ((index % 8) + 8) % 8;
  return PHYSICAL_COUNTER_CLOCKWISE_ORDER[normalizedIndex];
}

/**
 * 转盘式旋转：从某宫开始旋转指定步数
 * @param startGong 起始宫位
 * @param steps 步数
 * @param isYang 是否阳遁（阳遁顺时针，阴遁逆时针）
 * @returns 目标宫位
 */
export function rotate(startGong: GongWei, steps: number, isYang: boolean): GongWei {
  let actualStart = startGong;
  if (actualStart === 5) {
    actualStart = ZHONG_GONG_JI_ZHUAN; // 中宫寄坤二
  }

  if (isYang) {
    // 阳遁顺时针
    const startIdx = getPhysicalClockwiseIndex(actualStart);
    return getPhysicalClockwiseGong(startIdx + steps);
  } else {
    // 阴遁逆时针
    const startIdx = getPhysicalCounterClockwiseIndex(actualStart);
    return getPhysicalCounterClockwiseGong(startIdx + steps);
  }
}

/**
 * 计算两宫之间的旋转步数
 * @param fromGong 起始宫位
 * @param toGong 目标宫位
 * @param isYang 是否阳遁
 * @returns 步数
 */
export function getRotationSteps(fromGong: GongWei, toGong: GongWei, isYang: boolean): number {
  let actualFrom = fromGong === 5 ? ZHONG_GONG_JI_ZHUAN : fromGong;
  let actualTo = toGong === 5 ? ZHONG_GONG_JI_ZHUAN : toGong;

  if (isYang) {
    const fromIdx = getPhysicalClockwiseIndex(actualFrom);
    const toIdx = getPhysicalClockwiseIndex(actualTo);
    return ((toIdx - fromIdx) % 8 + 8) % 8;
  } else {
    const fromIdx = getPhysicalCounterClockwiseIndex(actualFrom);
    const toIdx = getPhysicalCounterClockwiseIndex(actualTo);
    return ((toIdx - fromIdx) % 8 + 8) % 8;
  }
}
