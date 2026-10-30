export const STORAGE_KEY = 'culture.srijita.v1';
export const ROLES = ['Pharma QC', 'Food & water', 'Research', 'Clinical research'];
export const CATEGORIES = ['Foundations', 'Lab methods', 'Pharma QC', 'Food & water', 'Clinical research', 'HR & communication'];
export const DEFAULT_STATE = { version: 1, role: 'Pharma QC', reviewed: [], saved: [], librarySaved: [], days: [], checklist: [], sessions: [], applications: [], notes: {}, lastVisit: null };
const strings = value => Array.isArray(value) ? [...new Set(value.filter(x => typeof x === 'string'))] : [];
export function normalizeState(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('This is not a Culture backup.');
  if (raw.version !== undefined && raw.version !== 1) throw new Error('This backup version is not supported.');
  return { ...structuredClone(DEFAULT_STATE), role: ROLES.includes(raw.role) ? raw.role : ROLES[0], reviewed: strings(raw.reviewed), saved: strings(raw.saved), librarySaved: strings(raw.librarySaved), days: strings(raw.days), checklist: strings(raw.checklist), notes: raw.notes && typeof raw.notes === 'object' && !Array.isArray(raw.notes) ? Object.fromEntries(Object.entries(raw.notes).filter(([k,v])=>typeof k==='string' && typeof v==='string')) : {}, sessions: Array.isArray(raw.sessions) ? raw.sessions.filter(s=>s && typeof s.id==='string' && ROLES.includes(s.role) && typeof s.date==='string' && !Number.isNaN(Date.parse(s.date)) && Array.isArray(s.answers)).slice(-30).map(s=>({id:s.id,role:s.role,date:s.date,answers:s.answers.filter(a=>a && typeof a.id==='string' && ['revisit','partial','strong'].includes(a.rating)).map(a=>({id:a.id,rating:a.rating,text:typeof a.text==='string'?a.text.slice(0,10000):''}))})) : [], applications: Array.isArray(raw.applications) ? raw.applications.filter(a => a && typeof a.id==='string' && typeof a.company==='string' && typeof a.role==='string').slice(0,300).map(a=>({ id:a.id,company:a.company.slice(0,150),role:a.role.slice(0,150),status:['Wishlist','Applied','Interview','Offer','Closed'].includes(a.status)?a.status:'Wishlist', date:typeof a.date==='string'?a.date:'',next:typeof a.next==='string'?a.next.slice(0,1000):'',url:typeof a.url==='string'?a.url:'' })) : [], lastVisit: typeof raw.lastVisit === 'string' ? raw.lastVisit : null };
}
export function filterQuestions(questions, { search='', category='All topics', difficulty='All levels', role='All roles', status='All questions', reviewed=[], saved=[] }={}) {
  const query = search.trim().toLowerCase();
  return questions.filter(q => (!query || [q.title,q.answer,q.category,...q.keyPoints].join(' ').toLowerCase().includes(query)) && (category==='All topics' || q.category===category) && (difficulty==='All levels' || q.difficulty===difficulty) && (role==='All roles' || q.roles.includes(role)) && (status==='All questions' || status==='Saved' && saved.includes(q.id) || status==='To review' && !reviewed.includes(q.id) || status==='Reviewed' && reviewed.includes(q.id)));
}
export function selectMock(questions, role, difficulty, count, random=Math.random) {
  const pool = questions.filter(q=>q.roles.includes(role) && (difficulty==='Mixed levels' || q.difficulty===difficulty));
  for (let i=pool.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count);
}
export function safeUrl(url) { try { const u = new URL(url); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
export function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function validateContent({ questions, sources, companies, companySources, journey }) {
  if (!Array.isArray(questions) || questions.length < 50) throw new Error('Question bank incomplete');
  const allSources=[...sources,...companySources];
  const sourceIds=new Set(allSources.map(s=>s.id));
  if(sourceIds.size!==allSources.length) throw new Error('Duplicate source IDs');
  const ids=new Set();
  for(const s of allSources) if(!safeUrl(s.url)) throw new Error(`Invalid source URL: ${s.id}`);
  for(const q of questions) {
    if(ids.has(q.id)) throw new Error(`Duplicate question ${q.id}`);
    ids.add(q.id);
    if(!q.title || !q.answer || !Array.isArray(q.keyPoints) || !q.pitfall || !q.followUp || !['Basic','Intermediate','Advanced'].includes(q.difficulty) || !CATEGORIES.includes(q.category) || !q.roles?.every(r=>ROLES.includes(r)) || !Array.isArray(q.sourceIds) || (q.category!=='HR & communication' && !q.sourceIds.length) || !q.sourceIds.every(id=>sourceIds.has(id))) throw new Error(`Invalid question ${q.id}`);
  }
  if(!Array.isArray(companies) || companies.length<5 || !journey.days || journey.days.length!==14) throw new Error('Journey or company content incomplete');
  for(const c of companies) {
    if(!safeUrl(c.officialUrl) || !Array.isArray(c.reports) || !c.evidenceNote) throw new Error(`Invalid company ${c.id}`);
    for(const r of c.reports) if(!safeUrl(r.url) || !r.caveat) throw new Error(`Invalid report ${c.id}`);
  }
  return true;
}
