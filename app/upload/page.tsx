'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import EventForm from '@/components/EventForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function UploadEventPage() {
  const router = useRouter();
  const { user, loading, isOrganizer } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/upload');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  if (!isOrganizer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Organizer Access Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be registered as an organizer to upload events. 
            Please register with an organizer account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary">
              Register as Organizer
            </Link>
            <Link href="/events" className="btn-secondary">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Event</h1>
        <p className="text-gray-600">
          Fill in the details below to submit your event. It will be reviewed by an admin before going live.
        </p>
      </div>

      <EventForm />
    </div>
  );
}
