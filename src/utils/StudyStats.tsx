import { useEffect, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudyStats() {
  type WeeklyStat = { day: string; hours: number; words: number };
  
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [compareText, setCompareText] = useState("");
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.local.get([
      "weeklyStats",
      "studyStreak",
      "studyBadges",
      "lastWeekStats"
    ], (data) => {
      const stats = data.weeklyStats || DAYS.map(day => ({ day, hours: 0, words: 0 }));
      setWeeklyStats(stats);
      setStreak(data.studyStreak || 0);
      setBadges(data.studyBadges || []);
      // Compare to last week
      const lastWeek = data.lastWeekStats || DAYS.map(day => ({ day, hours: 0, words: 0 }));
    const totalThisWeek = stats.reduce((sum: number, s: WeeklyStat) => sum + s.hours, 0);
    const totalLastWeek = lastWeek.reduce((sum: number, s: WeeklyStat) => sum + s.hours, 0);
      if (totalThisWeek > totalLastWeek) {
        setCompareText(`You studied ${(totalThisWeek - totalLastWeek).toFixed(1)} hours more than last week 🎉`);
      } else if (totalThisWeek < totalLastWeek) {
        setCompareText(`You studied ${(totalLastWeek - totalThisWeek).toFixed(1)} hours less than last week.`);
      } else {
        setCompareText(`You studied the same as last week.`);
      }
      // Smart Insights
    const bestDay = stats.reduce((best: WeeklyStat, s: WeeklyStat) => s.hours > best.hours ? s : best, stats[0]);
    const avgSession = stats.reduce((sum: number, s: WeeklyStat) => sum + s.hours, 0) / 7;
      setInsights([
        `You study best on ${bestDay.day}s — keep it up!`,
        `Average focus session: ${(avgSession * 60).toFixed(0)} minutes.`,
      ]);
    });
  }, []);

  // Find best day for crown
  const bestDayIdx = weeklyStats.reduce((bestIdx, s, idx, arr) =>
    s.hours > arr[bestIdx].hours ? idx : bestIdx, 0);

  // SVG Bar Chart for hours studied
  const maxHours = Math.max(...weeklyStats.map(s => s.hours), 1);
  const maxWords = Math.max(...weeklyStats.map(s => s.words), 1);

  return (
    <div style={{
      width: 340,
      margin: "0 auto",
      padding: 18,
      fontFamily: "sans-serif",
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 12px rgba(16,185,129,0.07)",
      textAlign: "center"
    }}>
      <h2 style={{ color: "#2563eb", marginBottom: 18 }}>📊 Study Stats</h2>
      {/* Weekly Summary Chart */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Weekly Summary</div>
        <svg width={320} height={110}>
          {/* Hours studied bars */}
          {weeklyStats.map((s, i) => (
            <rect
              key={s.day}
              x={20 + i * 40}
              y={60 - (s.hours / maxHours) * 50}
              width={18}
              height={(s.hours / maxHours) * 50}
              fill={i === bestDayIdx ? "#f59e42" : "#2563eb"}
              rx={4}
            />
          ))}
          {/* Words written bars */}
          {weeklyStats.map((s, i) => (
            <rect
              key={s.day + "-words"}
              x={20 + i * 40 + 20}
              y={60 - (s.words / maxWords) * 50}
              width={18}
              height={(s.words / maxWords) * 50}
              fill="#10b981"
              rx={4}
              opacity={0.7}
            />
          ))}
          {/* Day labels */}
          {weeklyStats.map((s, i) => (
            <text
              key={s.day + "-label"}
              x={29 + i * 40}
              y={80}
              fontSize={13}
              textAnchor="middle"
              fill="#444"
            >
              {s.day}
            </text>
          ))}
          {/* Crown icon for best day */}
          <text
            x={29 + bestDayIdx * 40}
            y={40}
            fontSize={22}
            textAnchor="middle"
          >👑</text>
        </svg>
        <div style={{ fontSize: "0.95em", color: "#2563eb", marginTop: 6 }}>
          <span style={{ fontWeight: 600 }}>Blue:</span> Hours studied &nbsp;
          <span style={{ color: "#10b981", fontWeight: 600 }}>Green:</span> Words written
        </div>
      </div>
      {/* Best Day Highlight */}
      <div style={{ marginBottom: 12, fontWeight: 600, color: "#f59e42" }}>
        Best Day: {weeklyStats[bestDayIdx]?.day} <span style={{ fontSize: "1.2em" }}>👑</span>
      </div>
      {/* Study Streak */}
      <div style={{ fontWeight: 600, color: "#f59e42", marginBottom: 12 }}>
        🔥 {streak}-Day Study Streak
      </div>
      {/* Achievements & Badges */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Achievements & Badges 🏅</div>
        <div>
          {badges.length === 0 && <span style={{ color: "#888" }}>No badges yet.</span>}
          {badges.map(badge => (
            <span key={badge} style={{ marginRight: 8, fontSize: "1.2em" }}>{badge}</span>
          ))}
        </div>
      </div>
      {/* Compare to Last Week */}
      <div style={{ marginBottom: 12, color: "#11916c" }}>
        {compareText}
      </div>
      {/* Smart Insights */}
      <div style={{ marginBottom: 12, color: "#2563eb" }}>
        {insights.map((tip, idx) => (
          <div key={idx}>{tip}</div>
        ))}
      </div>
    </div>
  );
}