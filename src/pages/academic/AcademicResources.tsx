import { useState, useEffect } from 'react';
import { Card, SearchBar, Button, Select, Modal, EmptyState, LoadingSkeleton, useToast, DataTable, UnifiedUploader } from '../../components/ui';
import type { Column } from '../../components/ui/DataTable';
import { RoleGuard, PermissionGuard } from '../../permissions';
import { resourceService, courseService } from '../../services';
import type { Resource, Course } from '../../types';
import { formatDate } from '../../utils/format';

const fileIcons: Record<string, string> = {
  pdf: 'description',
  pptx: 'slideshow',
  xlsx: 'table_chart',
  docx: 'article',
  other: 'insert_drive_file',
};

export function AcademicResources() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ course: '', courseCode: '', week: '', title: '', fileName: '', fileType: '' as Resource['fileType'], fileSize: 0 });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([resourceService.getAll(), courseService.getAll()]).then(([res, crs]) => {
      setResources(res);
      setCourses(crs);
      setLoading(false);
    });
  }, []);

  const filtered = resources.filter(r =>
    r.course.toLowerCase().includes(search.toLowerCase()) ||
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async () => {
    if (!uploadForm.course || !uploadForm.week || !uploadForm.title) return;
    setUploading(true);
    try {
      const newRes = await resourceService.create({
        course: uploadForm.course,
        courseCode: uploadForm.courseCode,
        week: Number(uploadForm.week),
        title: uploadForm.title,
        fileName: uploadForm.fileName || 'uploaded_file.pdf',
        fileType: uploadForm.fileType || 'pdf',
        fileSize: uploadForm.fileSize || 0,
        uploadedBy: 'Administrator',
      });
      setResources(prev => [newRes, ...prev]);
      setShowUpload(false);
      setUploadForm({ course: '', courseCode: '', week: '', title: '', fileName: '', fileType: '' as Resource['fileType'], fileSize: 0 });
      toast('Resource uploaded successfully', 'success');
    } catch {
      toast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const columns: Column<Resource>[] = [
    { key: 'course', header: 'Course', render: (r: Resource) => <span className="font-[500] text-[#171b1f]">{r.course}</span> },
    { key: 'week', header: 'Week', align: 'center', render: (r: Resource) => <span className="bg-[rgba(42,157,127,0.13)] text-[#16735c] px-2 py-0.5 rounded-full text-[12px] font-[600]">Wk {String(r.week).padStart(2, '0')}</span> },
    { key: 'fileName', header: 'File', render: (r: Resource) => (
      <div className="flex items-center gap-2">
        <span className="material-symbols-rounded text-[#67706c] text-[18px]">{fileIcons[r.fileType] || 'insert_drive_file'}</span>
        <span className="text-[13px]">{r.fileName}</span>
      </div>
    )},
    { key: 'uploadDate', header: 'Uploaded', render: (r: Resource) => <span className="text-[#67706c] text-[13px]">{formatDate(r.uploadDate)}</span> },
    { key: 'actions', header: '', align: 'right', render: () => (
      <PermissionGuard permission="resource.delete" fallback={<span className="text-[13px] text-[#67706c]">View</span>}>
        <div className="flex gap-3 justify-end">
          <button className="text-[13px] font-[500] text-[#2a9d7f] hover:underline cursor-pointer border-none bg-transparent">View</button>
          <button className="text-[13px] font-[500] text-[#67706c] hover:underline cursor-pointer border-none bg-transparent">Replace</button>
          <button className="text-[13px] font-[500] text-[#c3423f] hover:underline cursor-pointer border-none bg-transparent">Delete</button>
        </div>
      </PermissionGuard>
    )},
  ];



  return (
    <RoleGuard roles={['admin', 'representative', 'academic']}>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-['Fraunces',serif] text-[32px] font-[500] text-[#171b1f] mb-1">Academic Resources</h1>
            <p className="text-[14px] text-[#67706c]">Upload and organise course materials.</p>
          </div>
          <PermissionGuard permission="resource.upload">
            <Button icon="cloud_upload" onClick={() => setShowUpload(true)}>Upload Resource</Button>
          </PermissionGuard>
        </div>

        <div className="flex gap-4 items-center">
          <SearchBar placeholder="Search resources..." onSearch={setSearch} className="flex-1 max-w-sm" />
          <span className="text-[13px] text-[#67706c]">{filtered.length} resources</span>
        </div>

        <Card padding="sm">
          {loading ? (
            <LoadingSkeleton lines={4} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={search ? 'search' : 'inbox'}
              message={search ? 'No resources match your search' : 'No resources uploaded yet'}
              description={search ? 'Try a different course or title.' : 'Upload your first resource to get started.'}
            />
          ) : (
            <DataTable columns={columns} data={filtered} keyExtractor={r => r.id} />
          )}
        </Card>

        <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Resource"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button onClick={handleUpload} loading={uploading}>Confirm Upload</Button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <Select label="Course" placeholder="Select course..." value={uploadForm.course} onChange={e => {
              const c = courses.find(crs => crs.name === e.target.value);
              setUploadForm(prev => ({ ...prev, course: e.target.value, courseCode: c?.code || '' }));
            }} options={courses.map(c => ({ value: c.name, label: `${c.code} - ${c.name}` }))} />
            <Select label="Week" placeholder="Select week..." value={uploadForm.week} onChange={e => setUploadForm(prev => ({ ...prev, week: e.target.value }))}
              options={Array.from({ length: 14 }, (_, i) => ({ value: String(i + 1), label: `Week ${i + 1}` }))} />
          </div>
          <UnifiedUploader
            config={{ label: 'Upload lecture slides or documents', hint: 'Maximum file size: 50MB', accept: '.pdf,.ppt,.pptx,.doc,.docx', maxSizeMB: 50 }}
            onFile={f => setUploadForm(prev => ({ ...prev, fileName: f.name, fileSize: f.size, fileType: f.name.split('.').pop() as Resource['fileType'] || 'other' }))}
          />
          <div className="space-y-1">
            <label className="text-[14px] font-[500] text-[#171b1f]">Resource Title</label>
            <input className="w-full px-3.5 py-2.5 border border-[#e3ddd0] rounded-[10px] text-[15px] bg-[#fffdf8] text-[#171b1f] outline-none focus:border-[#2a9d7f] focus:shadow-[0_0_0_3px_rgba(42,157,127,0.13)]" placeholder="e.g. Lecture Notes V3" value={uploadForm.title} onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))} />
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
