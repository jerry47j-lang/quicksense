import React from 'react';
export function PixelAvatar({kind='sprout',size=48}:{kind?:'sprout'|'cat'|'fox';size?:number}){
 const skin=kind==='fox'?'#ce8952':kind==='cat'?'#e9c99c':'#e6c49b',dark='#4c5442';
 return <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" aria-label={kind}><path d="M7 6h10v2h2v10h-2v3H7v-3H5V8h2z" fill={skin}/>{kind==='sprout'?<><path d="M11 6V3h2v4z" fill="#5a754a"/><path d="M11 4H7V1h4v2h2V0h4v3h-4v2z" fill="#8ca45d"/></>:<path d="M5 8V2h4v3h6V2h4v6h-4V6H9v2z" fill={skin}/>}<path d="M8 10h2v3H8zm6 0h2v3h-2z" fill={dark}/><path d="M11 14h2v2h-2z" fill="#9d7458"/><path d="M6 14h3v2H6zm9 0h3v2h-3z" fill="#dca283"/><path d="M6 20h12v4H6z" fill="#73917b"/><path d="M10 20h4v4h-4z" fill="#f0e6bf"/></svg>
}
export function PixelRoom({name,books=0,avatar='sprout'}:{name:string;books?:number;avatar?:'sprout'|'cat'|'fox'}){
 return <svg className="pixel-room" viewBox="0 0 480 198" shapeRendering="crispEdges" role="img" aria-label={`${name} 的像素小書房`}>
  <defs><pattern id="wall" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#e6ead5"/><rect x="2" y="2" width="1" height="1" fill="#dce2c9"/></pattern><pattern id="floor" width="48" height="20" patternUnits="userSpaceOnUse"><rect width="48" height="20" fill="#e4cda3"/><path d="M0 19h48M47 0v20" stroke="#d4b98e" strokeWidth="1"/></pattern></defs>
  <rect width="480" height="198" fill="url(#wall)"/><rect y="146" width="480" height="52" fill="url(#floor)"/><rect y="142" width="480" height="6" fill="#c3cba9"/>
  <rect x="34" y="22" width="102" height="88" fill="#9baf95"/><rect x="39" y="27" width="92" height="78" fill="#f8f3dc"/><rect x="44" y="32" width="82" height="68" fill="#c0d5cd"/><path d="M44 77h82v23H44z" fill="#adc3b1"/><path d="M44 85h16V73h16v11h17V70h15v13h18v17H44z" fill="#98b19a"/>
  <path d="M52 42h23v4h8v6H52zm40 13h15v-5h12v5h7v7H92z" fill="#f5f3df"/><rect x="82" y="28" width="5" height="76" fill="#f8f3dc"/><rect x="39" y="63" width="92" height="5" fill="#f8f3dc"/><path d="M29 20h13v94H29zm98 0h13v94h-13z" fill="#b9c4a6"/><path d="M33 20h4v87h-4zm98 0h4v87h-4z" fill="#abb99a"/>
  <rect x="178" y="19" width="111" height="9" fill="#a28e6f"/><rect x="183" y="28" width="101" height="55" fill="#d6d0ac"/><rect x="178" y="79" width="111" height="8" fill="#a28e6f"/>
  {[{x:190,w:9,h:31,c:'#819480'},{x:200,w:12,h:36,c:'#b78266'},{x:214,w:8,h:30,c:'#cfb676'},{x:224,w:13,h:39,c:'#7f9696'},{x:240,w:10,h:33,c:'#ad9b7c'},{x:252,w:8,h:37,c:'#a0ad80'},{x:264,w:11,h:31,c:'#b58c7d'}].map((b,i)=><g key={i}><rect x={b.x} y={79-b.h} width={b.w} height={b.h} fill={b.c}/><rect x={b.x+2} y={84-b.h} width={b.w-4} height="2" fill="#e8dfb9"/></g>)}
  <rect x="335" y="22" width="71" height="55" fill="#ae9978"/><rect x="340" y="27" width="61" height="45" fill="#f6f0d9"/><path d="M356 56h27v4h-27zM361 42h5v15h-5zm13-7h5v22h-5z" fill="#91a07b"/><rect x="348" y="33" width="5" height="5" fill="#dcb274"/>
  <ellipse cx="248" cy="180" rx="106" ry="10" fill="#cfb88f"/><path d="M153 167h178v20H153z" fill="#c1c8a4"/><path d="M157 171h170v12H157z" fill="#d5d9b9"/>
  <path d="M172 112h155v9H172zm7 9h8v53h-8zm133 0h8v53h-8z" fill="#927b5d"/><rect x="177" y="108" width="147" height="6" fill="#b6a07c"/>
  <rect x="227" y="70" width="56" height="35" fill="#687c70"/><rect x="232" y="75" width="46" height="24" fill="#e8efda"/><path d="M239 82h15v3h-15zm0 6h30v3h-30zm0 6h21v2h-21z" fill="#b0c1a1"/><rect x="250" y="105" width="8" height="4" fill="#687c70"/><rect x="239" y="108" width="30" height="3" fill="#687c70"/>
  <path d="M193 105V75h5v30zm0-30h26v5h-26z" fill="#687e65"/><path d="M210 80h14v8h-14z" fill="#9caa77"/><path d="M188 105h17v4h-17z" fill="#687e65"/>
  <rect x="288" y="98" width="15" height="11" fill="#d0a17c"/><path d="M303 100h5v6h-5" fill="none" stroke="#b98e6b" strokeWidth="2"/>
  <path d="M233 148h33v7h-33zm3 7h5v27h-5zm23 0h5v27h-5z" fill="#7a8e76"/>
  <g transform="translate(224,109) scale(1.8)"><PixelAvatar kind={avatar} size={25}/></g>
  <rect x="379" y="127" width="33" height="36" fill="#b88e6b"/><rect x="375" y="123" width="41" height="9" fill="#cba37b"/><path d="M390 123V94h6v29zM378 94v-8h14v12h-8v-4zm18 8V85h15v11h-8v6zM388 86V73h11v15z" fill="#819b6d"/><path d="M390 113h-12v-11h12zm9 5v-12h14v8h-8v4z" fill="#9eae7b"/>
  <rect x="60" y="130" width="45" height="28" fill="#aa9878"/><path d="M65 126h35v8H65z" fill="#d1ba92"/><rect x="66" y="137" width="33" height="16" fill="#d5c5a3"/><path d="M72 141h21v3H72zm0 6h17v2H72z" fill="#b8ab8c"/>
  <rect x="16" y="170" width="84" height="17" fill="#eee5c9"/><text x="23" y="182" fontFamily="monospace" fontSize="8" fill="#8d8d70">{name.slice(0,12).toUpperCase()}'S STUDY</text>
  {books>0&&<g><rect x="316" y="30" width="6" height="12" fill="#d5a478"/><path d="M314 34h10v5h-10z" fill="#e9cf96"/></g>}
 </svg>
}
