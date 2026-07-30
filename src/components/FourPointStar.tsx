import React from 'react';

interface FourPointStarProps {
  className?: string;
}

export const FourPointStar: React.FC<FourPointStarProps> = ({ className = "w-3.5 h-3.5" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
};
