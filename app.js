'use strict';
const KEY='truckmate.v1';
const defaultProfile=()=>({rate:18.5,threshold:35,ot:25,nightRate:20,meal:15,bonus:0,waitingMode:'pending',deduction:22,monthlyBonus:0,dailyBonus:0,dailyAllowance:0});
const defaultState=()=>({days:[],country:'FR',profiles:{FR:defaultProfile(),DE:defaultProfile()}});
let state;
let viewedMonth=new Date();viewedMonth.setDate(1);
try{const raw=JSON.parse(localStorage.getItem(KEY));state=raw&&Array.isArray(raw.days)&&raw.profiles?.FR&&raw.profiles?.DE?raw:defaultState()}catch{state=defaultState()}
for(const c of ['FR','DE'])state.profiles[c]={...defaultProfile(),...state.profiles[c]};
const $=id=>document.getElementById(id);
const num=x=>Number(x)||0;
const minutes=s=>{if(!/^\d{2}:\d{2}$/.test(s||''))return NaN;const [h,m]=s.split(':').map(Number);return h<=23&&m<=59?h*60+m:NaN};
const duration=(start,end)=>{const a=minutes(start),b=minutes(end);return Number.isFinite(a)&&Number.isFinite(b)?(b-a+1440)%1440:NaN};
const fmt=m=>`${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`;
const euros=n=>n.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{alert('Impossible de sauvegarder sur cet appareil. Exportez vos données.');return false}};
const profile=()=>state.profiles[state.country];
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const weekStart=()=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const weekDays=()=>{const s=weekStart(),e=new Date(s);e.setDate(e.getDate()+6);return state.days.filter(d=>d.date>=iso(s)&&d.date<=iso(e)).sort((a,b)=>a.date.localeCompare(b.date))};
const counts=d=>{const amp=duration(d.start,d.end);if(d.mode==='quick'){const pause=Number(d.pauseMinutes)||0;return {drive:0,work:Math.max(0,amp-pause),wait:0,breaks:pause,night:0}}return {drive:minutes(d.drive)||0,work:minutes(d.work)||0,wait:minutes(d.wait)||0,breaks:minutes(d.breaks)||0,night:minutes(d.night)||0}};
const dayWork=d=>{const x=counts(d);return d.mode==='quick'?x.work:x.drive+x.work};
const pauseMinutes=()=>{if($('pausePreset').value!=='custom')return Number($('pausePreset').value);return minutes($('pauseCustom').value)};
const human=m=>Number.isFinite(m)?fmt(m):'—';
const weekDate=d=>new Date(d.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'});

const sums=days=>days.reduce((a,d)=>{const x=counts(d);for(const k of Object.keys(a))a[k]+=x[k];return a},{drive:0,work:0,wait:0,breaks:0,night:0});
function show(page){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===page));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));if(page==='home')renderHome();if(page==='dashboard')renderDashboard();if(page==='monthly')renderMonth();if(page==='pay')renderPay();if(page==='settings')renderSettings();window.scrollTo(0,0)}
const mondayOf=date=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return iso(d)};
const weekEnding=start=>{const d=new Date(start+'T12:00:00');d.setDate(d.getDate()+6);return iso(d)};
const groupByWeek=days=>{const map=new Map();days.forEach(d=>{const k=mondayOf(d.date);if(!map.has(k))map.set(k,[]);map.get(k).push(d)});return [...map.entries()].sort((a,b)=>b[0].localeCompare(a[0]))};
function groupedMarkup(days, expandedWeek=''){const groups=groupByWeek(days);if(!groups.length)return '<p class="muted">Aucune journée enregistrée.</p>';return groups.map(([start,items])=>{const total=items.reduce((a,d)=>a+dayWork(d),0),title=`${new Date(start+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} – ${new Date(weekEnding(start)+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}`;return `<details class="week-group" ${start===expandedWeek?"open":""}><summary><span><strong>${safe(title)}</strong><small>${items.length} journée(s)</small></span><strong class="accent">${fmt(total)}</strong></summary><div class="week-entries">${items.map(d=>{const x=counts(d);return `<button type="button" class="day-row" data-edit="${safe(d.id)}"><span><strong>${safe(weekDate(d))}</strong><small>${safe(d.start)}–${safe(d.end)} · Pause ${fmt(x.breaks)}</small></span><span class="accent">${fmt(dayWork(d))} ✎</span></button>`}).join('')}</div></details>`}).join('')}
function renderHome(){const ds=state.days.filter(d=>d.date.startsWith(today().slice(0,7)));const mins=ds.reduce((n,d)=>n+dayWork(d),0);const s=sums(ds);const p=profile();const now=new Date();$('homeMonthLabel').textContent=now.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});const rows=[['Jours travaillés',String(ds.length),'ico-calendar-days'],['Heures totales',fmt(mins),'ico-chart-no-axes-column-increasing'],['Heures de nuit renseignées',fmt(s.night),'ico-moon'],['Heures sup. (simulation)',fmt(Math.max(0,mins/60-num(p.threshold))*60),'ico-clock']];$('homeMonthRows').innerHTML=rows.map(([label,val,ico])=>`<div class="home-month-row"><i aria-hidden="true" class="${ico}"></i><span>${label}</span><strong>${val}</strong></div>`).join('')}
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));
function renderDashboard(){const days=weekDays(),s=sums(days),start=weekStart(),end=new Date(start);end.setDate(end.getDate()+6);$('period').textContent=`${start.toLocaleDateString('fr-FR')} – ${end.toLocaleDateString('fr-FR')}`;const amp=days.reduce((a,d)=>a+duration(d.start,d.end),0),work=days.reduce((a,d)=>a+dayWork(d),0);const items=[['Temps calculé*',work],['Amplitude',amp],['Pauses',s.breaks],['Conduite détaillée',s.drive],['Attente détaillée',s.wait],['Nuit éligible',s.night]];$('stats').innerHTML=items.map(([name,value])=>`<div class="stat"><small>${name}</small><strong>${fmt(value)}</strong></div>`).join('');$('daysTable').innerHTML=days.length?days.map(d=>{const x=counts(d);return `<tr><td>${safe(weekDate(d))}</td><td>${safe(d.start)}</td><td>${safe(d.end)}</td><td>${fmt(x.breaks)}</td><td class="accent">${fmt(dayWork(d))}</td><td><button class="secondary mini" data-edit="${safe(d.id)}">✎</button></td></tr>`}).join(''):'<tr><td colspan="6">Aucune journée cette semaine.</td></tr>';$('days').innerHTML=groupedMarkup(days,iso(weekStart()))}
function renderMonth(){
 const year=viewedMonth.getFullYear(),month=viewedMonth.getMonth(),prefix=`${year}-${String(month+1).padStart(2,'0')}-`;
 const days=state.days.filter(d=>d.date.startsWith(prefix)).sort((a,b)=>a.date.localeCompare(b.date));
 const p=profile(),tot=sums(days),work=days.reduce((a,d)=>a+dayWork(d),0),amp=days.reduce((a,d)=>a+duration(d.start,d.end),0);
 $('monthLabel').textContent=viewedMonth.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
 $('monthStats').innerHTML=[['Jours',days.length+'','ico-calendar-days','red'],['Travail',fmt(work),'ico-clock','orange'],['Nuit saisie',fmt(tot.night),'ico-moon','purple'],['Brut indicatif',euros(work/60*num(p.rate)),'ico-coins','gold']].map(([name,value,ico,color])=>`<div class="month-mini-stat ${color}"><i aria-hidden="true" class="${ico}"></i><strong>${safe(value)}</strong><small>${safe(name)}</small></div>`).join('');
 $('monthGroups').innerHTML=groupedMarkup(days,iso(weekStart()));
 $('monthTable').innerHTML=days.length?days.map(d=>{const x=counts(d);return `<tr><td>${safe(weekDate(d))}</td><td>${safe(d.start)}</td><td>${safe(d.end)}</td><td>${fmt(x.breaks)}</td><td class="accent">${fmt(dayWork(d))}</td><td><button class="secondary mini" data-edit="${safe(d.id)}">✎</button></td></tr>`}).join(''):'<tr><td colspan="6">Aucune journée enregistrée ce mois.</td></tr>';
 renderCalendarGrid(year,month,days);
 $('monthPay').innerHTML=payMarkup(days,'month');

}

function renderCalendarGrid(year,month,days){
 const grid=$('calendarGrid');if(!grid)return;
 const first=new Date(year,month,1),last=new Date(year,month+1,0).getDate();
 const offset=(first.getDay()+6)%7;
 const byDate=new Map(days.map(d=>[d.date,d]));
 const weekday=['L','M','M','J','V','S','D'];
 let out=weekday.map((name,i)=>`<span class="calendar-weekday" aria-label="${['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]}">${name}</span>`).join('');
 for(let i=0;i<offset;i++)out+='<span class="calendar-empty" aria-hidden="true"></span>';
 for(let n=1;n<=last;n++){
  const date=`${year}-${String(month+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
  const d=byDate.get(date),todayClass=date===today()?' today':'',filled=d?' filled':'';
  out+=`<button type="button" class="calendar-day${filled}${todayClass}" data-calendar-date="${date}" aria-label="${n} ${first.toLocaleDateString('fr-FR',{month:'long'})}${d?', '+fmt(dayWork(d))+' de travail':', ajouter une journée'}"><strong>${n}</strong>${d?`<small>${fmt(dayWork(d))}</small>`:'<small>+</small>'}</button>`;
 }
 grid.innerHTML=out;
}
$('calendarGrid').addEventListener('click',e=>{
 const button=e.target.closest('[data-calendar-date]');if(!button)return;
 const date=button.dataset.calendarDate,entry=state.days.find(d=>d.date===date);
 if(entry){editDay(entry.id)}else{resetDay();$('date').value=date;show('journal');validate()}
});

$('monthPrev').onclick=()=>{viewedMonth.setMonth(viewedMonth.getMonth()-1);renderMonth()};
$('monthNext').onclick=()=>{viewedMonth.setMonth(viewedMonth.getMonth()+1);renderMonth()};
$('monthToday').onclick=()=>{viewedMonth=new Date();viewedMonth.setDate(1);renderMonth()};
$('monthTable').addEventListener('click',e=>{const id=e.target.closest('[data-edit]')?.dataset.edit;if(id)editDay(id)});
function payMarkup(days,period){
 const p=profile(),rate=num(p.rate),threshold=num(p.threshold),nightPct=num(p.nightRate),otPct=num(p.ot);
 const groups=groupByWeek(days),weeklyTotals=groups.map(([start])=>{const all=state.days.filter(d=>mondayOf(d.date)===start),s=sums(all);return {start,all,s,paid:(all.reduce((a,d)=>a+dayWork(d),0)+(p.waitingMode==='included'?s.wait:0))/60}});
 const s=sums(days),baseWork=days.reduce((a,d)=>a+dayWork(d),0)/60,waiting=p.waitingMode==='included'?s.wait/60:0,paid=baseWork+waiting;
 let overtime=0,missingWeeks=0;
 for(const w of weeklyTotals){const weekHours=w.paid,ot=Math.max(0,weekHours-threshold);const monthHours=w.all.filter(d=>days.some(x=>x.id===d.id)).reduce((a,d)=>a+dayWork(d)+(p.waitingMode==='included'?counts(d).wait:0),0)/60;const fraction=weekHours>0?monthHours/weekHours:0;overtime+=ot*fraction;if(w.all.length<5)missingWeeks++}
 const base=paid*rate,otPremium=overtime*rate*otPct/100,nightHours=Math.min(s.night/60,paid),nightPremium=nightHours*rate*nightPct/100;
 const weeklyBonus=period==='week'?num(p.bonus):groups.length*num(p.bonus),monthlyBonus=period==='month'?num(p.monthlyBonus):0,otherBonus=days.length*num(p.dailyBonus),gross=base+otPremium+nightPremium+weeklyBonus+monthlyBonus+otherBonus;
 const meals=days.length*num(p.meal),allowances=days.length*num(p.dailyAllowance),net=gross*(1-Math.min(100,num(p.deduction))/100);
 const lines=[['Heures retenues pour la simulation',`${paid.toLocaleString('fr-FR',{maximumFractionDigits:2})} h`],['Heures au-delà du seuil (estimation)',`${overtime.toLocaleString('fr-FR',{maximumFractionDigits:2})} h`],['Base brute',euros(base)],['Majoration heures supplémentaires',euros(otPremium)],['Majoration de nuit',euros(nightPremium)],['Primes brutes configurées',euros(weeklyBonus+monthlyBonus+otherBonus)],['Brut estimé',euros(gross)],['Retenues simulées',`− ${euros(gross-net)}`],['Net indicatif avant traitement fiscal',euros(net)],['Repas et autres indemnités (séparés)',euros(meals+allowances)]];
 let notes='<p class="notice">Net calculé avec un pourcentage de retenues personnalisable : il ne représente pas nécessairement le net à payer après impôt. Les indemnités restent séparées et leur régime doit être vérifié.</p>';
 if(p.waitingMode==='pending'&&s.wait)notes+=`<p class="notice warning">${fmt(s.wait)} d’attente non qualifiée : exclue du calcul.</p>`;
 if(days.some(d=>d.mode==='quick'))notes+='<p class="notice warning">Saisie rapide : les heures de nuit ne sont pas automatiquement déterminées. Les primes de nuit ne couvrent que les heures éligibles renseignées en mode détaillé.</p>';
 if(period==='month')notes+='<p class="notice warning">Les semaines chevauchant deux mois sont réparties proportionnellement aux heures saisies : approximation à vérifier sur le bulletin. Les primes hebdomadaires sont comptées pour chaque semaine représentée.</p>';
 if(missingWeeks)notes+='<p class="notice">Certaines semaines peuvent être incomplètes : les heures supplémentaires estimées peuvent changer après ajout de journées.</p>';
 return `<div class="card pay-card"><div class="pay-totals"><div><small>Brut estimé</small><strong>${euros(gross)}</strong></div><div><small>Net indicatif</small><strong>${euros(net)}</strong></div></div><div class="pay-lines">${lines.map(([a,b],i)=>`<div class="line ${i===6?'gross-line':''} ${i===8?'net-line':''}"><span>${safe(a)}</span><strong>${safe(b)}</strong></div>`).join('')}</div><button type="button" class="secondary pay-settings-link" data-go="settings">⚙ Paramètres de paie</button></div>`+notes;

}
function renderPay(){const isMonth=$('payPeriod').value==='month';const days=isMonth?state.days.filter(d=>d.date.startsWith(`${viewedMonth.getFullYear()}-${String(viewedMonth.getMonth()+1).padStart(2,'0')}-`)):weekDays();$('payResults').innerHTML=payMarkup(days,isMonth?'month':'week')}
$('payPeriod').addEventListener('change',renderPay);
$('monthGroups').addEventListener('click',e=>{const id=e.target.closest('[data-edit]')?.dataset.edit;if(id)editDay(id)});
function renderSettings(){const p=profile();$('country').value=state.country;for(const key of ['rate','threshold','ot','nightRate','meal','bonus','deduction','monthlyBonus','dailyBonus','dailyAllowance','waitingMode'])$(key).value=p[key]}
function syncPause(){const custom=$('pausePreset').value==='custom';$('pauseCustom').hidden=!custom;if(!custom)$('pauseCustom').value=`${String(Math.floor(Number($('pausePreset').value)/60)).padStart(2,'0')}:${String(Number($('pausePreset').value)%60).padStart(2,'0')}`}
function syncDetails(){$('detailFields').hidden=!$('detailedMode').checked;validate()}
function resetDay(){$('dayForm').reset();$('editId').value='';$('date').value=today();$('start').value='02:00';$('end').value='11:00';$('pausePreset').value='60';$('pauseCustom').value='01:00';$('detailedMode').checked=false;for(const [k,v] of Object.entries({drive:'06:00',work:'01:00',wait:'01:00',breaks:'01:00',night:'00:00'}))$(k).value=v;$('deleteDay').hidden=true;syncPause();syncDetails()}
function validate(){const amp=duration($('start').value,$('end').value),pause=pauseMinutes(),detail=$('detailedMode').checked;let message='',ok=Number.isFinite(amp)&&amp>0&&Number.isFinite(pause)&&pause>=0&&pause<=amp;if(!Number.isFinite(amp)||amp===0)message='Vérifie les horaires (début et fin différents).';else if(!Number.isFinite(pause)||pause>amp)message='La pause doit être valide et inférieure à l’amplitude.';else if(detail){const d=Object.fromEntries(['drive','work','wait','breaks','night'].map(k=>[k,$(k).value]));const x=counts(d),sum=x.drive+x.work+x.wait+x.breaks;if(sum!==amp||x.breaks!==pause||x.night>x.drive+x.work+x.wait){ok=false;message='Détail incohérent : activités + pause doivent correspondre à l’amplitude, et la pause détaillée à la pause choisie.'}}$('daySummary').innerHTML=Number.isFinite(amp)&&Number.isFinite(pause)?`<div><small>Amplitude</small><strong>${fmt(amp)}</strong></div><div><small>Pause</small><strong>${fmt(pause)}</strong></div><div><small>Temps calculé*</small><strong class="accent">${fmt(Math.max(0,amp-pause))}</strong></div>`:'';$('validation').textContent=message||'✓ Durées cohérentes';$('validation').classList.toggle('warning',!ok);return ok}
function editDay(id){const d=state.days.find(x=>x.id===id);if(!d)return;resetDay();for(const k of ['date','start','end','notes'])$(k).value=d[k]||'';$('editId').value=id;const x=counts(d),p=x.breaks;const presets=['0','30','45','60','90'];$('pausePreset').value=presets.includes(String(p))?String(p):'custom';$('pauseCustom').value=`${String(Math.floor(p/60)).padStart(2,'0')}:${String(p%60).padStart(2,'0')}`;$('detailedMode').checked=d.mode!=='quick';for(const k of ['drive','work','wait','breaks','night'])if(d[k])$(k).value=d[k];syncPause();syncDetails();$('deleteDay').hidden=false;show('journal')}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.page)));
$('newDay').onclick=()=>{resetDay();show('journal')};$('resetDay').onclick=resetDay;
$('dayForm').addEventListener('input',validate);$('pausePreset').addEventListener('change',()=>{syncPause();validate()});$('detailedMode').addEventListener('change',syncDetails);
$('dayForm').addEventListener('submit',e=>{e.preventDefault();if(!validate()){alert('Corrigez les durées avant enregistrement.');return}const detail=$('detailedMode').checked;const keys=detail?['date','start','end','drive','work','wait','breaks','night','notes']:['date','start','end','notes'];const d=Object.fromEntries(keys.map(k=>[k,$(k).value]));d.mode=detail?'detailed':'quick';d.pauseMinutes=pauseMinutes();d.id=$('editId').value||`${Date.now()}-${Math.random().toString(36).slice(2,9)}`;const existing=state.days.find(x=>x.date===d.date&&x.id!==d.id);if(existing){alert('Une journée existe déjà à cette date. Ouvre-la depuis le tableau pour la modifier.');return}const index=state.days.findIndex(x=>x.id===d.id);if(index>=0)state.days[index]=d;else state.days.push(d);if(save()){resetDay();show('dashboard')}});
$('days').addEventListener('click',e=>{const id=e.target.closest('[data-edit]')?.dataset.edit;if(id)editDay(id)});
$('daysTable').addEventListener('click',e=>{const id=e.target.closest('[data-edit]')?.dataset.edit;if(id)editDay(id)});
$('deleteDay').onclick=()=>{const id=$('editId').value;if(id&&confirm('Supprimer définitivement cette journée ?')){state.days=state.days.filter(d=>d.id!==id);if(save()){resetDay();show('dashboard')}}};
$('country').onchange=e=>{state.country=e.target.value;save();renderSettings()};
$('settingsForm').onsubmit=e=>{e.preventDefault();const p={};for(const k of ['rate','threshold','ot','nightRate','meal','bonus','deduction','monthlyBonus','dailyBonus','dailyAllowance'])p[k]=num($(k).value);p.waitingMode=$('waitingMode').value;state.profiles[state.country]=p;if(save())alert('Réglages enregistrés pour '+state.country)};
$('exportData').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='truckmate-sauvegarde.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('importData').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.days)||!data.profiles?.FR||!data.profiles?.DE||!['FR','DE'].includes(data.country))throw Error('Format non reconnu');if(!confirm('Remplacer toutes les données locales par cette sauvegarde ?'))return;state={days:data.days,country:data.country,profiles:data.profiles};if(save()){resetDay();show('dashboard')}}catch(err){alert('Import impossible : '+err.message)}finally{e.target.value=''}};
resetDay();renderHome();renderDashboard();if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});

// V2.3 : navigation des onglets mensuels, sans toucher aux données enregistrées.
(function(){const weeks=document.getElementById('monthWeeksTab'),calendar=document.getElementById('monthCalendarTab');function selectMonthView(which){const isWeeks=which==='weeks';weeks.classList.toggle('active',isWeeks);calendar.classList.toggle('active',!isWeeks);weeks.setAttribute('aria-selected',String(isWeeks));calendar.setAttribute('aria-selected',String(!isWeeks));document.querySelector('.month-weeks-view').hidden=!isWeeks;document.querySelector('.month-calendar-view').hidden=isWeeks}weeks.addEventListener('click',()=>selectMonthView('weeks'));calendar.addEventListener('click',()=>selectMonthView('calendar'));document.getElementById('payResults').addEventListener('click',e=>{if(e.target.closest('[data-go="settings"]'))show('settings')})})();
