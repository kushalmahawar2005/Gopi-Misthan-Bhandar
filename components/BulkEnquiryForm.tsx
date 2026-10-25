'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiX } from 'react-icons/fi';

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  giftType: '',
  quantityPreference: 'small',
  description: '',
};

const quantityOptions = [
  { value: 'small', label: 'Minimum (up to 50 boxes)' },
  { value: 'bulk', label: 'Bulk (100+ boxes)' },
  { value: 'custom', label: 'Custom Quantity' },
];

const giftTypeOptions = [
  'Wedding Favors',
  'Engagement Hampers',
  'Corporate Gifting',
  'Festive Hampers',
  'Custom Assorted Boxes',
  'Other',
];

export default function BulkEnquiryForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const closeModal = () => {
    onClose();
    setStatusMessage(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/wedding-enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatusMessage({
        type: 'success',
        text: 'Thank you! Your enquiry has been submitted successfully.',
      });
      setFormData(defaultForm);

      closeTimer.current = setTimeout(closeModal, 2000);
    } catch (error: unknown) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to submit your enquiry right now. Please try later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-3 py-6 sm:px-4 sm:py-8">
          <div className="relative flex w-full max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] sm:max-w-lg">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close enquiry form"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div className="rounded-t-2xl bg-primary-red px-5 py-5 text-white sm:px-6 sm:py-6">
              <h2 className="text-xl font-bold font-general-sans sm:text-2xl">Bulk order Enquiry</h2>
              <p className="mt-1 text-xs text-white/80 sm:text-sm">
                Share your requirements and we will get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Name<span className="text-primary-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                    placeholder="Full name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone<span className="text-primary-red">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    required={!formData.email}
                    placeholder="+91 7746883645"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                    placeholder="City / Event Venue"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Type of Gifts</label>
                  <select
                    value={formData.giftType}
                    onChange={handleInputChange('giftType')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
                  >
                    <option value="">Select Gift Type</option>
                    {giftTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <select
                    value={formData.quantityPreference}
                    onChange={handleInputChange('quantityPreference')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
                  >
                    {quantityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Description / Requirements</label>
                <textarea
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  rows={4}
                  placeholder="Share themes, flavours, delivery date or any custom requirements."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
                />
              </div>

              {statusMessage && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm ${statusMessage.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                    }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary-darkRed disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FiSend className="h-4 w-4" />
                {submitting ? 'Sending...' : 'Submit Enquiry'}
              </button>
            </form>
          </div>
        </div>
  );
}
