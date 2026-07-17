import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, keyExtractor, onRowClick, emptyMessage }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-[#67706c] text-[14px]">
        {emptyMessage || 'No data available'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[#e3ddd0]">
          {columns.map(col => (
            <th
              key={col.key}
              className={`px-3 py-2.5 text-[12px] font-[600] uppercase tracking-[0.5px] text-[#67706c] ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr
            key={keyExtractor(item)}
            className={`border-b border-[#e3ddd0] text-[14px] ${onRowClick ? 'cursor-pointer hover:bg-[rgba(0,0,0,0.03)]' : ''}`}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map(col => (
              <td
                key={col.key}
                className={`px-3 py-2.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
              >
                {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
