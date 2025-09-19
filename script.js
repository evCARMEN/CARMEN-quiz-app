/* ==============================
   C.A.R.M.E.N. Quiz-App – Logik
   =================================*/

// ---------- Globale States ----------
let MODE = null;                 
let CURRENT_CAT_KEY = null;      
let CURRENT_COLOR = '#18470F';
let currentQuestions = [];       
let idx = 0;                     
let score = 0;

// ---------- Einstellungen ----------
const QUESTIONS_PER_ROUND = 3;   

// ---------- Kategorien & Farben ----------
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

// ---------- Fragenbank ----------
let QUESTION_BANK = {};

// Lade Fragen
fetch("https://evcarmen.github.io/CARMEN-quiz-app/questions.json")
  .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
  .then(data => {
    QUESTION_BANK = data;
    console.log("Fragen geladen:", data);
  })
  .catch(err => console.error("Fehler beim Laden der Fragen:", err));

// ---------- DOM ----------
const modeSection     = document.getElementById('mode-selection');
const catSection      = document.getElementById('category-selection');
const quizSection     = document.getElementById('quiz');
const resultSection   = document.getElementById('result');
const catButtonsWrap  = document.getElementById('category-buttons');
const wheel           = document.getElementById('wheel');
const spinBtn         = document.getElementById('spin-btn');

const startBtn   = document.getElementById('start-quiz-btn');
const titleEl    = document.getElementById('quiz-title');
const progress   = document.getElementById('progress');
const qEl        = document.getElementById('question');
const answersEl  = document.getElementById('answers');
const feedback   = document.getElementById('feedback');
const sourceEl   = document.getElementById('source');
const nextBtn    = document.getElementById('next-btn');
const backBtn    = document.getElementById('back-btn');
const scoreEl    = document.getElementById('score');
const breakdown  = document.getElementById('breakdown');
const restartBtn = document.getElementById('restart-btn');
const extraHintEl = document.getElementById("extra-hint");

// ---------- Start ----------
startBtn.addEventListener('click', () => {
  modeSection.classList.add('hidden');
  catSection.classList.remove('hidden');
  catSection.classList.add('show');
  buildCategoryButtons();
});

// ---------- Kategorie-Buttons ----------
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
spinBtn.addEventListener('click', spinWheel);
function spinWheel() {
  const keys = Object.keys(CATS);
  const targetIndex = Math.floor(Math.random() * keys.length);
  const sliceDeg = 360 / keys.length;
  const endDeg = 5*360 + targetIndex*sliceDeg + sliceDeg/2;
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
    }, 1200);
  }, { once: true });
}

// ---------- Kategorie starten ----------
function startCategory(key){
  CURRENT_CAT_KEY = key;
  CURRENT_COLOR = CATS[key].color;

  const pool = QUESTION_BANK[key] ? [...QUESTION_BANK[key]] : [];
  currentQuestions = shuffle(pool).slice(0, QUESTIONS_PER_ROUND);

  idx = 0;
  score = 0;

  catSection.classList.add('hidden');
  quizSection.classList.remove('hidden');
  quizSection.classList.add('show');

  titleEl.textContent = CATS[key].label;
  showQuestion();
}

// ---------- Frage anzeigen ----------
function showQuestion() {
  if(idx >= currentQuestions.length) return endQuiz();

  const q = currentQuestions[idx];
  qEl.classList.remove('show');
  qEl.textContent = q.question;
  qEl.classList.add('show');

  answersEl.innerHTML = '';
  feedback.textContent = '';
  feedback.className = 'feedback';
  sourceEl.innerHTML = '';

  shuffle(q.answers).forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = a.text;
    btn.dataset.correct = a.correct;
    btn.addEventListener('click', () => handleAnswer(btn, a.correct, q.source));
    answersEl.appendChild(btn);
  });

  progress.textContent = `Frage ${idx+1} / ${currentQuestions.length}`;
  nextBtn.classList.add('hidden');
}

// ---------- Antwort Handling ----------
function handleAnswer(btn, isCorrect, source) {
  [...answersEl.querySelectorAll('button')].forEach(b => b.disabled = true);
  currentQuestions[idx].userAnswer = isCorrect;

  if(isCorrect){
    btn.classList.add('correct');
    feedback.textContent = '✅ Richtig!';
    feedback.classList.add('ok');
    score++;
  } else {
    btn.classList.add('wrong');
    feedback.textContent = '❌ Falsch!';
    feedback.classList.add('bad');

    [...answersEl.querySelectorAll('button')].forEach(b => {
      if(b.dataset.correct === "true") b.classList.add("correct");
    });
    feedback.innerHTML += `<br>Die richtige Antwort ist: <strong>${getCorrectAnswerText()}</strong>`;
  }

  if(source){
    sourceEl.innerHTML = `Quelle: <a href="${source}" target="_blank" rel="noopener">${source}</a>`;
  }

  nextBtn.classList.remove('hidden');
}

function getCorrectAnswerText() {
  const correct = currentQuestions[idx].answers.find(a => a.correct);
  return correct ? correct.text : '';
}

// ---------- Nächste Frage ----------
nextBtn.addEventListener('click', () => {
  idx++;
  if(idx < currentQuestions.length) showQuestion();
  else endQuiz();
});

// ---------- Quiz Ende ----------
function endQuiz() {
  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  scoreEl.textContent = `Du hast ${score} von ${currentQuestions.length} Fragen richtig beantwortet.`;

  breakdown.innerHTML = currentQuestions.map((q,i) => {
    const correct = q.userAnswer === true;
    return `<div class="breakdown-item ${correct ? 'correct' : 'wrong'}">Frage ${i+1}: ${correct ? '✔️ Richtig' : '❌ Falsch'}</div>`;
  }).join('');

  showExtraHint();
}

// ---------- Extra Hint ----------
const HINTS = [
  { text: "📩 Melde dich zu unserem Newsletter an!", url: "https://www.carmen-ev.de/service/newsletter/" },
  { text: "📅 Entdecke unseren Veranstaltungskalender", url: "https://www.carmen-ev.de/c-a-r-m-e-n-veranstaltungskalender/" },
  { text: "🎧 Höre die C.A.R.M.E.N.-Podcasts", url: "https://www.carmen-ev.de/service/publikationen/c-a-r-m-e-n-podcasts/" },
  { text: "📖 Stöbere in unseren Broschüren & Flyern", url: "https://www.carmen-ev.de/service/publikationen/publikationen-broschueren-und-flyer/" },
  { text: "ℹ️ Erfahre mehr über C.A.R.M.E.N. e.V.", url: "https://www.carmen-ev.de/c-a-r-m-e-n-e-v/" },
  { text: "Folge uns auf Instagram", url: "https://www.instagram.com/c.a.r.m.e.n.e.v/" },
  { text: "Besuche uns auf Facebook", url: "https://www.facebook.com/CentralesAgrarRohstoffMarketingundEnergieNetzwerk/" },
  { text: "Vernetze dich mit uns auf LinkedIn", url: "https://de.linkedin.com/company/carmenevCentralesAgrarRohstoffMarketingundEnergieNetzwerk/" },
  { text: "Abonniere unseren YouTube-Kanal", url: "https://www.youtube.com/@c.a.r.m.e.n.e.v.9184" }
];

function getPlatformIcon(url){
  if(url.includes("instagram")) return "instagram.png";
  if(url.includes("facebook")) return "facebook.png";
  if(url.includes("linkedin")) return "linkedin.png";
  if(url.includes("youtube")) return "youtube.png";
  if(url.includes("newsletter")) return "newsletter.png";
  if(url.includes("carmen-ev.de")) return "calendar.png";
  return null;
}

function showExtraHint(){
  extraHintEl.innerHTML = '';
  const hint = HINTS[Math.floor(Math.random()*HINTS.length)];
  const container = document.createElement('div');
  container.className = 'hint-content';
  const icon = getPlatformIcon(hint.url);
  if(icon){
    const img = document.createElement('img');
    img.src = `assets/icons/${icon}`;
    img.alt = hint.text;
    img.className = 'hint-icon';
    container.appendChild(img);
  }
  const link = document.createElement('a');
  link.href = hint.url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = hint.text;
  container.appendChild(link);
  extraHintEl.appendChild(container);
}

// ---------- Navigation ----------
backBtn.addEventListener('click', () => {
  quizSection.classList.add('hidden');
  idx = 0; score = 0; currentQuestions = [];
  buildCategoryButtons();
  catSection.classList.remove('hidden');
});

restartBtn.addEventListener('click', () => {
  resultSection.classList.add('hidden');
  idx = 0; score = 0; currentQuestions = [];
  buildCategoryButtons();
  catSection.classList.remove('hidden');
});

// ---------- Utils ----------
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}
