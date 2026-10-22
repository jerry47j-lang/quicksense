import {readFileSync} from 'node:fs';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {clearLookupCache,lookupLocal,lookupMeaning} from '../src/lib/lookup';
import {freeTranslationUrl,resolveTarget} from '../src/lib/free-translation';
import {defaultProfile,saveProfile,loadProfile,saveItems,loadSaved,storageAvailable} from '../src/lib/storage';

afterEach(()=>{vi.unstubAllGlobals();clearLookupCache();});
function bundledFetch(){vi.stubGlobal('fetch',async(path:string)=>{
 const relative=path.slice(path.indexOf('dictionary/'));
 try{return new Response(readFileSync(new URL('../public/'+relative,import.meta.url)),{status:200});}catch{return new Response('',{status:404});}
});}
describe('free first-use path',()=>{
 it.each([['deadline','最後期限'],['serendipity',''],['meeting','會議'],['went','']])('finds the shipped Chinese entry for %s',async(query,meaning)=>{
  bundledFetch();const result=await lookupLocal(query);expect(result.mode).toBe('dictionary');expect(result.dictionary?.translationZh).toMatch(/\p{Script=Han}/u);if(meaning)expect(lookupMeaning(result)).toContain(meaning);
 });
 it('still returns Chinese when the English pack cannot load',async()=>{
  bundledFetch();const original=fetch;vi.stubGlobal('fetch',(path:string)=>path.includes('/en/')?Promise.reject(Error('offline')):original(path));
  expect(lookupMeaning(await lookupLocal('deadline'))).toContain('最後期限');
 });
 it('keeps a useful English result when the Chinese pack fails',async()=>{
  bundledFetch();const original=fetch;vi.stubGlobal('fetch',(path:string)=>path.includes('/zh-TW/')?Promise.reject(Error('offline')):original(path));
  expect(lookupMeaning(await lookupLocal('deadline'))).toContain('completed');
 });
 it('returns an honest miss for a sentence without manufacturing a translation',async()=>{
  vi.stubGlobal('fetch',()=>{throw Error('no dictionary request expected');});
  const result=await lookupLocal('I am looking forward to our next meeting on Friday.');expect(result.mode).toBe('miss');expect(result.analysis).toBeUndefined();
 });
 it('preserves Unicode, line breaks and reserved characters in the free handoff',()=>{
  const text='我想確認 A&B 的時間。\nIs 10:30 OK? #meeting';const url=new URL(freeTranslationUrl(text,'auto','en'));
  expect(url.origin).toBe('https://translate.google.com');expect(url.searchParams.get('text')).toBe(text);expect(url.searchParams.get('tl')).toBe('en');expect(url.username).toBe('');
 });
 it('refuses to silently truncate long text',()=>{expect(()=>freeTranslationUrl('a'.repeat(5001),'en','ja')).toThrow();expect(()=>freeTranslationUrl('  ','en','ja')).toThrow();});
 it.each([['我餓了','en'],['想把會議改到下午','en'],['お疲れ様です','zh-TW'],['ありがとうございます','zh-TW'],['I am hungry','zh-TW']])('shows a useful automatic target for %s',(text,target)=>{expect(resolveTarget(text,{...defaultProfile,source:'auto',smartTarget:true})).toBe(target);});
 it('respects a manually selected target and an explicit Chinese source',()=>{expect(resolveTarget('我餓了',{...defaultProfile,target:'ko',smartTarget:false})).toBe('ko');expect(resolveTarget('test',{...defaultProfile,source:'zh-TW',smartTarget:true})).toBe('en');});
 it('keeps working in memory when browser storage is unavailable',()=>{
  vi.stubGlobal('localStorage',{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}});
  expect(storageAvailable()).toBe(false);expect(()=>saveProfile({...defaultProfile,name:'Temporary learner'})).not.toThrow();expect(loadProfile().name).toBe('Temporary learner');
  const items=[{id:'temp',query:'deadline',meaning:'最後期限',language:'en',source:'test',createdAt:1,dueAt:1,reviews:0,interval:0}];saveItems(items);expect(loadSaved()).toEqual(items);
 });
});
