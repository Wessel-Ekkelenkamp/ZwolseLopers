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
           minHeight: "100vh",
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
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
          }}
        >

           <PostCard
        title="Rondje Zwolle marathon"
         content={
    <>
      In het weekend zijn wij als Zwolselopers vaak in of rondom Zwolle te vinden voor een gezellige duurloop, maar op zaterdag 7 februari 2026 gaan we een stapje verder! <br/>

Op 7 februari organiseren we als hardloopgroep de Zwolselopers de marathon van Zwolle. De route die we gaan lopen is het welbekende ‘rondje Zwolle’. Een mooie route van 42km over de dijken en wegen rondom Zwolle (zie ook: {" "}
      <a
        href="https://www.anwb.nl/fietsroutes/routes/rondje-zwolle"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        rondje zwolle
      </a>). We willen er vooral een gezellige hardloopdag van maken in de sfeer van een lange duurloop. Verwacht dus geen PR in tijd, maar in gezelligheid. Klinkt dit je als muziek in de oren, meld je dan snel aan via dit formulier. Er zijn namelijk maar 75 plekken beschikbaar. <br/>  
      <strong className="mt-4 block">Wat verwachten we van jou:</strong>
  <div className="ml-4 mt-2 space-y-1">
    <div><span className="font-bold mr-2">1.</span>Voldoende fitheid voor het comfortabel lopen van een marathon</div>
    <div><span className="font-bold mr-2">2.</span>Gezelligheid</div>
    <div><span className="font-bold mr-2">3.</span>Eigen verantwoordelijkheid voor eten en drinken</div>
  </div> <br/>

  <strong>Wat kun je van ons verwachten:</strong>
  <div className="ml-4 mt-2 space-y-1">
    <div><span className="font-bold mr-2">1.</span>Een gezellige groep en een gezellig evenement</div>
    <div><span className="font-bold mr-2">2.</span>Een waterpunt halverwege</div>
    <div><span className="font-bold mr-2">3.</span>Achteraf een lekker bakje koffie</div>
  </div>

  <strong className="mt-4 block">Wat verwachten we van jou:</strong>
  <div className="ml-4 mt-2 space-y-1">
    <div><span className="font-bold mr-2">1.</span>Voldoende fitheid voor het comfortabel lopen van een marathon</div>
    <div><span className="font-bold mr-2">2.</span>Gezelligheid</div>
    <div><span className="font-bold mr-2">3.</span>Eigen verantwoordelijkheid voor eten en drinken</div> <br></br>
  </div>

Vrijwillige bijdrage: we organiseren deze activiteit voor het eerst en willen het qua omvang en organisatie klein houden. Daarom is het evenement gratis. Als organisatie maken we echter wel kosten en daarom vragen we een kleine vrijwillige bijdrage. <br/>

Vragen? Neem dan contact op met: zwolselopers@hotmail.com<br/>
Na de inschrijving ontvangen je van ons meer informatie over de startlocatie, starttijd, etc.<br/>
      {" "}
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSc1IgsaZeB-RjT4dFhR4AYlwd5-x1fC4gx9RlGtE49k5HNv7g/viewform"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        <div><span className="font-bold mr-2">Inschrijven</span></div>
      </a>
    </>
         }
        images={[
          "/images/rondjezwolle.jpg"
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
