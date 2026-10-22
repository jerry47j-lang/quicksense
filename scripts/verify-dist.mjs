import {readFile,access} from 'node:fs/promises';
const base=process.env.GITHUB_PAGES==='true'?'/quicksense/':'/';
const html=await readFile('dist/index.html','utf8');
for(const [,value]of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(!value.startsWith(base))throw Error('Unexpected root-relative asset: '+value);
 await access('dist/'+value.slice(base.length));
}
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
if(manifest.scope!=='./'||manifest.start_url!=='./')throw Error('Wrong installed app scope');
for(const icon of manifest.icons)await access('dist/'+icon.src);
for(const letter of 'abcdefghijklmnopqrstuvwxyz_')for(const language of ['en','zh-TW']){
 const data=JSON.parse(await readFile(`dist/dictionary/${language}/${letter}.json`,'utf8'));
 if(!data||typeof data!=='object')throw Error('Invalid dictionary chunk');
}
const chinese=JSON.parse(await readFile('dist/dictionary/zh-TW/d.json','utf8'));
if(!chinese.deadline.translationZh.includes('最後期限'))throw Error('Missing usable Chinese lookup data');
await access('dist/sw.js');
console.log('Public paths, app scope, icons and both full dictionary packs verified.');
