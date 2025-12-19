/**
 * 测试脚本 - 验证八字和紫微计算结果
 *
 * 样例数据：1992-04-12 07:30:00 男
 *
 * 期望八字：年柱壬申 月柱甲辰 日柱戊午 時柱丙辰
 * 期望紫微：命宫壬子-巨門(旺)，四化：化祿天梁 化權紫微 化科左輔 化忌武曲
 * 
 * 注意：此文件為手動測試腳本，正式測試請使用 vitest：npm test
 */

import { BaziService } from '../src/services/bazi/BaziService';
import { ZiweiService } from '../src/services/ziwei/ZiweiService';

async function testCalculations() {
  console.log('========================================');
  console.log('Mingpan 计算验证测试');
  console.log('========================================\n');

  // 测试数据
  const testData = {
    year: 1992,
    month: 4,
    day: 12,
    hour: 7,
    minute: 30,
    gender: 'male' as const
  };

  console.log('测试数据：');
  console.log(`  出生日期：${testData.year}-${testData.month}-${testData.day} ${testData.hour}:${testData.minute}`);
  console.log(`  性别：${testData.gender === 'male' ? '男' : '女'}\n`);

  // ========================================
  // 八字测试
  // ========================================
  console.log('--- 八字计算测试 ---\n');

  const baziService = new BaziService({ debug: false });
  const baziResult = await baziService.calculate({
    year: testData.year,
    month: testData.month,
    day: testData.day,
    hour: testData.hour,
    minute: testData.minute,
    gender: testData.gender,
  });

  let baziSuccess = false;
  if (baziResult.chart) {
    const chart = baziResult.chart;
    console.log('八字排盘结果：');
    console.log(`  年柱：${chart.year.stem}${chart.year.branch}`);
    console.log(`  月柱：${chart.month.stem}${chart.month.branch}`);
    console.log(`  日柱：${chart.day.stem}${chart.day.branch}`);
    console.log(`  時柱：${chart.hour.stem}${chart.hour.branch}`);
    console.log(`  日主：${chart.day.stem}`);

    const expected = { year: '壬申', month: '甲辰', day: '戊午', hour: '丙辰' };
    const actual = {
      year: `${chart.year.stem}${chart.year.branch}`,
      month: `${chart.month.stem}${chart.month.branch}`,
      day: `${chart.day.stem}${chart.day.branch}`,
      hour: `${chart.hour.stem}${chart.hour.branch}`,
    };

    baziSuccess =
      actual.year === expected.year &&
      actual.month === expected.month &&
      actual.day === expected.day &&
      actual.hour === expected.hour;

    console.log(`\n八字验证：${baziSuccess ? '✅ 全部正确' : '❌ 有错误'}`);
  }

  // ========================================
  // 紫微测试
  // ========================================
  console.log('\n--- 紫微计算测试 ---\n');

  const ziweiService = new ZiweiService();
  const ziweiResult = await ziweiService.calculate({
    year: testData.year,
    month: testData.month,
    day: testData.day,
    hour: testData.hour,
    gender: testData.gender,
  });

  console.log('紫微排盘结果：');

  // 基本信息
  if (ziweiResult.basicInfo) {
    console.log(`  五行局：${ziweiResult.basicInfo.fiveElement}`);
    console.log(`  命主星：${ziweiResult.basicInfo.soul}`);
    console.log(`  身主星：${ziweiResult.basicInfo.body}`);
  }

  // 找到命宫和身宫
  const palaces = ziweiResult.palaces || [];
  const mingPalace = palaces.find((p: any) => p.name === '命宫' || p.name === '命宮');
  const shenPalace = palaces.find((p: any) => p.isBodyPalace);

  if (mingPalace) {
    const ganZhi = `${mingPalace.heavenlyStem}${mingPalace.earthlyBranch}`;
    console.log(`\n  命宫位置：${ganZhi}`);

    const majorStars = mingPalace.majorStars?.map((s: any) =>
      `${s.name}(${s.brightness})`
    ).join('、') || '无';
    console.log(`  命宫主星：${majorStars}`);
  }

  if (shenPalace) {
    const isSameAsMing = shenPalace.name === '命宫' || shenPalace.name === '命宮';
    console.log(`  身宫位置：${isSameAsMing ? '与命宫同宫' : shenPalace.name}`);
  }

  // 十二宫位对比
  console.log('\n  十二宫位：');

  const palaceOrder = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
                       '迁移', '仆役', '官禄', '田宅', '福德', '父母'];

  const expectedPalaces: Record<string, string> = {
    '命宫': '壬子', '兄弟': '辛亥', '夫妻': '庚戌', '子女': '己酉',
    '财帛': '戊申', '疾厄': '丁未', '迁移': '丙午', '仆役': '乙巳',
    '官禄': '甲辰', '田宅': '癸卯', '福德': '壬寅', '父母': '癸丑'
  };

  let allPalacesMatch = true;

  for (const palaceName of palaceOrder) {
    const palace = palaces.find((p: any) => p.name === palaceName);
    if (palace) {
      const actualGanZhi = `${palace.heavenlyStem}${palace.earthlyBranch}`;
      const expectedGanZhi = expectedPalaces[palaceName];
      const match = actualGanZhi === expectedGanZhi;
      if (!match) allPalacesMatch = false;

      const majorStars = palace.majorStars?.map((s: any) =>
        `${s.name}(${s.brightness})`
      ).join('、') || '';
      const bodyMark = palace.isBodyPalace ? ' [身]' : '';
      const status = match ? '✅' : '❌';

      console.log(`    ${status} ${actualGanZhi} ${palace.name}${bodyMark}：${majorStars}`);
    }
  }

  // 四化验证
  console.log('\n  本命四化验证：');

  const expectedMutagens = { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' };

  // mutagenInfo 是 CompleteMutagenInfo 类型，本命四化在 natal 中
  const natalMutagen = ziweiResult.mutagenInfo?.natal;
  let allMutagensMatch = true;

  if (natalMutagen) {
    // 简繁体转换辅助函数
    const normalize = (s: string | undefined) => {
      if (!s) return '';
      return s.replace('机', '機').replace('阴', '陰');
    };

    const luMatch = normalize(natalMutagen.lu) === expectedMutagens.lu;
    const quanMatch = normalize(natalMutagen.quan) === expectedMutagens.quan;
    const keMatch = normalize(natalMutagen.ke) === expectedMutagens.ke;
    const jiMatch = normalize(natalMutagen.ji) === expectedMutagens.ji;

    allMutagensMatch = luMatch && quanMatch && keMatch && jiMatch;

    console.log(`    化祿：${luMatch ? '✅' : '❌'} (期望: ${expectedMutagens.lu}, 实际: ${natalMutagen.lu})`);
    console.log(`    化權：${quanMatch ? '✅' : '❌'} (期望: ${expectedMutagens.quan}, 实际: ${natalMutagen.quan})`);
    console.log(`    化科：${keMatch ? '✅' : '❌'} (期望: ${expectedMutagens.ke}, 实际: ${natalMutagen.ke})`);
    console.log(`    化忌：${jiMatch ? '✅' : '❌'} (期望: ${expectedMutagens.ji}, 实际: ${natalMutagen.ji})`);
  } else {
    console.log('    ❌ 未获取到四化信息');
    allMutagensMatch = false;
  }

  // 总结
  console.log('\n========================================');
  console.log('测试总结');
  console.log('========================================');
  console.log(`  八字计算：${baziSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  宫位排列：${allPalacesMatch ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  四化计算：${allMutagensMatch ? '✅ 通过' : '❌ 失败'}`);

  const allSuccess = baziSuccess && allPalacesMatch && allMutagensMatch;
  console.log(`\n总体结果：${allSuccess ? '✅ 全部通过！' : '❌ 存在问题'}`);
  console.log('========================================\n');
}

testCalculations().catch(console.error);
