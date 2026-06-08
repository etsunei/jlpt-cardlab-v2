"use client";

import { StudyCharts } from "@/components/dashboard-charts";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLearningStore } from "@/stores/learning-store";

export default function StatsPage() {
  const entries = useLearningStore((state) => state.entries);
  const review = useLearningStore((state) => state.review);
  const daily = useLearningStore((state) => state.daily);
  const mastered = Object.values(review).filter((item) => item.mastered).length;
  const lapses = Object.values(review).reduce((sum, item) => sum + item.lapses, 0);
  const reviewed = Object.keys(review).length;
  const forgetting = reviewed ? Math.round((lapses / Math.max(reviewed, 1)) * 100) : 0;

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">数据统计</h1>
        <p className="mt-2 text-sm text-muted-foreground">学习热力、每日学习量、掌握词数、遗忘率与等级进度。</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="学习天数" value={daily.length || 1} />
        <StatCard label="掌握词数" value={mastered} />
        <StatCard label="遗忘率" value={`${forgetting}%`} />
        <StatCard label="词库覆盖" value={entries.length} />
      </div>
      <StudyCharts />
      <Card>
        <CardHeader>
          <CardTitle>学习热力图</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {Array.from({ length: 84 }, (_, index) => {
              const value = daily[index % Math.max(daily.length, 1)]?.reviewed ?? index % 4;
              const opacity = Math.min(1, 0.2 + value * 0.18);
              return <div key={index} className="aspect-square rounded-sm bg-primary" style={{ opacity }} title={`${value} reviews`} />;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
