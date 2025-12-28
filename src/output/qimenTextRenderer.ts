/**
 * 奇门遁甲盘面 Markdown 渲染器
 *
 * 输出格式设计原则：
 * - 第一屏就让人/agent 看懂
 * - ASCII 艺术保持九宫格的直观性
 * - 统一使用简体中文
 */

import type { QimenResult, GongWei, GongInfo } from '../services/qimen/types';
import {
  BA_MEN_FULL,
  JIU_XING_FULL,
  BA_SHEN_FULL,
} from '../services/qimen/data/constants';

/**
 * 渲染奇门遁甲盘面为 Markdown 文本
 */
export function renderQimenText(result: QimenResult): string {
  const lines: string[] = [];

  // 标题
  lines.push('## 奇门遁甲排盘');
  lines.push('');

  // 基本信息
  const panStyleText = result.panStyle === '飞盘' ? '飞盘式' : '转盘式';
  lines.push(`**${result.yinYangDun}${result.juShu}局** | ${result.panType} | ${panStyleText} | ${result.yuan} | ${result.zhiRunMethod === 'chaibu' ? '拆补法' : '茅山法'}`);
  lines.push('');

  // 时间信息
  lines.push(`**公历**：${result.timeInfo.solarDate} | **农历**：${result.timeInfo.lunarDate}`);
  lines.push(`**节气**：${result.timeInfo.jieQi}`);
  lines.push(`**四柱**：${result.timeInfo.siZhu.yearGanZhi}年 ${result.timeInfo.siZhu.monthGanZhi}月 ${result.timeInfo.siZhu.dayGanZhi}日 ${result.timeInfo.siZhu.hourGanZhi}时`);
  lines.push('');

  // 旬首信息
  lines.push(`**旬首**：${result.xunShou.xunShou} | **空亡**：${result.xunShou.kongWang[0]}${result.xunShou.kongWang[1]}`);
  lines.push(`**值符**：${JIU_XING_FULL[result.xunShou.zhiFuXing]}（原${getGongName(result.xunShou.zhiFuGong)}→${getGongName(result.xunShou.zhiFuLuoGong)}）`);
  lines.push(`**值使**：${BA_MEN_FULL[result.xunShou.zhiShiMen]}（原${getGongName(result.xunShou.zhiShiGong)}→${getGongName(result.xunShou.zhiShiLuoGong)}）`);
  lines.push('');

  // 日时落宫
  lines.push(`**日干${result.timeInfo.siZhu.dayGan}落宫**：${getGongName(result.dayGanGong)} | **时干${result.timeInfo.siZhu.hourGan}落宫**：${getGongName(result.hourGanGong)}`);
  lines.push('');

  // 九宫盘
  lines.push('### 九宫盘');
  lines.push('');
  lines.push(renderJiuGongGrid(result.gongs));
  lines.push('');

  // 格局
  if (result.geJu.length > 0) {
    lines.push('### 格局');
    lines.push('');

    const jiGe = result.geJu.filter(g => g.type === '吉格');
    const xiongGe = result.geJu.filter(g => g.type === '凶格');
    const zhongXing = result.geJu.filter(g => g.type === '中性');

    if (jiGe.length > 0) {
      lines.push(`**吉格**：${jiGe.map(g => g.name).join('、')}`);
    }
    if (xiongGe.length > 0) {
      lines.push(`**凶格**：${xiongGe.map(g => g.name).join('、')}`);
    }
    if (zhongXing.length > 0) {
      lines.push(`**中性**：${zhongXing.map(g => g.name).join('、')}`);
    }
    lines.push('');

    // 格局详情
    lines.push('**格局详情**：');
    for (const ge of result.geJu) {
      const icon = ge.type === '吉格' ? '✓' : ge.type === '凶格' ? '✗' : '○';
      lines.push(`- ${icon} ${ge.name}：${ge.description}`);
    }
    lines.push('');
  }

  // 九宫详表
  lines.push('### 九宫详表');
  lines.push('');
  lines.push('| 宫位 | 地盘 | 天盘 | 八门 | 九星 | 八神 | 空亡 | 马星 |');
  lines.push('|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|');

  // 按洛书顺序排列：巽4 离9 坤2 / 震3 中5 兑7 / 艮8 坎1 乾6
  const displayOrder: GongWei[] = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  for (const gongWei of displayOrder) {
    const gong = result.gongs[gongWei];
    const kongMark = gong.isKong ? '○' : '';
    const maMark = gong.isMa ? '○' : '';
    lines.push(`| ${gong.gongName}${gong.gong} | ${gong.diPanGan} | ${gong.tianPanGan} | ${BA_MEN_FULL[gong.men]} | ${JIU_XING_FULL[gong.xing]} | ${BA_SHEN_FULL[gong.shen]} | ${kongMark} | ${maMark} |`);
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * 渲染九宫格 ASCII 艺术
 */
function renderJiuGongGrid(gongs: Record<GongWei, GongInfo>): string {
  const lines: string[] = [];

  // 获取每个宫位的显示信息
  const getGongDisplay = (gongWei: GongWei): string[] => {
    const gong = gongs[gongWei];
    const line1 = `${gong.gongName}${gong.gong}宫`;
    const line2 = `${gong.diPanGan}+${gong.tianPanGan}`;
    const line3 = `${JIU_XING_FULL[gong.xing]} ${BA_MEN_FULL[gong.men]}`;
    const line4 = BA_SHEN_FULL[gong.shen];
    return [line1, line2, line3, line4];
  };

  // 填充到固定宽度
  const pad = (s: string, width: number): string => {
    const len = [...s].length; // 处理中文字符
    const padding = width - len;
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return ' '.repeat(left) + s + ' '.repeat(right);
  };

  const cellWidth = 12;

  lines.push('```');

  // 第一行：巽4 离9 坤2
  const row1 = [getGongDisplay(4), getGongDisplay(9), getGongDisplay(2)];
  lines.push('┌' + '─'.repeat(cellWidth) + '┬' + '─'.repeat(cellWidth) + '┬' + '─'.repeat(cellWidth) + '┐');
  for (let i = 0; i < 4; i++) {
    lines.push('│' + pad(row1[0][i], cellWidth) + '│' + pad(row1[1][i], cellWidth) + '│' + pad(row1[2][i], cellWidth) + '│');
  }

  // 第二行：震3 中5 兑7
  const row2 = [getGongDisplay(3), getGongDisplay(5), getGongDisplay(7)];
  lines.push('├' + '─'.repeat(cellWidth) + '┼' + '─'.repeat(cellWidth) + '┼' + '─'.repeat(cellWidth) + '┤');
  for (let i = 0; i < 4; i++) {
    lines.push('│' + pad(row2[0][i], cellWidth) + '│' + pad(row2[1][i], cellWidth) + '│' + pad(row2[2][i], cellWidth) + '│');
  }

  // 第三行：艮8 坎1 乾6
  const row3 = [getGongDisplay(8), getGongDisplay(1), getGongDisplay(6)];
  lines.push('├' + '─'.repeat(cellWidth) + '┼' + '─'.repeat(cellWidth) + '┼' + '─'.repeat(cellWidth) + '┤');
  for (let i = 0; i < 4; i++) {
    lines.push('│' + pad(row3[0][i], cellWidth) + '│' + pad(row3[1][i], cellWidth) + '│' + pad(row3[2][i], cellWidth) + '│');
  }

  lines.push('└' + '─'.repeat(cellWidth) + '┴' + '─'.repeat(cellWidth) + '┴' + '─'.repeat(cellWidth) + '┘');

  lines.push('```');

  return lines.join('\n');
}

/**
 * 获取宫位名称
 */
function getGongName(gong: GongWei): string {
  const names: Record<GongWei, string> = {
    1: '坎一',
    2: '坤二',
    3: '震三',
    4: '巽四',
    5: '中五',
    6: '乾六',
    7: '兑七',
    8: '艮八',
    9: '离九',
  };
  return names[gong];
}

// 导出辅助函数
export { renderJiuGongGrid, getGongName };

// ============= Phase 3: 用神分析 + 择日输出渲染 =============

import type {
  YongShenInfo,
  YongShenItem,
  YongShenAnalysis,
  ZhuKeAnalysis,
  NianMingInfo,
  ShenShaInfo,
  ZeRiResult,
  ShiLei,
} from '../services/qimen/types';

/**
 * 渲染带用神分析的奇门盘
 */
export function renderQimenYongShenText(result: QimenResult): string {
  const lines: string[] = [];

  // 首先渲染基础盘面
  lines.push(renderQimenText(result));

  // 如果有用神分析
  if (result.yongShen) {
    lines.push('');
    lines.push(renderYongShenText(result.yongShen));
  }

  // 如果各宫有神煞信息，单独汇总
  const allShenSha: ShenShaInfo[] = [];
  for (const gong of [1, 2, 3, 4, 5, 6, 7, 8, 9] as GongWei[]) {
    if (result.gongs[gong].shenSha) {
      allShenSha.push(...result.gongs[gong].shenSha!);
    }
  }
  if (allShenSha.length > 0) {
    lines.push('');
    lines.push(renderShenShaText(allShenSha));
  }

  return lines.join('\n');
}

/**
 * 渲染用神分析
 */
export function renderYongShenText(yongShen: YongShenInfo): string {
  const lines: string[] = [];

  lines.push('### 用神分析');
  lines.push('');
  lines.push(`**事类**：${yongShen.shiLei}`);
  lines.push('');

  // 主用神
  if (yongShen.zhuyong.length > 0) {
    lines.push('**主用神**：');
    for (const item of yongShen.zhuyong) {
      lines.push(`- ${item.name}：落${getGongName(item.gong)}（${item.state}）`);
    }
    lines.push('');
  }

  // 辅用神
  if (yongShen.fuyong.length > 0) {
    lines.push('**辅用神**：');
    for (const item of yongShen.fuyong) {
      lines.push(`- ${item.name}：落${getGongName(item.gong)}（${item.state}）`);
    }
    lines.push('');
  }

  // 用神详细分析
  if (yongShen.analysis.length > 0) {
    lines.push('**用神评分**：');
    lines.push('');
    lines.push('| 用神 | 落宫 | 评分 | 状态 |');
    lines.push('|:----:|:----:|:----:|:-----|');

    for (const a of yongShen.analysis) {
      const statusParts: string[] = [];
      if (a.isKong) statusParts.push('空亡');
      if (a.isRuMu) statusParts.push('入墓');
      if (a.isJiXing) statusParts.push('击刑');
      statusParts.push(`${a.relationToDay}日干`);
      if (a.geJuEffects.length > 0) {
        statusParts.push(a.geJuEffects.join('、'));
      }

      lines.push(`| ${a.yongshen} | ${getGongName(a.gong)} | ${a.score}分 | ${statusParts.join('、')} |`);
    }
    lines.push('');
  }

  // 主客分析
  if (yongShen.zhuKe) {
    lines.push('**主客分析**：');
    lines.push(`- 我方（日干）：落${getGongName(yongShen.zhuKe.zhu.gong)}（${yongShen.zhuKe.zhu.state}）`);
    lines.push(`- 对方（时干）：落${getGongName(yongShen.zhuKe.ke.gong)}（${yongShen.zhuKe.ke.state}）`);
    lines.push(`- 主客关系：${yongShen.zhuKe.relation}`);
    lines.push(`- 结论：${yongShen.zhuKe.summary}`);
    lines.push('');
  }

  // 年命分析
  if (yongShen.nianMing) {
    lines.push('**年命分析**：');
    lines.push(`- 年干${yongShen.nianMing.nianGan}落${getGongName(yongShen.nianMing.gong)}（${yongShen.nianMing.state}）`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 渲染神煞信息
 */
export function renderShenShaText(shenShaList: ShenShaInfo[]): string {
  const lines: string[] = [];

  lines.push('### 神煞信息');
  lines.push('');

  // 按吉凶分组
  const ji = shenShaList.filter(s => s.type === '吉');
  const xiong = shenShaList.filter(s => s.type === '凶');
  const zhongxing = shenShaList.filter(s => s.type === '中性');

  if (ji.length > 0) {
    lines.push('**吉神**：');
    for (const s of ji) {
      lines.push(`- ${s.name}：${getGongName(s.gong)}（${s.description}）`);
    }
    lines.push('');
  }

  if (xiong.length > 0) {
    lines.push('**凶煞**：');
    for (const s of xiong) {
      lines.push(`- ${s.name}：${getGongName(s.gong)}（${s.description}）`);
    }
    lines.push('');
  }

  if (zhongxing.length > 0) {
    lines.push('**中性**：');
    for (const s of zhongxing) {
      lines.push(`- ${s.name}：${getGongName(s.gong)}（${s.description}）`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 渲染择日结果
 */
export function renderQimenZeRiText(results: ZeRiResult[], shiLei: ShiLei): string {
  const lines: string[] = [];

  lines.push('## 奇门择日结果');
  lines.push('');
  lines.push(`**事类**：${shiLei}`);
  lines.push(`**推荐数量**：${results.length}`);
  lines.push('');

  if (results.length === 0) {
    lines.push('未找到符合条件的吉时。建议：');
    lines.push('- 扩大日期范围');
    lines.push('- 降低最小评分阈值');
    lines.push('- 减少过滤条件');
    return lines.join('\n');
  }

  // 概览表格
  lines.push('### 推荐时辰概览');
  lines.push('');
  lines.push('| 序号 | 日期时间 | 评分 | 评级 | 局数 |');
  lines.push('|:----:|:---------|:----:|:----:|:----:|');

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const dateStr = formatDateTime(r.datetime);
    lines.push(`| ${i + 1} | ${dateStr} | ${r.score.totalScore}分 | ${r.grade} | ${r.qimenResult.yinYangDun}${r.qimenResult.juShu}局 |`);
  }
  lines.push('');

  // 详细信息（前3个）
  const detailCount = Math.min(3, results.length);
  lines.push(`### 详细分析（前${detailCount}个）`);
  lines.push('');

  for (let i = 0; i < detailCount; i++) {
    const r = results[i];
    lines.push(`#### ${i + 1}. ${formatDateTime(r.datetime)}`);
    lines.push('');
    lines.push(`**评分**：${r.score.totalScore}分（${r.grade}）`);
    lines.push(`- 格局：${r.score.geJuScore}分`);
    lines.push(`- 用神：${r.score.yongShenScore}分`);
    lines.push(`- 神煞：${r.score.shenShaScore}分`);
    lines.push('');
    lines.push(`**推荐理由**：${r.score.recommendation}`);
    lines.push('');

    if (r.highlights.length > 0) {
      lines.push('**有利因素**：');
      for (const h of r.highlights) {
        lines.push(`- ✓ ${h}`);
      }
      lines.push('');
    }

    if (r.warnings.length > 0) {
      lines.push('**注意事项**：');
      for (const w of r.warnings) {
        lines.push(`- ✗ ${w}`);
      }
      lines.push('');
    }

    // 方位信息
    if (r.direction) {
      lines.push('**方位信息**：');
      if (r.direction.sanJiMen.length > 0) {
        lines.push('- 三吉门方位：' + r.direction.sanJiMen.map(m => `${m.men}门（${m.direction}）`).join('、'));
      }
      if (r.direction.yongShen.length > 0) {
        lines.push('- 用神方位：' + r.direction.yongShen.map(y => `${y.name}（${y.direction}）`).join('、'));
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 格式化日期时间
 */
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // 时辰名称
  const shiChenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const shiChenIdx = Math.floor((hour + 1) % 24 / 2);
  const shiChen = shiChenNames[shiChenIdx];

  return `${year}年${month}月${day}日 ${shiChen}时（${hour}:00）`;
}
