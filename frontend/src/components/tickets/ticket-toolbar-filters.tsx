'use client';

import { FilterDropdown, SearchField } from '@/components/page-kits';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function TicketToolbarFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <SearchField
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search tickets"
      />
      <FilterDropdown
        options={statusOptions}
        value={statusFilter}
        active={statusFilter !== 'all'}
        onValueChange={onStatusChange}
      />
      <FilterDropdown
        options={priorityOptions}
        value={priorityFilter}
        active={priorityFilter !== 'all'}
        onValueChange={onPriorityChange}
      />
    </div>
  );
}
