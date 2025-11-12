'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { WeddingEnquiry } from '@/types';

interface EnquiryFilters {
  search: string;
  quantity: string;
}

const quantityLabels: Record<string, string> = {
  small: 'Small (up to 20 boxes)',
  medium: 'Medium (20 - 100 boxes)',
  bulk: 'Bulk (100+ boxes)',
  custom: 'Custom Quantity',
};

export default function WeddingEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<WeddingEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EnquiryFilters>({ search: '', quantity: 'all' });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const response = await fetch('/api/wedding-enquiries');
      const data = await response.json();
      if (data.success) {
        setEnquiries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wedding enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const matchesSearch =
        filters.search.trim().length === 0 ||
        [enquiry.name, enquiry.email, enquiry.phone, enquiry.location, enquiry.giftType]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesQuantity =
        filters.quantity === 'all' || enquiry.quantityPreference === filters.quantity;

      return matchesSearch && matchesQuantity;
    });
  }, [enquiries, filters]);

  const handleFilterChange = (field: keyof EnquiryFilters) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-red" />
          <p className="text-gray-600">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary-brown sm:text-3xl">Wedding Gift Enquiries</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track all custom gift hamper requests submitted from the storefront.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <input
            type="search"
            value={filters.search}
            onChange={handleFilterChange('search')}
            placeholder="Search by name, email, phone or location"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
          />
          <select
            value={filters.quantity}
            onChange={handleFilterChange('quantity')}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red sm:w-48"
          >
            <option value="all">All Quantities</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="bulk">Bulk</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Gift Preference
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
              {filteredEnquiries.map((enquiry) => (
                <tr key={enquiry.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold text-primary-brown">{enquiry.name}</p>
                    {enquiry.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <FiMapPin className="h-4 w-4" />
                        {enquiry.location}
                      </p>
                    )}
                    {enquiry.description && (
                      <p className="mt-2 line-clamp-3 text-xs text-gray-600">{enquiry.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1 text-xs">
                      {enquiry.email && (
                        <p className="flex items-center gap-1 text-gray-600">
                          <FiMail className="h-4 w-4" />
                          <a href={`mailto:${enquiry.email}`} className="hover:text-primary-red">
                            {enquiry.email}
                          </a>
                        </p>
                      )}
                      {enquiry.phone && (
                        <p className="flex items-center gap-1 text-gray-600">
                          <FiPhone className="h-4 w-4" />
                          <a href={`tel:${enquiry.phone}`} className="hover:text-primary-red">
                            {enquiry.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1 text-xs">
                      {enquiry.giftType && (
                        <p className="font-medium text-primary-brown">{enquiry.giftType}</p>
                      )}
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-primary-red">
                        {quantityLabels[enquiry.quantityPreference || 'small']}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FiCalendar className="h-4 w-4" />
                      {new Date(enquiry.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnquiries.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No enquiries found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}


