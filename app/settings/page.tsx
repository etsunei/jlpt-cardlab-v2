"use client";

import { Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowser } from "@/lib/supabase";

export default function SettingsPage() {
  async function oauth(provider: "google" | "github") {
    const supabase = createSupabaseBrowser();
    if (!supabase) {
      alert("请先在 .env.local 配置 Supabase。");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
  }

  return (
    <div className="grid gap-5 pb-20 lg:grid-cols-2 lg:pb-0">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">设置</h1>
        <p className="mt-2 text-sm text-muted-foreground">连接账户、同步学习记录、开启 PWA 离线学习。</p>
      </div>
      <Card className="lg:col-start-1">
        <CardHeader>
          <CardTitle>用户系统</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline" onClick={() => oauth("google")}>
            <Mail size={18} /> Google 登录
          </Button>
          <Button className="w-full justify-start" variant="outline" onClick={() => oauth("github")}>
            <Github size={18} /> GitHub 登录
          </Button>
          <p className="text-sm text-muted-foreground">登录后可将学习记录、收藏、复习计划保存到 Supabase PostgreSQL。</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI 功能</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>API 已预留：AI 例句生成、AI 单词解释、AI 近义词对比。</p>
          <p>配置 `OPENAI_API_KEY` 后可在服务端路由中接入模型调用。</p>
        </CardContent>
      </Card>
    </div>
  );
}
