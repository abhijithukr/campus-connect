'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { eventsAPI, EventData } from '@/lib/api';
import { Loader2, CheckCircle } from 'lucide-react';

interface EventFormProps {
  initialData?: Partial<EventData> & { _id?: string };
  isEditing?: boolean;
}

const categories = [
  { value: 'academic', label: 'Academic' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'club', label: 'Club' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState<EventData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    time: initialData?.time || '',
    endTime: initialData?.endTime || '',
    location: initialData?.location || '',
    category: initialData?.category || 'other',
    contactEmail: initialData?.contactEmail || user?.email || '',
    contactPhone: initialData?.contactPhone || '',
    maxAttendees: initialData?.maxAttendees,
    registrationLink: initialData?.registrationLink || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxAttendees' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!token) {
        throw new Error('You must be logged in to create an event');
      }

      if (isEditing && initialData?._id) {
        await eventsAPI.update(initialData._id, formData, token);
      } else {
        await eventsAPI.create(formData, token);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/events');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Event {isEditing ? 'Updated' : 'Submitted'}!
        </h2>
        <p className="text-gray-600">
          {isEditing 
            ? 'Your event has been updated successfully.'
            : 'Your event has been submitted for review. It will be visible once approved by an admin.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
          Event Details
        </h3>
        
        <div>
          <label htmlFor="title" className="label">Event Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={200}
            className="input"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label htmlFor="description" className="label">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength={2000}
            rows={4}
            className="input resize-none"
            placeholder="Describe your event..."
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
        </div>

        <div>
          <label htmlFor="category" className="label">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="input"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 2: Date & Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
          Date & Time
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="label">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="time" className="label">Start Time *</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="label">End Time</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
          Location
        </h3>
        
        <div>
          <label htmlFor="location" className="label">Venue/Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="input"
            placeholder="e.g., Main Auditorium, Building A"
          />
        </div>
      </div>

      {/* Step 4: Contact Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactEmail" className="label">Contact Email *</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="input"
              placeholder="organizer@college.edu"
            />
          </div>

          <div>
            <label htmlFor="contactPhone" className="label">Contact Phone</label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="input"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      {/* Step 5: Additional Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
          Additional Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="maxAttendees" className="label">Max Attendees</label>
            <input
              type="number"
              id="maxAttendees"
              name="maxAttendees"
              value={formData.maxAttendees || ''}
              onChange={handleChange}
              min={1}
              className="input"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div>
            <label htmlFor="registrationLink" className="label">Registration Link</label>
            <input
              type="url"
              id="registrationLink"
              name="registrationLink"
              value={formData.registrationLink}
              onChange={handleChange}
              className="input"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 border-t border-gray-200 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isEditing ? 'Update Event' : 'Submit Event'}</span>
        </button>
      </div>
    </form>
  );
}
