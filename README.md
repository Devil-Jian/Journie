# Journie

轻巧可爱的 Chrome 期刊分区查询小助手（v1.0.0）。

## 主要功能

- 支持期刊全名、简称、ISSN、eISSN 和关键词模糊搜索。
- 弹窗卡片直接显示四川大学分级、JCR 分区、中科院分区、CCF 等级、JIF（影响因子）。
- 每个结果提供「查看详情」链接，跳转爱科学期刊查询系统。
- 数据本地检索，无需登录；Chrome Manifest V3。

## 安装和使用

1. 从项目的安装包中取得插件文件并解压。
2. 进入 Chrome 的 `chrome://extensions/`（Edge 使用 `edge://extensions/`）。
3. 打开「开发者模式」，点击「加载已解压的扩展程序」。
4. 选择含 `manifest.json` 的 Journie 文件夹。
5. 固定工具栏图标，点击 Journie，输入期刊全名、简称或 ISSN。
6. 在结果卡片查看五项指标，点击「查看详情 ↗」跳转爱科学。

### 完整数据库如何安装？

**公开 GitHub 仓库不附带第三方 JCR、中科院、CCF 期刊整合数据库**，其公开再分发许可尚未核实。请在有合法使用权的前提下，将整合 JSON 保存为 `data/integrated_journals.json`，然后点击扩展管理页的「重新加载」。

仅从本仓库克隆源码，不会自动获得完整 23,556 条期刊数据；`data/example_journals.json` 只用于展示字段格式，并不是真实期刊信息。

### 如何查询？

例如输入：
- `IEEE Trans Image Process`
- `Medical Image Analysis`
- `1057-7149`

期刊卡片展示：名称、ISSN、川大、JCR、中科院、CCF、IF 以及爱科学查询链接。每次最多展示前 12 条结果，输入更完整关键词可缩小范围。指标显示「—」表示数据缺失或未匹配，不等于官方未收录。

## 数据格式

`data/integrated_journals.json` 使用一个包含 `metadata` 和 `journals` 数组的 JSON 对象。单条记录示例：

```json
{
  "name": "EXAMPLE JOURNAL",
  "abbreviation": "EXAMPLE J",
  "issn": "1234-5678",
  "eissn": "",
  "aliases": [],
  "issns": [],
  "school": {"grade": "B", "subject": "工程技术", "year": 2020},
  "jcr": [{"quartile": "Q1", "impact_factor": 3.0}],
  "cas": [{"major": "1", "is_top": false}],
  "ccf": [{"grade": "B"}]
}
```

以上仅为 JSON 格式示例，**全部评价数值均为虚构**。

## 数据源版本

| 体系 | 版本 | 备注 |
| --- | --- | --- |
| 四川大学 | 2020 年目录 | 后续可能更新 |
| JCR | 2026 版 | JIF 对应 2025 引文数据 |
| 中科院 | 2025 版 | 仅使用提供的大类分区 |
| CCF | 2026 版 | 此版本仅包含期刊，不包含会议 |

分区体系相互独立，不能直接互换；请以官方发布的数据和所在学校最新政策为准。

## 项目文件

- `manifest.json`：Manifest V3 插件清单（v1.0.0）
- `popup.html`：弹窗结构
- `popup.css`：灰白青蓝风格
- `popup.js`：本地搜索与结果卡片
- `icon16.png`、`icon48.png`、`icon128.png`：Journie 图标
- `data/example_journals.json`：数据格式示例
- `data/integrated_journals.json`：仅在有权使用的数据安装包中提供，不包含在公开仓库

## 版本记录

**v1.0.0**：首次正式发布，中文界面、四套分级、IF、模糊查询和爱科学跳转。

项目地址：https://github.com/Devil-Jian/Journie
