# 命盘 MCP Server

[![Version](https://img.shields.io/badge/version-0.1.2-blue.svg)](https://github.com/ChesterRa/mingpan)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)

**命盘（Mingpan）** 是一个中华传统术数 MCP 服务，为 Claude 等 AI 应用提供命理排盘与占卜起卦的计算能力。

## 特性

-  **MCP 原生**：无缝集成 Claude Desktop 及 Claude Code
- 🌏 **繁体中文输出**：符合传统术数的专业术语
- 📊 **结构化文本**：便于 AI 理解与分析的格式

## 配置方法

### Claude Desktop

找到配置文件并添加以下内容：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mingpan": {
      "command": "npx",
      "args": ["-y", "mingpan"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add mingpan -- npx -y mingpan
```

### 验证

配置完成后重启客户端，然后尝试：

> 请帮我排一个八字命盘，1992年4月12日7点30分，男性

## 工具列表

### 命理排盘

命理学基于出生时间推算人生运势，属于「命」的范畴。

#### 八字命理

| 工具 | 说明 |
|------|------|
| `bazi_basic` | 八字命盘排盘（四柱、藏干、十神、五行力量） |
| `bazi_dayun` | 大运列表（十年一运） |
| `bazi_liunian` | 流年列表（指定年份范围） |
| `bazi_liuyue` | 流月列表（节气月，立春起算） |
| `bazi_liuri` | 流日列表（指定月份内每日） |

#### 紫微斗数

| 工具 | 说明 |
|------|------|
| `ziwei_basic` | 紫微命盘排盘（十二宫、主星、辅星、四化） |
| `ziwei_daxian` | 大限列表（十年一限） |
| `ziwei_xiaoxian` | 小限列表（每年一宫） |
| `ziwei_liunian` | 流年列表（指定年份范围） |
| `ziwei_liuyue` | 流月列表（农历月） |
| `ziwei_liuri` | 流日列表（农历日） |

### 占卜起卦

占卜术基于起卦时间或随机数推演卦象，属于「卜」的范畴。

#### 六爻

| 工具 | 说明 |
|------|------|
| `liuyao_basic` | 六爻排盘（本卦/变卦、纳甲、六亲、六神、世应、旬空） |

六爻输入为六个爻值（自下而上）：
- 6 = 老阴（动爻，阴变阳）
- 7 = 少阳（静爻）
- 8 = 少阴（静爻）
- 9 = 老阳（动爻，阳变阴）

#### 梅花易数

| 工具 | 说明 |
|------|------|
| `meihua_basic` | 梅花易数排盘（本卦/变卦/互卦、体用分析） |

支持两种起卦方式：
- 时间起卦：根据农历年月日时计算
- 数字起卦：根据两个数字计算

#### 大六壬

| 工具 | 说明 |
|------|------|
| `daliuren_basic` | 大六壬排盘（天地盘、四课、三传、十二天将、神煞） |

大六壬为三式之首，需输入节气、农历月、日干支、时干支。

## 输入参数

### 命理工具（八字/紫微）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| year | number | ✓ | 出生年份（1900-2100） |
| month | number | ✓ | 出生月份（1-12） |
| day | number | ✓ | 出生日期（1-31） |
| hour | number | ✓ | 出生时辰（0-23） |
| minute | number | | 出生分钟（0-59），默认 0 |
| gender | string | ✓ | `male` / `female` |
| longitude | number | | 出生地经度，用于真太阳时校正 |
| isLunar | boolean | | 是否为农历输入，默认 false |

### 占卜工具（六爻/梅花/大六壬）

占卜工具使用起卦时间而非出生时间，具体参数请参考各工具说明。

## 月份基准说明

| 系统 | 月份基准 | 日期基准 |
|------|----------|----------|
| 八字 | 节气月（立春起算） | 公历日 |
| 紫微 | 农历月（初一起算） | 农历日 |

## 开发

```bash
git clone https://github.com/ChesterRa/mingpan.git
cd mingpan
npm install
npm run build
npm run dev  # 监听变化
```

## 依赖

| 库 | 用途 |
|------|------|
| `@modelcontextprotocol/sdk` | MCP 协议实现 |
| `lunar-javascript` | 农历/公历转换 |
| `iztro` | 紫微斗数计算引擎 |
| `zod` | 输入参数校验 |

## 路线图

- [x] 八字基础排盘与时运列表
- [x] 紫微基础排盘与时运列表
- [x] 六爻排盘
- [x] 梅花易数排盘
- [x] 大六壬排盘
- [ ] 奇门遁甲

## 许可证

Apache License 2.0
