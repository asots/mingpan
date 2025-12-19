/**
 * 起卦計算器
 * 
 * 支持：
 * - 時間起卦（農曆年月日時）
 * - 數字起卦（兩數/三數）
 */

import { Lunar, Solar } from 'lunar-javascript';
import { QiGuaData, TimeQiGuaDetail } from '../types';

/** 地支對應時辰序數（子=1, 丑=2, ..., 亥=12） */
const DIZHI_TO_SHICHEN: Record<string, number> = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12,
};

/** 地支序數（子=1, 丑=2, ..., 亥=12） */
const DIZHI_INDEX: Record<string, number> = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12,
};

export class QiguaCalculator {
  /**
   * 時間起卦
   * 
   * 算法口徑（農曆）- 標準梅花易數口徑：
   * - 年數 = 農曆年地支序數（子=1, 丑=2, ..., 亥=12）
   * - 月數 = 農曆月（1-12，閏月按本月算）
   * - 日數 = 農曆日（1-30）
   * - 時數 = 時辰地支序數（子=1, 丑=2, ..., 亥=12）
   * 
   * - 上卦數 = (年數 + 月數 + 日數) % 8，餘 0 取 8
   * - 下卦數 = (年數 + 月數 + 日數 + 時數) % 8，餘 0 取 8
   * - 動爻 = (年數 + 月數 + 日數 + 時數) % 6，餘 0 取 6
   * 
   * 參考：《梅花易數》原著、shu-var 開源項目
   */
  static fromTime(
    year: number,
    month: number,
    day: number,
    hour: number,
    isLunar: boolean = false
  ): { qiGuaData: QiGuaData; timeDetail: TimeQiGuaDetail; lunar: Lunar } {
    // 獲取農曆
    let lunar: Lunar;
    if (isLunar) {
      // 農曆輸入需要包含時間信息
      lunar = Lunar.fromYmdHms(year, month, day, hour, 0, 0);
    } else {
      const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
      lunar = solar.getLunar();
    }

    // 獲取時辰地支序數
    const hourBranch = lunar.getTimeZhi();
    const shiChenIndex = DIZHI_TO_SHICHEN[hourBranch];

    // 獲取年地支序數（標準梅花口徑：用地支序數 1-12，不是干支序數 1-60）
    const yearZhi = lunar.getYearZhi();
    const yearZhiIndex = DIZHI_INDEX[yearZhi];

    // 農曆月日
    const lunarMonth = Math.abs(lunar.getMonth()); // 閏月取絕對值
    const lunarDay = lunar.getDay();

    // 計算起卦數
    const sumForUpper = yearZhiIndex + lunarMonth + lunarDay;
    const sumForLower = sumForUpper + shiChenIndex;

    const upperGuaIndex = sumForUpper % 8 === 0 ? 8 : sumForUpper % 8;
    const lowerGuaIndex = sumForLower % 8 === 0 ? 8 : sumForLower % 8;
    const movingYao = sumForLower % 6 === 0 ? 6 : sumForLower % 6;

    return {
      qiGuaData: {
        upperNumber: sumForUpper,
        lowerNumber: sumForLower,
        yaoNumber: sumForLower,
        upperGuaIndex,
        lowerGuaIndex,
        movingYao,
      },
      timeDetail: {
        lunarYear: lunar.getYear(),
        lunarMonth,
        lunarDay,
        shiChenIndex,
        yearZhiIndex,
        sumForUpper,
        sumForLower,
      },
      lunar,
    };
  }

  /**
   * 數字起卦
   * 
   * - 上卦 = upperNumber % 8，餘 0 取 8
   * - 下卦 = lowerNumber % 8，餘 0 取 8
   * - 動爻 = yaoNumber % 6，餘 0 取 6（默認用 upper + lower）
   */
  static fromNumber(
    upperNumber: number,
    lowerNumber: number,
    yaoNumber?: number
  ): QiGuaData {
    const actualYaoNumber = yaoNumber ?? (upperNumber + lowerNumber);

    return {
      upperNumber,
      lowerNumber,
      yaoNumber: actualYaoNumber,
      upperGuaIndex: upperNumber % 8 === 0 ? 8 : upperNumber % 8,
      lowerGuaIndex: lowerNumber % 8 === 0 ? 8 : lowerNumber % 8,
      movingYao: actualYaoNumber % 6 === 0 ? 6 : actualYaoNumber % 6,
    };
  }

}
