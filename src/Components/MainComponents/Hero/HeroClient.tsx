"use client";

import Link from "next/link";

interface HeroClientProps {
  heroVideo: string;
}

export default function HeroClient({ heroVideo }: HeroClientProps) {
  return (
    <div className="bg-white relative">
      <main>
        <div className="relative isolate">
          <video
            className="absolute inset-0 w-full h-full object-cover -z-10"
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
          />

          <div
            className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
            aria-hidden="true"
          >
            <div
              style={{
                clipPath:
                  "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
              }}
            />
          </div>

          <div className="overflow-hidden relative bg-gray-900/50">
            <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:pt-10 lg:px-8 lg:pt-12 relative z-10">
              <div className="mb-8 sm:mb-8 flex justify-start md:justify-center"></div>
              <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full max-w-xl lg:shrink-0 xl:max-w-2xl ">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-8xl text-white">
                    Find Your Dream Wedding Items
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none text-white">
                    Buy and sell pre-loved wedding dresses, decor, and accessories at affordable prices.
                  </p>
                  <div className="mt-10 flex flex-col items-start gap-y-2 sm:flex-row sm:items-center sm:gap-x-6">
                    <Link
                      href="/listings"
                      className="rounded-md bg-rose-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                    >
                      Discover Wedding Treasures
                    </Link>

                    <div className="w-full sm:flex-1">
                      <Link
                        href="/sign-up"
                        className="text-sm font-semibold leading-6 text-gray-900 text-white"
                      >
                        List your wedding items <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
