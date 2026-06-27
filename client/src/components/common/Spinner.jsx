import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <svg
        className="h-6 w-6 animate-spin text-[#00d492]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          className="opacity-75"
          fill="currentColor"
          d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
        />
      </svg>
    </div>
  );
};

export default Spinner;
