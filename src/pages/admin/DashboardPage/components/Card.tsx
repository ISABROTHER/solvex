import React from "react";

const Card: React.FC<React.PropsWithChildren<{ className?: string; title?: string; right?: React.ReactNode }>> = ({
  children,
  className = "",
  title,
  right,
}) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
    {(title || right) && (
      <div className="mb-4 flex items-center justify-between">
        {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
        {right}
      </div>
    )}
    {children}
  </div>
);

export default Card;