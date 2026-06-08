"use client";

import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseVocabFile, exportAnkiTsv } from "@/lib/vocab";
import { useLearningStore } from "@/stores/learning-store";

export default function LibraryPage() {
  const entries = useLearningStore((state) => state.entries);
  const upsertEntries = useLearningStore((state) => state.upsertEntries);
  const [message, setMessage] = useState("");

  async function importFile(file: File) {
    const text = await file.text();
    const type = file.name.toLowerCase().endsWith(".json") ? "json" : "csv";
    const parsed = parseVocabFile(text, type);
    upsertEntries(parsed);
    setMessage(`已导入 ${parsed.length} 个词条。`);
  }

  function downloadAnki() {
    const blob = new Blob([exportAnkiTsv(entries)], { type: "text/tab-separated-values;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jlpt-cardlab-anki.tsv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 pb-20 lg:grid-cols-[1fr_0.9fr] lg:pb-0">
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">词库</h1>
          <p className="mt-2 text-sm text-muted-foreground">导入 CSV / JSON，统一为项目字段；公开资源不标记为官方词库。</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>导入词库</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept=".csv,.json" onChange={(event) => event.target.files?.[0] && importFile(event.target.files[0])} />
            <div className="flex flex-wrap gap-2">
              <Button>
                <Upload size={18} /> 上传到 Supabase
              </Button>
              <Button variant="outline" onClick={downloadAnki}>
                <Download size={18} /> 导出 Anki
              </Button>
            </div>
            {message ? <p className="text-sm text-primary">{message}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>公开来源策略</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>优先导入 GitHub 开源 JLPT 数据集、Tanos/JLPT Lab 等社区整理资源，导入时记录 source 字段。</p>
            <p>由于 JLPT 官方不公开正式词汇表，页面和数据库都保留数据来源说明，不宣称官方覆盖。</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>统一结构</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs leading-6">
{`{
  "word": "",
  "reading": "",
  "meaning_cn": "",
  "meaning_en": "",
  "jlpt_level": "",
  "example": "",
  "audio": "",
  "tags": []
}`}
          </pre>
          <p className="mt-4 text-sm text-muted-foreground">当前本地词条：{entries.length}</p>
        </CardContent>
      </Card>
    </div>
  );
}
