// Browser-generated game audio: no microphone and no downloaded sound files.
const BingoAudio=(()=>{
 const KEY='christmas-bingo-audio-v1';
 let prefs={effects:true,voice:true};
 try{const p=JSON.parse(localStorage.getItem(KEY));if(p&&typeof p.effects==='boolean'&&typeof p.voice==='boolean')prefs=p}catch{}
 let context=null,master=null,speechTimer=null;
 const sources=new Set();
 const speechAvailable='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
 const effectsAvailable=!!(window.AudioContext||window.webkitAudioContext);
 function status(message){for(const id of ['audio-status','present-audio-status']){const el=document.getElementById(id);if(el)el.textContent=message}}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}}
 function sync(){document.querySelectorAll('[data-audio]').forEach(b=>{const type=b.dataset.audio,available=type==='voice'?speechAvailable:effectsAvailable;b.disabled=!available;b.setAttribute('aria-pressed',prefs[type]&&available);b.textContent=type==='voice'?`🗣 Voice ${prefs.voice&&available?'on':'off'}`:`♫ Sounds ${prefs.effects&&available?'on':'off'}`});document.querySelectorAll('[data-repeat]').forEach(b=>b.disabled=!speechAvailable||!prefs.voice||!document.body.dataset.hasWord)}
 function unlock(){
  if(!effectsAvailable)return;
  try{if(!context){const AC=window.AudioContext||window.webkitAudioContext;context=new AC();master=context.createGain();master.gain.value=.32;const limiter=context.createDynamicsCompressor();limiter.threshold.value=-14;limiter.ratio.value=8;master.connect(limiter);limiter.connect(context.destination)}if(context.state==='suspended')context.resume().catch(()=>status('Sound is blocked. Click Sounds off, then on, or check browser audio permissions.'))}catch{status('Sound effects are unavailable in this browser.')}
 }
 function stopEffects(){for(const src of sources){try{src.stop()}catch{}}sources.clear()}
 function startSource(src,when,duration){sources.add(src);src.onended=()=>{sources.delete(src);src.disconnect()};src.start(when);src.stop(when+duration)}
 function tone(freq,when,duration,volume,type='sine'){
  const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.value=freq;
  gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),when+.006);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(gain);gain.connect(master);startSource(osc,when,duration+.02);
 }
 function noise(when,duration,volume,highpass=1200){
  const size=Math.ceil(context.sampleRate*duration),buffer=context.createBuffer(1,size,context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<size;i++)data[i]=(Math.random()*2-1);
  const src=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();src.buffer=buffer;filter.type='highpass';filter.frequency.value=highpass;
  gain.gain.setValueAtTime(volume,when);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  src.connect(filter);filter.connect(gain);gain.connect(master);startSource(src,when,duration);
 }
 function effect(kind){
  if(!prefs.effects||!effectsAvailable)return;unlock();if(!context||!master)return;
  try{const now=context.currentTime+.015;
   if(kind==='drums'){for(let i=0;i<12;i++){const t=now+i*.05;noise(t,.055,.12+i*.012,900);tone(135,t,.055,.10+i*.005,'triangle')}}
   if(kind==='bells'){for(const [offset,freq] of [[0,1046.5],[.12,1318.5],[.24,1568]]){tone(freq,now+offset,.43,.25);tone(freq*2.76,now+offset,.25,.075);tone(freq*4.07,now+offset,.13,.025)}}
   if(kind==='applause'){
    // Overlapping, irregular clap transients form a short crowd applause.
    for(let i=0;i<64;i++){const offset=i*.039+Math.random()*.045,fade=1-offset/3;noise(now+offset,.045+Math.random()*.065,(.18+Math.random()*.12)*fade,650+Math.random()*1200)}
    for(const [i,f] of [523.25,659.25,783.99,1046.5].entries()){tone(f,now+i*.14,.32,.20,'triangle');tone(f/2,now+i*.14,.32,.07)}
    for(const f of [523.25,659.25,783.99,1046.5])tone(f,now+.65,.65,.10,'triangle');
   }
  }catch{status('Sound effects are unavailable. You can continue playing.')}
 }
 function stopSpeech(){clearTimeout(speechTimer);speechTimer=null;if(speechAvailable)window.speechSynthesis.cancel()}
 function say(word,delay=0){
  stopSpeech();if(!prefs.voice||!speechAvailable)return;
  speechTimer=setTimeout(()=>{
   if(!prefs.voice)return;
   try{const voices=window.speechSynthesis.getVoices(),english=voices.filter(v=>/^en(?:-|_)/i.test(v.lang));
    if(voices.length&&!english.length){status('No English voice is installed. Add one in your browser or device speech settings.');return}
    const voice=english.find(v=>v.lang==='en-GB')||english.find(v=>v.lang==='en-US')||english[0];
    const utterance=new window.SpeechSynthesisUtterance(word);utterance.lang=voice?.lang||'en-GB';if(voice)utterance.voice=voice;utterance.rate=.85;utterance.volume=1;
    utterance.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))status('Voice could not play. Check your device speech settings, then use Repeat word.')};
    window.speechSynthesis.speak(utterance);
   }catch{status('Spoken words are unavailable in this browser.')}
  },delay);
 }
 function init(){document.querySelectorAll('[data-audio]').forEach(b=>b.onclick=()=>{const type=b.dataset.audio;prefs[type]=!prefs[type];if(type==='voice'&&!prefs.voice)stopSpeech();if(type==='effects'){if(prefs.effects)unlock();else stopEffects()}save();sync();status('')});sync();if(!speechAvailable)status('Your browser does not support spoken words. Sound effects can still be used.');else if(!effectsAvailable)status('Sound effects are unavailable in this browser. Spoken words can still be used.')}
 return {init,sync,unlock,effect,say,stopSpeech,stopEffects,get effectsEnabled(){return prefs.effects&&effectsAvailable}};
})();
