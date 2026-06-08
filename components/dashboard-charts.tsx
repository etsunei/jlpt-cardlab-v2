"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLearningStore } from "@/stores/learning-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StudyCharts() {
  const daily = useLearningStore((state) => state.daily);
  const entries = useLearningStore((state) => state.entries);
  const review = useLearningStore((state) => state.review);

  const fallback = Array.from({ length: 7 }, (_, index) => ({
    date: `D-${6 - index}`,
    learned: index % 3,
    reviewed: index + 2,
    correct: index + 1,
    total: index + 3
  }));
  const data = daily.length ? daily.slice(-14) : fallback;
  const levelData = ["N5", "N4", "N3", "N2", "N1"].map((level) => {
    const levelEntries = entries.filter((entry) => entry.jlpt_level === level);
    const mastered = levelEntries.filter((entry) => review[entry.id]?.mastered).length;
    return { level, mastered, total: levelEntries.length };
  });

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>每日学习量</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="learned" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reviewed" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>各等级进度</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="level" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="mastered" stroke="#14b8a6" strokeWidth={3} />
              <Line type="monotone" dataKey="total" stroke="#94a3b8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
