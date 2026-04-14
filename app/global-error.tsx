'use client'; // Error components must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FDF8F3] flex items-center justify-center font-sans tracking-wide">
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="text-[#FE8E02] text-6xl mb-6 flex justify-center">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-[#503223] mb-4 uppercase tracking-[0.1em]">
            System Error
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm">
            A critical error occurred while rendering the application. We've logged this issue.
          </p>
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-[#FE8E02] text-white tracking-widest text-xs uppercase hover:bg-[#e07d00] transition-colors"
          >
            Recover Application
          </button>
        </div>
      </body>
    </html>
  );
}
