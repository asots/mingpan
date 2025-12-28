# Tasks: Extend GeJu Patterns Recognition

## Task List

### Phase 1: Fan Yin Patterns (反吟格局)

- [x] **1.1** 实现 `checkFanYinGeJu()` 方法
  - 检测天地反吟（天盘地盘相冲）
  - 检测星反吟（值符星落对宫）
  - 检测门反吟（值使门落对宫）
  - 添加宫位冲对映射表（1↔9, 3↔7, 4↔6, 2↔8）

- [x] **1.2** 编写 Fan Yin 单元测试
  - 测试天地反吟识别
  - 测试星门反吟识别
  - 测试边界情况（中宫处理）

### Phase 2: Qi Yi Xiang He Patterns (奇仪相合)

- [x] **2.1** 实现 `checkQiYiXiangHeGeJu()` 方法
  - 乙庚合检测
  - 丙辛合检测
  - 丁壬合检测
  - 戊癸合检测
  - 己甲合检测（甲遁六仪特殊处理）

- [x] **2.2** 编写 Qi Yi Xiang He 单元测试
  - 测试五种相合格局
  - 测试天盘地盘双向匹配

### Phase 3: Fei Gan / Fu Gan Patterns (飞干格/伏干格)

- [x] **3.1** 实现 `checkFeiGanFuGanGeJu()` 方法
  - 飞干格：时干天盘落日干地盘宫
  - 伏干格：日干天盘落时干地盘宫
  - 需要传入 dayGan 和 hourGan 参数

- [x] **3.2** 编写 Fei Gan / Fu Gan 单元测试
  - 测试飞干格识别
  - 测试伏干格识别

### Phase 4: Tian Xian Shi Pattern (天显时格)

- [x] **4.1** 实现 `checkTianXianShiGeJu()` 方法
  - 添加时支-宫位映射表
  - 检测三奇落时支宫位且逢吉门

- [x] **4.2** 编写 Tian Xian Shi 单元测试
  - 测试各时支的正确映射
  - 测试格局组合条件

### Phase 5: Di Si Men Pattern (地私门格)

- [x] **5.1** 实现 `checkDiSiMenGeJu()` 方法
  - 检测六仪落时支宫位且逢凶门

- [x] **5.2** 编写 Di Si Men 单元测试

### Phase 6: Wang Gai Patterns (网盖格)

- [x] **6.1** 实现 `checkWangGaiGeJu()` 方法
  - 天网四张：戊落乾宫逢死/惊门
  - 地网盖：癸落巽宫受制

- [x] **6.2** 编写 Wang Gai 单元测试

### Phase 7: Tian Lao Pattern (天牢格)

- [x] **7.1** 实现 `checkTianLaoGeJu()` 方法
  - 庚+开门+白虎组合
  - 庚+杜门组合变体

- [x] **7.2** 编写 Tian Lao 单元测试

### Phase 8: Interface Update (前置任务)

- [x] **8.1** 修改 `GeJuCalculator.calculate()` 签名，增加 `hourZhi: DiZhi` 参数
- [x] **8.2** 修改 `QimenService.ts` 调用，传入 `siZhu.hourZhi`
- [x] **8.3** 更新现有测试用例适配新签名

### Phase 9: Integration

- [x] **9.1** 更新 `calculate()` 方法调用新增的检查方法
- [x] **9.2** 运行完整测试套件确保无回归
- [x] **9.3** 更新 GeJuCalculator.test.ts 测试文件

## Dependencies

- **Phase 8 (接口修改) 必须最先完成**
- Task 1-7 可并行开发，但依赖 Phase 8 完成
- Phase 9 依赖 Task 1-7 全部完成

### Phase 10: Code Review Fixes (代码审查修复)

- [x] **10.1** 修复甲干映射问题
  - 甲遁于六仪，需使用 `getLiuYiGan(xunShou)` 获取对应六仪
  - 修改 `checkFeiGanFuGanGeJu()` 接受 `xunShou` 参数

- [x] **10.2** 优化天牢格描述
  - 天牢与白虎猖狂同条件触发时，侧重不同含义
  - 天牢：主官司牢狱、禁锢之象
  - 白虎猖狂：主凶暴、攻击之象

- [x] **10.3** 修正天地反吟传统定义
  - 传统定义：某宫天盘干 = 对冲宫地盘干
  - 即天盘干落到地盘干对冲位置

- [x] **10.4** 修复测试用例
  - 飞干格/伏干格测试用例使用了不存在的"甲"干
  - 改用三奇（丙、丁）作为测试干支

### Phase 11: Deep Review Fixes (深度审查修复)

- [x] **11.1** 移除己甲合检测
  - 甲遁于六仪，不会出现在盘面上
  - 从 GAN_HE_MAP 中移除甲己映射
  - 删除不可能触发的己甲合测试用例

- [x] **11.2** 清理入墓格局
  - 移除无效的"甲"入墓映射
  - 补充"己"入墓映射（己属土，墓在戌/乾宫）

- [x] **11.3** 清理未使用的导入
  - 移除 JiuXing 类型导入
  - 移除 GONG_WUXING, TIAN_GAN_WUXING, BA_MEN_GONG, JIU_XING_GONG

### Phase 12: Final Review Fixes (最终审查修复)

- [x] **12.1** 修复入墓格局宫位映射错误
  - 庚辛墓位从坤2宫改为艮8宫（金墓在丑，丑在艮宫）
  - 添加五行墓库注释说明

- [x] **12.2** 清理未使用的方法参数
  - 移除 checkMenPoGeJu 中未使用的 yinYangDun 参数

### Phase 13: Traditional Wuxing Fix (传统五行墓库修复)

- [x] **13.1** 修正乙木入墓位置
  - 采用传统五行墓库规则（源于《五行大义》）
  - 乙木墓从乾6宫（戌）改为坤2宫（未）
  - 木墓未，火土墓戌，金墓丑，水墓辰

### Phase 14: Liu Yi Ji Xing Fix (六仪击刑修复)

- [x] **14.1** 修正六仪击刑宫位映射
  - 基于《神奇之门》和地支三刑规则
  - 六仪对应旬首：戊(甲子)、己(甲戌)、庚(甲申)、辛(甲午)、壬(甲辰)、癸(甲寅)
  - 三刑规则：子刑卯、寅巳申三刑、丑戌未三刑、辰午酉亥自刑
  - 修正己从艮8改为坤2（戌刑未）
  - 修正庚从坎1改为艮8（申刑寅）
  - 修正壬从坤2改为巽4（辰自刑）
  - 修正癸从艮8改为巽4（寅刑巳）

### Phase 15: Wu Bu Yu Shi Fix (五不遇时修复)

- [x] **15.1** 修正五不遇时判断逻辑
  - 原错误："日干克时干"
  - 正确："时干克日干"（同性相克）
  - 口诀：甲日庚时、乙日辛时、丙日壬时、丁日癸时、戊日甲时、
          己日乙时、庚日丙时、辛日丁时、壬日戊时、癸日己时

- [x] **15.2** 更新五不遇时测试用例
  - 添加正例：甲日庚时、丙日壬时、庚日丙时
  - 添加反例：甲日戊时（日克时）、甲日辛时（异性相克）

## Validation

- [x] `npm test` 全部通过 (544 tests passed)
- [x] 新增格局测试覆盖率 100%
- [x] 使用真实案例验证准确性
- [x] 代码审查问题已修复
- [x] 深度审查问题已修复
