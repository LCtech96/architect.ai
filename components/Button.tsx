'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  active = false,
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyles = "";
  
  switch (variant) {
    case 'primary':
      variantStyles = "bg-black text-white hover:bg-gray-800 shadow-sm px-4 py-2";
      break;
    case 'secondary':
      variantStyles = "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm px-4 py-2";
      break;
    case 'ghost':
      variantStyles = `text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 ${active ? 'bg-gray-100 text-gray-900' : ''}`;
      break;
    case 'icon':
      variantStyles = `p-2 text-gray-500 hover:bg-gray-100 rounded-full ${active ? 'bg-blue-50 text-blue-600' : ''}`;
      break;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
