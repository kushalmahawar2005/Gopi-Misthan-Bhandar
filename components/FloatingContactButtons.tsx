'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { FiGift, FiSend, FiX } from 'react-icons/fi';

const whatsappNumber =
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+919876543210').replace(/\s|\+/g, '') || '919876543210';
const whatsappMessage =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
  'Hi%20Gopi%20Misthan%20Bhandar,%20I%20would%20like%20to%20know%20more%20about%20your%20wedding%20gift%20options.';

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
  { value: 'small', label: 'Small (up to 20 boxes)' },
  { value: 'medium', label: 'Medium (20 - 100 boxes)' },
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

export default function FloatingContactButtons() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const whatsappHref = useMemo(() => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURI(decodeURI(whatsappMessage))}`;
  }, []);

  // Listen for global event to open/close enquiry modal (triggered from header Bulk Enquiry)
  useEffect(() => {
    const openHandler = () => setIsModalOpen(true);
    const closeHandler = () => setIsModalOpen(false);
    if (typeof window !== 'undefined') {
      window.addEventListener('open-wedding-enquiry', openHandler as EventListener);
      window.addEventListener('close-wedding-enquiry', closeHandler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-wedding-enquiry', openHandler as EventListener);
        window.removeEventListener('close-wedding-enquiry', closeHandler as EventListener);
      }
    };
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: error.message || 'Unable to submit your enquiry right now. Please try later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center rounded-full bg-primary-red p-3 text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-red"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <FiGift className="h-6 w-6" />
          </div>
          <div className="pointer-events-none absolute right-[110%] hidden min-w-[200px] translate-y-1 rounded-xl bg-primary-red px-4 py-3 text-left text-white shadow-lg transition group-hover:flex">
            <span className="text-sm font-semibold uppercase tracking-wide">Bulk Enquiry</span>
            <span className="text-xs text-white/80">Plan your custom gift hampers</span>
          </div>
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center rounded-full bg-[#25D366] p-3 text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          aria-label="Chat with us on WhatsApp"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <FaWhatsapp className="h-6 w-6" />
          </div>
          <div className="pointer-events-none absolute right-[110%] hidden min-w-[200px] translate-y-1 rounded-xl bg-[#1fb455] px-4 py-3 text-left text-white shadow-lg transition group-hover:flex">
            <span className="text-sm font-semibold uppercase tracking-wide">WhatsApp</span>
            <span className="text-xs text-white/80">Chat with our team</span>
          </div>
        </a>
      </div>

      {isModalOpen && (
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
                    placeholder="+91 98765 43210"
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
                  className={`rounded-lg px-4 py-3 text-sm ${
                    statusMessage.type === 'success'
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
      )}
    </>
  );
}


