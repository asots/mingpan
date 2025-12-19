/**
 * 大六壬服務
 * 
 * 提供大六壬排盤功能，輸出天地盤、四課、三傳
 * 
 * 參考來源：
 * - kentang2017/kinliuren (MIT License)
 * - 《大六壬大全》
 * - 《六壬粹言》
 */

import type {
  DaliurenInput,
  DaliurenResult,
  DaliurenServiceConfig,
  TianGan,
  DiZhi,
} from './types';
import { TianDiPanCalculator } from './calculators/TianDiPanCalculator';
import { SiKeCalculator } from './calculators/SiKeCalculator';
import { SanChuanCalculator } from './calculators/SanChuanCalculator';
import { ShenShaCalculator } from './calculators/ShenShaCalculator';
import { DAY_NIGHT_MAP } from './data/constants';

export class DaliurenService {
  private config: DaliurenServiceConfig;
  
  constructor(config: DaliurenServiceConfig = {}) {
    this.config = config;
  }
  
  /**
   * 計算大六壬盤
   */
  calculate(input: DaliurenInput): DaliurenResult {
    const { jieqi, lunarMonth, dayGanZhi, hourGanZhi } = input;
    
    // 解析干支
    const dayGan = dayGanZhi[0] as TianGan;
    const dayZhi = dayGanZhi[1] as DiZhi;
    const hourZhi = hourGanZhi[1] as DiZhi;
    
    // 1. 計算天地盤
    const tianDiPan = TianDiPanCalculator.calculate(jieqi, hourZhi, dayGan);
    
    // 2. 計算四課
    const siKe = SiKeCalculator.calculate(dayGan, dayZhi, tianDiPan);
    
    // 3. 計算三傳
    const sanChuan = SanChuanCalculator.calculate(siKe, tianDiPan, dayGanZhi, hourZhi);
    
    // 4. 計算神煞
    const shenSha = ShenShaCalculator.calculate(dayGanZhi);
    
    // 5. 確定晝夜
    const dayNight = DAY_NIGHT_MAP[hourZhi];
    
    // 構建結果
    return {
      basicInfo: {
        jieqi,
        lunarMonth: this.formatLunarMonth(lunarMonth),
        dayGanZhi,
        hourGanZhi,
        dayNight,
      },
      tianDiPan,
      siKe,
      sanChuan,
      shenSha,
    };
  }
  
  /**
   * 格式化農曆月份
   */
  private formatLunarMonth(month: number): string {
    const monthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
    return monthNames[month - 1] + '月';
  }
}
