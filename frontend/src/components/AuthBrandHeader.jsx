'use client';

import Image from 'next/image';

export default function AuthBrandHeader({ subtitle }) {
  return (
    <header className="flex flex-col items-center text-center gap-2.5">
      <div className="w-full max-w-[min(240px,85vw)] sm:max-w-[270px] mx-auto">
        <Image
          src="/thekedaari-logo.png"
          alt="Thekedaari — attendance & finance for construction sites"
          width={400}
          height={400}
          sizes="(max-width: 640px) 240px, 270px"
          className="w-full h-auto max-h-[5.25rem] sm:max-h-[5.75rem] object-contain object-center mx-auto select-none"
          priority
        />
      </div>
      {subtitle ? (
        <p className="text-gray-600 text-sm sm:text-base font-medium leading-snug max-w-[320px] mx-auto">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
