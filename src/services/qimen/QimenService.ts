/**
 * 奇门遁甲服务
 *
 * 提供奇门遁甲排盘功能，支持时盘和日盘
 * 支持拆补法和茅山法两种置闰算法
 */

import { Lunar, Solar } from 'lunar-javascript';
import type {
  QimenInput,
  QimenResult,
  QimenServiceConfig,
  GongWei,
  GongInfo,
  TianGan,
  DiZhi,
  PanType,
  ZhiRunMethod,
  SiZhuInfo,
  XunShouInfo,
  QimenCalculationError,
} from './types';
import { JuShuCalculator } from './calculators/JuShuCalculator';
import { JiuGongCalculator } from './calculators/JiuGongCalculator';
import { SanQiLiuYiCalculator } from './calculators/SanQiLiuYiCalculator';
import { BaMenCalculator } from './calculators/BaMenCalculator';
import { JiuXingCalculator } from './calculators/JiuXingCalculator';
import { BaShenCalculator } from './calculators/BaShenCalculator';
import { GeJuCalculator } from './calculators/GeJuCalculator';
import {
  GONG_NAMES,
  GONG_WUXING,
  getXunShou,
  getXunKong,
  getLiuYiGan,
  DI_ZHI_GONG,
  MA_XING,
  ZHONG_GONG_JI,
} from './data/constants';

export class QimenService {
  private config: QimenServiceConfig;

  constructor(config: QimenServiceConfig = {}) {
    this.config = config;
  }

  /**
   * 验证输入参数
   */
  private validateInput(input: QimenInput): void {
    // 验证年份
    if (!Number.isInteger(input.year) || input.year < 1900 || input.year > 2100) {
      throw new Error(`年份必须在 1900-2100 之间，当前值: ${input.year}`);
    }

    // 验证月份
    if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
      throw new Error(`月份必须在 1-12 之间，当前值: ${input.month}`);
    }

    // 验证日期
    if (!Number.isInteger(input.day) || input.day < 1 || input.day > 31) {
      throw new Error(`日期必须在 1-31 之间，当前值: ${input.day}`);
    }

    // 验证小时
    if (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23) {
      throw new Error(`小时必须在 0-23 之间，当前值: ${input.hour}`);
    }

    // 验证分钟（可选）
    if (input.minute !== undefined) {
      if (!Number.isInteger(input.minute) || input.minute < 0 || input.minute > 59) {
        throw new Error(`分钟必须在 0-59 之间，当前值: ${input.minute}`);
      }
    }

    // 验证盘类型（可选）
    if (input.panType !== undefined && input.panType !== '时盘' && input.panType !== '日盘') {
      throw new Error(`盘类型必须是 '时盘' 或 '日盘'，当前值: ${input.panType}`);
    }

    // 验证置闰方法（可选）
    if (input.zhiRunMethod !== undefined && input.zhiRunMethod !== 'chaibu' && input.zhiRunMethod !== 'maoshan') {
      throw new Error(`置闰方法必须是 'chaibu' 或 'maoshan'，当前值: ${input.zhiRunMethod}`);
    }
  }

  /**
   * 计算奇门遁甲盘
   */
  calculate(input: QimenInput): QimenResult {
    // 输入参数验证
    this.validateInput(input);

    const panType: PanType = input.panType || '时盘';
    const zhiRunMethod: ZhiRunMethod = input.zhiRunMethod || 'chaibu';

    // 1. 处理时间，获取四柱和节气信息
    const { siZhu, jieQi, jieQiDate, solarDate, lunarDate } = this.getTimeInfo(input);

    // 2. 计算局数（阴阳遁 + 上中下元 + 局数）
    const currentDate = new Date(input.year, input.month - 1, input.day);
    const juShuResult = JuShuCalculator.calculate(
      jieQi,
      siZhu.dayGanZhi,
      zhiRunMethod,
      jieQiDate,
      currentDate
    );
    const { yinYangDun, juShu, yuan } = juShuResult;

    // 3. 计算地盘（九宫布局）
    const diPanResult = JiuGongCalculator.calculate(juShu, yinYangDun);

    // 4. 确定用于计算的干支（时盘用时干支，日盘用日干支）
    const refGanZhi = panType === '时盘' ? siZhu.hourGanZhi : siZhu.dayGanZhi;
    const refZhi = panType === '时盘' ? siZhu.hourZhi : siZhu.dayZhi;

    // 5. 计算天盘（三奇六仪飞布）
    const tianPanResult = SanQiLiuYiCalculator.calculate(
      diPanResult.ganGong,
      refGanZhi,
      yinYangDun
    );

    // 6. 计算旬首信息
    const xunShouInfo = this.calculateXunShou(
      refGanZhi,
      diPanResult.ganGong,
      tianPanResult.ganGong,
      refZhi,
      yinYangDun
    );

    // 7. 计算九星
    const jiuXingResult = JiuXingCalculator.calculate(
      xunShouInfo.zhiFuGong,
      refZhi,
      yinYangDun
    );

    // 8. 计算八门
    const baMenResult = BaMenCalculator.calculate(
      xunShouInfo.zhiFuGong,
      refZhi,
      yinYangDun
    );

    // 9. 计算八神
    const baShenResult = BaShenCalculator.calculate(
      jiuXingResult.zhiFuLuoGong,
      yinYangDun
    );

    // 10. 组装九宫信息
    const gongs = this.assembleGongs(
      diPanResult.gongGan,
      tianPanResult.gongGan,
      baMenResult.gongMen,
      jiuXingResult.gongXing,
      baShenResult.gongShen,
      xunShouInfo.kongWang,
      siZhu.dayZhi
    );

    // 11. 计算日干/时干落宫
    // 注意：甲遁于六仪，需根据各自干支的旬首确定
    const dayGanGong = this.findGanGong(siZhu.dayGan, siZhu.dayGanZhi, tianPanResult.ganGong);
    const hourGanGong = this.findGanGong(siZhu.hourGan, siZhu.hourGanZhi, tianPanResult.ganGong);

    // 12. 计算格局
    const geJu = GeJuCalculator.calculate(
      gongs,
      yinYangDun,
      siZhu.dayGan,
      siZhu.hourGan,
      siZhu.hourZhi,
      xunShouInfo
    );

    // 更新旬首信息中的值符值使落宫
    const fullXunShouInfo: XunShouInfo = {
      ...xunShouInfo,
      zhiFuXing: jiuXingResult.zhiFuXing,
      zhiFuLuoGong: jiuXingResult.zhiFuLuoGong,
      zhiShiMen: baMenResult.zhiShiMen,
      zhiShiLuoGong: baMenResult.zhiShiLuoGong,
    };

    return {
      timeInfo: {
        solarDate,
        lunarDate,
        siZhu,
        jieQi,
      },
      panType,
      zhiRunMethod,
      yinYangDun,
      juShu,
      yuan,
      xunShou: fullXunShouInfo,
      gongs,
      dayGanGong,
      hourGanGong,
      geJu,
    };
  }

  /**
   * 获取时间信息（四柱、节气）
   */
  private getTimeInfo(input: QimenInput): {
    siZhu: SiZhuInfo;
    jieQi: string;
    jieQiDate: Date;
    solarDate: string;
    lunarDate: string;
  } {
    let solar: InstanceType<typeof Solar>;
    let lunar: InstanceType<typeof Lunar>;

    if (input.isLunar) {
      // 农历转公历
      lunar = Lunar.fromYmd(input.year, input.month, input.day);
      solar = lunar.getSolar();
    } else {
      // 公历
      solar = Solar.fromYmd(input.year, input.month, input.day);
      lunar = solar.getLunar();
    }

    // 使用 Solar 获取精确时辰信息
    const hour = input.hour;
    const solarWithTime = Solar.fromYmdHms(
      solar.getYear(),
      solar.getMonth(),
      solar.getDay(),
      hour,
      input.minute || 0,
      0
    );
    const lunarWithTime = solarWithTime.getLunar();

    // 使用 EightChar 获取精确四柱
    const eightChar = lunarWithTime.getEightChar();
    const yearGanZhi = eightChar.getYear();
    const monthGanZhi = eightChar.getMonth();
    const dayGanZhi = eightChar.getDay();
    const hourGanZhi = eightChar.getTime();

    const siZhu: SiZhuInfo = {
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      hourGanZhi,
      dayGan: dayGanZhi[0] as TianGan,
      dayZhi: dayGanZhi[1] as DiZhi,
      hourGan: hourGanZhi[0] as TianGan,
      hourZhi: hourGanZhi[1] as DiZhi,
    };

    // 获取节气
    const prevJieQi = lunarWithTime.getPrevJieQi();
    const jieQi = prevJieQi ? prevJieQi.getName() : '冬至';
    const jieQiSolar = prevJieQi ? prevJieQi.getSolar() : solar;
    const jieQiDate = new Date(
      jieQiSolar.getYear(),
      jieQiSolar.getMonth() - 1,
      jieQiSolar.getDay()
    );

    // 格式化日期
    const solarDate = `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`;
    const lunarDate = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

    return { siZhu, jieQi, jieQiDate, solarDate, lunarDate };
  }

  /**
   * 计算旬首信息
   */
  private calculateXunShou(
    refGanZhi: string,
    diPanGanGong: Record<TianGan, GongWei>,
    tianPanGanGong: Record<TianGan, GongWei>,
    refZhi: DiZhi,
    yinYangDun: '阳遁' | '阴遁'
  ): XunShouInfo {
    // 获取旬首
    const xunShou = getXunShou(refGanZhi);
    const fuTou = xunShou; // 符头就是旬首

    // 获取旬首对应的六仪（遁甲干）
    const liuYiGan = getLiuYiGan(xunShou);

    // 值符星原始宫位 = 旬首遁干在地盘的宫位
    let zhiFuGong = diPanGanGong[liuYiGan];
    if (zhiFuGong === 5) {
      zhiFuGong = ZHONG_GONG_JI; // 中宫寄坤二
    }

    // 值使门原始宫位 = 值符星原始宫位
    const zhiShiGong = zhiFuGong;

    // 获取空亡
    const kongWang = getXunKong(xunShou);

    return {
      xunShou,
      fuTou,
      zhiFuXing: '蓬', // 占位，后续由 JiuXingCalculator 计算
      zhiFuGong,
      zhiFuLuoGong: zhiFuGong, // 占位，后续更新
      zhiShiMen: '休', // 占位，后续由 BaMenCalculator 计算
      zhiShiGong,
      zhiShiLuoGong: zhiShiGong, // 占位，后续更新
      kongWang,
    };
  }

  /**
   * 组装九宫完整信息
   */
  private assembleGongs(
    diPanGan: Record<GongWei, TianGan>,
    tianPanGan: Record<GongWei, TianGan>,
    gongMen: Record<GongWei, import('./types').BaMen>,
    gongXing: Record<GongWei, import('./types').JiuXing>,
    gongShen: Record<GongWei, import('./types').BaShen>,
    kongWang: [DiZhi, DiZhi],
    dayZhi: DiZhi
  ): Record<GongWei, GongInfo> {
    const gongs: Record<GongWei, GongInfo> = {} as Record<GongWei, GongInfo>;

    // 获取马星地支
    const maZhi = MA_XING[dayZhi];
    const maGong = DI_ZHI_GONG[maZhi];

    for (let g = 1; g <= 9; g++) {
      const gong = g as GongWei;

      // 检查是否空亡（根据地支判断）
      // 某些宫位对应两个地支，只要其中一个在空亡列表中即为空亡
      const gongDiZhiList = this.getGongDiZhiList(gong);
      const isKong = gongDiZhiList.some(dz => kongWang.includes(dz));

      // 检查是否马星
      const isMa = gong === maGong;

      gongs[gong] = {
        gong,
        gongName: GONG_NAMES[gong],
        diPanGan: diPanGan[gong],
        tianPanGan: tianPanGan[gong],
        men: gongMen[gong],
        xing: gongXing[gong],
        shen: gongShen[gong],
        wuXing: GONG_WUXING[gong],
        isKong,
        isMa,
      };
    }

    return gongs;
  }

  /**
   * 获取宫位对应的所有地支
   * 某些宫位对应两个地支（坤、巽、乾、艮），需要全部返回
   */
  private getGongDiZhiList(gong: GongWei): DiZhi[] {
    const gongDiZhiMap: Record<GongWei, DiZhi[]> = {
      1: ['子'],         // 坎宫
      2: ['未', '申'],   // 坤宫
      3: ['卯'],         // 震宫
      4: ['辰', '巳'],   // 巽宫
      5: ['未', '申'],   // 中宫寄坤二
      6: ['戌', '亥'],   // 乾宫
      7: ['酉'],         // 兑宫
      8: ['丑', '寅'],   // 艮宫
      9: ['午'],         // 离宫
    };
    return gongDiZhiMap[gong];
  }

  /**
   * 根据天干找落宫
   * 注意：甲遁于六仪之下，需要根据旬首找对应的六仪
   *
   * @param gan - 天干
   * @param ganZhi - 干支（用于确定甲的旬首）
   * @param ganGong - 天干落宫映射
   */
  private findGanGong(gan: TianGan, ganZhi: string, ganGong: Record<TianGan, GongWei>): GongWei {
    let actualGan = gan;

    // 甲遁于六仪之下，需要根据干支的旬首找对应的六仪
    if (gan === '甲') {
      const xunShou = getXunShou(ganZhi);
      actualGan = getLiuYiGan(xunShou);
    }

    const gong = ganGong[actualGan];
    if (gong === undefined) {
      return ZHONG_GONG_JI; // 默认返回坤二
    }
    return gong === 5 ? ZHONG_GONG_JI : gong;
  }
}
