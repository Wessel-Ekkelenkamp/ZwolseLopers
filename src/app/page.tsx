"use client";

import Header from "./components/Header";
import { useState } from "react";
import RunCard from "./components/cards/RunCard";
import PostCard from "./components/cards/PostCard";

export default function Home() {
  const [page, setPage] = useState(1);

  return (
    <>
      <Header />
      <main
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#f0f0f0",
          paddingTop: "1rem",
        }}
      >
        <div
          style={{
            width: "80%",
            height: "100%",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
          }}
        >

           <RunCard
        title="Zwolselopers website"
        date="Coming soon"
        time="00:38"
        distance="038"
        startLocation="zwolselopers.nl"
        speed="0:38 min/km"
        images={[
          "/images/zwolselopers.svg",
          "/images/zwolselopers.svg",
          "/images/zwolselopers.svg"
        ]}
      />

          {/* Pagination bottom center */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "1rem 0",
              borderTop: "1px solid #ddd",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ marginRight: "1rem" }}
            >
              ←
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              style={{ marginLeft: "1rem" }}
            >
              →
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
