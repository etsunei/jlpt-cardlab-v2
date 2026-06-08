# JLPT CardLab

一个现代化的 JLPT 日语单词学习平台原型，产品方向参考 Anki、Mochi Cards、Quizlet、Notion 和 Duolingo。

## 功能

- N5 到 N1 分级浏览、搜索、收藏、重点标记、词性筛选
- 统一词库结构，支持 CSV / JSON 导入
- SM-2 风格间隔重复复习：Again / Hard / Good / Easy
- 每日新词、复习任务、Streak、完成率、掌握词数
- 选择题、拼写题、听力题、JLPT 模拟模式
- 学习热力图、每日学习量、掌握进度、遗忘率、等级进度
- Supabase Auth：邮箱、Google、GitHub
- PWA：manifest、service worker、本地缓存
- AI 例句/解释/近义词 API 预留
- Anki TSV 导出

## 数据声明

JLPT 官方没有公布正式词汇表。本项目的数据源定位为公开 JLPT 词库、历史考试整理词库、社区维护词库与 GitHub 开源数据集，不声称为官方词库。

参考公开来源包括：

- JLPT Lab Vocabulary: https://jlptlab.com/vocabularies
- Tanos JLPT Resources: https://www.tanos.co.uk/jlpt/skills/vocab/
- Open Anki JLPT Decks / AnkiWeb: https://ankiweb.net/shared/info/135014526
- GitHub JLPT datasets topic: https://github.com/topics/jlpt-n5
- JMdict/EDICT dictionary project: https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project

## 开发

```bash
npm install
npm run dev
```

复制 `.env.example` 为 `.env.local` 并填入 Supabase 配置即可启用云端数据与 OAuth。

## 部署到 Vercel

本项目已包含 `vercel.json`，Vercel 会按 Next.js 项目自动部署：

1. 上传项目到 GitHub
2. 在 Vercel 导入 GitHub 仓库
3. Framework Preset 选择或保持 `Next.js`
4. Build Command 使用 `npm run build`
5. Install Command 使用 `npm install`
6. 点击 Deploy

手机访问 Vercel 生成的网址后，可以通过浏览器添加到主屏幕作为 PWA 使用。

## Supabase

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`
2. Auth Providers 中启用 Google 和 GitHub
3. 将回调地址设置为你的域名或 `http://localhost:3000/auth/callback`

## 导入词库

CSV / JSON 字段会归一化为：

```json
{
  "word": "",
  "reading": "",
  "meaning_cn": "",
  "meaning_en": "",
  "jlpt_level": "",
  "example": "",
  "audio": "",
  "tags": []
}
```

本地脚本：

```bash
npm run import:vocab -- ./data/sample-vocab.json
```
