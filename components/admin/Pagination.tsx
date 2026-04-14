'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  itemLabel?: string; // "orders" | "products" | "users" | "posts"
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  itemLabel = 'items',
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
        Showing{' '}
        <span className="font-semibold text-primary-brown">{startItem}</span>
        {' '}to{' '}
        <span className="font-semibold text-primary-brown">{endItem}</span>
        {' '}of{' '}
        <span className="font-semibold text-primary-brown">{totalItems}</span>
        {' '}{itemLabel}
      </div>

      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          Previous
        </button>

        {/* Page Numbers - hidden on very small screens */}
        <div className="hidden xs:flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-xs sm:text-sm text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[36px] px-2 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary-red text-white shadow-sm'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Mobile page indicator */}
        <span className="xs:hidden text-xs text-gray-600 px-2">
          {currentPage} / {totalPages}
        </span>

        {/* Next Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-primary-red text-white hover:bg-primary-darkRed transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-red"
        >
          Next
        </button>
      </div>
    </div>
  );
}
