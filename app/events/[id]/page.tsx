'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventsAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Calendar, Clock, MapPin, User, Mail, Phone, 
  ArrowLeft, ExternalLink, Users, Edit, Trash2 
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  category: string;
  organizer: {
    _id: string;
    name: string;
    email: string;
    organization?: string;
  };
  organizerName: string;
  contactEmail: string;
  contactPhone?: string;
  status: string;
  maxAttendees?: number;
  registrationLink?: string;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-700',
  cultural: 'bg-purple-100 text-purple-700',
  sports: 'bg-green-100 text-green-700',
  workshop: 'bg-yellow-100 text-yellow-700',
  seminar: 'bg-indigo-100 text-indigo-700',
  club: 'bg-pink-100 text-pink-700',
  social: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAdmin } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsAPI.getOne(params.id as string);
        setEvent(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setDeleting(true);
    try {
      await eventsAPI.delete(event!._id, token!);
      router.push('/events');
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'The event you\'re looking for doesn\'t exist.'}</p>
        <Link href="/events" className="btn-primary">
          Browse Events
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isToday = new Date().toDateString() === eventDate.toDateString();
  const isPast = eventDate < new Date();
  const isOwner = user?.id === event.organizer._id;
  const canEdit = isOwner || isAdmin;

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        href="/events" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Link>

      <div className="card">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-grow">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${categoryColors[event.category] || categoryColors.other}`}>
                  {event.category}
                </span>
                {isToday && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                    🔥 Happening Today
                  </span>
                )}
                {isPast && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-600">
                    Past Event
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <p className="text-gray-500">
                Organized by <span className="font-medium text-gray-700">{event.organizerName}</span>
              </p>
            </div>

            {/* Action Buttons */}
            {canEdit && (
              <div className="flex space-x-2">
                <Link
                  href={`/events/${event._id}/edit`}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About this Event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>

            {event.registrationLink && (
              <div>
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span>Register Now</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Event Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{formattedDate}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.time}
                      {event.endTime && ` - ${event.endTime}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{event.location}</p>
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Max {event.maxAttendees} attendees</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Contact Organizer</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{event.organizerName}</span>
                </div>
                
                <a 
                  href={`mailto:${event.contactEmail}`}
                  className="flex items-center space-x-3 text-primary-500 hover:text-primary-600"
                >
                  <Mail className="h-5 w-5" />
                  <span>{event.contactEmail}</span>
                </a>
                
                {event.contactPhone && (
                  <a 
                    href={`tel:${event.contactPhone}`}
                    className="flex items-center space-x-3 text-primary-500 hover:text-primary-600"
                  >
                    <Phone className="h-5 w-5" />
                    <span>{event.contactPhone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
