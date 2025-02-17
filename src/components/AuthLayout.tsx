import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  wide?: boolean; // optional prop to allow a wider container
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  wide = false,
}: AuthLayoutProps) {
  // Decide which container width to use:
  // - default: max-w-md (good for login, signup, etc.)
  // - wide: max-w-xl (slightly bigger, but still centered)
  const containerClasses = wide
    ? 'sm:mx-auto sm:w-full sm:max-w-xl'
    : 'sm:mx-auto sm:w-full sm:max-w-md';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-4 px-4 text-base">
      {/* Top section: logo, title, subtitle */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TT6h28gNIZXvItU0Dzmk/media/67180e69632642282678b099.png"
            alt="SpeakerDrive"
            className="h-12 w-12"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {subtitle}
        </p>
      </div>

      {/* Main container, size depends on `wide` prop */}
      <div className={`mt-4 ${containerClasses}`}>
        <div className="bg-white py-8 px-4 sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
