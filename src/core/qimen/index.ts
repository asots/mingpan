/**
 * 奇门遁甲核心模块导出
 * Core Qimen module exports
 */

// Types
export * from './types';

// Flying rules (飞盘式)
export {
  LUOSHU_ORDER,
  LUOSHU_ORDER_9,
  ZHONG_GONG_JI,
  getLuoShuIndex,
  getLuoShuGong,
  getLuoShuIndex9,
  getLuoShuGong9,
  flyForward,
  flyBackward,
} from './FlyingRule';

// Rotating rules (转盘式)
export {
  PHYSICAL_CLOCKWISE_ORDER,
  PHYSICAL_COUNTER_CLOCKWISE_ORDER,
  ZHONG_GONG_JI_ZHUAN,
  getPhysicalClockwiseIndex,
  getPhysicalClockwiseGong,
  getPhysicalCounterClockwiseIndex,
  getPhysicalCounterClockwiseGong,
  rotate,
  getRotationSteps,
} from './RotatingRule';

// Gong mappings
export {
  GONG_NAMES,
  GONG_WUXING,
  DI_ZHI_GONG,
  CHONG_GONG_MAP,
  GAN_HE_MAP,
} from './GongMapping';

// Yin-Yang Dun calculations
export {
  JIEQI_JU_MAP,
  getYinYangDun,
  getJuShu,
} from './YinYangDunCalculator';
