/**
 * 六爻盤面文本渲染器
 * 
 * 輸出格式：Markdown 純文本
 * 語言：繁體中文
 */

import { LiuyaoResult, WangShuaiState } from '../services/liuyao/types';

/** 爻位名稱（自下而上） */
const YAO_POSITION_NAMES = ['初', '二', '三', '四', '五', '上'];

/** 六親簡稱 */
const LIUQIN_SHORT: Record<string, string> = {
  '父母': '父',
  '兄弟': '兄',
  '子孫': '子',
  '妻財': '財',
  '官鬼': '官',
};

/** 旺衰簡稱 */
const WANGSHUAI_SHORT: Record<WangShuaiState, string> = {
  '旺': '旺',
  '相': '相',
  '休': '休',
  '囚': '囚',
  '死': '死',
};

/**
 * 渲染六爻盤面為 Markdown 文本
 */
export function renderLiuyaoText(result: LiuyaoResult): string {
  const lines: string[] = [];

  // 標題
  lines.push('## 六爻排盤');
  lines.push('');

  // 時間信息
  lines.push(`**起卦時間**：${result.timeInfo.solarDate} ${getShiChen(result.timeInfo.hourGanZhi)}`);
  lines.push(`**日干支**：${result.timeInfo.dayGanZhi}日 | **月建**：${result.timeInfo.monthBranch}月 | **旬空**：${result.timeInfo.xunKong.join('')}`);
  lines.push('');

  // 卦名
  const guaTitle = result.bianGua
    ? `**本卦**：${result.benGua.name}（${result.benGua.gong}宮）→ **變卦**：${result.bianGua.name}`
    : `**本卦**：${result.benGua.name}（${result.benGua.gong}宮）`;
  lines.push(guaTitle);

  // 特殊卦標記
  const specialMarks: string[] = [];
  if (result.benGua.isYouHun) specialMarks.push('遊魂卦');
  if (result.benGua.isGuiHun) specialMarks.push('歸魂卦');
  if (specialMarks.length > 0) {
    lines.push(`*${specialMarks.join('、')}*`);
  }
  lines.push('');

  // 爻位表格（增加旺衰列）
  lines.push('| 爻位 | 本卦 | 變卦 | 六親 | 六神 | 納甲 | 月/日 |');
  lines.push('|:----:|:----:|:----:|:----:|:----:|:----:|:-----:|');

  // 從上爻到初爻（倒序顯示）
  for (let i = 5; i >= 0; i--) {
    const yao = result.yaoList[i];
    const posName = YAO_POSITION_NAMES[i];
    
    // 本卦爻象
    const benYaoSymbol = getYaoSymbol(yao.yinYang === '陽', yao.isMoving);
    
    // 變卦爻象
    let bianYaoSymbol = '';
    if (result.bianGua) {
      if (yao.isMoving) {
        bianYaoSymbol = getYaoSymbol(yao.changedYinYang === '陽', false);
      } else {
        bianYaoSymbol = getYaoSymbol(yao.yinYang === '陽', false);
      }
    }
    
    // 六親（含進退神標記）
    let liuQin = LIUQIN_SHORT[yao.liuQin] || yao.liuQin;
    if (yao.jinTuiShen) {
      liuQin += yao.jinTuiShen === '進神' ? '↑' : '↓';
    }
    
    // 納甲（含變爻）
    let naJiaStr = `${yao.naJia}${yao.naJiaWuXing}`;
    if (yao.isMoving && yao.changedNaJia) {
      naJiaStr += `→${yao.changedNaJia}`;
    }
    
    // 旺衰
    const wangShuaiStr = yao.wangShuaiByMonth && yao.wangShuaiByDay
      ? `${WANGSHUAI_SHORT[yao.wangShuaiByMonth]}/${WANGSHUAI_SHORT[yao.wangShuaiByDay]}`
      : '';
    
    // 世應標記
    let posDisplay = posName;
    if (yao.isShiYao) posDisplay += '世';
    if (yao.isYingYao) posDisplay += '應';
    
    lines.push(`| ${posDisplay} | ${benYaoSymbol} | ${bianYaoSymbol} | ${liuQin} | ${yao.liuShen} | ${naJiaStr} | ${wangShuaiStr} |`);
  }

  lines.push('');

  // 世應位置
  lines.push(`**世爻**：${YAO_POSITION_NAMES[result.benGua.shiYaoPosition - 1]}爻 | **應爻**：${YAO_POSITION_NAMES[result.benGua.yingYaoPosition - 1]}爻`);

  // 動爻信息（含進退神）
  if (result.movingYaoPositions.length > 0) {
    const movingDetails = result.movingYaoPositions.map(p => {
      const yao = result.yaoList[p - 1];
      let str = YAO_POSITION_NAMES[p - 1] + '爻';
      if (yao.jinTuiShen) {
        str += `(${yao.jinTuiShen})`;
      }
      return str;
    });
    lines.push(`**動爻**：${movingDetails.join('、')}`);
  }

  // 伏神信息
  if (result.fuShenList && result.fuShenList.length > 0) {
    lines.push('');
    lines.push('**伏神**：');
    for (const fuShen of result.fuShenList) {
      const posName = YAO_POSITION_NAMES[fuShen.position - 1];
      const wangShuai = fuShen.wangShuaiByMonth && fuShen.wangShuaiByDay
        ? `(${fuShen.wangShuaiByMonth}/${fuShen.wangShuaiByDay})`
        : '';
      lines.push(`- ${fuShen.liuQin}：${fuShen.diZhi}${fuShen.wuXing}${wangShuai} 伏於${posName}爻${fuShen.feiShenDiZhi}${fuShen.feiShenWuXing}下（${fuShen.relation}）`);
    }
  }

  return lines.join('\n');
}

/**
 * 獲取爻象符號
 */
function getYaoSymbol(isYang: boolean, isMoving: boolean): string {
  if (isYang) {
    return isMoving ? '▅▅▅○' : '▅▅▅';
  } else {
    return isMoving ? '▅ ▅×' : '▅ ▅';
  }
}

/**
 * 獲取時辰名稱
 */
function getShiChen(hourGanZhi: string): string {
  const branch = hourGanZhi.charAt(1);
  const SHICHEN_NAMES: Record<string, string> = {
    '子': '子時', '丑': '丑時', '寅': '寅時', '卯': '卯時',
    '辰': '辰時', '巳': '巳時', '午': '午時', '未': '未時',
    '申': '申時', '酉': '酉時', '戌': '戌時', '亥': '亥時',
  };
  return SHICHEN_NAMES[branch] || hourGanZhi;
}
