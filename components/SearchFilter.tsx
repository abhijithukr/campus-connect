'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilterProps {
  onSearch: (filters: {
    search: string;
    category: string;
    startDate: string;
    endDate: string;
  }) => void;
  showStatusFilter?: boolean;
  onStatusChange?: (status: string) => void;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'academic', label: 'Academic' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'club', label: 'Club' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

export default function SearchFilter({ onSearch, showStatusFilter, onStatusChange }: SearchFilterProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ search, category, startDate, endDate });
  };

  const handleClear = () => {
    setSearch('');
    setCategory('all');
    setStartDate('');
    setEndDate('');
    onSearch({ search: '', category: 'all', startDate: '', endDate: '' });
  };

  const hasFilters = search || category !== 'all' || startDate || endDate;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              aria-label="Search events"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center space-x-2 ${showFilters ? 'bg-gray-100' : ''}`}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="label">From Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="label">To Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>

            {showStatusFilter && onStatusChange && (
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select
                  id="status"
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="input"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Clear Filters */}
        {hasFilters && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear filters</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
