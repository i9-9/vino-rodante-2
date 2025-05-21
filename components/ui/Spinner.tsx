import React from "react";

export default function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          stroke="#A83935"
          strokeWidth="5"
        />
        <path
          className="opacity-75"
          fill="#A83935"
          d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 1 0-15 15v5A20 20 0 0 1 25 5z"
        />
      </svg>
    </div>
  );
} 