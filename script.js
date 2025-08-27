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
      source: "https://www.carmen-ev.de/infothek/windenergie/"
    },
    {
      question: "Welche Hauptkomponente einer Windenergieanlage ist gut recycelbar?",
      answers: [
        { text: "Stahl des Turms", correct: true },
        { text: "Generatoröl", correct: false },
        { text: "Rotorblatt-Verbundkunststoffe", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/windenergie/"
    },
    {
      question: "Wie lange beträgt die typische Lebensdauer moderner Windenergieanlagen?",
      answers: [
        { text: "20–25 Jahre", correct: true },
        { text: "5–10 Jahre", correct: false },
        { text: "40–50 Jahre", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/windenergie/"
    },
    {
      question: "Was bestimmt maßgeblich den Energieertrag von Windanlagen?",
      answers: [
        { text: "Rotorlackierung", correct: false },
        { text: "Windangebot/Standortqualität", correct: true },
        { text: "Turmfarbe", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/windenergie/"
    }
  ],
  sun: [
    {
      question: "Welche Technologie wandelt Sonnenlicht direkt in Strom um?",
      answers: [
        { text: "Solarthermie", correct: false },
        { text: "Photovoltaik", correct: true },
        { text: "Biophotonik", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/sonnenenergie/photovoltaik/"
    },
    {
      question: "Was verbessert den Eigenverbrauch bei PV-Anlagen im Haushalt?",
      answers: [
        { text: "Batteriespeicher", correct: true },
        { text: "Kleinere Module", correct: false },
        { text: "Weiße Dachziegel", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/sonnenenergie/photovoltaik/"
    },
    {
      question: "Wofür wird Solarthermie primär genutzt?",
      answers: [
        { text: "Wärmeerzeugung (z. B. Warmwasser)", correct: true },
        { text: "Stromerzeugung", correct: false },
        { text: "Klimatisierung mit Kaltluft", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/sonnenenergie/solarthermie/"
    }
  ],
  heat: [
    {
      question: "Welches System nutzt Umweltenergie aus der Luft, dem Erdreich oder dem Wasser?",
      answers: [
        { text: "Wärmepumpe", correct: true },
        { text: "Ölheizung", correct: false },
        { text: "Pelletkaminofen", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/umweltwaerme/"
    },
    {
      question: "Welche Kenngröße ist bei Wärmepumpen entscheidend?",
      answers: [
        { text: "COP/JAZ", correct: true },
        { text: "PS-Zahl", correct: false },
        { text: "Brennwert (Hs)", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/umweltwaerme/"
    },
    {
      question: "Welche Wärmequelle eignet sich für Erdsondenanlagen?",
      answers: [
        { text: "Erdreich", correct: true },
        { text: "Dieselkraftstoff", correct: false },
        { text: "Holzkohle", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/umweltwaerme/"
    }
  ],
  eff: [
    {
      question: "Welche Maßnahme spart typischerweise am meisten Heizenergie im Altbau?",
      answers: [
        { text: "Thermostatfarbe", correct: false },
        { text: "Dämmung & hydraulischer Abgleich", correct: true },
        { text: "Fensteraufkleber", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/energieeffizienz/"
    },
    {
      question: "Was beschreibt der U-Wert eines Bauteils?",
      answers: [
        { text: "Wärmedurchgang", correct: true },
        { text: "Stromverbrauch", correct: false },
        { text: "Luftfeuchtigkeit", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/energieeffizienz/"
    },
    {
      question: "Welche Beleuchtung ist besonders effizient?",
      answers: [
        { text: "Halogenlampen", correct: false },
        { text: "LED", correct: true },
        { text: "Glühlampen", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/energieeffizienz/"
    }
  ],
  biogas: [
    {
      question: "Welches Gas ist Hauptbestandteil von Biogas?",
      answers: [
        { text: "Methan", correct: true },
        { text: "Wasserstoff", correct: false },
        { text: "Stickstoff", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/biogas/"
    },
    {
      question: "Welche Einsatzstoffe sind typisch für landwirtschaftliche Biogasanlagen?",
      answers: [
        { text: "Gülle und Energiepflanzen", correct: true },
        { text: "Steinkohle", correct: false },
        { text: "Diesel", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/biogas/"
    },
    {
      question: "Wofür kann Biomethan im Mobilitätssektor genutzt werden?",
      answers: [
        { text: "Als Kraftstoff (CNG/CBG)", correct: true },
        { text: "Für Schiffsdiesel", correct: false },
        { text: "Für Kerosin ohne Aufbereitung", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/biogas/"
    }
  ],
  wood: [
    {
      question: "Welcher Brennstoff gilt als besonders klimafreundlich in modernen Feuerungen?",
      answers: [
        { text: "Holzpellets", correct: true },
        { text: "Braunkohlebriketts", correct: false },
        { text: "Schweröl", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/holzenergie/"
    },
    {
      question: "Worauf ist bei Scheitholz für effizientes Heizen zu achten?",
      answers: [
        { text: "Niedrige Holzfeuchte", correct: true },
        { text: "Bunte Lackierung", correct: false },
        { text: "Sehr lange Scheite > 1 m", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/holzenergie/"
    },
    {
      question: "Was verteilen Wärmenetze?",
      answers: [
        { text: "Wärme aus zentraler Erzeugung", correct: true },
        { text: "Druckluft", correct: false },
        { text: "Kohlendioxid für Gewächshäuser", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/waermenetze/"
    }
  ],
  mat: [
    {
      question: "Was versteht man unter stofflicher Nutzung nachwachsender Rohstoffe?",
      answers: [
        { text: "Einsatz als Material (z. B. Biokunststoffe)", correct: true },
        { text: "Ausschließliche Verbrennung", correct: false },
        { text: "Nur Stromerzeugung", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/stoffliche-nutzung/"
    },
    {
      question: "Welche biobasierte Alternative gibt es zu fossilen Kunststoffen?",
      answers: [
        { text: "Biokunststoffe", correct: true },
        { text: "Beton", correct: false },
        { text: "Quarzglas", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/stoffliche-nutzung/"
    },
    {
      question: "Welche Fasern sind typische biobasierte Werkstoffe?",
      answers: [
        { text: "Flachs und Hanf", correct: true },
        { text: "Asbest", correct: false },
        { text: "Kevlar", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/stoffliche-nutzung/"
    }
  ],
  sust: [
    {
      question: "Welches Prinzip beschreibt die Nachhaltigkeit in der Forstwirtschaft klassisch?",
      answers: [
        { text: "Es darf nicht mehr geschlagen werden, als nachwächst.", correct: true },
        { text: "So viel wie möglich ernten.", correct: false },
        { text: "Nur Monokulturen anpflanzen.", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/nachhaltigkeit/"
    },
    {
      question: "Welche Dimensionen umfasst Nachhaltigkeit üblicherweise?",
      answers: [
        { text: "Ökologie, Ökonomie, Soziales", correct: true },
        { text: "Sport, Kunst, Technik", correct: false },
        { text: "Chemie, Physik, Biologie", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/nachhaltigkeit/"
    },
    {
      question: "Welches Instrument unterstützt Kommunen bei nachhaltiger Energieplanung?",
      answers: [
        { text: "Energienutzungsplan", correct: true },
        { text: "Briefmarkensammlung", correct: false },
        { text: "Autowaschplan", correct: false }
      ],
      source: "https://www.carmen-ev.de/infothek/nachhaltigkeit/"
    }
  ]
};

// ---------- DOM-Elemente ----------
const modeSection     = document.getElementById('mode-selection');
const catSection      = document.getElementById('category-selection');
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
document.querySelectorAll('.btn.mode').forEach(btn => {
  btn.addEventListener('click', () => {
    MODE = btn.dataset.mode; // 'practice'|'test'
    modeSection.classList.add('hidden');
    buildCategoryButtons();
    catSection.classList.remove('hidden');
  });
});

backBtn.addEventListener('click', () => {
  // Zurück zur Kategorieauswahl
  quizSection.classList.add('hidden');
  catSection.classList.remove('hidden');
});

restartBtn.addEventListener('click', () => {
  resultSection.classList.add('hidden');
  modeSection.classList.remove('hidden');
});

nextBtn.addEventListener('click', nextQuestion);

spinBtn.addEventListener('click', spinWheel);

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

  // Besonderheit: Bei App-Start 1–2 Zufallsfragen je Kategorie möglich –
  // hier verwenden wir aber den vollen Pool und reduzieren ggf. im Testmodus:
  if (MODE === 'test'){
    currentQuestions = pool.slice(0, 10); // 10 Fragen für Testmodus
  } else {
    currentQuestions = pool; // Übungsmodus: alle verfügbaren Fragen
  }

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

  // Antworten zufällig mischen, damit nicht immer A korrekt ist
  const answers = shuffle([...q.answers]);

  answers.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = a.text;
    btn.addEventListener('click', () => handleAnswer(btn, a.correct, q.source));
    answersEl.appendChild(btn);
  });

  // Fortschritt
  progress.textContent = `Frage ${idx+1} / ${currentQuestions.length}`;

  // Theme-Akzent (Answer Hover via border beim Feedback)
  nextBtn.classList.add('hidden');
  sourceEl.innerHTML = '';
}

// ---------- Antwort-Handling ----------
function handleAnswer(btn, isCorrect, source){
  // Buttons deaktivieren
  const all = [...answersEl.querySelectorAll('button')];
  all.forEach(b => b.disabled = true);

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
    // Zeige die richtige Antwort im Feedback
    const correctAnswerText = getCorrectAnswerText();
    feedback.innerHTML += `<br>Die richtige Antwort ist: <strong>${correctAnswerText}</strong>`;
  }

  // Quelle immer anzeigen, wenn vorhanden
  if (source) {
    sourceEl.innerHTML = `Quelle: <a href="${source}" target="_blank" rel="noopener">${source}</a>`;
  } else {
    sourceEl.innerHTML = '';
  }

  // "Nächste Frage" Button immer sichtbar machen
  nextBtn.classList.remove('hidden');
}

// Hilfsfunktion, um den Text der richtigen Antwort zu bekommen
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

  if (MODE === 'test'){
    scoreEl.textContent = `Du hast ${score} von ${currentQuestions.length} Fragen richtig beantwortet.`;
  } else {
    scoreEl.textContent = `Übungsmodus beendet – richtige Antworten: ${score} von ${currentQuestions.length}.`;
  }

  // Optionaler Breakdown (einfach)
  breakdown.innerHTML = "";
  const correctBar = document.createElement('div');
  const wrongBar = document.createElement('div');
  const total = currentQuestions.length || 1;
  const okPct = Math.round((score/total)*100);
  const badPct = 100 - okPct;
  correctBar.style.cssText = `height:16px;background:#65B32E;width:${okPct}%;border-radius:8px 0 0 8px`;
  wrongBar.style.cssText   = `height:16px;background:#E74011;width:${badPct}%;border-radius:0 8px 8px 0`;
  const barWrap = document.createElement('div');
  barWrap.style.cssText = 'display:flex;width:100%;background:#eef0ee;border-radius:8px;overflow:hidden;margin:8px 0 4px';
  barWrap.appendChild(correctBar); barWrap.appendChild(wrongBar);
  breakdown.appendChild(barWrap);
  const label = document.createElement('div');
  label.textContent = `${okPct}% richtig`;
  label.style.marginTop = '6px';
  breakdown.appendChild(label);
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
