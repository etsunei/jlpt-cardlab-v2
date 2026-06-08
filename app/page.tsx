"use client";

import Link from "next/link";
import { ArrowRight, Flame, Layers, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { StudyCharts } from "@/components/dashboard-charts";
import { useLearningStore } from "@/stores/learning-store";

export default function HomePage() {
  const entries = useLearningStore((state) => state.entries);
  const review = useLearningStore((state) => state.review);
  const daily = useLearningStore((state) => state.daily);
  const mastered = Object.values(review).filter((item) => item.mastered).length;
  const today = daily.at(-1);
  const completion = today?.total ? Math.round((today.correct / today.total) * 100) : 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <p className="text-sm font-medium text-primary">社区词库 + 间隔重复 + 测验强化</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">JLPT CardLab</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            用统一词库、SM-2 复习、听力与拼写测验，把 N5 到 N1 的单词学习压进每天可完成的小任务。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/learn">
                开始学习 <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/library">导入词库</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>今日任务</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div className="flex items-center gap-3">
                <Flame className="text-amber-500" />
                <span className="font-medium">Streak</span>
              </div>
              <span className="text-2xl font-semibold">1</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">新词</p>
                <p className="mt-1 text-2xl font-semibold">12</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">复习</p>
                <p className="mt-1 text-2xl font-semibold">{Object.keys(review).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="累计词条" value={entries.length} detail="可由 CSV / JSON 扩展" />
        <StatCard label="掌握词数" value={mastered} detail="复习间隔大于 21 天" />
        <StatCard label="今日完成率" value={`${completion}%`} detail="按正确率估算" />
        <StatCard label="遗忘率" value={`${Math.max(0, 100 - completion)}%`} detail="Again 会自动强化" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          { icon: Layers, title: "统一词库", text: "支持 GitHub 开源词库、CSV、JSON，字段归一化后进入学习系统。" },
          { icon: Target, title: "智能复习", text: "Again / Hard / Good / Easy 会更新下一次复习时间。" },
          { icon: Trophy, title: "JLPT 模拟", text: "按等级随机抽题，统计正确率并优先强化错词。" }
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="p-5">
              <item.icon className="text-primary" />
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <StudyCharts />
    </div>
  );
}
