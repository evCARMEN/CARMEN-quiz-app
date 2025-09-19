/* ==============================
   C.A.R.M.E.N. Quiz-App – Logik
   =================================*/

// ---------- Globale States ----------
let MODE = null;                 // 'practice' | 'test'
let CURRENT_CAT_KEY = null;      // z.B. 'wind'
let CURRENT_COLOR = '#18470F';
let currentQuestions = [];       // aktuell gezogene Fragen
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

// ---------- Fragenpool ----------
let QUESTION_BANK = {};

fetch("https://evcarmen.github.io/CARMEN-quiz-app/questions.json")
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    QUESTION_BANK = data;
    console.log("Fragen erfolgreich geladen:", data);
  })
  .catch(err => console.error("Fehler beim Laden der Fragen:", err.message));

// ---------- DOM-Elemente ----------
const modeSection     = document.getElementById('mode-selection');
const catSection      = document.getElementById('category-selection');
const startBtn        = document.getElementById('start-quiz-btn');
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

// ---------- Start-Button ----------
startBtn.addEventListener('click', () => {
  // Startseite ausblenden
  modeSection.classList.add('hidden');

  // Kategorien vorbereiten
  buildCategoryButtons();

  // Kategorieauswahl anzeigen
  catSection.classList.remove('hidden');
  catSection.classList.add('show');
});

// ---------- Navigation ----------
backBtn.addEventListener('click', () => {
  quizSection.classList.add('hidden');
  idx = 0; score = 0; currentQuestions = [];
  buildCategoryButtons();
  catSection.classList.remove('hidden');
  catSection.classList.add('show');
});

restartBtn.addEventListener('click', () => {
  resultSection.classList.add('hidden');
  idx = 0; score = 0; currentQuestions = [];
  buildCategoryButtons();
  catSection.classList.remove('hidden');
  catSection.classList.add('show');
  quizSection.classList.add('hidden');
});

nextBtn.addEventListener('click', nextQuestion);
spinBtn.addEventListener('click', spinWheel);

// ---------- UI-Aufbau ----------
function buildCategoryButtons() {
  catButtonsWrap.innerHTML = '';

  Object.entries(CATS).forEach(([key, val]) => {
    const b = document.createElement('button');
    b.className = 'category-btn';
    b.style.background = val.color;

    const showLogo = ['wind', 'sun', 'heat', 'eff'].includes(key);
    const labelText = val.label.replace(/\s*\(LandSchafftEnergie\)/, '');

    b.innerHTML = showLogo
      ? `<span class="cat-label">${labelText}</span><img src="assets/icons/LandSchafftEnergie.png" alt="LandSchafftEnergie" class="lse-icon">`
      : `<span class="cat-label">${val.label}</span>`;

    b.addEventListener('click', () => startCategory(key));
    catButtonsWrap.appendChild(b);
  });
}

// ---------- Glücksrad ----------
function spinWheel(){
  const keys = Object.keys(CATS);
  const targetIndex = Math.floor(Math.random() * keys.length);
  const sliceDeg = 360 / keys.length;
  const endDeg = 5 * 360 + targetIndex * sliceDeg + sliceDeg/2;

  wheel.style.setProperty('--end-deg', `${endDeg}deg`);
  wheel.classList.remove('spinning');
  void wheel.offsetWidth;
  wheel.classList.add('spinning');
  spinBtn.disabled = true;

  wheel.addEventListener('animationend', () => {
    const selectedKey = keys[targetIndex];
    const selectedCat = CATS[selectedKey];

    spinBtn.textContent = `🎯 ${selectedCat.label}`;
    spinBtn.style.background = selectedCat.color;

    setTimeout(() => {
      spinBtn.textContent = '🎡 Zufallskategorie';
      spinBtn.style.background = '#444';
      spinBtn.disabled = false;
      startCategory(selectedKey);
    }, 1500);
  }, { once: true });
}

// ---------- Kategorie starten ----------
function startCategory(key){
  CURRENT_CAT_KEY = key;
  CURRENT_COLOR = CATS[key].color;

  const pool = QUESTION_BANK[key] ? [...QUESTION_BANK[key]] : [];
  shuffle(pool);

  currentQuestions = pool.slice(0, QUESTIONS_PER_ROUND);
  idx = 0; score = 0;

  catSection.classList.add('hidden');
  quizSection.classList.remove('hidden');
  quizSection.classList.add('show');

  titleEl.textContent = CATS[key].label;
  showQuestion();
}

// ---------- Frage anzeigen ----------
function showQuestion(){
  if (idx >= currentQuestions.length) return endQuiz();

  qEl.textContent = currentQuestions[idx].question;
  answersEl.innerHTML = '';
  feedback.textContent = '';
  feedback.className = 'feedback';

  const answers = shuffle([...currentQuestions[idx].answers]);
  answers.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = a.text;
    btn.dataset.correct = a.correct;
    btn.addEventListener('click', () => handleAnswer(btn, a.correct, currentQuestions[idx].source));
    answersEl.appendChild(btn);
  });

  progress.textContent = `Frage ${idx+1} / ${currentQuestions.length}`;
  nextBtn.classList.add('hidden');
  sourceEl.innerHTML = '';
}

// ---------- Antwort prüfen ----------
function handleAnswer(btn, isCorrect, source){
  [...answersEl.querySelectorAll('button')].forEach(b => b.disabled = true);
  currentQuestions[idx].userAnswer = isCorrect;

  if (isCorrect){
    btn.classList.add('correct');
    feedback.textContent = '✅ Richtig!';
    feedback.classList.add('ok');
    score++;
  } else {
    btn.classList.add('wrong');
    feedback.textContent = '❌ Falsch!';
    feedback.classList.add('bad');
    const correctAnswerText = getCorrectAnswerText();
    feedback.innerHTML += `<br>Die richtige Antwort ist: <strong>${correctAnswerText}</strong>`;
    [...answersEl.querySelectorAll('button')].forEach(button => {
      if (button.dataset.correct === "true") button.classList.add("correct");
    });
  }

  if (source) {
    sourceEl.innerHTML = `Quelle: <a href="${source}" target="_blank" rel="noopener">${source}</a>`;
  }

  nextBtn.classList.remove('hidden');
}

function getCorrectAnswerText() {
  const correctAnswer = currentQuestions[idx].answers.find(a => a.correct);
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

// ---------- Quiz beenden ----------
function endQuiz(){
  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  scoreEl.textContent = `Du hast ${score} von ${currentQuestions.length} Fragen richtig beantwortet.`;

  let breakdownHTML = '';
  currentQuestions.forEach((q, i) => {
    const isCorrect = q.userAnswer === true;
    breakdownHTML += `
      <div class="breakdown-item ${isCorrect ? 'correct' : 'wrong'}">
        Frage ${i+1}: ${isCorrect ? '✔️ Richtig' : '❌ Falsch'}
      </div>
    `;
  });
  breakdown.innerHTML = breakdownHTML;

  // Extra-Hinweis anzeigen
  const HINTS = [
    { text: "📩 Newsletter abonnieren", url: "https://www.carmen-ev.de/service/newsletter/" },
    { text: "📅 Veranstaltungskalender", url: "https://www.carmen-ev.de/c-a-r-m-e-n-veranstaltungskalender/" },
    { text: "🎧 Podcasts", url: "https://www.carmen-ev.de/service/publikationen/c-a-r-m-e-n-podcasts/" },
    { text: "📖 Broschüren & Flyer", url: "https://www.carmen-ev.de/service/publikationen/publikationen-broschueren-und-flyer/" },
    { text: "ℹ️ Über C.A.R.M.E.N. e.V.", url: "https://www.carmen-ev.de/c-a-r-m-e-n-e-v/" },
    { text: "Instagram", url: "https://www.instagram.com/c.a.r.m.e.n.e.v/" },
    { text: "Facebook", url: "https://www.facebook.com/CentralesAgrarRohstoffMarketingundEnergieNetzwerk/?locale=de_DE" },
    { text: "LinkedIn", url: "https://de.linkedin.com/company/carmenevCentralesAgrarRohstoffMarketingundEnergieNetzwerk/?locale=de_DE" },
    { text: "YouTube", url: "https://www.youtube.com/@c.a.r.m.e.n.e.v.9184" }
  ];
  const randomHint = HINTS[Math.floor(Math.random() * HINTS.length)];
  const extraHintEl = document.getElementById("extra-hint");
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

