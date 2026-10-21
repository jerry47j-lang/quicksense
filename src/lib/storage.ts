import type {Profile,SavedItem} from '../types';
export const defaultProfile:Profile={name:'Jerry',avatar:'sprout',target:'zh-TW',source:'auto',mode:'work',serviceUrl:'',allowOnline:false,onboarded:false,completedLessons:[],reviewLog:[]};
const PROFILE='quicksense.profile.v1',SAVED='quicksense.saved.v1',HISTORY='quicksense.history.v1';
function read<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
export function loadProfile():Profile{const p=read<Partial<Profile>>(PROFILE,{});return {...defaultProfile,...p,name:typeof p.name==='string'?p.name.slice(0,24):defaultProfile.name,completedLessons:Array.isArray(p.completedLessons)?p.completedLessons.filter(x=>typeof x==='string'):[],reviewLog:Array.isArray(p.reviewLog)?p.reviewLog.filter(x=>typeof x?.at==='number'&&typeof x?.remembered==='boolean'):[]};}
export function saveProfile(profile:Profile){localStorage.setItem(PROFILE,JSON.stringify(profile));window.dispatchEvent(new Event('quicksense-storage'));}
export function loadSaved():SavedItem[]{return read<SavedItem[]>(SAVED,[]).filter(x=>typeof x?.id==='string'&&typeof x?.query==='string'&&typeof x?.meaning==='string'&&typeof x?.dueAt==='number');}
export function saveItems(items:SavedItem[]){localStorage.setItem(SAVED,JSON.stringify(items));window.dispatchEvent(new Event('quicksense-storage'));}
export function loadHistory():string[]{return read<string[]>(HISTORY,[]).filter(x=>typeof x==='string').slice(0,12);}
export function addHistory(query:string){const list=[query,...loadHistory().filter(x=>x!==query)].slice(0,12);localStorage.setItem(HISTORY,JSON.stringify(list));return list;}
export function scheduleReview(item:SavedItem,remembered:boolean,now=Date.now()):SavedItem{const interval=remembered?(item.reviews===0?1:Math.min(60,Math.max(1,item.interval)*2.5)):0;return {...item,reviews:remembered?item.reviews+1:0,interval,dueAt:now+(remembered?Math.round(interval*86400000):10*60000)};}
export function makeBackup(profile:Profile,items:SavedItem[]){return {format:'quicksense-backup',version:1,exportedAt:new Date().toISOString(),profile:{...profile,serviceUrl:'',allowOnline:false},items};}
export function parseBackup(input:unknown):{profile:Profile;items:SavedItem[]}{
 if(!input||typeof input!=='object')throw Error('invalid_backup');const b=input as Record<string,unknown>;
 if(b.format!=='quicksense-backup'||b.version!==1||!Array.isArray(b.items)||b.items.length>10000)throw Error('invalid_backup');
 const p=b.profile as Partial<Profile>;
 if(!p||typeof p.name!=='string'||!['zh-TW','en','ja','ko','es','fr','de','pt','it','vi','th','id'].includes(String(p.target)))throw Error('invalid_backup');
 const items=b.items.filter((x):x is SavedItem=>!!x&&typeof x==='object'&&typeof x.id==='string'&&typeof x.query==='string'&&x.query.length<=6000&&typeof x.meaning==='string'&&x.meaning.length<=12000&&Number.isFinite(x.dueAt)&&Number.isFinite(x.createdAt)&&Number.isFinite(x.reviews)&&Number.isFinite(x.interval));
 if(items.length!==b.items.length)throw Error('invalid_backup');
 return {profile:{...defaultProfile,name:p.name.slice(0,24),avatar:['sprout','cat','fox'].includes(String(p.avatar))?p.avatar!:'sprout',target:p.target!,completedLessons:Array.isArray(p.completedLessons)?p.completedLessons.filter(x=>typeof x==='string'):[],reviewLog:[] ,onboarded:true},items};
}
