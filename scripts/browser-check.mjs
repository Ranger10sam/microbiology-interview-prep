import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
await mkdir('output/playwright',{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage();
const errors=[];page.on('pageerror',err=>errors.push(err.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
const base=process.env.TEST_URL||'http://localhost:4173';
const go=async hash=>{await page.goto(base+'/#'+hash);await page.locator('#main').waitFor();};
const action=async name=>page.locator(`[data-action="${name}"]`).first().click();
try{
  await go('home');await page.locator('.hero').waitFor();await page.screenshot({path:'output/playwright/dashboard-desktop.png',fullPage:true});
  await page.selectOption('#home-role','Food & water');
  await go('questions');await page.locator('.question-toggle').first().click();await action('review-question');await action('save-question');
  await page.reload();await page.locator('.question-card.reviewed').first().waitFor();
  await page.fill('#question-search','PCR');await page.waitForTimeout(300);assert.ok(await page.locator('.question-card').count()>0);
  await action('clear-filters');await page.selectOption('#filter-category','Clinical research');assert.ok((await page.locator('.question-card').count())>0);await page.screenshot({path:'output/playwright/question-bank.png',fullPage:true});
  await go('path');await page.locator('[data-action="complete-day"][data-day="1"]').click();await page.locator('#day-1.complete').waitFor();
  await page.locator('[data-action="day-study"][data-day="7"]').click();await page.locator('#mock-setup').waitFor();
  await page.selectOption('#mock-time','0');await page.locator('#mock-setup button[type="submit"]').click();
  for(let i=0;i<5;i++){await page.fill('#mock-answer',`My honest practice answer ${i+1}`);await action('reveal-mock');await page.locator('[data-action="rate-mock"][data-rating="partial"]').click();}
  await page.getByRole('heading',{name:'A little more confident.'}).waitFor();await page.screenshot({path:'output/playwright/mock-reflection.png',fullPage:true});
  await go('story');await page.fill('#note-sweets','Verified project detail for testing.');await page.reload();assert.equal(await page.inputValue('#note-sweets'),'Verified project detail for testing.');
  await go('companies');await page.locator('a[href="#companies/eurofins"]').click();await page.getByRole('heading',{name:'What candidates reported'}).waitFor();await page.locator('details').first().click();await page.screenshot({path:'output/playwright/company-room.png',fullPage:true});
  await go('applications');await action('add-application');await page.fill('#app-company','Example laboratory');await page.fill('#app-role','Microbiology trainee');await page.fill('#app-next','Prepare my project story');await page.fill('#app-url','https://example.com/job');await page.locator('#application-form button[type="submit"]').click();await page.getByRole('heading',{name:'Example laboratory'}).waitFor();await page.selectOption('[data-app-status]','Interview');
  await action('edit-application');await page.fill('#app-next','Interview confirmed');await page.locator('#application-form button[type="submit"]').click();assert.ok(await page.getByText('Interview confirmed',{exact:false}).count());
  await action('settings');const download=page.waitForEvent('download');await action('export');const file=await download;await file.saveAs('output/playwright/test-backup.json');await action('close-modal');
  await action('delete-application');await action('remove-application');await page.getByRole('heading',{name:'Your next chapter has a starting point.'}).waitFor();
  await action('settings');await page.locator('#import-file').setInputFiles('output/playwright/test-backup.json');await action('accept-import');await page.getByRole('heading',{name:'Example laboratory'}).waitFor();
  await go('sources');await page.locator('[data-action="source-type"][data-type="Community reports"]').click();assert.ok(await page.locator('.source-card').count()>0);
  await go('home');await page.locator('.art-star').click();await page.locator('dialog[open] .egg').waitFor();await action('close-modal');
  for(const width of [390,768,1280]){await page.setViewportSize({width,height:844});for(const route of ['home','questions','path','mock','companies','companies/eurofins','story','applications','sources']){await go(route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Horizontal overflow ${route} at ${width}px`);}if(width===390){await go('home');await page.screenshot({path:'output/playwright/dashboard-mobile.png',fullPage:true});await page.locator('.menu-button').click();await page.locator('.sidebar.open').waitFor();await page.locator('.sidebar a[href="#questions"]').click();await page.locator('.filters').waitFor();await page.screenshot({path:'output/playwright/questions-mobile.png',fullPage:true});}}
  assert.deepEqual(errors,[]);
  console.log('PASS: navigation, filtering, persistence, 5-question mock, notes, company reports, application CRUD, backup round-trip, Easter egg, responsive layout at 390/768/1280, no page errors.');
}finally{await browser.close();}
