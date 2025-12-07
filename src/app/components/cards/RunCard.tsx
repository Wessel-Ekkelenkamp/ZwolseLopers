"use client";

import React from "react";
import Card from "./Card";
import ImageCarousel from "./ImageCarousel";
import { Run } from "@/src/app/types/run";

type RunCardProps = {
  title: string;
  run: Run;
};

export default function RunCard({ title, run }: RunCardProps) {
  // Debug log to see what data we're getting
  console.log("RunCard received:", { title, run });

  // Ensure image_urls is an array
  const imageUrls = Array.isArray(run.image_urls) ? run.image_urls : [];

  return (
    <Card>
      <h1 className="text-slate-800 font-semibold mb-1">{title}</h1>
      <p className="text-gray-500 text-sm mb-2">
        {run.run_date ? new Date(run.run_date).toLocaleDateString() : 'N/A'} • {run.run_time || 'N/A'}
      </p>
      <p className="text-gray-700">
        <strong>Afstand:</strong> {run.distance || 'N/A'} km<br />
        <strong>Start:</strong> {run.start_location || 'N/A'}<br />
        <strong>Snelheid:</strong> {run.average_speed || 'N/A'}
        {run.max_participants && (
          <>
            <br />
            <strong>Max deelnemers:</strong> {run.max_participants}
          </>
        )}
      </p>
      {imageUrls.length > 0 && (
        <div className="mt-3">
          <ImageCarousel images={imageUrls} />
        </div>
      )}
    </Card>
  );
}