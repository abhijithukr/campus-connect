'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { eventsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Check, X, Eye, Calendar, Users, Clock } from 'lucide-react';
import Link from 'next/link';

interface Event {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizerName: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, loading: authLoading, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const response = await eventsAPI.getAll({ status: filter || undefined, limit: 50 }, token);
        setEvents(response.data);
        
        // Fetch stats
        const allResponse = await eventsAPI.getAll({ limit: 1000 }, token);
        const allEvents = allResponse.data;
        setStats({
          total: allEvents.length,
          pending: allEvents.filter((e: Event) => e.status === 'pending').length,
          approved: allEvents.filter((e: Event) => e.status === 'approved').length,
          rejected: allEvents.filter((e: Event) => e.status === 'rejected').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin && token) {
      fetchEvents();
    }
  }, [isAdmin, token, filter]);

  const handleStatusUpdate = async (eventId: string, newStatus: string) => {
    try {
      await eventsAPI.updateStatus(eventId, newStatus, token!);
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: newStatus } : e))
      );
      // Update stats
      setStats((prev) => {
        const oldStatus = events.find((e) => e._id === eventId)?.status || '';
        return {
          ...prev,
          [oldStatus]: prev[oldStatus as keyof typeof prev] - 1,
          [newStatus]: prev[newStatus as keyof typeof prev] + 1,
        };
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (authLoading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage and approve events</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Events</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status === 'all' ? '' : status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              (filter === status || (filter === '' && status === 'all'))
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Events Table */}
      {loading ? (
        <LoadingSpinner text="Loading events..." />
      ) : events.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600">No events found with this status.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500 capitalize">{event.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.organizerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[event.status]}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/events/${event._id}`}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {event.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(event._id, 'approved')}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(event._id, 'rejected')}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {event.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(event._id, 'cancelled')}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        {event.status === 'rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(event._id, 'approved')}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
