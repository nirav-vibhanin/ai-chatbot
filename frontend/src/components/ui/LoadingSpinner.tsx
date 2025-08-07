'use client';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <div className="text-white/80 text-lg">Loading...</div>
      </div>
    </div>
  );
} 