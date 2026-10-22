import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const shell = [
  "./",
  "./index.html",
  "./icon.svg",
  "./manifest.webmanifest",
  "./icons/192x192.png",
  "./icons/512x512.png",
  ...(await readdir("dist/assets")).map((f) => "./assets/" + f),
];
const revision = createHash("sha256")
  .update(shell.join("|"))
  .update(await readFile("dist/dictionary/zh-TW/manifest.json"))
  .digest("hex")
  .slice(0, 12);
const code = `const CACHE='quicksense-${revision}',SHELL=${JSON.stringify(shell)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('quicksense-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 const base=new URL('./',self.location).pathname;if(!url.pathname.startsWith(base))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(event.request.mode==='navigate'){try{const response=await fetch(event.request);if(response.ok){await cache.put(new URL('./',self.location).href,response.clone());return response;} }catch{} return await cache.match(new URL('./',self.location).href)||new Response('請先連線開啟快懂一次，再使用離線模式。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}
  const hit=await cache.match(event.request);if(hit)return hit;
  const response=await fetch(event.request);if(response.ok&&(/\\/dictionary\\/|\\/assets\\/|\\/icons\\//.test(url.pathname)||/\\.(svg|webmanifest)$/.test(url.pathname)))await cache.put(event.request,response.clone());return response;
 })());
});`;
await writeFile("dist/sw.js", code);
console.log("Offline app shell prepared: " + revision);
