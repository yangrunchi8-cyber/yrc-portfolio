import {useEffect,useRef,useState} from 'react';
import pieces from './blockPieces.json';
import RippleDistortion from './RippleDistortion';
import RotatingFlower from './RotatingFlower';
const W=3840,H=2160;
const clamp=x=>Math.max(0,Math.min(1,x));
// The source artwork stays in its native coordinate system. Only transparent layers move.
const shapes=[
 {ids:[0,1,16,17],delay:.45,turn:-18},
 {ids:[2,3,4,18],delay:.85,turn:22},
 {ids:[5,6,7],delay:1.15,turn:-15},
 {ids:[8,9,20,21],delay:1.55,turn:16},
 {ids:[10,11,22,23],delay:1.95,turn:-22},
 {ids:[12,13,14,15],delay:2.3,turn:19},
 {ids:[25,26,33,38],delay:2.7,turn:-14},
 {ids:[27,28,29,35],delay:3.1,turn:20},
 {ids:[24,30,31,32],delay:3.5,turn:-17},
 {ids:[34,39,40],delay:3.9,turn:16},
 {ids:[36,37,41,42,43],delay:4.3,turn:-20},
 {ids:[19],delay:2.05,turn:25}
].map((shape,i)=>{
 const tiles=shape.ids.map(id=>pieces[id]);
 const left=Math.min(...tiles.map(p=>p.x)),top=Math.min(...tiles.map(p=>p.y));
 const right=Math.max(...tiles.map(p=>p.x+p.width)),bottom=Math.max(...tiles.map(p=>p.y+p.height));
 return {...shape,tiles,cx:(left+right)/2,cy:(top+bottom)/2,bottom,duration:1.3+(i%3)*.09,drift:(i%2?-1:1)*(35+i*9)};
});
export default function CoverIntro({desktopTrailFix=false}){
 const canvas=useRef(null),[run,setRun]=useState(0);
 useEffect(()=>{
  let alive=true,raf=0,drawStatic=null,drawFrame=null,visible=true,paused=false;const c=canvas.current,ctx=c.getContext('2d');
  const setCoordinates=()=>ctx.setTransform(c.width/W,0,0,c.height/H,0,0);
  const resize=()=>{const r=c.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,3);c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);if(drawStatic)drawStatic()};
  resize();const ro=new ResizeObserver(resize);ro.observe(c);
  const stop=()=>{cancelAnimationFrame(raf);raf=0};
  const wake=()=>{if(alive&&!raf&&drawFrame&&!drawStatic&&visible&&!paused&&!document.hidden)raf=requestAnimationFrame(drawFrame)};
  const intersection=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)wake();else stop()});intersection.observe(c);
  const onPause=event=>{paused=!!event.detail;if(paused)stop();else wake()};
  const onVisibility=()=>{if(document.hidden)stop();else wake()};
  window.addEventListener('portfolio:motion-pause',onPause);document.addEventListener('visibilitychange',onVisibility);
  const load=src=>{const i=new Image();i.src=src;return i};
  const sprites=pieces.map(p=>load(p.src)),blocks=load('/assets/cover-blocks.png'),text=load('/assets/cover-text-no-flower.png');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  c.dataset.phase='loading';ctx.clearRect(0,0,c.width,c.height);
  const staticFrame=()=>{setCoordinates();ctx.clearRect(0,0,W,H);ctx.drawImage(blocks,0,960,3840,1200);ctx.drawImage(text,79,0,3761,1553)};
  Promise.all([...sprites,blocks,text].map(i=>i.decode())).then(()=>{
   if(!alive)return;const start=performance.now();
   function draw(now){
    raf=0;if(!alive||!visible||paused||document.hidden)return;const t=reduced?20:(now-start)/1000;let settled=true;
    setCoordinates();ctx.clearRect(0,0,W,H);
    shapes.forEach(shape=>{
     const p=clamp((t-shape.delay)/shape.duration);if(p<1)settled=false;if(p<=0)return;
     // Accelerate into a short impact, then settle with two diminishing rebounds.
     const hit=.79;
     const fall=p<hit?(p/hit)**2:1;
     const after=clamp((p-hit)/(1-hit));
     const bounce=p>=hit?-Math.abs(Math.sin(after*Math.PI*2))*Math.exp(-after*3.5)*32:0;
     const dy=-(shape.bottom+300)*(1-fall)+bounce;
     const angle=(shape.turn*Math.PI/180)*(1-Math.min(p/hit,1))+(p>=hit?Math.sin(after*Math.PI*2)*.014*(1-after):0);
     ctx.save();ctx.translate(shape.cx+shape.drift*(1-fall),shape.cy+dy);ctx.rotate(angle);ctx.translate(-shape.cx,-shape.cy);
     shape.ids.forEach(id=>{const q=pieces[id];ctx.drawImage(sprites[id],q.x,q.y,q.width,q.height)});ctx.restore();
    });
    // Video 2: a single coherent type composition floats upward and eases into place.
    // Draw it above the falling pieces so the heading remains readable throughout.
    const p=clamp((t-.18)/1.45),ease=1-Math.pow(1-p,4);
    ctx.save();ctx.globalAlpha=1-Math.pow(1-p,2);ctx.drawImage(text,79,108*(1-ease),3761,1553);ctx.restore();
    c.dataset.phase=settled?'settled':t<.65?'starting':t<1.65?'rising':'falling';
    if(settled){drawStatic=staticFrame;staticFrame();return;}
    wake();
   }drawFrame=draw;wake();
  }).catch(()=>{if(!alive)return;Promise.all([blocks,text].map(i=>i.decode())).then(()=>{if(alive){drawStatic=staticFrame;staticFrame();c.dataset.phase='settled'}}).catch(()=>{});});
  return()=>{alive=false;cancelAnimationFrame(raf);ro.disconnect();intersection.disconnect();window.removeEventListener('portfolio:motion-pause',onPause);document.removeEventListener('visibilitychange',onVisibility)};
 },[run]);
 return <><div className="cover-art split-cover"><img className="cover-original" src="/assets/cover-background.jpg" alt="阳润驰作品集紫色渐变背景" width="3840" height="2160" fetchPriority="high"/><canvas ref={canvas} className="cover-blocks-canvas" role="img" aria-label="个人作品集：文字向上浮现，俄罗斯方块组合依次下落"/><RippleDistortion desktopSafe={desktopTrailFix} className="cover-ripple" src="/assets/cover-background.jpg" sourceCanvasRef={canvas} brushSize={100} strength={0.065} swirl={0.65} rings={3} spread={1.65} fade={1.8} spacing={8} grayscale={false} tintAmount={0} dispersion={0} glint={0} quality="high" trigger="hover"/><RotatingFlower className="flower-cover"/></div><button className="cover-replay" onClick={()=>setRun(r=>r+1)} aria-label="重播封面入场动画">↻ 重播入场</button></>;
}
