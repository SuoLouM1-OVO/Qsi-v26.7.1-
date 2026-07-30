import React from 'react';

interface QSiLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  pulsingLine?: boolean;
}

export const QSiLogo: React.FC<QSiLogoProps> = ({
  className = "h-8 w-auto text-black dark:text-white",
  variant = 'full',
  pulsingLine = false
}) => {
  return (
    <svg
      viewBox="0 0 635.8 294.09"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g>
        <path d="M263.49,219.38c13.62-21.68,20.59-46.3,20.59-72.34,0-75.57-61.48-137.04-137.04-137.04S10,71.48,10,147.04s61.48,137.04,137.04,137.04h86.01l10.69,10h-96.71C65.96,294.09,0,228.12,0,147.04S65.96,0,147.04,0s147.04,65.96,147.04,147.04c0,28.17-7.83,55.12-22.75,78.61" />
        <path d="M543.02,294.09h-254.4l-2.4-1.34-.44-.41-126.88-117.48,14.57-.14,118.11,109.37h251.43c45.65,0,82.78-37.14,82.78-82.78s-37.14-82.78-82.78-82.78h-164.51c-32.67,0-59.25-26.58-59.25-59.25S345.84,.02,378.51,.02h148.75V10.02h-148.75c-27.16,0-49.25,22.09-49.25,49.25s22.09,49.25,49.25,49.25h164.51c51.16,0,92.78,41.62,92.78,92.79s-41.62,92.78-92.78,92.78Z" />
        <rect
          x="564.96"
          y=".02"
          width="28.1"
          height="10"
          className={pulsingLine ? "animate-[pulse_1s_ease-in-out_infinite] fill-black dark:fill-white" : ""}
        />
      </g>
    </svg>
  );
};
