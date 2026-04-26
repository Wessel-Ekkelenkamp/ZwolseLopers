import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />

      <main className="flex-grow p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-blue-100">
          
          <h1 className="text-3xl font-black text-[#2454a3] italic mb-6">
            Privacy & Cookies
          </h1>
          
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Wie zijn wij?</h2>
              <p>ZwolseLopers is een lokale hardloopcommunity in Zwolle. Deze website is bedoeld om runs te organiseren en lopers te verbinden.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Cookies</h2>
              <p>Wij houden van simpel. Daarom gebruiken we <strong>alleen functionele cookies</strong>. Dit zijn kleine tekstbestanden die ervoor zorgen dat je ingelogd blijft tijdens je bezoek. Zonder deze cookies werkt je account niet. We gebruiken geen tracking-cookies en plaatsen geen advertenties.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Jouw Gegevens</h2>
              <p>We slaan alleen de gegevens op die je zelf invult: je e-mailadres (om in te loggen) en je gebruikersnaam. Je kunt je profiel op elk moment aanpassen of verwijderen.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}