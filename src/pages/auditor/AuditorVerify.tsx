import { useState, useEffect } from 'react';
import { Card, Button, SearchBar, Badge, LoadingSkeleton, EmptyState, useToast } from '../../components/ui';
import { RoleGuard } from '../../permissions';
import { receiptService, studentService } from '../../services'; // Import studentService
import type { Receipt, Student } from '../../types'; // Import Student type
import { formatDate } from '../../utils/format';

export function AuditorVerify() {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [students, setStudents] = useState<Student[]>([]); // State for all students
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      receiptService.getAll(),
      studentService.getAll(), // Fetch all students
    ]).then(([recs, stus]) => {
      // Map studentDetails for existing receipts
      const receiptsWithDetails = recs.map(r => ({
        ...r,
        studentDetails: (r.studentIds || []).map(id => stus.find(s => s.id === id)).filter(Boolean) as Student[],
      }));
      setReceipts(receiptsWithDetails);
      setStudents(stus);
      setSelected(receiptsWithDetails.find(r => r.status === 'pending') || receiptsWithDetails[0] || null);
      setLoading(false);
    });
  }, []);

  const filtered = receipts.filter(r =>
    r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.purpose.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerify = async () => {
    if (!selected) return;
    setVerifying(true);
    try {
      const updated = await receiptService.verify(selected.id, 'Auditor');
      // Re-map studentDetails for the updated receipt
      const updatedWithDetails = { ...updated, studentDetails: (updated.studentIds || []).map(id => students.find(s => s.id === id)).filter(Boolean) as Student[] };
      setReceipts(prev => prev.map(r => r.id === updated.id ? updatedWithDetails : r));
      setSelected(updatedWithDetails);
      toast('Receipt verified successfully', 'success');
    } catch {
      toast('Verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <RoleGuard roles={['admin', 'auditor']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-['Fraunces',serif] text-[32px] font-[500] text-[#171b1f] mb-1">Verify Transactions</h1>
          <p className="text-[14px] text-[#67706c]">Review and verify receipt submissions. Read-only — no editing permitted.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar placeholder="Search receipt by ID or purpose..." onSearch={setSearch} className="w-full sm:max-w-md" />
        </div>

        {loading ? (
          <LoadingSkeleton lines={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="receipt_long" message={search ? 'No receipts match your search' : 'No receipts to verify'} description={search ? 'Try a different receipt ID or purpose.' : 'New receipts will appear here when submitted by the Treasurer.'} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {filtered.map(rec => (
                <Card
                  key={rec.id}
                  hover
                  padding="md"
                  className={`cursor-pointer ${selected?.id === rec.id ? 'ring-2 ring-[#2a9d7f]' : ''}`}
                  onClick={() => setSelected(rec)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[rgba(42,157,127,0.13)] flex items-center justify-center">
                        <span className="material-symbols-rounded text-[#2a9d7f] text-[18px]">receipt_long</span>
                      </div>
                      <div>
                        <p className="font-[500] text-[14px] text-[#171b1f]">{rec.receiptNumber} - {rec.purpose}</p>
                        <p className="text-[12px] text-[#67706c]">{rec.studentIds?.length || 0} students · {formatDate(rec.date)}</p>
                      </div>
                    </div>
                    <Badge variant={rec.status === 'verified' ? 'mint' : 'clay'}>
                      {rec.status === 'verified' ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              {selected && (
                <Card padding="lg" className="sticky top-6">
                  <div className="space-y-5">
                    <div>
                      <span className="text-[12px] font-[600] uppercase tracking-[0.5px] text-[#67706c]">TRANS-ID: {selected.receiptNumber}</span>
                      <h3 className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f]">{selected.purpose}, ₦{selected.amount.toLocaleString()}</h3>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-[600] uppercase tracking-[0.5px] ${selected.status === 'verified' ? 'bg-[rgba(42,157,127,0.13)] text-[#16735c]' : 'bg-[rgba(217,111,77,0.13)] text-[#d96f4d]'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {selected.status === 'verified' ? 'Verified' : 'Pending Verification'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <p className="text-[#67706c]">Uploaded By</p>
                        <p className="font-[500] text-[#171b1f]">{selected.uploadedBy}</p>
                      </div>
                      <div>
                        <p className="text-[#67706c]">Student Count</p>
                        <p className="font-[500] text-[#171b1f]">{selected.studentIds?.length || 0} students</p>
                      </div>
                      <div>
                        <p className="text-[#67706c]">Date Submitted</p>
                        <p className="font-[500] text-[#171b1f]">{formatDate(selected.date)}</p>
                      </div>
                      {selected.studentDetails && selected.studentDetails.length > 0 && (
                        <div>
                          <p className="text-[12px] font-[600] uppercase tracking-[0.5px] text-[#67706c] mb-2">Linked Students (Top 5)</p>
                          <div className="border border-[#e3ddd0] rounded-[10px] overflow-x-auto">
                            <table className="w-full text-[13px]">
                              <thead className="bg-[rgba(0,0,0,0.02)]">
                                <tr className="border-b border-[#e3ddd0]">
                                  <th className="px-3 py-2 text-left text-[11px] font-[600] uppercase text-[#67706c]">ID</th>
                                  <th className="px-3 py-2 text-left text-[11px] font-[600] uppercase text-[#67706c]">Name</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selected.studentDetails.slice(0, 5).map(s => (
                                  <tr key={s.id} className="border-b border-[#e3ddd0] last:border-0">
                                    <td className="px-3 py-2 text-[#67706c]">{s.matricNumber}</td>
                                    <td className="px-3 py-2">{s.fullName || s.name}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-[#67706c]">Verification Status</p>
                        <p className="italic text-[#67706c]">{selected.status === 'verified' ? `Verified by ${selected.verifiedBy || 'Auditor'}` : 'Awaiting auditor review'}</p>
                      </div>
                    </div>



                    {selected.status === 'pending' && (
                      <Button className="w-full" icon="verified" onClick={handleVerify} loading={verifying}>Verify Receipt</Button>
                    )}

                    <p className="text-[11px] text-center text-[#67706c]">Note: Verification is final. No edits permitted.</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {filtered.length > 0 && (
          <section>
            <h3 className="font-['Fraunces',serif] text-[18px] font-[500] text-[#171b1f] mb-3">Other Recent Submissions</h3>
            <div className="space-y-2">
              {filtered.slice(0, 3).map(rec => (
                <Card key={rec.id} padding="md" hover className="cursor-pointer" onClick={() => setSelected(rec)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(0,0,0,0.02)] flex items-center justify-center border border-[#e3ddd0]">
                      <span className="material-symbols-rounded text-[#67706c] text-[18px]">description</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-[500] text-[#171b1f]">#{rec.receiptNumber} - {rec.purpose}</p>
                      <p className="text-[12px] text-[#67706c]">{rec.studentIds?.length || 0} students · ₦{rec.amount.toLocaleString()} Total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[#67706c]">{formatDate(rec.date)}</p>
                      <Badge variant={rec.status === 'verified' ? 'mint' : 'clay'} dot>{rec.status === 'verified' ? 'Verified' : 'Pending'}</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </RoleGuard>
  );
}
