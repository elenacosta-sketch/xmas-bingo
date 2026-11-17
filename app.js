const $=id=>document.getElementById(id);
const META={easy:{title:'Easy',cefr:'A1 / A2'},medium:{title:'Medium',cefr:'B1'},hard:{title:'Hard',cefr:'B2 / B2+'}};
const KEY='christmas-bingo-v1';
function shuffledIndices(length){const a=Array.from({length},(_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function fresh(level,selected=BANKS[level].map((_,i)=>i)){return {selected:[...selected].sort((a,b)=>a-b),order:shuffledIndices(selected.length).map(i=>selected[i]),count:0,started:false}}
let state={level:'easy',mode:'both',games:Object.fromEntries(Object.keys(BANKS).map(l=>[l,fresh(l)]))};
try{
 const s=JSON.parse(localStorage.getItem(KEY));
 if(s&&META[s.level]&&['words','icons','both'].includes(s.mode)&&Object.keys(BANKS).every(l=>{
  const g=s.games?.[l],n=BANKS[l].length,selected=g?.selected??g?.order;
  return g&&Array.isArray(g.order)&&Array.isArray(selected)&&selected.length<=n&&new Set(selected).size===selected.length&&selected.every(i=>Number.isInteger(i)&&i>=0&&i<n)&&g.order.length===selected.length&&new Set(g.order).size===g.order.length&&g.order.every(i=>selected.includes(i))&&Number.isInteger(g.count)&&g.count>=0&&g.count<=g.order.length&&(!(g.started||g.count>0)||selected.length>=9);
 }))state=s;
}catch{}
for(const level of Object.keys(BANKS)){
 const g=state.games[level];
 if(!g.selected)g.selected=[...g.order].sort((a,b)=>a-b);
 if(typeof g.started!=='boolean')g.started=g.count>0;
}
let vocabLevel=state.level,previousFocus=null,drawing=false,drawTimer=null,celebrationTimer=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function game(){return state.games[state.level]}
function current(){const g=game();return g.count?BANKS[state.level][g.order[g.count-1]]:null}
function content(entry){if(!entry)return '<div class="welcome-art" aria-hidden="true">🎄</div><h2>Ready, set, <em>bingo.</em></h2><p>Your first Christmas word is waiting.</p>';return `${state.mode!=='words'?`<div class="call-icon" role="img" aria-label="${entry.word}">${entry.icon}</div>`:''}${state.mode!=='icons'?`<div class="call-word">${entry.word}</div>`:''}`}
function bankMarkup(editable=false){return game().selected.map(idx=>{
 const e=BANKS[state.level][idx];
 return `<span class="round-word"><span aria-hidden="true">${e.icon}</span><span class="word-label">${e.word}</span>${editable?`<button type="button" class="remove-word" data-remove="${idx}" aria-label="Remove ${e.word} from this round" title="Remove from this round">×</button>`:''}</span>`;
}).join('')||'<p class="selection-empty">No words selected. Restore some words below.</p>'}
function editWord(idx,include){
 const g=game();if(g.started||!Number.isInteger(idx)||idx<0||idx>=BANKS[state.level].length)return;
 const selected=new Set(g.selected);include?selected.add(idx):selected.delete(idx);
 state.games[state.level]=fresh(state.level,[...selected].sort((a,b)=>a-b));render();
 $('selection-announcement').textContent=`${BANKS[state.level][idx].word} ${include?'restored':'removed'}. ${game().selected.length} words selected.`;
}
function restoreAllWords(){if(game().started)return;state.games[state.level]=fresh(state.level);render();$('selection-announcement').textContent='All words restored.'}
function historyMarkup(){const g=game();return g.count?g.order.slice(0,g.count).reverse().map((idx,i)=>{const e=BANKS[state.level][idx];return `<span class="history-chip"><span class="num">${g.count-i}</span><span aria-hidden="true">${e.icon}</span><strong>${e.word}</strong></span>`}).join(''):'<p class="empty-history">Every new word will stay here so you can catch up.</p>'}
function render(){
 const g=game(),n=g.order.length,m=META[state.level],entry=current();
 document.querySelectorAll('[data-bingo]').forEach(b=>b.disabled=!g.started||!entry);
 document.querySelectorAll('[data-level]').forEach(b=>{const selected=b.dataset.level===state.level;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',selected)});
 document.querySelectorAll('[data-mode]').forEach(b=>{const selected=b.dataset.mode===state.mode;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected)});
 $('round-bank-label').textContent=`${m.title} · ${m.cefr} · ${n} possible words`;
 $('round-bank').innerHTML=bankMarkup(!g.started);
 document.querySelectorAll('[data-level]').forEach(b=>{const l=b.dataset.level;$(l+'-count').textContent=state.games[l].selected.length+' words selected'});
 $('selection-controls').hidden=g.started;
 const removed=BANKS[state.level].map((e,i)=>({...e,idx:i})).filter(e=>!g.selected.includes(e.idx));
 $('restore-all').disabled=removed.length===0;
 $('removed-summary').textContent=`Removed words (${removed.length}) — click to restore`;
 $('removed-list').innerHTML=removed.map(e=>`<button type="button" data-restore="${e.idx}" aria-label="Restore ${e.word} to this round"><span aria-hidden="true">${e.icon}</span> ${e.word} <span aria-hidden="true">＋</span></button>`).join('');
 $('removed-words').hidden=g.started||removed.length===0;
 $('start-game').disabled=n<9;
 $('round-words').open=!g.started;
 $('start-game').hidden=g.started;
 $('prep-status').textContent=g.started?'Game started. Your word selection is locked until reset.':n<9?`Keep at least nine words to start (${n} selected).`:`${n} words selected. Remove any that do not fit your students, then fill the grids.`;
 $('game-level').textContent=`${m.title.toUpperCase()} · ${m.cefr}`;
 $('progress').textContent=`${g.count} / ${n} drawn`;
 $('remaining').textContent=n-g.count;
 const card=$('draw-card');
 card.className=state.mode==='icons'?'icon-only':state.mode==='words'?'words-only':'';
 card.innerHTML=g.started?content(entry):'<div class="welcome-art" aria-hidden="true">🎄</div><h2>Fill your grids first!</h2><p>See every possible word in the list above.</p>';
 $('draw').innerHTML=!g.started?'Waiting for students…':g.count===n?'Every word called ✓':`<span>✦</span> ${g.count?'Draw next word':'Draw first word'} <span>→</span>`;
 $('draw').disabled=drawing||!g.started||g.count===n;if(drawing)$('draw').textContent='🥁 Drumroll…';
 $('history-count').textContent=g.count;
 $('history').innerHTML=historyMarkup();
 $('present-history-count').textContent=g.count;
 $('present-history').innerHTML=historyMarkup();
 for(const id of ['history','present-history'])$(id).scrollTop=0;
 $('presentation-label').textContent=`CHRISTMAS BINGO · ${m.title.toUpperCase()} · ${m.cefr}`;
 $('presentation-card').className=g.started?'':'presentation-prep';
 $('presentation-card').innerHTML=g.started?content(entry):`<h2>Words in this round</h2><p>Choose nine different words and fill your grid before we start.</p><div class="round-bank">${bankMarkup()}</div>`;
 $('presentation-progress').textContent=g.started?`${g.count} of ${n} called · ${n-g.count} remaining`:`${n} possible words · ${m.title} · ${m.cefr}`;
 $('present-draw').disabled=drawing||g.count===n||(!g.started&&n<9);
 $('present-draw').textContent=!g.started?'Students ready — start game →':g.count===n?'Every word called ✓':g.count?'Draw next word →':'Draw first word →';
 if(drawing)$('present-draw').textContent='🥁 Drumroll…';
 document.body.dataset.hasWord=entry?'yes':'';
 BingoAudio.sync();
 save();
}
function startGame(){if(game().started||game().selected.length<9)return;BingoAudio.unlock();game().started=true;render()}
function cancelPendingDraw(){clearTimeout(drawTimer);drawTimer=null;drawing=false;BingoAudio.stopSpeech();BingoAudio.stopEffects()}
function draw(){
 const g=game();if(drawing||!g.started||g.count>=g.order.length)return;
 BingoAudio.unlock();BingoAudio.stopSpeech();BingoAudio.stopEffects();
 drawing=true;render();BingoAudio.effect('drums');
 drawTimer=setTimeout(()=>{
  drawTimer=null;drawing=false;g.count++;render();
  for(const id of ['draw-card','presentation-card']){const el=$(id);el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}
  BingoAudio.effect('bells');BingoAudio.say(current().word,BingoAudio.effectsEnabled?700:0);
 },BingoAudio.effectsEnabled?700:0);
}
function celebrateBingo(){
 if(!game().started||!current())return;
 cancelPendingDraw();render();BingoAudio.unlock();BingoAudio.effect('applause');
 $('bingo-celebration').hidden=false;clearTimeout(celebrationTimer);
 celebrationTimer=setTimeout(()=>$('bingo-celebration').hidden=true,3400);
}
function openDialog(id){previousFocus=document.activeElement;$(id).showModal()}
function closeDialog(dialog){dialog.close();previousFocus?.focus()}
function showVocab(){const rows=BANKS[vocabLevel].filter(e=>e.word.toLowerCase().includes($('search').value.toLowerCase()));$('vocab-tabs').innerHTML=Object.entries(META).map(([l,m])=>`<button data-vocab="${l}" class="${l===vocabLevel?'active':''}" aria-pressed="${l===vocabLevel}">${m.title} · ${m.cefr} (${BANKS[l].length})</button>`).join('');$('word-list').innerHTML=rows.length?rows.map(e=>`<div class="vocab-word"><span aria-hidden="true">${e.icon}</span>${e.word}</div>`).join(''):'<p>No matching words. Try another search.</p>'}
for(const l of Object.keys(BANKS)) $(l+'-count').textContent=BANKS[l].length+' words';
document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{cancelPendingDraw();$('bingo-celebration').hidden=true;state.level=b.dataset.level;render()}));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;render()}));
$('round-bank').onclick=e=>{const b=e.target.closest('[data-remove]');if(b)editWord(Number(b.dataset.remove),false)};
$('removed-list').onclick=e=>{const b=e.target.closest('[data-restore]');if(b)editWord(Number(b.dataset.restore),true)};
$('restore-all').onclick=restoreAllWords;
$('start-game').onclick=startGame;$('draw').onclick=draw;$('present-draw').onclick=()=>game().started?draw():startGame();
$('help').onclick=()=>openDialog('help-dialog');
$('vocabulary').onclick=()=>{vocabLevel=state.level;$('search').value='';showVocab();openDialog('vocab-dialog')};
$('vocab-tabs').onclick=e=>{const b=e.target.closest('[data-vocab]');if(b){vocabLevel=b.dataset.vocab;showVocab()}};
$('search').oninput=showVocab;
document.querySelectorAll('.close').forEach(b=>b.onclick=()=>closeDialog(b.closest('dialog')));
$('reset').onclick=()=>{$('reset-level').textContent=META[state.level].title;openDialog('reset-dialog')};$('cancel-reset').onclick=()=>closeDialog($('reset-dialog'));$('confirm-reset').onclick=()=>{cancelPendingDraw();$('bingo-celebration').hidden=true;state.games[state.level]=fresh(state.level,game().selected);render();closeDialog($('reset-dialog'))};
function present(){previousFocus=document.activeElement;$('presentation').hidden=false;document.querySelector('main').inert=true;document.querySelector('header').inert=true;document.body.style.overflow='hidden';$('present-draw').focus()}
function exitPresent(){if($('presentation').hidden)return;$('presentation').hidden=true;document.querySelector('main').inert=false;document.querySelector('header').inert=false;document.body.style.overflow='';previousFocus?.focus()}
$('present').onclick=present;$('exit-present').onclick=exitPresent;
document.addEventListener('keydown',e=>{if(e.key==='Escape')exitPresent();if(e.code==='Space'&&!e.repeat&&!document.querySelector('dialog[open]')&&!['INPUT','TEXTAREA','BUTTON','A'].includes(document.activeElement.tagName)){e.preventDefault();draw()}if(e.key==='Tab'&&!$('presentation').hidden){const buttons=[...$('presentation').querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();(last.disabled?first:last).focus()}else if(!e.shiftKey&&(document.activeElement===last||last.disabled)){e.preventDefault();first.focus()}}});
BingoAudio.init();
document.querySelectorAll('[data-repeat]').forEach(b=>b.onclick=()=>{if(current()){BingoAudio.unlock();BingoAudio.say(current().word)}});
document.querySelectorAll('[data-bingo]').forEach(b=>b.onclick=celebrateBingo);
render();
