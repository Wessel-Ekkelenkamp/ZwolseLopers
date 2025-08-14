"use client";

import React from "react";

type CardProps = {
  children: React.ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4 w-full max-w-xl mx-auto">
      {children}
    </div>
  );
}
