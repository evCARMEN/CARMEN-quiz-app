/* ==============================
   C.A.R.M.E.N. Quiz-App – Logik
   - Zwei Modi: Übung & Test (10 Zufallsfragen)
   - Kategorie-Auswahl + Glücksrad
   - Zufällige Antwortreihenfolge
   - Sofortiges Feedback + Quelle
   - Mobile optimiert
   =================================*/

// ---------- Globale States ----------
let MODE = null;                 // 'practice' | 'test'
let CURRENT_CAT_KEY = null;      // z.B. 'wind'
let CURRENT_COLOR = '#18470F';
let currentQuestions = [];       // aktuell gezogene Fragen (abh. von Modus)
let idx = 0;                     // Index der aktuellen Frage
let score = 0;

// ---------- Einstellungen ----------
const QUESTIONS_PER_ROUND = 3;   // Anzahl Fragen pro Durchgang

// ---------- Kategorien & CI-Farben ----------
const CATS = {
  wind:  { label: "Windenergie (LandSchafftEnergie)", color: "#2F52A0" },
  sun:   { label: "Sonnenenergie (LandSchafftEnergie)", color: "#97a9d0" },
  heat:  { label: "Umweltwärme (LandSchafftEnergie)", color: "#cbd4e7" },
  eff:   { label: "Energieeffizienz (LandSchafftEnergie)", color: "#e0e5f1" },
  biogas:{ label: "Biogas & Mobilität", color: "#65B32E" },
  wood:  { label: "Holzenergie & Wärmenetze", color: "#E74011" },
  mat:   { label: "Stoffliche Nutzung", color: "#822A3A" },
  sust:  { label: "Nachhaltigkeit", color: "#DEDC00" },
};

// ---------- Fragenpool (Beispiel-Datensatz) ----------
// HINWEIS: Um sofort testen zu können, liegt ein kompakter Fragenpool bei (3–4 je Kategorie).
// Du kannst die Fragen leicht erweitern: Füge einfach weitere Objekte in die Arrays ein.
// Struktur je Frage:
// {
//   question: "Fragetext",
//   answers: [
//     { text: "Antwort A", correct: false },
//     { text: "Antwort B", correct: true  },
//     { text: "Antwort C", correct: false }
//   ],
//   source: "https://www.carmen-ev.de/..."
// }
const QUESTION_BANK = {
  wind: [
    {
      question: "Welche Abstandsregel wird in Bayern häufig mit Windenergie verbunden?",
      answers: [
        { text: "5H-Regel", correct: false },
        { text: "10H-Regel", correct: true },
        { text: "2H-Regel", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Welche Größe bestimmt maßgeblich den Energieertrag einer Windenergieanlage?",
      answers: [
        { text: "Rotorblattlänge und Windangebot am Standort", correct: true },
        { text: "Anzahl der Schrauben am Turmfuß", correct: false },
        { text: "Farbe des Generators", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Welche Prüfung ist im Genehmigungsverfahren für Windparks üblich, um geschützte Arten zu schützen?",
      answers: [
        { text: "Artenschutzrechtliche Prüfung", correct: true },
        { text: "Lärmschutz für Elektrogeräte", correct: false },
        { text: "Brandschutz für Rotorblätter", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Wie lange beträgt die typische technische Lebensdauer moderner Windenergieanlagen?",
      answers: [
        { text: "20–25 Jahre", correct: true },
        { text: "5–10 Jahre", correct: false },
        { text: "60–80 Jahre", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Welches Bauteil einer Windenergieanlage ist gut recyclingfähig?",
      answers: [
        { text: "Der Turm aus Stahl", correct: true },
        { text: "Die Rotorblätter ohne Aufbereitung", correct: false },
        { text: "Der Rotorblatt‑Kunststoff ohne Recyclingoption", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Was bedeutet Repowering bei Windparks?",
      answers: [
        { text: "Ersetzen älterer Anlagen durch leistungsfähigere, oft mit weniger Anlagen", correct: true },
        { text: "Neue Windräder zusätzlich in bestehende Parks stellen, ohne alte zu entfernen", correct: false },
        { text: "Tägliches Abschalten der Rotoren zur Wartung", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Was beschreibt die Zahl der Volllaststunden einer Windanlage?",
      answers: [
        { text: "Die jährlichen Stunden, die bei voller Nennleistung äquivalent erzeugt werden", correct: true },
        { text: "Die täglichen Stunden, in denen der Turm stillsteht", correct: false },
        { text: "Die Anzahl der möglichen Rotorblatt-Parkpositionen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Welchen Effekt haben längere Rotorblätter auf den Ertrag einer Windenergieanlage?",
      answers: [
        { text: "Sie erhöhen die Energieausbeute", correct: true },
        { text: "Sie verringern immer den Ertrag", correct: false },
        { text: "Sie ändern nur die Farbe der Anlage", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Welcher Lärmtyp wird bei Windenergieanlagen oft diskutiert, ist aber meist unterhalb der Hörschwelle?",
      answers: [
        { text: "Infraschall", correct: true },
        { text: "Ultraschall", correct: false },
        { text: "Weißes Rauschen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Welches Phänomen (bei Sonneneinstrahlung) kann von Anwohnern als störend empfunden werden und wird bei Planung berücksichtigt?",
      answers: [
        { text: "Schattenwurf (Shadow‑Flicker)", correct: true },
        { text: "Blendwirkung durch Turmfarbe", correct: false },
        { text: "Magnetische Störungen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Welche Maßnahme reduziert Vogel- und Fledermausschäden an Windenergieanlagen am stärksten?",
      answers: [
        { text: "Sorgfältige Standortwahl und spezialisierte Prüfungen", correct: true },
        { text: "Lackieren der Rotorblätter in grellen Farben", correct: false },
        { text: "Erhöhen der Rotordrehzahl dauerhaft", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Warum sind hohe Türme an weniger windstarken Standorten sinnvoll?",
      answers: [
        { text: "Weil die Windgeschwindigkeit mit der Höhe in der Regel zunimmt", correct: true },
        { text: "Weil sie leichter zu transportieren sind", correct: false },
        { text: "Weil sie weniger Material benötigen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Welche Rolle spielt die Netzanschlussplanung bei Windprojekten?",
      answers: [
        { text: "Sie ist entscheidend für Wirtschaftlichkeit und Umsetzbarkeit", correct: true },
        { text: "Sie ist nur für Offshore relevant", correct: false },
        { text: "Sie wird erst nach Fertigstellung durchgeführt", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Womit lässt sich die lokale Akzeptanz für Windprojekte erhöhen?",
      answers: [
        { text: "Frühzeitiger Einbindung der Öffentlichkeit und Beteiligungsmodelle", correct: true },
        { text: "Geheimhaltung der Planungsunterlagen", correct: false },
        { text: "Ignorieren lokaler Bedenken", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    },
    {
      question: "Was ist in der Regel Voraussetzung, bevor ein Windpark realisiert wird?",
      answers: [
        { text: "Erforderliche Genehmigungen und Umweltprüfungen", correct: true },
        { text: "Eine schriftliche Garantie der Anwohner, keine Einwände zu erheben", correct: false },
        { text: "Mindestens zehn Jahre vorheriges Probebetrieb", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-windenergie/"
    }
  ],

  sun: [
    {
      question: "Welche Technologie wandelt Sonnenlicht direkt in elektrischen Strom um?",
      answers: [
        { text: "Photovoltaik", correct: true },
        { text: "Solarthermie", correct: false },
        { text: "Solarwärmepumpe", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Wofür werden Solarkollektoren (Solarthermie) primär eingesetzt?",
      answers: [
        { text: "Wärmeerzeugung, z. B. Warmwasserbereitung", correct: true },
        { text: "Direkte Stromerzeugung wie bei PV", correct: false },
        { text: "Abwasserreinigung", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Welche Komponente erhöht typischerweise den Eigenverbrauch eines Haushalts mit PV-Anlage?",
      answers: [
        { text: "Batteriespeicher", correct: true },
        { text: "Mehr Wechselrichter", correct: false },
        { text: "Kleinere Module", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Müssen defekte PV‑Module in den Restmüll entsorgt werden?",
      answers: [
        { text: "Nein, sie sind als Elektro‑Altgeräte bzw. zur Rücknahme/Recycling zu führen", correct: true },
        { text: "Ja, sie dürfen in die Biotonne", correct: false },
        { text: "Ja, im Hausmüll", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Ist eine Südausrichtung bei PV‑Dachanlagen immer zwingend am besten?",
      answers: [
        { text: "Nein — Ost/West‑Ausrichtungen können bei spezifischen Zielen (z. B. gleichmäßige Tagesproduktion) sinnvoll sein", correct: true },
        { text: "Ja — nur Süd liefert brauchbare Energie", correct: false },
        { text: "Nur bei Freiflächen ist Süd relevant", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Welche Kostenschätzung (netto) wird für schlüsselfertige Dachanlagen bis ca. 10 kWp genannt?",
      answers: [
        { text: "≈ 1.200 € pro installiertem kWp", correct: true },
        { text: "≈ 5.000 € pro kWp", correct: false },
        { text: "≈ 100 € pro kWp", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Wie lange dauert eine typische Amortisationszeit für eine Wohnhaus‑PV‑Anlage (Nähewerte)?",
      answers: [
        { text: "Rund 13–15 Jahre", correct: true },
        { text: "Unter 2 Jahren", correct: false },
        { text: "Über 40 Jahre", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Welche Anlagenform ist typischerweise pro kWp günstiger zu errichten?",
      answers: [
        { text: "Große Freiflächenanlagen", correct: true },
        { text: "Kleine Balkon‑Steckeranlagen", correct: false },
        { text: "Reine Solarthermie‑Anlagen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Wodurch kann die Leistung von PV‑Modulen dauerhaft beeinträchtigt werden?",
      answers: [
        { text: "Verschattung und Verschmutzung", correct: true },
        { text: "Ausschließlich durch Blitzschlag", correct: false },
        { text: "Nur durch Schnee", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Welche einfache Maßnahme kann die Jahreserträge von PV‑Anlagen verbessern?",
      answers: [
        { text: "Regelmäßige Reinigung und Entfernen von Verschattung", correct: true },
        { text: "Die Module nachts in den Keller bringen", correct: false },
        { text: "Module nur im Winter betreiben", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Was ist ein typischer Vorteil von steckerfertigen (Balkon‑)PV‑Anlagen?",
      answers: [
        { text: "Sie können den Eigenverbrauch kurzfristig erhöhen", correct: true },
        { text: "Sie ersetzen immer die Hausversorgung komplett", correct: false },
        { text: "Sie funktionieren nur bei direktem Sonnenlicht ohne Batterie", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Warum ist die Ausrichtung und Neigung der Module relevant?",
      answers: [
        { text: "Sie beeinflusst den zeitlichen Ertrag und die Jahresmengen", correct: true },
        { text: "Sie hat keinerlei Einfluss", correct: false },
        { text: "Nur die Modulfarbe ist entscheidend", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Welches Bauteil speichert elektrischen Strom aus PV‑Anlagen zur späteren Nutzung?",
      answers: [
        { text: "Batteriespeicher (Hausbatterie)", correct: true },
        { text: "Solarthermiekollektor", correct: false },
        { text: "Windgenerator", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    },
    {
      question: "Warum liefern PV‑Module im Sommer nicht immer deutlich mehr als im Winter trotz längerer Tage?",
      answers: [
        { text: "Die Einstrahlung und Sonnenhöhe sowie Temperatur beeinflussen Ertrag; Jahresverteilung variiert", correct: true },
        { text: "PV‑Module sind nur für Winterbetrieb gemacht", correct: false },
        { text: "PV‑Module funktionieren nur bei Regen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-solarenergie/"
    }
  ],

  heat: [
    {
      question: "Welches System nutzt Umweltenergie aus Luft, Erdreich oder Wasser zur Heizung?",
      answers: [
        { text: "Wärmepumpe", correct: true },
        { text: "Ölheizung", correct: false },
        { text: "Koksheizung", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Wofür steht die Abkürzung JAZ bei Wärmepumpen?",
      answers: [
        { text: "Jahresarbeitszahl", correct: true },
        { text: "Jährlicher Anschlusszuschlag", correct: false },
        { text: "Justierbare Ausgangszone", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Welche Kenngröße gibt das Verhältnis von abgegebener Wärme zu eingesetzter Antriebsenergie an (Kurzform)?",
      answers: [
        { text: "COP (Coefficient of Performance) bzw. Jahresarbeitszahl (JAZ)", correct: true },
        { text: "PS (Pferdestärke)", correct: false },
        { text: "Lumen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Welche Wärmequellen sind gängige Optionen für Wärmepumpen?",
      answers: [
        { text: "Luft, Erdreich (Sonden/Flächen) und Wasser", correct: true },
        { text: "Schmieröl und Kerosin", correct: false },
        { text: "Flüssiger Stickstoff", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Können Wärmepumpen zur Kühlung genutzt werden?",
      answers: [
        { text: "Ja, sie können aktiv oder passiv auch für Kühlung eingesetzt werden", correct: true },
        { text: "Nein, Wärmepumpen sind nur Heizgeräte", correct: false },
        { text: "Nur wenn sie mit Solarthermie kombiniert sind", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Wann kann eine zusätzliche Heizquelle sinnvoll sein?",
      answers: [
        { text: "Bei Luftwärmepumpen in sehr kalten Perioden als Ergänzung", correct: true },
        { text: "Wenn das Haus nur im Sommer genutzt wird", correct: false },
        { text: "Wenn ausschließlich Solarthermie vorhanden ist", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Welche Installationsform nutzt das Erdreich als Wärmequelle?",
      answers: [
        { text: "Erdsonden oder Erdkollektoren", correct: true },
        { text: "Dachfenster", correct: false },
        { text: "Pelletkessel", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Welches Verhalten der Heizverteilung verbessert die Effizienz eines Wärmepumpensystems?",
      answers: [
        { text: "Niedertemperaturheizung (Flächenheizung) und hydraulischer Abgleich", correct: true },
        { text: "Höhere Vorlauftemperaturen als nötig", correct: false },
        { text: "Einsatz vieler elektrischer Zusatzheizungen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Welche Komponente beeinflusst die Effizienz einer Luft‑Wärmepumpe besonders?",
      answers: [
        { text: "Außentemperatur und Systemauslegung", correct: true },
        { text: "Farbe der Hausfassade", correct: false },
        { text: "Anzahl der Zimmerpflanzen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Wie lange halten Wärmepumpen in der Regel technisch nutzbar?",
      answers: [
        { text: "Ca. 15–20 Jahre", correct: true },
        { text: "2–5 Jahre", correct: false },
        { text: "Über 50 Jahre ohne Austausch", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Wofür ist die Jahresarbeitszahl (JAZ) eine geeignete Kennzahl?",
      answers: [
        { text: "Zur Bewertung der realen Jahresleistung einer Wärmepumpe", correct: true },
        { text: "Zur Messung des Trinkwasserverbrauchs", correct: false },
        { text: "Zur Bestimmung der Pelletqualität", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Welche Kombination erhöht häufig die Klimafreundlichkeit einer Wärmepumpe?",
      answers: [
        { text: "Wärmepumpe kombiniert mit eigenem PV‑Strom", correct: true },
        { text: "Wärmepumpe kombiniert mit Ölheizung", correct: false },
        { text: "Wärmepumpe kombiniert mit Kohleofen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Was ist bei der Wahl des Wärmequellentyps (Luft vs. Erdreich) zu bedenken?",
      answers: [
        { text: "Erdreich liefert konstantere Quelle, Luft ist meist günstiger in der Installation", correct: true },
        { text: "Luft ist immer effizienter als Erdreich", correct: false },
        { text: "Nur Erdreich kann Kühlung liefern", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Welche Rolle spielt die Gebäudehülle für die Systemwahl einer Wärmepumpe?",
      answers: [
        { text: "Ein gut gedämmtes Gebäude ermöglicht niedrigere Vorlauftemperaturen und höhere Effizienz", correct: true },
        { text: "Gebäudedämmung hat keinen Einfluss", correct: false },
        { text: "Mehr Fenster verringern unbedingt den Wärmebedarf", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    },
    {
      question: "Welche Maßnahme sollte bei Planung einer Wärmepumpe unbedingt erfolgen?",
      answers: [
        { text: "Professionelle Auslegung und Dimensionierung des Systems", correct: true },
        { text: "Größere Anlage als empfohlen wählen, ohne Auslegung", correct: false },
        { text: "Nur auf Erfahrungswerte des Nachbarn vertrauen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-umweltwaerme/"
    }
  ],

  eff: [
    {
      question: "Welche Maßnahme spart typischerweise am meisten Heizenergie im Altbau?",
      answers: [
        { text: "Dämmung der Gebäudehülle und hydraulischer Abgleich", correct: true },
        { text: "Thermostatfarbe", correct: false },
        { text: "Fensteraufkleber", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Was beschreibt der U‑Wert eines Bauteils?",
      answers: [
        { text: "Den Wärmedurchgang eines Bauteils", correct: true },
        { text: "Die elektrische Leitfähigkeit", correct: false },
        { text: "Die Luftdichtigkeit", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Welche Beleuchtung ist energieeffizient?",
      answers: [
        { text: "LED", correct: true },
        { text: "Halogenlampen", correct: false },
        { text: "Glühlampen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Was bedeutet Suffizienz im energetischen Kontext?",
      answers: [
        { text: "Notwendigen Energieverbrauch vermeiden bzw. reduzieren", correct: true },
        { text: "Ausschließlich effizientere Technik kaufen", correct: false },
        { text: "Mehr Energie produzieren", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Was ist der Rebound‑Effekt?",
      answers: [
        { text: "Teilweise höherer Energieverbrauch durch nachlässigeres Verhalten trotz Effizienzgewinnen", correct: true },
        { text: "Ein Effizienzlabel für Haushaltsgeräte", correct: false },
        { text: "Ein staatliches Förderprogramm", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Welche einfache Maßnahme reduziert Standby‑Verluste bei Geräten?",
      answers: [
        { text: "Ausschaltbare Steckerleisten bzw. Geräte komplett vom Netz trennen", correct: true },
        { text: "Geräte dauerhaft im Standby lassen", correct: false },
        { text: "Immer die höchste Leistungsstufe nutzen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Welche Reihenfolge beschreibt den Energie‑3‑Sprung korrekt?",
      answers: [
        { text: "1) Bedarf senken, 2) Effizienz steigern, 3) Erneuerbare Energien ausbauen", correct: true },
        { text: "1) Erneuerbare ausbauen, 2) Effizienz, 3) Bedarf erhöhen", correct: false },
        { text: "1) Effizienz, 2) Bedarf steigern, 3) Export erhöhen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Welche Energieeffizienzklassen werden seit der Umstellung (ab 2021) wieder verwendet?",
      answers: [
        { text: "Klassen A bis G", correct: true },
        { text: "A+++ bis D", correct: false },
        { text: "Skala 1–10", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Wieviel Anteil hat Waschen & Trocknen näherungsweise am Haushaltsenergieverbrauch?",
      answers: [
        { text: "Ca. 13 %", correct: true },
        { text: "Ca. 50 %", correct: false },
        { text: "Ca. 2 %", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Was ist ein zentraler Hebel zur Senkung des Energiebedarfs in Gebäuden?",
      answers: [
        { text: "Verbesserte Dämmung und Einbau effizienter Haustechnik", correct: true },
        { text: "Mehr elektrische Zusatzheizungen", correct: false },
        { text: "Weniger Fenster für bessere Belüftung", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Was macht ein hydraulischer Abgleich?",
      answers: [
        { text: "Er stellt sicher, dass Wärme gleichmäßig und effizient im Heizsystem verteilt wird", correct: true },
        { text: "Er misst die Luftfeuchtigkeit", correct: false },
        { text: "Er kontrolliert den Stromverbrauch der Pumpe nicht", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Welcher Tipp hilft sofort beim Stromsparen im Haushalt?",
      answers: [
        { text: "Ausschalten statt Standby und energieeffiziente Geräte wählen", correct: true },
        { text: "Mehr Geräte anschaffen", correct: false },
        { text: "Alle Lichter permanent anlassen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Warum ist richtiges Lüften wichtig für Energieeffizienz?",
      answers: [
        { text: "Es verhindert Feuchte‑ und Schimmelprobleme und reduziert Wärmeverluste bei stoßweisem Lüften", correct: true },
        { text: "Es erhöht immer den Energiebedarf drastisch", correct: false },
        { text: "Es ersetzt vollständig Dämmmaßnahmen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Welcher Ansatz reduziert Energiebedarf langfristig am stärksten?",
      answers: [
        { text: "Gebäudemodernisierung (Dämmung, Fenster, Heizungssanierung)", correct: true },
        { text: "Verstärktes Heizen bei offenem Fenster", correct: false },
        { text: "Nur mehr Solarpanele montieren ohne Dämmung", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    },
    {
      question: "Was ist ein typisches Verhalten, das den Nutzen effizienterer Technik abschwächen kann?",
      answers: [
        { text: "Nachlässigerer Verbrauch (Rebound‑Effekt)", correct: true },
        { text: "Strikte Einhaltung der Bedienungsanleitung", correct: false },
        { text: "Nutzung energieeffizienter Geräte", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-effizienz/"
    }
  ],

  biogas: [
    {
      question: "Welches Gas ist der Hauptbestandteil von Biogas?",
      answers: [
        { text: "Methan (CH4)", correct: true },
        { text: "Sauerstoff (O2)", correct: false },
        { text: "Stickstoff (N2)", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Welche Einsatzstoffe sind in landwirtschaftlichen Biogasanlagen typisch?",
      answers: [
        { text: "Gülle und Energiepflanzen", correct: true },
        { text: "Steinkohle", correct: false },
        { text: "Kerosin", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Wofür kann aufbereitetes Biomethan verwendet werden?",
      answers: [
        { text: "Als Kraftstoff (CNG/CBG) oder zur Einspeisung in das Erdgasnetz", correct: true },
        { text: "Direkt als Rohbenzin fürs Flugzeug ohne Aufbereitung", correct: false },
        { text: "Als Lebensmittel", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Wie werden Gärreste aus Biogasanlagen meist genutzt?",
      answers: [
        { text: "Als Dünger/Wirtschaftsdünger auf Feldern", correct: true },
        { text: "Als Trinkwasser", correct: false },
        { text: "Als Verpackungsmaterial", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Gibt es pauschale, bedingungslose Investitionszuschüsse für Biogasanlagen?",
      answers: [
        { text: "Nein, Zuschüsse sind meist zweckgebunden und an Bedingungen geknüpft", correct: true },
        { text: "Ja, immer für jede Anlage", correct: false },
        { text: "Nur für Anlagen unter 1 kW", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Was ist Co‑Vergärung in Biogasanlagen?",
      answers: [
        { text: "Gleichzeitige Vergärung verschiedener Substrate zur Optimierung der Gasproduktion", correct: true },
        { text: "Verbrennung von Biogas in Co‑Kesseln", correct: false },
        { text: "Ein separates Abfalllager außerhalb der Anlage", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Welche Sicherheitsthemen werden bei Biogasanlagen häufig behandelt?",
      answers: [
        { text: "Explosions- und Hygienerisiken sowie Lagerungssicherheit", correct: true },
        { text: "Nur Brandschutz bei großen Anlagen", correct: false },
        { text: "Keine speziellen Sicherheitsanforderungen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Welche Rolle spielen Substratkosten für die Wirtschaftlichkeit einer Biogasanlage?",
      answers: [
        { text: "Eine große Rolle; günstige Rohstoffe verbessern die Wirtschaftlichkeit", correct: true },
        { text: "Überhaupt keinen Einfluss", correct: false },
        { text: "Nur bei Anlagen unter 10 kW relevant", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Was ist eine mögliche Weiterverwendung von Biogas vor Ort?",
      answers: [
        { text: "Betrieb eines Blockheizkraftwerks (KWK) zur Strom‑ und Wärmeversorgung", correct: true },
        { text: "Direktes Einspeisen in Trinkwasserleitungen", correct: false },
        { text: "Verwendung als Baumaterial", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Warum kann die Aufbereitung von Biogas zu Biomethan sinnvoll sein?",
      answers: [
        { text: "Um das Gas netz‑ oder fahrzeugtauglich zu machen", correct: true },
        { text: "Um das Gas sofort zu trinken", correct: false },
        { text: "Um das Volumen zu verdoppeln", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Welche Umweltfrage ist bei Einsatz von Energiepflanzen für Biogas relevant?",
      answers: [
        { text: "Flächenkonkurrenz zur Nahrungsmittelproduktion und Biodiversität", correct: true },
        { text: "Biogas verbraucht keine Energiepflanzen", correct: false },
        { text: "Energiepflanzen sind immer die umweltfreundlichste Option", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Welche Maßnahme verbessert die Akzeptanz von Biogasprojekten in der Region?",
      answers: [
        { text: "Transparente Information über Substrate und Emissionsschutzmaßnahmen", correct: true },
        { text: "Geheimhaltung der Betriebsdaten", correct: false },
        { text: "Verzicht auf jegliche Sicherheitsstandards", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Wie lässt sich die Netzintegration von Biogas‑Kraftwerken zweckmäßig gestalten?",
      answers: [
        { text: "Durch Einsatz flexibler Betriebsstrategien und bedarfsgerechte Erzeugung", correct: true },
        { text: "Durch dauerhaftes Abschalten bei hoher Solarproduktion", correct: false },
        { text: "Durch Einspeisung nur an Sonntagen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    },
    {
      question: "Welches Nebenprodukt entsteht bei der Vergärung und kann wirtschaftlich genutzt werden?",
      answers: [
        { text: "Gärrest (als Wirtschaftsdünger)", correct: true },
        { text: "Kohleasche", correct: false },
        { text: "Flüssiger Asphalt", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-biogas/"
    }
  ],

  wood: [
    {
      question: "Welcher Holzbrennstoff gilt als klimafreundlich bei moderner Verbrennungstechnik?",
      answers: [
        { text: "Holzpellets", correct: true },
        { text: "Braunkohlebriketts", correct: false },
        { text: "Schweröl", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Worauf sollte man bei Scheitholz für effizientes Heizen besonders achten?",
      answers: [
        { text: "Geringe Holzfeuchte", correct: true },
        { text: "Bunte Lackschichten", correct: false },
        { text: "Sehr lange Scheite (> 1 m)", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Was verteilen Wärmenetze überwiegend?",
      answers: [
        { text: "Wärme aus zentraler Erzeugung", correct: true },
        { text: "Druckluft für Industrieanlagen", correct: false },
        { text: "Kohlendioxid für Gewächshäuser", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Warum werden moderne Holzfeuerungen mit Abgasreinigung als akzeptabler eingestuft?",
      answers: [
        { text: "Weil sie Emissionen deutlich reduzieren und effizienter arbeiten", correct: true },
        { text: "Weil Holz keinerlei Emissionen verursacht", correct: false },
        { text: "Weil sie billiger als Luft sind", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Welches Thema betrifft Betreiber größerer Holzenergieanlagen (Schwellenwert)?",
      answers: [
        { text: "Zertifizierungspflichten ab bestimmten Feuerungsleistungen (RED III‑Anforderungen)", correct: true },
        { text: "Verbot der Nutzung von Holzpellets", correct: false },
        { text: "Pflicht zum Einsatz von Kohle als Backup", correct: false }
      ],
      source: "https://www.carmen-ev.de/2025/03/28/zertifizierungspflicht-fuer-holzenergieanlagen-ab-75-mw/"
    },
    {
      question: "Welche Form der Wärmeversorgung empfiehlt sich für dicht bebaute Ortsteile?",
      answers: [
        { text: "Zentrale Erzeugung (z. B. Heizwerk) und Verteilung über Wärmenetz", correct: true },
        { text: "Jeder Haushalt eigene Ölheizung", correct: false },
        { text: "Nur mobile elektrische Heizlüfter", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Welche Rolle spielt regionale Verfügbarkeit bei Energieholz?",
      answers: [
        { text: "Sie ist wichtig — Energieholzmärkte sind überwiegend regional geprägt", correct: true },
        { text: "Regionale Verfügbarkeit ist irrelevant", correct: false },
        { text: "Holz wird ausschließlich importiert", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/positionspapier-energieholznutzung-und-klimaschutz/"
    },
    {
      question: "Was ist ein Vorteil von Holzpellets gegenüber unsortiertem Restholz?",
      answers: [
        { text: "Konstante Brennstoffqualität und automatisierbare Lagerung/Feuerung", correct: true },
        { text: "Pellets haben immer höhere Emissionen", correct: false },
        { text: "Pellets sind wasserlöslich", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Wofür werden Biomasseheizwerke häufig eingesetzt?",
      answers: [
        { text: "Zur Bereitstellung von Wärme für Quartiere und Industrieprozesse", correct: true },
        { text: "Als Trinkwasseraufbereitung", correct: false },
        { text: "Als Solarspeicher", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Welche Maßnahme hilft, Aschen aus Holzverbrennung zu verwerten?",
      answers: [
        { text: "Gezielte Ascheverwertung nach Leitfäden und gesetzlichen Vorgaben", correct: true },
        { text: "Asche ins Grundwasser leiten", correct: false },
        { text: "Asche ungeprüft auf Spielplätzen verteilen", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Welcher Aspekt ist bei Planung eines Wärmenetzes finanziell relevant?",
      answers: [
        { text: "Förderprogramme und Wirtschaftlichkeits‑Berechnungen", correct: true },
        { text: "Anzahl der Fenster im Haus", correct: false },
        { text: "Länge der benachbarten Flüsse", correct: false }
      ],
      source: "https://www.carmen-ev.de/2022/10/05/bundesfoerderung-fuer-effiziente-waermenetze-bew/"
    },
    {
      question: "Welche Technik kann Prozesswärme in der Industrie ersetzen?",
      answers: [
        { text: "Holzenergie und biomassebasierte Systeme in Kombination mit Wärmerückgewinnung", correct: true },
        { text: "Offshore‑Wind direkt im Firmengebäude", correct: false },
        { text: "Elektrische Heizlüfter ohne Regelung", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Warum sind Wärmenetze ein sinnvolles Mittel zur Dekarbonisierung?",
      answers: [
        { text: "Sie ermöglichen zentrale Erzeugung mit erneuerbaren Quellen und Kopplung unterschiedlicher Erzeuger", correct: true },
        { text: "Weil sie fossile Brennstoffe direkt verteilen", correct: false },
        { text: "Weil sie nur in Großstädten gebaut werden können", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    },
    {
      question: "Was ist bei Lagerung von Holzpellets wichtig?",
      answers: [
        { text: "Trockenheit und geschützte Lagerbedingungen", correct: true },
        { text: "Lagerung direkt im Freien ohne Schutz", correct: false },
        { text: "Pellets in Wasser einweichen", correct: false }
      ],
      source: "https://www.carmen-ev.de/holzenergie-und-waerrmenetze/"
    }
  ],

  mat: [
    {
      question: "Was versteht man unter stofflicher Nutzung nachwachsender Rohstoffe?",
      answers: [
        { text: "Einsatz als Material (z. B. Biokunststoffe, Fasern) statt ausschließlicher energetischer Nutzung", correct: true },
        { text: "Ausschließlich Verbrennung zur Energiegewinnung", correct: false },
        { text: "Nur Stromerzeugung", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-paludikultur-2/"
    },
    {
      question: "Was ist Paludikultur?",
      answers: [
        { text: "Nutzung wiedervernässter Moorflächen zur Produktion spezialisierter Biomasse", correct: true },
        { text: "Trockenfeldbau auf Moorböden", correct: false },
        { text: "Eine Form der intensiven Viehwirtschaft", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-paludikultur-2/"
    },
    {
      question: "Welche Einsatzmöglichkeiten bieten Pflanzen aus Paludikulturen?",
      answers: [
        { text: "Baustoffe, Einstreu, Dämmstoffe und Rohstoffe für Bioraffinerien", correct: true },
        { text: "Nur zur Erzeugung von Kohle", correct: false },
        { text: "Keine wirtschaftliche Nutzung möglich", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-paludikultur-2/"
    },
    {
      question: "Was ist das Ziel einer Bioraffinerie?",
      answers: [
        { text: "Verschiedene Produkte (Materialien, Chemikalien, Energie) aus Biomasse zu erzeugen", correct: true },
        { text: "Nur Holz zu verbrennen", correct: false },
        { text: "Rohöl in Produkte umzuwandeln", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-bioraffinerien/"
    },
    {
      question: "Welche Vorteile bieten biobasierte Werkstoffe wie Flachs oder Hanf?",
      answers: [
        { text: "Sie sind nachwachsend und für Dämmstoffe, Fasern und Werkstoffe nutzbar", correct: true },
        { text: "Sie sind chemisch identisch mit Asbest", correct: false },
        { text: "Sie können nur als Brennstoff verwendet werden", correct: false }
      ],
      source: "https://www.carmen-ev.de/industriepflanzen/"
    },
    {
      question: "Was sind Biokunststoffe?",
      answers: [
        { text: "Kunststoffe auf Basis nachwachsender Rohstoffe oder biologisch abbaubarer Polymere", correct: true },
        { text: "Kunststoffe aus reinem Erdöl", correct: false },
        { text: "Nur Glasfasern", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-bioraffinerien/"
    },
    {
      question: "Welche Rolle spielen Bioraffinerien in der Bioökonomie?",
      answers: [
        { text: "Sie ermöglichen die flexible Produktion vieler Produkte aus Biomasse und erhöhen Ressourceneffizienz", correct: true },
        { text: "Sie sind reine Verfeuerungsanlagen", correct: false },
        { text: "Sie ersetzen alle petrochemischen Anlagen sofort", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-bioraffinerien/"
    },
    {
      question: "Wofür können pflanzliche Fasern wie Flachs verwendet werden?",
      answers: [
        { text: "Für Textilien, Dämmstoffe und Verbundwerkstoffe", correct: true },
        { text: "Nur als Deponiematerial", correct: false },
        { text: "Nur als chemische Lösemittel", correct: false }
      ],
      source: "https://www.carmen-ev.de/industriepflanzen/"
    },
    {
      question: "Welche Eigenschaft ist für stoffliche Nutzung von Rohstoffen besonders wichtig?",
      answers: [
        { text: "Langlebigkeit/Materialfunktion statt sofortiger Verbrennung", correct: true },
        { text: "Sofortige Verbrennbarkeit", correct: false },
        { text: "Unbedingte Eignung als Futtermittel", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-bioraffinerien/"
    },
    {
      question: "Wie können Paludikulturen klimatisch positiv wirken?",
      answers: [
        { text: "Sie ermöglichen Nutzung bei gleichzeitigem Moorschutz und Treibhausgasminderung", correct: true },
        { text: "Sie erhöhen automatisch CO2‑Emissionen", correct: false },
        { text: "Sie zerstören die Biodiversität zwingend", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-paludikultur-2/"
    },
    {
      question: "Was ist ein mögliches Produkt aus der stofflichen Nutzung von Nachwachsenden Rohstoffen?",
      answers: [
        { text: "Dämmplatten aus Pflanzenfasern", correct: true },
        { text: "Erdölprodukte direkt aus Pflanzen", correct: false },
        { text: "Flüssiges Metall", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-paludikultur-2/"
    },
    {
      question: "Welche Herausforderung besteht bei stofflicher Nutzung im Vergleich zu energetischer Nutzung?",
      answers: [
        { text: "Aufbau stabiler Wertschöpfungsketten und Marktzugänge", correct: true },
        { text: "Es gibt keine Herausforderungen", correct: false },
        { text: "Stoffliche Nutzung ist immer billiger", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-bioraffinerien/"
    },
    {
      question: "Welche Rolle spielt Industriehanf in der stofflichen Nutzung?",
      answers: [
        { text: "Hanf liefert Fasern und Rohstoffe für Werkstoffe und Bauanwendungen", correct: true },
        { text: "Hanf ist nur für Rauschmittelproduktion geeignet", correct: false },
        { text: "Hanf kann nur als Dünger verwendet werden", correct: false }
      ],
      source: "https://www.carmen-ev.de/industriepflanzen/"
    },
    {
      question: "Was ist ein Vorteil stofflicher Nutzung gegenüber alleiniger Verbrennung?",
      answers: [
        { text: "Längere CO2‑Speicherung in langlebigen Produkten und höherer Wertschöpfung", correct: true },
        { text: "Sofort bessere Stromerzeugung", correct: false },
        { text: "Geringere Rohstoffeffizienz", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-bioraffinerien/"
    }
  ],

  sust: [
    {
      question: "Wie wird Nachhaltigkeit häufig in der Forstwirtschaft formuliert?",
      answers: [
        { text: "Nicht mehr entnehmen, als nachwächst", correct: true },
        { text: "So viel wie möglich entnehmen", correct: false },
        { text: "Nur Monokulturen pflanzen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Welche drei Dimensionen umfasst Nachhaltigkeit klassisch?",
      answers: [
        { text: "Ökologie, Ökonomie, Soziales", correct: true },
        { text: "Technik, Markt, Werbung", correct: false },
        { text: "Kultur, Sport, Freizeit", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Welche globalen Ziele dienen oft als Orientierung für nachhaltige Entwicklung?",
      answers: [
        { text: "Die 17 Sustainable Development Goals (SDGs)", correct: true },
        { text: "Die 7 Weltmeere‑Initiative", correct: false },
        { text: "Die 12 Kulturziele", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Was bedeutet zirkuläres Wirtschaften in einem Satz?",
      answers: [
        { text: "Ressourcen möglichst lange nutzen, wiederverwenden und stofflich/technisch recyceln", correct: true },
        { text: "Einmalige Nutzung und sofort entsorgen", correct: false },
        { text: "Nur fossile Rohstoffe verwenden", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Warum ist nachhaltige Beschaffung wichtig für Kommunen und Unternehmen?",
      answers: [
        { text: "Sie reduziert Umwelt- und Klimabelastungen und fördert faire Lieferketten", correct: true },
        { text: "Sie erhöht automatisch den Energieverbrauch", correct: false },
        { text: "Sie ersetzt alle technischen Maßnahmen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Was ist ein normatives Ziel von Nachhaltigkeit?",
      answers: [
        { text: "Gerechtigkeit gegenüber heutigen und zukünftigen Generationen", correct: true },
        { text: "Maximaler kurzfristiger Profit", correct: false },
        { text: "Ausschließlich technologischer Fortschritt", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Welches Instrument kann Kommunen bei der nachhaltigen Energieplanung unterstützen?",
      answers: [
        { text: "Energienutzungsplan", correct: true },
        { text: "Briefmarkensammlung", correct: false },
        { text: "Autowaschplan", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Welche Rolle spielt Bildung für die Nachhaltigkeitstransformation?",
      answers: [
        { text: "Sie vermittelt Wissen und fördert Verhaltensänderung zur Umsetzung nachhaltiger Praktiken", correct: true },
        { text: "Sie ist unwichtig im Transformationsprozess", correct: false },
        { text: "Sie wird nur in Industriestaaten gebraucht", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Was versteht man unter nachhaltiger Lieferkette?",
      answers: [
        { text: "Berücksichtigung von sozialen, ökologischen und ökonomischen Kriterien entlang der Wertschöpfungskette", correct: true },
        { text: "Maximaler Profit unabhängig von Lieferantenbedingungen", correct: false },
        { text: "Lokale Beschaffung ohne Prüfung", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Wie kann Kommunen Nachhaltigkeit praktisch fördern?",
      answers: [
        { text: "Durch kommunale Beschaffungsstandards, Energieplanung und Bildungsangebote", correct: true },
        { text: "Indem sie alle Maßnahmen verbieten", correct: false },
        { text: "Indem sie nur Sportveranstaltungen fördern", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Welche Bedeutung hat circular management (Kreislaufwirtschaft) für Klimaschutz?",
      answers: [
        { text: "Sie reduziert Rohstoffverbrauch und Emissionen durch Wiederverwendung und Recycling", correct: true },
        { text: "Sie erhöht automatisch Emissionen", correct: false },
        { text: "Sie ist nur für den Kulturbereich relevant", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Welche Rolle spielen verbindliche Ziele in nachhaltiger Unternehmensführung?",
      answers: [
        { text: "Sie schaffen Orientierung und ermöglichen Fortschrittsmessung", correct: true },
        { text: "Sie verhindern jegliche Innovation", correct: false },
        { text: "Sie sind nur für NGOs wichtig", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Was kann eine Kommune als erstes tun, um nachhaltiger zu werden?",
      answers: [
        { text: "Einen Energienutzungsplan erstellen und gezielte Maßnahmen planen", correct: true },
        { text: "Nur auf fossile Energiequellen setzen", correct: false },
        { text: "Alle öffentlichen Verkehrsmittel einstellen", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Warum sind praxisnahe Informationen (z. B. FAQs) für Nachhaltigkeit wichtig?",
      answers: [
        { text: "Sie helfen, komplexe Themen verständlich zu machen und Entscheidungen vor Ort zu treffen", correct: true },
        { text: "Sie ersetzen gesetzliche Vorgaben", correct: false },
        { text: "Sie sind nur für Forschende relevant", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    },
    {
      question: "Wie tragen SDGs (Sustainable Development Goals) zur lokalen Planung bei?",
      answers: [
        { text: "Sie bieten einen Rahmen für integrierte Ziele und Maßnahmen", correct: true },
        { text: "Sie sind nur für nationale Regierungen gedacht", correct: false },
        { text: "Sie ersetzen lokale Zielsetzungen vollständig", correct: false }
      ],
      source: "https://www.carmen-ev.de/service/faqten/faq/faq-nachhaltigkeit/"
    }
  ]
};

// ---------- DOM-Elemente ----------
const modeSection     = document.getElementById('mode-selection');
const catSection      = document.getElementById('category-selection');
// ---------- Start-Button ----------
const startBtn = document.getElementById('start-quiz-btn');

startBtn.addEventListener('click', () => {
  // Startkarte ausblenden
  modeSection.classList.add('hidden');

  // Kategorie-Buttons aufbauen und anzeigen
  buildCategoryButtons();
  catSection.classList.remove('hidden');
});

const quizSection     = document.getElementById('quiz');
const resultSection   = document.getElementById('result');
const catButtonsWrap  = document.getElementById('category-buttons');
const wheel           = document.getElementById('wheel');
const spinBtn         = document.getElementById('spin-btn');

const titleEl   = document.getElementById('quiz-title');
const progress  = document.getElementById('progress');
const qEl       = document.getElementById('question');
const answersEl = document.getElementById('answers');
const feedback  = document.getElementById('feedback');
const sourceEl  = document.getElementById('source');
const nextBtn   = document.getElementById('next-btn');
const backBtn   = document.getElementById('back-btn');
const scoreEl   = document.getElementById('score');
const breakdown = document.getElementById('breakdown');
const restartBtn= document.getElementById('restart-btn');

// ---------- Initialisierung ----------
backBtn.addEventListener('click', () => {
  quizSection.classList.add('hidden');
  catSection.classList.remove('hidden');
});

restartBtn.addEventListener('click', () => {
  resultSection.classList.add('hidden');
  catSection.classList.remove('hidden');
});

nextBtn.addEventListener('click', nextQuestion);

spinBtn.addEventListener('click', spinWheel);

buildCategoryButtons();

// ---------- UI-Aufbau ----------
function buildCategoryButtons(){
  catButtonsWrap.innerHTML = '';
  Object.entries(CATS).forEach(([key, val]) => {
    const b = document.createElement('button');
    b.className = 'category-btn';
    b.style.background = val.color;
    b.textContent = val.label;
    b.addEventListener('click', () => startCategory(key));
    catButtonsWrap.appendChild(b);
  });
}

// ---------- Glücksrad ----------
function spinWheel(){
  const keys = Object.keys(CATS);
  const targetIndex = Math.floor(Math.random() * keys.length);
  const spins = 5; // volle Runden
  const sliceDeg = 360 / keys.length;
  const endDeg = spins*360 + targetIndex * sliceDeg + (sliceDeg/2);

  wheel.style.transition = 'transform 2.2s cubic-bezier(.19,1,.22,1)';
  wheel.style.transform = `rotate(${endDeg}deg)`;

  spinBtn.disabled = true;
  setTimeout(() => {
    spinBtn.disabled = false;
    startCategory(keys[targetIndex]);
  }, 2300);
}

// ---------- Kategorie starten ----------
function startCategory(key){
  CURRENT_CAT_KEY = key;
  CURRENT_COLOR = CATS[key].color;

  // Fragenpool kopieren & mischen
  const pool = QUESTION_BANK[key] ? [...QUESTION_BANK[key]] : [];
  shuffle(pool);

  // Nur 3 Fragen pro Runde
  currentQuestions = pool.slice(0, 3);

  idx = 0;
  score = 0;

  catSection.classList.add('hidden');
  quizSection.classList.remove('hidden');

  titleEl.textContent = CATS[key].label;
  showQuestion();
}


// ---------- Frage rendern ----------
function showQuestion(){
  if (idx >= currentQuestions.length) return endQuiz();

  const q = currentQuestions[idx];

  qEl.textContent = q.question;
  answersEl.innerHTML = '';
  feedback.textContent = '';
  feedback.className = 'feedback';

  const answers = shuffle([...q.answers]);

  answers.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = a.text;
    btn.dataset.correct = a.correct;
    btn.addEventListener('click', () => handleAnswer(btn, a.correct, q.source));
    answersEl.appendChild(btn);
  });

  progress.textContent = `Frage ${idx+1} / ${currentQuestions.length}`;

  nextBtn.classList.add('hidden');
  sourceEl.innerHTML = '';
}

// ---------- Antwort-Handling ----------
function handleAnswer(btn, isCorrect, source){
  const all = [...answersEl.querySelectorAll('button')];
  all.forEach(b => b.disabled = true);
   
// Nutzerantwort speichern
  currentQuestions[idx].userAnswer = isCorrect;
// Score erhöhen 
  if (isCorrect){
    btn.classList.add('correct');
    feedback.textContent = '✅ Richtig!';
    feedback.classList.add('ok');
    score++;
  } else {
    btn.classList.add('wrong');
    feedback.textContent = '❌ Falsch!';
    feedback.classList.add('bad');

    const answerButtons = [...answersEl.querySelectorAll('button')];
    answerButtons.forEach(button => {
      if (button.dataset.correct === "true") {
        button.classList.add("correct");
      }
    });
    const correctAnswerText = getCorrectAnswerText();
    feedback.innerHTML += `<br>Die richtige Antwort ist: <strong>${correctAnswerText}</strong>`;
  }

  if (source) {
    sourceEl.innerHTML = `Quelle: <a href="${source}" target="_blank" rel="noopener">${source}</a>`;
  } else {
    sourceEl.innerHTML = '';
  }

  nextBtn.classList.remove('hidden');
}

function getCorrectAnswerText() {
  const currentQuestion = currentQuestions[idx];
  const correctAnswer = currentQuestion.answers.find(a => a.correct);
  return correctAnswer ? correctAnswer.text : '';
}


// ---------- Nächste Frage ----------
function nextQuestion(){
  idx++;
  if (idx < currentQuestions.length){
    showQuestion();
  } else {
    endQuiz();
  }
}

// ---------- Ende & Auswertung ----------
function endQuiz(){
  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  // Score anzeigen
  scoreEl.textContent = `Du hast ${score} von ${currentQuestions.length} Fragen richtig beantwortet.`;

  // Breakdown
  const breakdownEl = document.getElementById('breakdown');
  let breakdownHTML = '';
  currentQuestions.forEach((q, i) => {
    const isCorrect = q.userAnswer === true;
    breakdownHTML += `
      <div class="breakdown-item ${isCorrect ? 'correct' : 'wrong'}">
        Frage ${i+1}: ${isCorrect ? '✔️ Richtig' : '❌ Falsch'}
      </div>
    `;
  });
  breakdownEl.innerHTML = breakdownHTML;

  // Zufälliger Hinweis
  const HINTS = [
    { text: "📩 Melde dich zu unserem Newsletter an!", url: "https://www.carmen-ev.de/service/newsletter/" },
    { text: "📅 Entdecke unseren Veranstaltungskalender", url: "https://www.carmen-ev.de/c-a-r-m-e-n-veranstaltungskalender/" },
    { text: "🎧 Höre die C.A.R.M.E.N.-Podcasts", url: "https://www.carmen-ev.de/service/publikationen/c-a-r-m-e-n-podcasts/" },
    { text: "📖 Stöbere in unseren Broschüren & Flyern", url: "https://www.carmen-ev.de/service/publikationen/publikationen-broschueren-und-flyer/" },
    { text: "ℹ️ Erfahre mehr über C.A.R.M.E.N. e.V.", url: "https://www.carmen-ev.de/c-a-r-m-e-n-e-v/" },
    { text: "📸 Folge uns auf Instagram", url: "https://www.instagram.com/c.a.r.m.e.n.e.v/" },
    { text: "📘 Besuche uns auf Facebook", url: "https://www.facebook.com/CentralesAgrarRohstoffMarketingundEnergieNetzwerk/?locale=de_DE" },
    { text: "💼 Vernetze dich mit uns auf LinkedIn", url: "https://de.linkedin.com/company/carmenevCentralesAgrarRohstoffMarketingundEnergieNetzwerk/?locale=de_DE" },
    { text: "▶️ Abonniere unseren YouTube-Kanal", url: "https://www.youtube.com/@c.a.r.m.e.n.e.v.9184" }
  ];

  const randomHint = HINTS[Math.floor(Math.random() * HINTS.length)];
  const extraHintEl = document.getElementById('extra-hint');
  if (extraHintEl) {
    extraHintEl.innerHTML = `<a href="${randomHint.url}" target="_blank" rel="noopener">${randomHint.text}</a>`;
  }
}

// ---------- Utils ----------
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ==============================
   ➕ So erweiterst du den Fragenpool auf 18+/Kategorie:
   - Suche in QUESTION_BANK die gewünschte Kategorie (z. B. wind) und füge weitere
     Frageobjekte am Ende des Arrays ein (siehe Struktur oben).
   - Achte darauf, dass genau EINE Antwort pro Frage 'correct: true' hat.
   - Nutze als Quelle bitte die entsprechende Seite auf www.carmen-ev.de.
   - Antworten werden bei jeder Anzeige neu gemischt.
   ==============================*/
