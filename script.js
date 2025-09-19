let CURRENT_CAT_KEY = null;
let CURRENT_COLOR = '#18470F';
let currentQuestions = [];
let idx = 0;
let score = 0;
const QUESTIONS_PER_ROUND = 3;

const CATS = {
  wind:  { label: "Windenergie (LSE)", color: "#2F52A0" },
  sun:   { label: "Sonnenenergie (LSE)", color: "#97a9d0" },
  heat:  { label: "Umweltwärme (LSE)", color: "#cbd4e7" },
  eff:   { label: "Energieeffizienz (LSE)", color: "#e0e5f1" },
  biogas:{ label: "Biogas & Mobilität", color: "#65B32E" },
  wood:  { label: "Holzenergie & Wärmenetze", color: "#E74011" },
  mat:   { label: "Stoffliche Nutzung", color: "#822A3A" },
  sust:  { label: "Nachhaltigkeit", color: "#DEDC00" },
};

// Fragenpool initial leer
let QUESTION_BANK = {};

fetch("https://evcarmen.github.io/CARMEN-quiz-app/questions.json")
  .then(r=>r.json())
  .then(data=>{QUESTION_BANK=data; console.log("Fragen geladen:", data);})
  .catch(e=>console.error("Fehler:", e.message));

// DOM
const modeSection = document.getElementById('mode-selection');
const catSection  = document.getElementById('category-selection');
const quizSection = document.getElementById('quiz');
const resultSection = document.getElementById('result');
const catButtonsWrap = document.getElementById('category-buttons');
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');

const startBtn = document.getElementById('start-quiz-btn');
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

// Startbutton
startBtn.addEventListener('click', ()=>{
  modeSection.classList.add('hidden');
  buildCategoryButtons();
  catSection.classList.remove('hidden'); catSection.classList.add('show');
});

backBtn.addEventListener('click', ()=>{
  quizSection.classList.add('hidden');
  idx=0;score=0;currentQuestions=[];
  buildCategoryButtons();
  catSection.classList.remove('hidden'); catSection.classList.add('show');
});

restartBtn.addEventListener('click', ()=>{
  resultSection.classList.add('hidden');
  idx=0;score=0;currentQuestions=[];
  buildCategoryButtons();
  catSection.classList.remove('hidden'); catSection.classList.add('show');
  quizSection.classList.add('hidden');
});

nextBtn.addEventListener('click', nextQuestion);
spinBtn.addEventListener('click', spinWheel);

function buildCategoryButtons(){
  catButtonsWrap.innerHTML='';
  Object.entries(CATS).forEach(([key,val])=>{
    const b=document.createElement('button');
    b.className='category-btn';
    b.style.background=val.color;
    const showLogo=['wind','sun','heat','eff'].includes(key);
    const labelText = val.label.replace(/\s*\(LSE\)/,'');
    b.innerHTML=showLogo?`<span class="cat-label">${labelText}</span>`:`<span class="cat-label">${val.label}</span>`;
    b.addEventListener('click',()=>startCategory(key));
    catButtonsWrap.appendChild(b);
  });
}

function startCategory(key){
  CURRENT_CAT_KEY=key; CURRENT_COLOR=CATS[key].color;
  const pool = QUESTION_BANK[key]? [...QUESTION_BANK[key]] : [];
  shuffle(pool);
  currentQuestions = pool.slice(0,QUESTIONS_PER_ROUND);
  idx=0;score=0;
  catSection.classList.add('hidden'); quizSection.classList.remove('hidden'); quizSection.classList.add('show');
  titleEl.textContent=CATS[key].label;
  showQuestion();
}

function showQuestion(){
  if(idx>=currentQuestions.length) return endQuiz();
  qEl.classList.remove('show');
  const q=currentQuestions[idx];
  qEl.textContent=q.question; qEl.classList.add('show');
  answersEl.innerHTML=''; feedback.textContent=''; feedback.className='feedback';
  const answers=shuffle([...q.answers]);
  answers.forEach(a=>{
    const btn=document.createElement('button');
    btn.className='answer-btn'; btn.textContent=a.text; btn.dataset.correct=a.correct;
    btn.addEventListener('click',()=>handleAnswer(btn,a.correct,q.source));
    answersEl.appendChild(btn);
  });
  progress.textContent=`Frage ${idx+1} / ${currentQuestions.length}`;
  nextBtn.classList.add('hidden'); sourceEl.innerHTML='';
}

function handleAnswer(btn,isCorrect,source){
  [...answersEl.querySelectorAll('button')].forEach(b=>b.disabled=true);
  currentQuestions[idx].userAnswer=isCorrect;
  if(isCorrect){btn.classList.add('correct'); feedback.textContent='✅ Richtig!'; feedback.classList.add('ok'); score++;}
  else{btn.classList.add('wrong'); feedback.textContent='❌ Falsch!'; feedback.classList.add('bad');
    [...answersEl.querySelectorAll('button')].forEach(b=>{if(b.dataset.correct==="true") b.classList.add('correct');});
  }
  if(source) sourceEl.innerHTML=`Quelle: <a href="${source}" target="_blank" rel="noopener">${source}</a>`;
  nextBtn.classList.remove('hidden');
}

function nextQuestion(){ idx++; idx<currentQuestions.length? showQuestion(): endQuiz(); }

function endQuiz(){
  quizSection.classList.add('hidden'); resultSection.classList.remove('hidden');
  scoreEl.textContent=`Du hast ${score} von ${currentQuestions.length} Fragen richtig beantwortet.`;
  let html=''; currentQuestions.forEach((q,i)=>{const ok=q.userAnswer===true; html+=`<div class="breakdown-item ${ok?'correct':'wrong'}">Frage ${i+1}: ${ok?'✔️ Richtig':'❌ Falsch'}</div>`;});
  breakdown.innerHTML=html;
}

// Utilities
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

function spinWheel(){
  const keys=Object.keys(CATS);
  const idxRand=Math.floor(Math.random()*keys.length);
  const slice=360/keys.length;
  const endDeg=5*360 + idxRand*slice + slice/2;
  wheel.style.setProperty('--end-deg',`${endDeg}deg`);
  wheel.classList.remove('spinning'); void wheel.offsetWidth; wheel.classList.add('spinning');
  spinBtn.disabled=true;
  wheel.addEventListener('animationend',()=>{
    const selKey=keys[idxRand]; spinBtn.textContent=`🎯 ${CATS[selKey].label}`; spinBtn.style.background=CATS[selKey].color;
    setTimeout(()=>{spinBtn.textContent='🎡 Zufallskategorie'; spinBtn.style.background='#444'; spinBtn.disabled=false; startCategory(selKey);},1500);
  },{once:true});
}
