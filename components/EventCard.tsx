import Link from 'next/link';
import { Calendar, Clock, MapPin, Tag } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizerName: string;
  status?: string;
  featured?: boolean;
}

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

export default function EventCard({ event, showStatus = false }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isToday = new Date().toDateString() === eventDate.toDateString();
  
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/events/${event._id}`}>
      <article className="card hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* Featured/Today Badge */}
        {(event.featured || isToday) && (
          <div className={`px-3 py-1 text-xs font-medium ${isToday ? 'bg-primary-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
            {isToday ? '🔥 Happening Today!' : '⭐ Featured'}
          </div>
        )}
        
        <div className="p-5 flex flex-col flex-grow">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-grow">
              {event.title}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize whitespace-nowrap ${categoryColors[event.category] || categoryColors.other}`}>
              {event.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
            {event.description}
          </p>

          {/* Meta Info */}
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              By {event.organizerName}
            </span>
            {showStatus && event.status && (
              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[event.status]}`}>
                {event.status}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
