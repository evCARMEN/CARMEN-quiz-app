let MODE = null;
let CURRENT_CAT_KEY = null;
let CURRENT_COLOR = '#18470F';
let currentQuestions = [];
let idx = 0;
let score = 0;
const QUESTIONS_PER_ROUND = 3;

const CATS = {
  wind:{label:"Windenergie (LandSchafftEnergie)",color:"#2F52A0"},
  sun:{label:"Sonnenenergie (LandSchafftEnergie)",color:"#97a9d0"},
  heat:{label:"Umweltwärme (LandSchafftEnergie)",color:"#cbd4e7"},
  eff:{label:"Energieeffizienz (LandSchafftEnergie)",color:"#e0e5f1"},
  biogas:{label:"Biogas & Mobilität",color:"#65B32E"},
  wood:{label:"Holzenergie & Wärmenetze",color:"#E74011"},
  mat:{label:"Stoffliche Nutzung",color:"#822A3A"},
  sust:{label:"Nachhaltigkeit",color:"#DEDC00"}
};

let QUESTION_BANK={};

fetch("https://evcarmen.github.io/CARMEN-quiz-app/questions.json")
  .then(res=>res.json())
  .then(data=>{QUESTION_BANK=data;console.log("Fragen geladen:",data);})
  .catch(err=>console.error("Fehler beim Laden:",err));

const modeSection=document.getElementById('mode-selection');
const catSection=document.getElementById('category-selection');
const quizSection=document.getElementById('quiz');
const resultSection=document.getElementById('result');
const catButtonsWrap=document.getElementById('category-buttons');
const wheel=document.getElementById('wheel');
const spinBtn=document.getElementById('spin-btn');
const startBtn=document.getElementById('start-quiz-btn');
const titleEl=document.getElementById('quiz-title');
const progress=document.getElementById('progress');
const qEl=document.getElementById('question');
const answersEl=document.getElementById('answers');
const feedback=document.getElementById('feedback');
const sourceEl=document.getElementById('source');
const nextBtn=document.getElementById('next-btn');
const backBtn=document.getElementById('back-btn');
const scoreEl=document.getElementById('score');
const breakdown=document.getElementById('breakdown');
const restartBtn=document.getElementById('restart-btn');
const extraHintEl=document.getElementById('extra-hint');

startBtn.addEventListener('click',()=>{
  modeSection.classList.add('hidden');
  buildCategoryButtons();
  catSection.classList.remove('hidden');
  catSection.classList.add('show');
});

backBtn.addEventListener('click',()=>{
  quizSection.classList.add('hidden');
  idx=0;score=0;currentQuestions=[];
  buildCategoryButtons();
  catSection.classList.remove('hidden');
  catSection.classList.add('show');
});

restartBtn.addEventListener('click',()=>{
  resultSection.classList.add('hidden');
  idx=0;score=0;currentQuestions=[];
  buildCategoryButtons();
  catSection.classList.remove('hidden');
  catSection.classList.add('show');
  quizSection.classList.add('hidden');
});

nextBtn.addEventListener('click',nextQuestion);
spinBtn.addEventListener('click',spinWheel);

function buildCategoryButtons(){
  catButtonsWrap.innerHTML='';
  Object.entries(CATS).forEach(([key,val])=>{
    const b=document.createElement('button');
    b.className='category-btn';
    b.style.background=val.color;
    const showLogo=['wind','sun','heat','eff'].includes(key);
    const labelText=val.label.replace(/\s*\(LandSchafftEnergie\)/,'');
    b.innerHTML=showLogo
      ? `<span class="cat-label">${labelText}</span><img src="assets/icons/LandSchafftEnergie.png" alt="LandSchafftEnergie" class="lse-icon">`
      : `<span class="cat-label">${val.label}</span>`;
    b.addEventListener('click',()=>startCategory(key));
    catButtonsWrap.appendChild(b);
  });
}

function spinWheel(){
  const keys=Object.keys(CATS);
  const targetIndex=Math.floor(Math.random()*keys.length);
  const sliceDeg=360/keys.length;
  const endDeg=5*360+targetIndex*sliceDeg+sliceDeg/2;
  wheel.style.setProperty('--end-deg',`${endDeg}deg`);
  wheel.classList.remove('spinning');void wheel.offsetWidth;wheel.classList.add('spinning');
  spinBtn.disabled=true;
  wheel.addEventListener('animationend',()=>{
    const selectedKey=keys[targetIndex];
    const selectedCat=CATS[selectedKey];
    spinBtn.textContent=`🎯 ${selectedCat.label}`;
    spinBtn.style.background=selectedCat.color;
    setTimeout(()=>{
      spinBtn.textContent='🎡 Zufallskategorie';
      spinBtn.style.background='#444';
      spinBtn.disabled=false;
      startCategory(selectedKey);
    },1500);
  },{once:true});
}

function startCategory(key){
  CURRENT_CAT_KEY=key;CURRENT_COLOR=CATS[key].color;
  const pool=QUESTION_BANK[key]?[...QUESTION_BANK[key]]:[];
  shuffle(pool);
  currentQuestions=pool.slice(0,QUESTIONS_PER_ROUND);
  idx=0;score=0;
  catSection.classList.remove('show');catSection.classList.add('hidden');
  quizSection.classList.remove('hidden');quizSection.classList.add('show');
  titleEl.textContent=CATS[key].label;
  showQuestion();
}

function showQuestion(){
  if(idx>=currentQuestions.length)return endQuiz();
  const q=currentQuestions[idx];
  qEl.textContent=q.question;qEl.classList.add('show');
  answersEl.innerHTML='';feedback.textContent='';feedback.className='feedback';
  const answers=shuffle([...q.answers]);
  answers.forEach(a=>{
    const btn=document.createElement('button');
    btn.className='answer-btn';btn.textContent=a.text;btn.dataset.correct=a.correct;
    btn.addEventListener('click',()=>handleAnswer(btn,a.correct,q.source));
    answersEl.appendChild(btn);
  });
  progress.textContent=`Frage ${idx+1} / ${currentQuestions.length}`;
  nextBtn.classList.add('hidden');sourceEl.innerHTML='';
}

function handleAnswer(btn,isCorrect,source){
  [...answersEl.querySelectorAll('button')].forEach(b=>b.disabled=true);
  currentQuestions[idx].userAnswer=isCorrect;
  if(isCorrect){btn.classList.add('correct');feedback.textContent='✅ Richtig!';feedback.classList.add('ok');score++;} 
  else{
    btn.classList.add('wrong');feedback.textContent='❌ Falsch!';feedback.classList.add('bad');
    [...answersEl.querySelectorAll('button')].forEach(button=>{if(button.dataset.correct==="true")button.classList.add("correct");});
    feedback.innerHTML+=`<br>Die richtige Antwort ist: <strong>${getCorrectAnswerText()}</strong>`;
  }
  if(source)sourceEl.innerHTML=`Quelle: <a href="${source}" target="_blank">${source}</a>`;
  nextBtn.classList.remove('hidden');
}

function getCorrectAnswerText(){return currentQuestions[idx].answers.find(a=>a.correct)?.text||'';}

function nextQuestion(){idx++;idx<currentQuestions.length?showQuestion():endQuiz();}

function endQuiz(){
  quizSection.classList.add('hidden');resultSection.classList.remove('hidden');
  scoreEl.textContent=`Du hast ${score} von ${currentQuestions.length} Fragen richtig beantwortet.`;
  let breakdownHTML='';currentQuestions.forEach((q,i)=>{
    const isCorrect=q.userAnswer===true;
    breakdownHTML+=`<div class="breakdown-item ${isCorrect?'correct':'wrong'}">Frage ${i+1}: ${isCorrect?'✔️ Richtig':'❌ Falsch'}</div>`;
  });breakdown.innerHTML=breakdownHTML;

  // Extra Hints
  const HINTS=[
    {text:"📩 Melde dich zu unserem Newsletter an!",url:"https://www.carmen-ev.de/service/newsletter/"},
    {text:"📅 Entdecke unseren Veranstaltungskalender",url:"https://www.carmen-ev.de/c-a-r-m-e-n-veranstaltungskalender/"},
    {text:"🎧 Höre die C.A.R.M.E.N.-Podcasts",url:"https://www.carmen-ev.de/service/publikationen/c-a-r-m-e-n-podcasts/"},
    {text:"📖 Stöbere in unseren Broschüren & Flyern",url:"https://www.carmen-ev.de/service/publikationen/publikationen-broschueren-und-flyer/"},
    {text:"ℹ️ Erfahre mehr über C.A.R.M.E.N. e.V.",url:"https://www.carmen-ev.de/c-a-r-m-e-n-e-v/"},
    {text:"Folge uns auf Instagram",url:"https://www.instagram.com/c.a.r.m.e.n.e.v/"},
    {text:"Besuche uns auf Facebook",url:"https://www.facebook.com/CentralesAgrarRohstoffMarketingundEnergieNetzwerk/"},
    {text:"Vernetze dich mit uns auf LinkedIn",url:"https://de.linkedin.com/company/carmenevCentralesAgrarRohstoffMarketingundEnergieNetzwerk/"},
    {text:"Abonniere unseren YouTube-Kanal",url:"https://www.youtube.com/@c.a.r.m.e.n.e.v.9184"}
  ];

  const randomHint=HINTS[Math.floor(Math.random()*HINTS.length)];
  extraHintEl.innerHTML='';
  const container=document.createElement('div');container.className='hint-content';
  const iconFile=randomHint.url.includes("instagram")?"instagram.png":
                 randomHint.url.includes("facebook")?"facebook.png":
                 randomHint.url.includes("linkedin")?"linkedin.png":
                 randomHint.url.includes("youtube")?"youtube.png":
                 randomHint.url.includes("newsletter")?"newsletter.png":"calendar.png";
  if(iconFile){const img=document.createElement('img');img.src=`assets/icons/${iconFile}`;img.className='hint-icon';container.appendChild(img);}
  const link=document.createElement('a');link.href=randomHint.url;link.target='_blank';link.rel='noopener';link.textContent=randomHint.text;container.appendChild(link);
  extraHintEl.appendChild(container);
}

function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
