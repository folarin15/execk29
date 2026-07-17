import { useEffect, useState } from 'react';
import { studentService } from '../../services';
import type { Student } from '../../types';

export function MemberList() {
  const [members, setMembers] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getAll().then(setMembers).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.studentId.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  const exportCsv = () => {
    const header = 'Name,Student ID,Date of Birth,Status';
    const rows = members.map(m =>
      `"${m.name}","${m.studentId}","${m.dateOfBirth || ''}","${m.enrollmentStatus || 'active'}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'PhysioK29-Members.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-rounded animate-spin text-[#2a9d7f] text-[32px]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-['Fraunces',serif] font-[600] text-[#171b1a]">Members</h1>
          <p className="text-[13px] text-[#67706c] mt-1">{members.length} registered members</p>
        </div>
        <button onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-[500] text-white bg-[#2a9d7f] rounded-[10px] hover:bg-[#238b6e] transition-colors">
          <span className="material-symbols-rounded text-[16px]">download</span>
          Export CSV
        </button>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#67706c] material-symbols-rounded text-[18px]">search</span>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search members by name or ID..."
          className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-[#e3ddd0] rounded-[10px] focus:outline-none focus:border-[#2a9d7f] transition-colors"
        />
      </div>

      <div className="phys-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#f8f6ef] text-[#67706c] text-[11px] uppercase tracking-[0.5px]">
                <th className="text-left px-4 py-3 font-[500]">Name</th>
                <th className="text-left px-4 py-3 font-[500]">Student ID</th>
                <th className="text-left px-4 py-3 font-[500]">Date of Birth</th>
                <th className="text-center px-4 py-3 font-[500]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-t border-[#e3ddd0] hover:bg-[#f8f6ef] transition-colors">
                  <td className="px-4 py-3 font-[500] text-[#171b1a]">{m.name}</td>
                  <td className="px-4 py-3 text-[#67706c]">{m.studentId}</td>
                  <td className="px-4 py-3 text-[#67706c]">{m.dateOfBirth || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-[500] bg-[#e6f7f0] text-[#2a9d7f]">
                      {m.enrollmentStatus || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-[#67706c]">No members found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
