import { useEffect, useState } from 'react';
import { analyticsService } from '../../services';
import type { AnalyticsSummary, LeaderboardEntry, WeeklyActivity, EngagementRing, MemberStudyHistory } from '../../types';

export function StudyAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [engagement, setEngagement] = useState<EngagementRing | null>(null);
  const [history, setHistory] = useState<MemberStudyHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getSummary().then(setSummary),
      analyticsService.getLeaderboard().then(setLeaderboard),
      analyticsService.getWeeklyActivity(7).then(setWeeklyActivity),
      analyticsService.getEngagementRing().then(setEngagement),
    ]).finally(() => setLoading(false));
  }, []);

  const viewHistory = async (memberId: string) => {
    const h = await analyticsService.getMemberHistory(memberId);
    setHistory(h);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-rounded animate-spin text-[#2a9d7f] text-[32px]">progress_activity</span>
      </div>
    );
  }

  const maxActivity = Math.max(...weeklyActivity.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-['Fraunces',serif] font-[600] text-[#171b1a]">Study Analytics</h1>
        <p className="text-[13px] text-[#67706c] mt-1">Quiz, exam, and resource engagement data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Attempts', value: summary?.totalAttempts ?? 0 },
          { label: 'Average Score', value: `${summary?.avgPercent ?? 0}%` },
          { label: 'Unique Students', value: summary?.uniqueStudents ?? 0 },
          { label: 'Avg Duration', value: `${Math.floor((summary?.avgDuration ?? 0) / 60)}m ${(summary?.avgDuration ?? 0) % 60}s` },
        ].map(card => (
          <div key={card.label} className="phys-card p-4">
            <p className="phys-eyebrow">{card.label}</p>
            <p className="phys-metric mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Second row: Quizzes/Exams + Active Students */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Quizzes', value: summary?.totalQuizzes ?? 0 },
          { label: 'Exams', value: summary?.totalExams ?? 0 },
          { label: 'Active Today', value: summary?.activeToday ?? 0 },
          { label: 'Active This Week', value: summary?.activeWeek ?? 0 },
        ].map(card => (
          <div key={card.label} className="phys-card p-4">
            <p className="phys-eyebrow">{card.label}</p>
            <p className="phys-metric mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Activity Chart */}
        <div className="phys-card p-5">
          <h3 className="text-[15px] font-[500] text-[#171b1a] mb-4">Weekly Activity</h3>
          <div className="flex items-end gap-2 h-[120px]">
            {weeklyActivity.map(d => {
              const barH = Math.max((d.value / maxActivity) * 90, 4);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-[#67706c]">{d.value}</span>
                  <div
                    className="w-full rounded-t-[4px] bg-[#2a9d7f] transition-all"
                    style={{ height: `${barH}px` }}
                  />
                  <span className="text-[10px] text-[#67706c]">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engagement Ring */}
        <div className="phys-card p-5">
          <h3 className="text-[15px] font-[500] text-[#171b1a] mb-4">Resource Engagement</h3>
          {engagement && (
            <div className="flex items-center gap-6">
              <svg className="w-[120px] h-[120px] max-w-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#e3ddd0" strokeWidth="18" />
                {(() => {
                  const segments = [
                    { value: engagement.opened, color: '#5fa8d3' },
                    { value: engagement.reading, color: '#d8c74d' },
                    { value: engagement.done, color: '#2a9d7f' },
                  ];
                  let offset = 0;
                  const circumference = 2 * Math.PI * 45;
                  return segments.map((seg, i) => {
                    const length = (seg.value / engagement.total) * circumference;
                    const dash = offset === 0 ? `${length} ${circumference - length}` : `${length} ${circumference - offset - length}`;
                    const el = (
                      <circle key={i} cx="60" cy="60" r="45" fill="none" stroke={seg.color} strokeWidth="18"
                        strokeDasharray={dash}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'all 0.3s' }}
                      />
                    );
                    offset += length;
                    return el;
                  });
                })()}
                <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
                  className="text-[16px] font-[600]" fill="#171b1a">
                  {engagement.percentOpened}%
                </text>
              </svg>
              <div className="space-y-2">
                {[
                  { label: 'Opened', value: engagement.opened, color: '#5fa8d3' },
                  { label: 'Reading', value: engagement.reading, color: '#d8c74d' },
                  { label: 'Done', value: engagement.done, color: '#2a9d7f' },
                  { label: 'Not started', value: engagement.notStarted, color: '#e3ddd0' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 text-[12px]">
                    <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-[#67706c]">{s.label}</span>
                    <span className="font-[500] text-[#171b1a] ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="phys-card overflow-hidden">
        <div className="p-4 border-b border-[#e3ddd0]">
          <h3 className="text-[15px] font-[500] text-[#171b1a]">Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#f8f6ef] text-[#67706c] text-[11px] uppercase tracking-[0.5px]">
                <th className="text-left px-4 py-3 font-[500]">#</th>
                <th className="text-left px-4 py-3 font-[500]">Name</th>
                <th className="text-left px-4 py-3 font-[500]">Matric</th>
                <th className="text-center px-4 py-3 font-[500]">Attempts</th>
                <th className="text-center px-4 py-3 font-[500]">Avg %</th>
                <th className="text-center px-4 py-3 font-[500]">Streak</th>
                <th className="text-center px-4 py-3 font-[500]">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={entry.memberId} className="border-t border-[#e3ddd0] hover:bg-[#f8f6ef] transition-colors">
                  <td className="px-4 py-3 text-[#67706c]">{i + 1}</td>
                  <td className="px-4 py-3 font-[500] text-[#171b1a]">{entry.memberName}</td>
                  <td className="px-4 py-3 text-[#67706c]">{entry.matricNumber}</td>
                  <td className="px-4 py-3 text-center">{entry.attemptCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-[500] ${
                      entry.avgPercent >= 80 ? 'bg-[#e6f7f0] text-[#2a9d7f]' :
                      entry.avgPercent >= 50 ? 'bg-[#fef7e6] text-[#d8c74d]' :
                      'bg-[#fde8e8] text-[#d34a4a]'
                    }`}>
                      {entry.avgPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-[500]">{entry.streak}d</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => viewHistory(entry.memberId)}
                      className="text-[#2a9d7f] hover:underline text-[12px]"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-[#67706c]">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member History Panel */}
      {history && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setHistory(null)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="phys-card w-full max-w-md overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#e3ddd0] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-[500] text-[#171b1a]">{history.member.name}</h3>
                <p className="text-[12px] text-[#67706c]">{history.member.matricNumber} · {history.attempts.length} attempts · {history.streak}d streak</p>
              </div>
              <button onClick={() => setHistory(null)} className="p-2 hover:bg-[#f8f6ef] rounded-full">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {history.topics.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-[500] text-[#171b1a] mb-2">Topic Performance</h4>
                  <div className="space-y-1">
                    {history.topics.map(t => (
                      <div key={t.topic} className="flex items-center gap-3 text-[12px] p-2 rounded-lg bg-[#f8f6ef]">
                        <span className="flex-1 text-[#67706c]">{t.topic}</span>
                        <span className={`font-[500] ${
                          t.accuracy >= 80 ? 'text-[#2a9d7f]' : t.accuracy >= 50 ? 'text-[#d8c74d]' : 'text-[#d34a4a]'
                        }`}>{t.accuracy}%</span>
                        <span className="text-[#67706c]">{t.attempts} attempts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {history.attempts.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-[500] text-[#171b1a] mb-2">Recent Attempts</h4>
                  <div className="space-y-1">
                    {history.attempts.slice(0, 10).map(a => (
                      <div key={`${a.memberId}-${a.submittedAtMs}`} className="flex items-center gap-2 text-[12px] p-2 rounded-lg bg-[#f8f6ef]">
                        <span className="font-[500] text-[#171b1a]">{a.courseCode}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded ${
                          a.mode === 'exam' ? 'bg-[#fef7e6] text-[#d8c74d]' : 'bg-[#e6f7f0] text-[#2a9d7f]'
                        }`}>{a.mode}</span>
                        <span className="text-[#67706c]">{a.score}/{a.questionCount} ({a.percent}%)</span>
                        <span className="text-[#67706c] ml-auto">{new Date(a.submittedAtMs).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {history.attempts.length === 0 && (
                <p className="text-[13px] text-[#67706c] text-center py-8">No attempts found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
