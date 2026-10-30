import {useEffect,useRef,useState} from 'react';
import layout from './closingLayers.json';
import './ClosingPage.css';
const clamp=x=>Math.max(0,Math.min(1,x));
// Connected tile bodies use the same target positions as the original artwork.
const grouped=[];
for(const direction of ['up','down']){
 const source=layout.groups.filter(g=>g.direction===direction).flatMap(g=>g.pieces),regular=source.filter(p=>p.width===300&&p.height===300),details=source.filter(p=>p.width!==300||p.height!==300);
 const rest=new Map(regular.map(p=>[`${p.x},${p.y}`,p]));
 while(rest.size){
  const anchor=[...rest.values()].sort((a,b)=>direction==='up'?a.y-b.y||a.x-b.x:b.y-a.y||a.x-b.x)[0];const tiles=[anchor];rest.delete(`${anchor.x},${anchor.y}`);
  for(let at=0;at<tiles.length&&tiles.length<4;at++){
   const p=tiles[at],dy=direction==='up'?300:-300;
   for(const [x,y] of [[p.x,p.y+dy],[p.x+300,p.y],[p.x-300,p.y],[p.x,p.y-dy]]){const q=rest.get(`${x},${y}`);if(q&&tiles.length<4){tiles.push(q);rest.delete(`${x},${y}`)}}
  }grouped.push({direction,pieces:tiles});
 }
 details.forEach(p=>grouped.push({direction,pieces:[p]}));
}
const offsets={up:0,down:0};
const groups=grouped.map((group,i)=>{const n=offsets[group.direction]++,left=Math.min(...group.pieces.map(p=>p.x)),top=Math.min(...group.pieces.map(p=>p.y)),right=Math.max(...group.pieces.map(p=>p.x+p.width)),bottom=Math.max(...group.pieces.map(p=>p.y+p.height));return {...group,cx:(left+right)/2,cy:(top+bottom)/2,delay:.55+n*.32,duration:1.5+(i%3)*.1,turn:(i%2?-1:1)*(34+i%5*8),drift:(i%2?-1:1)*(110+i%4*35)}});
const firstLower=groups.findIndex(g=>g.direction==='down');
const finishAt=Math.max(...groups.map(g=>g.delay+g.duration));
export default function ClosingPage(){
 const root=useRef(null),canvas=useRef(null),assets=useRef(null);const [started,setStarted]=useState(false);
 function prepare(){if(!assets.current){const load=src=>{const image=new Image();image.decoding='async';image.src=src;return image};const texts=layout.texts.map(p=>load(p.src)),pieces=groups.map(g=>g.pieces.map(p=>load(p.src))),original=load('/assets/closing/original.png');assets.current=Promise.all([...texts,...pieces.flat(),original].map(i=>i.decode())).then(()=>({texts,pieces,original}))}return assets.current}
 useEffect(()=>{
  
  const nearby=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){prepare().catch(()=>{});nearby.disconnect()}},{rootMargin:'100% 0px'});nearby.observe(root.current);
  const enter=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setStarted(true);enter.disconnect()}},{threshold:.3});enter.observe(root.current);
  return()=>{nearby.disconnect();enter.disconnect()};
 },[]);
 useEffect(()=>{
  if(!started)return;let alive=true,raf=0,visible=true,paused=false,drawFrame=null,finalFrame=null;
  const c=canvas.current,ctx=c.getContext('2d'),W=layout.width,H=layout.height;
  const coordinates=()=>ctx.setTransform(c.width/W,0,0,c.height/H,0,0);
  const resize=()=>{const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);finalFrame?.()};resize();const ro=new ResizeObserver(resize);ro.observe(c);
  const stop=()=>{cancelAnimationFrame(raf);raf=0};
  const wake=()=>{if(alive&&!raf&&drawFrame&&!finalFrame&&visible&&!paused&&!document.hidden)raf=requestAnimationFrame(drawFrame)};
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)wake();else stop()});io.observe(c);
  const onPause=e=>{paused=!!e.detail;if(paused)stop();else wake()};const onVisibility=()=>{if(document.hidden)stop();else wake()};
  window.addEventListener('portfolio:motion-pause',onPause);document.addEventListener('visibilitychange',onVisibility);
  prepare().then(({texts,pieces,original})=>{
   if(!alive)return;const begin=performance.now(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
   function draw(now){
    raf=0;if(!alive||!visible||paused||document.hidden)return;const t=reduce?20:(now-begin)/1000;coordinates();ctx.clearRect(0,0,W,H);
    groups.forEach((g,i)=>{
     const p=clamp((t-g.delay)/g.duration);if(p<=0)return;
     const hit=.79,travel=p<hit?(p/hit)**2:1,after=clamp((p-hit)/(1-hit));
     const rebound=p>=hit?Math.abs(Math.sin(after*Math.PI*2))*Math.exp(-after*3)*115:0;
     // Upper tiles rise from below; lower tiles fall from above.
     const sign=g.direction==='up'?1:-1,dy=sign*((H+450)*(1-travel)+rebound);
     const angularBounce=p>=hit?Math.sin(after*Math.PI*3)*Math.exp(-after*3)*.055:0;
     const angle=g.turn*Math.PI/180*(1-Math.min(p/hit,1))**1.3+angularBounce;
     if(i===0)c.dataset.upperOffset=String(Math.round(dy));
     if(g.direction==='down'&&i===firstLower)c.dataset.lowerOffset=String(Math.round(dy));
     ctx.save();ctx.translate(g.cx+g.drift*(1-travel),g.cy+dy);ctx.rotate(angle);ctx.translate(-g.cx,-g.cy);
     g.pieces.forEach((q,j)=>ctx.drawImage(pieces[i][j],q.x,q.y,q.width,q.height));ctx.restore();
    });
    layout.texts.forEach((q,i)=>{const p=clamp((t-.18-i*.09)/1.45),ease=1-(1-p)**4;ctx.save();ctx.globalAlpha=1-(1-p)**2;ctx.drawImage(texts[i],q.x,q.y+160*(1-ease),q.width,q.height);ctx.restore()});
    const settle=clamp((t-finishAt)/.35);if(settle>0){ctx.globalAlpha=settle;ctx.drawImage(original,0,0,W,H);ctx.globalAlpha=1}
    c.dataset.phase=t<1.65?'text':'blocks';
    if(settle>=1){finalFrame=()=>{coordinates();ctx.clearRect(0,0,W,H);ctx.drawImage(original,0,0,W,H)};finalFrame();c.dataset.phase='complete';c.dataset.upperOffset='0';c.dataset.lowerOffset='0';return}wake();
   }drawFrame=draw;wake();
  }).catch(()=>{const image=new Image();image.onload=()=>{if(alive){finalFrame=()=>{coordinates();ctx.drawImage(image,0,0,W,H)};finalFrame();c.dataset.phase='complete'}};image.src='/assets/closing/original.png'});
  return()=>{alive=false;stop();ro.disconnect();io.disconnect();window.removeEventListener('portfolio:motion-pause',onPause);document.removeEventListener('visibilitychange',onVisibility)};
 },[started]);
 return <section id="closing" className="closing-page" ref={root} aria-label="作品集封底：THANKS"><div className="closing-art"><img src="/assets/closing/background.webp" width={layout.width} height={layout.height} alt=""/><canvas ref={canvas} className="closing-canvas" role="img" aria-label="THANKS。上方方块向上升起，下方方块从上落下，最终回归封底原图。"/></div></section>;
}
