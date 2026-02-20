'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { eventsAPI, EventFilters } from '@/lib/api';
import EventCard from '@/components/EventCard';
import SearchFilter from '@/components/SearchFilter';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizerName: string;
  featured?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function EventsContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<EventFilters>({});

  const fetchEvents = async (newFilters: EventFilters = filters, page: number = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await eventsAPI.getAll({ ...newFilters, page, limit: 12 });
      setEvents(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for today filter in URL
    const today = searchParams.get('today');
    if (today === 'true') {
      const todayDate = new Date().toISOString().split('T')[0];
      setFilters({ startDate: todayDate, endDate: todayDate });
      fetchEvents({ startDate: todayDate, endDate: todayDate });
    } else {
      fetchEvents();
    }
  }, [searchParams]);

  const handleSearch = (newFilters: { search: string; category: string; startDate: string; endDate: string }) => {
    const updatedFilters: EventFilters = {
      search: newFilters.search || undefined,
      category: newFilters.category !== 'all' ? newFilters.category : undefined,
      startDate: newFilters.startDate || undefined,
      endDate: newFilters.endDate || undefined,
    };
    setFilters(updatedFilters);
    fetchEvents(updatedFilters, 1);
  };

  const handlePageChange = (page: number) => {
    fetchEvents(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Events</h1>
        <p className="text-gray-600">Discover all the events happening on campus</p>
      </div>

      <SearchFilter onSearch={handleSearch} />

      {loading ? (
        <LoadingSpinner text="Loading events..." />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => fetchEvents()} className="btn-secondary">
            Try Again
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">
            Showing {events.length} of {pagination.total} events
          </p>

          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === pagination.page
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading..." />}>
      <EventsContent />
    </Suspense>
  );
}
