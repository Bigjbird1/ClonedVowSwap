"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tab, Disclosure } from "@headlessui/react";
import {
  ShareIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  MinusIcon,
  PlusIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import WeddingAttributeBadges from "./WeddingAttributeBadges";
import MeasurementDisplay from "./MeasurementDisplay";
import { WeddingCategory, ItemCondition } from "../../../../models/supabaseListing";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface ListingDetailViewProps {
  id: string;
  title: string;
  description: string;
  price: number;
  originalRetailPrice?: number;
  photos: { url: string; alt?: string }[];
  category?: WeddingCategory;
  condition?: ItemCondition;
  measurements?: Record<string, { value: number; unit: string }>;
  style?: string[];
  color?: string[];
  shippingOptions?: {
    id?: string;
    name: string;
    price: number;
    estimatedDays: [number, number]; // [min, max]
  }[];
  seller: {
    id: string;
    imageUrl: string;
    name: string;
    location: string;
    rating?: number;
  };
}

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (price: number, originalRetailPrice?: number): number | null => {
  if (!originalRetailPrice || originalRetailPrice <= price) return null;
  return Math.round(((originalRetailPrice - price) / originalRetailPrice) * 100);
};

export default function ListingDetailView({
  id,
  title,
  description,
  price,
  originalRetailPrice,
  photos,
  category,
  condition,
  measurements,
  style,
  color,
  shippingOptions,
  seller,
}: ListingDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(photos[0].url);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(
    shippingOptions && shippingOptions.length > 0 ? shippingOptions[0].id || shippingOptions[0].name : null
  );
  
  const router = useRouter();
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
  
  const discountPercentage = calculateDiscountPercentage(price, originalRetailPrice);
  
  // Initialize PhotoSwipe
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#gallery",
      children: "a",
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();

    lightboxRef.current = lightbox;

    return () => lightbox.destroy();
  }, []);
  
  // Toggle saved state
  const toggleSaved = () => {
    setIsSaved(!isSaved);
  };
  
  // Get selected shipping option
  const getSelectedShippingOption = () => {
    if (!shippingOptions || !selectedShipping) return null;
    return shippingOptions.find(option => (option.id || option.name) === selectedShipping);
  };
  
  // Calculate total price
  const calculateTotalPrice = () => {
    const shippingOption = getSelectedShippingOption();
    if (!shippingOption) return price;
    return price + shippingOption.price;
  };
  
  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Image Gallery */}
            <Tab.Group as="div" className="flex flex-col-reverse">
              <div className="mx-auto mt-6 w-full max-w-2xl lg:max-w-none">
                <Tab.List className="grid grid-cols-4 gap-6">
                  {photos.map((image, index) => (
                    <Tab
                      key={index}
                      onClick={() => setSelectedImage(image.url)}
                      className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                    >
                      <Image
                        src={image.url}
                        width={500}
                        height={500}
                        alt={image.alt || `Thumbnail ${index}`}
                        className="h-full w-full object-cover rounded-md object-center"
                      />
                    </Tab>
                  ))}
                </Tab.List>
              </div>

              <Tab.Panels className="aspect-h-1 aspect-w-1 w-full relative">
                <div className="w-full h-full" id="gallery">
                  <a
                    href={selectedImage}
                    data-pswp-width="1600"
                    data-pswp-height="1600"
                  >
                    <Image
                      src={selectedImage}
                      alt="Selected Product"
                      width={500}
                      height={500}
                      className="h-full w-full object-cover object-center sm:rounded-lg cursor-pointer"
                    />
                  </a>
                  <button
                    onClick={() => router.back()}
                    className="absolute top-0 left-0 z-10 p-2 m-2 text-white bg-black rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    aria-label="Go back"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                </div>
              </Tab.Panels>
            </Tab.Group>

            {/* Product Info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              {/* Wedding Attribute Badges */}
              <div className="mb-4">
                <WeddingAttributeBadges
                  category={category}
                  condition={condition}
                  style={style}
                  color={color}
                  size="md"
                  showTooltips={true}
                />
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {title}
              </h1>
              
              {/* Price */}
              <div className="mt-3 flex items-end">
                <p className="text-3xl tracking-tight text-gray-900">${price.toFixed(2)}</p>
                {originalRetailPrice && (
                  <p className="text-sm text-gray-500 line-through ml-2 mb-1">
                    ${originalRetailPrice.toFixed(2)}
                  </p>
                )}
                {discountPercentage && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
              
              {/* Description */}
              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div className="space-y-6 text-base text-gray-700">
                  {description}
                </div>
              </div>
              
              {/* Shipping Options */}
              {shippingOptions && shippingOptions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">Shipping Options</h3>
                  <div className="mt-2 space-y-3">
                    {shippingOptions.map((option) => (
                      <div key={option.id || option.name} className="flex items-center">
                        <input
                          id={`shipping-${option.id || option.name}`}
                          name="shipping-option"
                          type="radio"
                          checked={(option.id || option.name) === selectedShipping}
                          onChange={() => setSelectedShipping(option.id || option.name)}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`shipping-${option.id || option.name}`} className="ml-3 flex flex-1 items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">{option.name}</span>
                          <span className="text-gray-500">
                            {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
                          </span>
                        </label>
                        <span className="ml-4 text-sm text-gray-500">
                          {option.estimatedDays[0] === 0 && option.estimatedDays[1] === 1
                            ? 'Same day'
                            : `${option.estimatedDays[0]}-${option.estimatedDays[1]} days`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-6 flex items-center space-x-4">
                <button 
                  onClick={toggleSaved}
                  className="flex items-center justify-center rounded-md px-3 py-3 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  aria-label={isSaved ? "Remove from saved" : "Save listing"}
                >
                  {isSaved ? (
                    <BookmarkSolidIcon className="h-6 w-6 text-rose-600" aria-hidden="true" />
                  ) : (
                    <BookmarkIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
                <button className="flex items-center justify-center rounded-md px-3 py-3 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                  <ShareIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              {/* Total Price */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Total Price</h3>
                  <p className="text-xl font-medium text-gray-900">
                    ${calculateTotalPrice().toFixed(2)}
                  </p>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="mt-6 flex space-x-4">
                <button
                  className="flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                  onClick={() =>
                    alert("Contact Seller functionality not implemented yet")
                  }
                >
                  Contact Seller
                </button>
                <button
                  className="flex-1 items-center justify-center rounded-md bg-rose-600 px-8 py-3 text-base font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                  onClick={() =>
                    alert("Buy Now functionality not implemented yet")
                  }
                >
                  Buy Now
                </button>
              </div>
              
              {/* Seller Information */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex items-center">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={seller.imageUrl || "/images/profiles/profile1.jpg"}
                      alt={seller.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{seller.name}</h3>
                    <div className="flex items-center">
                      {seller.rating && (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < seller.rating! ? "text-yellow-400" : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 15.585l-7.07 3.715 1.35-7.865L.36 7.13l7.91-1.15L10 0l2.73 5.98 7.91 1.15-5.92 5.305 1.35 7.865z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                          <span className="ml-1 text-xs text-gray-500">
                            ({seller.rating.toFixed(1)})
                          </span>
                        </div>
                      )}
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{seller.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Measurements */}
              {measurements && Object.keys(measurements).length > 0 && (
                <div className="mt-8">
                  <MeasurementDisplay
                    category={category}
                    measurements={measurements}
                    showDiagram={true}
                  />
                </div>
              )}
              
              {/* Additional Details */}
              <section aria-labelledby="details-heading" className="mt-8">
                <div className="divide-y divide-gray-200 border-t">
                  <Disclosure as="div">
                    {({ open }) => (
                      <>
                        <h3>
                          <Disclosure.Button className="group relative flex w-full items-center justify-between py-6 text-left">
                            <span
                              className={classNames(
                                open ? "text-gray-600" : "text-gray-900",
                                "text-sm font-medium"
                              )}
                            >
                              Seller Information
                            </span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusIcon
                                  className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusIcon
                                  className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel as="div" className="prose prose-sm pb-6">
                          <ul role="list" className="list-disc pl-5 text-gray-500">
                            <li className="text-gray-500 text-sm p-1">
                              Seller: {seller.name}
                            </li>
                            <li className="text-gray-500 text-sm p-1">
                              Location: {seller.location}
                            </li>
                          </ul>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                  
                  <Disclosure as="div">
                    {({ open }) => (
                      <>
                        <h3>
                          <Disclosure.Button className="group relative flex w-full items-center justify-between py-6 text-left">
                            <span
                              className={classNames(
                                open ? "text-gray-600" : "text-gray-900",
                                "text-sm font-medium"
                              )}
                            >
                              Return Policy
                            </span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusIcon
                                  className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusIcon
                                  className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel as="div" className="prose prose-sm pb-6">
                          <p className="text-gray-500 text-sm">
                            All sales are final. Please contact the seller with any questions before purchasing.
                          </p>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Action Buttons */}
      <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 p-4 lg:hidden">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4">
          <button
            className="flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            onClick={() =>
              alert("Contact Seller functionality not implemented yet")
            }
          >
            Contact Seller
          </button>
          <button
            className="flex-1 items-center justify-center rounded-md bg-rose-600 px-8 py-3 text-base font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            onClick={() => alert("Buy Now functionality not implemented yet")}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
