import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildStudyIndex, filterStudyIndex, isLibrarySaved } from '../library.js';
import { normalizeState } from '../core.js';

const read = async name => JSON.parse(await readFile(new URL(`../content/${name}.json`,import.meta.url),'utf8'));
const [questions,journey,companies,sources,companySources] = await Promise.all(['questions','journey','companies','sources','company-sources'].map(read));
const entries=buildStudyIndex({questions,journey,companies,allSources:[...sources,...companySources]});

test('The shelf indexes every study resource with unique identities and the original content',()=>{
  assert.equal(entries.length,questions.length+journey.projects.length+journey.hr.length+companies.length+journey.roleGuides.length+sources.length+companySources.length+3);
  assert.equal(new Set(entries.map(entry=>entry.id)).size,entries.length);
  assert.equal(entries.find(entry=>entry.id==='question:q025').data,questions.find(q=>q.id==='q025'));
  assert.ok(entries.some(entry=>entry.id==='checklist'));
  assert.ok(entries.some(entry=>entry.id==='notebook'));
});
test('One search finds related questions, companies, role guides, and original references',()=>{
  const matches=filterStudyIndex(entries,{search:'consent'});
  for(const kind of ['Questions & answers','Company prep','Role guides','References'])assert.ok(matches.some(entry=>entry.kind===kind),kind);
  assert.equal(filterStudyIndex(entries,{search:'nonexistent_material_123'}).length,0);
});
test('Combined shelf filters narrow only to the requested role, level and topic',()=>{
  const matches=filterStudyIndex(entries,{kind:'Questions & answers',topic:'Lab methods',role:'Research',difficulty:'Intermediate'});
  assert.ok(matches.length>0);
  assert.ok(matches.every(entry=>entry.questionId&&entry.topic==='Lab methods'&&entry.roles.includes('Research')&&entry.difficulty==='Intermediate'));
});
test('The revision shelf reuses question-bank saves and supports other material independently',()=>{
  const state=normalizeState({saved:['q025'],librarySaved:['project:sweets','company:eurofins']});
  const saved=filterStudyIndex(entries,{kind:'Saved for later'},state);
  assert.deepEqual(saved.map(entry=>entry.id),['question:q025','project:sweets','company:eurofins']);
  assert.ok(isLibrarySaved(entries.find(entry=>entry.questionId==='q025'),state));
  assert.deepEqual(normalizeState({version:1,saved:['q025']}).librarySaved,[],'Old backups remain compatible');
  assert.deepEqual(normalizeState({librarySaved:['intro','intro',4]}).librarySaved,['intro']);
});
test('Personal revision notes are searchable on the current browser',()=>{
  const state=normalizeState({notes:{library:'My mnemonic zebratest123',sweets:'Verified lot example456'}});
  assert.equal(filterStudyIndex(entries,{search:'zebratest123'},state)[0].id,'notebook');
  assert.equal(filterStudyIndex(entries,{search:'example456'},state)[0].id,'project:sweets');
});
