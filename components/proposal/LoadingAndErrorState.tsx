import React from 'react';
import Link from 'next/link';

// LoadingState Component
export const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4"></div>
        <p className="text-zinc-400 mt-4">Loading your proposal...</p>
      </div>
    </div>
  );
};

// ErrorState Component
interface ErrorStateProps {
  error: string | null;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white p-4">
      <div className="text-center max-w-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-red-500 mx-auto mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Proposal Not Found
        </h1>
        <p className="mb-6 text-zinc-400">
          {error || "The proposal you're looking for doesn't exist or has expired."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Link
            href="/"
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default { LoadingState, ErrorState };
