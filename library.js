import { ROLES } from './core.js';

export const LIBRARY_KINDS = ['Questions & answers', 'Project stories', 'CV & HR', 'Company prep', 'Role guides', 'References'];

// The shelf is an index over the existing material, so answers and citations
// cannot drift away from the question bank or company room.
export function buildStudyIndex({ questions, journey, companies, allSources }) {
  const entries = [];
  const add = entry => entries.push({ roles: ROLES, ...entry, searchText: JSON.stringify(entry).toLowerCase() });
  questions.forEach(q => add({
    id: `question:${q.id}`, kind: LIBRARY_KINDS[0], topic: q.category,
    title: q.title, summary: q.answer, difficulty: q.difficulty,
    roles: q.roles, questionId: q.id, data: q
  }));
  journey.projects.forEach(p => add({
    id: `project:${p.id}`, kind: LIBRARY_KINDS[1], topic: 'My projects',
    title: p.title, summary: p.summary, noteKey: p.id, data: p
  }));
  add({ id: 'intro', kind: LIBRARY_KINDS[2], topic: 'CV & HR', title: 'Tell your story: your introduction', summary: journey.intro.pitch, data: journey.intro });
  journey.hr.forEach((h, i) => add({
    id: `hr:${i}`, kind: LIBRARY_KINDS[2], topic: 'CV & HR',
    title: h.question, summary: h.answer, data: h
  }));
  companies.forEach(c => add({
    id: `company:${c.id}`, kind: LIBRARY_KINDS[3], topic: 'Company prep',
    title: c.name, summary: c.overview, roles: c.roles, noteKey: `company-${c.id}`, data: c
  }));
  journey.roleGuides.forEach(r => add({
    id: `role:${r.id}`, kind: LIBRARY_KINDS[4], topic: 'Role guides',
    title: r.name, summary: r.description, roles: [r.name], data: r
  }));
  allSources.forEach(s => add({
    id: `source:${s.id}`, kind: LIBRARY_KINDS[5], topic: 'References',
    title: s.title, summary: s.note, data: s
  }));
  add({ id: 'checklist', kind: LIBRARY_KINDS[2], topic: 'CV & HR', title: 'Before the interview: a practical checklist', summary: 'Documents, logistics, verified project stories, and questions to ask.', data: journey.checklist });
  add({ id: 'notebook', kind: LIBRARY_KINDS[2], topic: 'CV & HR', title: 'My own revision notes', summary: 'A place for useful explanations, memory cues, and things to look up again.', noteKey: 'library', data: {} });
  return entries;
}

export function isLibrarySaved(entry, state) {
  return entry.questionId ? state.saved.includes(entry.questionId) : (state.librarySaved || []).includes(entry.id);
}

export function filterStudyIndex(entries, { search = '', kind = 'All material', topic = 'All topics', role = 'All roles', difficulty = 'All levels' } = {}, state = { saved: [], librarySaved: [] }) {
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter(entry =>
    terms.every(term => `${entry.searchText} ${entry.noteKey ? state.notes?.[entry.noteKey]?.toLowerCase() || '' : ''}`.includes(term)) &&
    (kind === 'All material' || kind === 'Saved for later' && isLibrarySaved(entry, state) || entry.kind === kind) &&
    (topic === 'All topics' || entry.topic === topic) &&
    (role === 'All roles' || entry.roles.includes(role)) &&
    (difficulty === 'All levels' || entry.difficulty === difficulty)
  );
}
