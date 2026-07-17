import { useState, useEffect } from 'react';
import { Card, Button, Input, EmptyState, LoadingSkeleton, UnifiedUploader, useToast, DataTable } from '../../components/ui';
import type { Column } from '../../components/ui/DataTable';
import { RoleGuard } from '../../permissions';
import { receiptService } from '../../services';
import type { Receipt } from '../../types';
import { formatDate } from '../../utils/format';

export function FinanceTreasurer() {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ receiptNumber: '', purpose: '', amount: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    receiptService.getAll().then(recs => {
      setReceipts(recs);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.receiptNumber || !form.purpose || !form.amount) {
      toast('Please fill all required fields', 'warning');
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
      });
      setReceipts(prev => [newRec, ...prev]);
      setForm({ receiptNumber: '', purpose: '', amount: '', date: '' });
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
    { key: 'amount', header: 'Amount', render: (r: Receipt) => <span className="text-[13px] font-[600]">{'₦' + r.amount.toLocaleString()}</span> },
    { key: 'status', header: 'Status', render: (r: Receipt) => (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-[600] ${r.status === 'verified' ? 'bg-[rgba(42,157,127,0.13)] text-[#16735c]' : 'bg-[rgba(217,111,77,0.13)] text-[#d96f4d]'}`}>
        {r.status}
      </span>
    )},
    { key: 'date', header: 'Date', render: (r: Receipt) => <span className="text-[#67706c] text-[13px]">{formatDate(r.date)}</span> },
  ];

  return (
    <RoleGuard roles={['admin', 'treasurer']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-['Fraunces',serif] text-[32px] font-[500] text-[#171b1f] mb-1">Upload Receipt</h1>
          <p className="text-[14px] text-[#67706c]">Centralised financial reconciliation. Attach proof of payment and assign students.</p>
        </div>

        <div className="max-w-2xl">
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
          <div className="flex justify-end mt-5">
            <Button icon="send" onClick={handleSubmit} loading={submitting}>Submit Receipt</Button>
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
