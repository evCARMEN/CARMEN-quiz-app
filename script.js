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
let QUESTION_BANK = {};

fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    QUESTION_BANK = data;
    // Rest des Quiz wie bisher
  });

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
