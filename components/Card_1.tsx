import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Interface for the Card component's props.
 * Exported to allow consumers to extend or type-check against it.
 */
export interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  ctaText?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A reusable card component for displaying content in a structured and visually appealing way.
 * It supports an optional image, can be wrapped in a link, and allows for custom content via children.
 * The styling is done with Tailwind CSS, including hover effects, dark mode support, and responsive design.
 */
const Card: React.FC<CardProps> = ({
  title,
  description,
  imageUrl,
  linkUrl,
  ctaText = 'Read More',
  className = '',
  children,
}) => {
  // The inner content of the card
  const cardInnerContent = (
    <>
      {imageUrl && (
        <div className="relative w-full h-56 flex-shrink-0 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl lg:text-2xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 flex-grow mb-4 line-clamp-3">
          {description}
        </p>
        
        {children && <div className="mb-4">{children}</div>}
        
        {linkUrl && (
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 font-semibold transition-colors duration-300">
              {ctaText}
              <svg 
                className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </>
  );

  // Base classes for the card container
  const cardClasses = `
    flex flex-col h-full
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 
    rounded-xl shadow-sm hover:shadow-xl 
    transition-all duration-300 ease-in-out 
    transform hover:-translate-y-1
    overflow-hidden group
    ${className}
  `;

  // If a linkUrl is provided, wrap the entire card in a Next.js Link component.
  if (linkUrl) {
    return (
      <Link href={linkUrl} className={cardClasses}>
        {cardInnerContent}
      </Link>
    );
  }

  // Otherwise, render a standard div.
  return <div className={cardClasses}>{cardInnerContent}</div>;
};

export default Card;