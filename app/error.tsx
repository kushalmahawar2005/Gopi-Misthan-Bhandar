'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center px-4 font-sans">
      <div className="text-center max-w-lg mx-auto">
        <div className="text-[#FE8E02] text-6xl mb-6 flex justify-center">
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223] mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-500 font-flama tracking-wide mb-8 leading-relaxed">
          We apologize for the inconvenience. An unexpected error has occurred on our servers. Please try again or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-[#FE8E02] text-white font-flama tracking-widest text-sm uppercase hover:bg-[#e07d00] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-3 bg-transparent border border-[#503223] text-[#503223] font-flama tracking-widest text-sm uppercase hover:bg-[#503223] hover:text-white transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
