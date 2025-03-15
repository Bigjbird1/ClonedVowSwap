"use client";

import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Menu, Transition, Popover } from "@headlessui/react";
import { Fragment } from "react";
import SearchComponent from "../SearchComponent/SearchComponent";
import { fetchSearchResults } from "../../../app/listings/utils-listings";
import NotificationBell from "../Notifications/NotificationBell";

interface HeaderProps {}

interface NavigationItem {
  name: string;
  href: string;
  current?: boolean;
}

export default function Header({}: HeaderProps) {
  const { isSignedIn } = useAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
  }

  const navigation: NavigationItem[] = [
    {
      name: isSignedIn ? "Dashboard" : "Sign in",
      href: isSignedIn ? "/dashboard" : "/sign-in",
    },
    {
      name: isSignedIn ? "Create a listing" : "Sign up",
      href: isSignedIn ? "/create-listing" : "/sign-up",
    },
    { name: "Listings", href: "/listings" },
  ];

  const handleSearch = async (query: string): Promise<void> => {
    const results = await fetchSearchResults(query);
    setSearchResults(results);
  };

  return (
    <>
      <Popover
        as="header"
        className={({ open }) =>
          classNames(
            open ? "fixed inset-0 z-40 overflow-y-auto" : "",
            "bg-white shadow-sm lg:static lg:overflow-y-visible"
          )
        }
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
              <div className="relative flex justify-between lg:gap-8 xl:grid xl:grid-cols-12">
                <div className="flex md:absolute md:inset-y-0 md:left-0 lg:static xl:col-span-2">
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/">
                      <span className="hidden xl:inline-block text-xl font-bold mr-2">
                        Marketplace
                      </span>
                    </Link>
                  </div>
                </div>
                <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
                  <div className="flex items-center px-6 py-4 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                    <div className="w-full" style={{ marginLeft: "-1rem" }}>
                      <SearchComponent
                        onSearch={handleSearch}
                        searchResults={searchResults}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center md:absolute md:inset-y-0 md:right-0 lg:hidden">
                  {/* Mobile menu button */}
                  <Popover.Button className="relative -mx-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Popover.Button>
                </div>
                <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4 space-x-4">
                  {/* Notification Bell - only show for signed in users */}
                  {isSignedIn && (
                    <NotificationBell className="mr-2" />
                  )}
                  
                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="sign-in"
                      className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <Popover.Panel as="nav" className="lg:hidden" aria-label="Global">
              <div className="mx-auto max-w-3xl space-y-1 px-2 pb-3 pt-2 sm:px-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? "page" : undefined}
                    className={classNames(
                      item.current
                        ? "bg-gray-100 text-gray-900"
                        : "hover:bg-gray-50",
                      "block rounded-md py-2 px-3 text-base font-medium"
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </>
  );
}
