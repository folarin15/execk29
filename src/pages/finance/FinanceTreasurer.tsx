import { useState, useEffect } from 'react';
import { Card, Button, Input, SearchBar, EmptyState, LoadingSkeleton, UnifiedUploader, useToast, DataTable } from '../../components/ui';
import type { Column } from '../../components/ui/DataTable';
import { RoleGuard } from '../../permissions';
import { receiptService, studentService } from '../../services';
import type { Receipt, Student } from '../../types';
import { formatDate } from '../../utils/format';

export function FinanceTreasurer() {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [form, setForm] = useState({ receiptNumber: '', purpose: '', amount: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([receiptService.getAll(), studentService.getAll()]).then(([recs, stus]) => {
      // Map studentDetails for existing receipts
      const receiptsWithDetails = recs.map(r => ({ ...r, studentDetails: (r.studentIds || []).map(id => stus.find(s => s.id === id)).filter(Boolean) as Student[] }));
      setReceipts(receiptsWithDetails);
      setStudents(stus);
      setLoading(false);
    });
  }, []);

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.matricNumber.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!form.receiptNumber || !form.purpose || !form.amount || selectedStudentIds.length === 0) {
      toast('Please fill all fields and select students', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const newRec = await receiptService.upload({
        receiptNumber: form.receiptNumber,
        purpose: form.purpose,
        amount: Number(form.amount),
        date: form.date || new Date().toISOString().split('T')[0],
        uploadedBy: 'Treasurer',
        uploaderRole: 'treasurer',
        studentIds: selectedStudentIds,
      });
      // Add studentDetails to the new receipt for local display
      const newRecWithDetails = { ...newRec, studentDetails: selectedStudentIds.map(id => students.find(s => s.id === id)).filter(Boolean) as Student[] };
      setReceipts(prev => [newRecWithDetails, ...prev]);
      setForm({ receiptNumber: '', purpose: '', amount: '', date: '' });
      setSelectedStudentIds([]);
      toast('Receipt submitted for verification', 'success');
    } catch {
      toast('Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const recColumns: Column<Receipt>[] = [
    { key: 'receiptNumber', header: 'Receipt #', render: (r: Receipt) => <span className="font-[500] text-[#171b1f]">{r.receiptNumber}</span> },
    { key: 'purpose', header: 'Purpose' },
    { key: 'studentIds', header: 'Students', render: (r: Receipt) => (
      <div className="flex items-center gap-2">
        <span className="bg-[rgba(42,157,127,0.13)] text-[#16735c] text-[11px] px-2 py-0.5 rounded-full font-[600]">{r.studentIds?.length || 0}</span>
        <span className="text-[13px] text-[#67706c]">{r.studentDetails?.slice(0, 2).map(s => s.fullName).join(', ')}{((r.studentIds?.length || 0) > 2) ? ', +' + ((r.studentIds?.length || 0) - 2) : ''}</span>
      </div>
    )},
    { key: 'date', header: 'Date', render: (r: Receipt) => <span className="text-[#67706c] text-[13px]">{formatDate(r.date)}</span> },
    { key: 'status', header: '', align: 'right', render: (r: Receipt) => (
      <div className="flex gap-2 justify-end">
        <button className="w-9 h-9 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] cursor-pointer border-none">
          <span className="material-symbols-rounded text-[#67706c] text-[20px] md:text-[18px]">visibility</span>
        </button>
        <button className="w-9 h-9 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.03)] cursor-pointer border-none">
          <span className="material-symbols-rounded text-[#67706c] text-[20px] md:text-[18px]">download</span>
        </button>
      </div>
    )},
  ];

  return (
    <RoleGuard roles={['admin', 'treasurer']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-['Fraunces',serif] text-[32px] font-[500] text-[#171b1f] mb-1">Upload Receipt</h1>
          <p className="text-[14px] text-[#67706c]">Centralised financial reconciliation. Attach proof of payment and assign students.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            <Card padding="lg">
              <h3 className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f] mb-5">Receipt Details</h3>
              <div className="space-y-4">
                <UnifiedUploader
                  config={{ label: 'Upload receipt (PDF or image)', hint: 'Maximum 10MB', accept: '.pdf,.jpg,.jpeg,.png', maxSizeMB: 10 }}
                  onFile={() => {}}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Receipt Number" placeholder="e.g. REC-99021" value={form.receiptNumber} onChange={e => setForm(prev => ({ ...prev, receiptNumber: e.target.value }))} />
                  <Input label="Date" type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <Input label="Payment Purpose" placeholder="e.g. Annual Tuition Fee" value={form.purpose} onChange={e => setForm(prev => ({ ...prev, purpose: e.target.value }))} />
                <Input label="Amount (per student)" type="number" placeholder="0.00" icon="payments" value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))} />
              </div>
            </Card>
            <div className="flex justify-end">
              <Button icon="send" onClick={handleSubmit} loading={submitting}>Submit Receipt</Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card padding="lg" className="h-full flex flex-col">
              <h3 className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f] mb-4">Assign Students</h3>
              <SearchBar placeholder="Search student..." onSearch={setSearchStudent} className="mb-4" />
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-[600] uppercase tracking-[0.5px] text-[#67706c]">Class List</span>
                <span className="text-[12px] font-[600] text-[#2a9d7f]">{selectedStudentIds.length} Selected</span>
              </div>
              <div className="flex-1 border border-[#e3ddd0] rounded-[10px] overflow-y-auto max-h-[40vh]">
                {filteredStudents.length === 0 ? (
                  <EmptyState icon="search" message={searchStudent ? 'No students match your search' : 'No students available'} description={searchStudent ? 'Try a different ID or name.' : 'Student records will appear here.'} />
                ) : (
                  <div className="p-1.5 space-y-0.5">
                    {filteredStudents.map(s => (
                      <label key={s.id} className={`flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.03)] ${selectedStudentIds.includes(s.id) ? 'bg-[rgba(42,157,127,0.13)]' : ''}`}>
                        <input type="checkbox" checked={selectedStudentIds.includes(s.id)} onChange={() => toggleStudent(s.id)} className="w-4 h-4 rounded border-[#e3ddd0] text-[#2a9d7f] focus:ring-[#2a9d7f]" />
                        <span className="text-[14px] text-[#171b1f]">{s.fullName || s.name}</span>
                        <span className="ml-auto text-[12px] text-[#67706c]">{s.matricNumber}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f]">Recent Receipts</h3>
            <Button variant="secondary" size="sm">View All History</Button>
          </div>
          <Card padding="sm">
            {loading ? (
              <LoadingSkeleton lines={3} />
            ) : receipts.length === 0 ? (
              <EmptyState icon="receipt_long" message="No receipts uploaded yet" description="Submit your first receipt to get started." />
            ) : (
              <DataTable columns={recColumns} data={receipts} keyExtractor={r => r.id} />
            )}
          </Card>
        </section>
      </div>
    </RoleGuard>
  );
}
