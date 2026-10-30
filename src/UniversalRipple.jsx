import {useEffect,useRef} from 'react';
import DesktopRipple from './DesktopRipple';
import {createPortal} from 'react-dom';
export default function UniversalRipple({desktopSafe=false}){return desktopSafe?<DesktopRipple/>:<LegacyUniversalRipple/>}
function LegacyUniversalRipple(){
 const filter=useRef(null),mapImage=useRef(null),displacement=useRef(null);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const field=document.createElement('canvas'),ctx=field.getContext('2d');
  let active=null,previousFilter='',waves=[],raf=0,lastRender=0,lastX=-1000,lastY=-1000,paused=false,W=1920,H=1080,FW=384,FH=216,values=null,pixels=null,packed=null;
  const clear=()=>{cancelAnimationFrame(raf);raf=0;waves=[];if(active){active.style.filter=previousFilter;active.dataset.pointerTrail='idle'}active=null;lastX=lastY=-1000;lastRender=0};
  const activate=node=>{if(active===node)return;clear();active=node;previousFilter=node.style.filter;W=node.clientWidth;H=node.clientHeight;FW=384;FH=Math.max(2,Math.min(768,Math.round(H/W*FW)));field.width=FW;field.height=FH;values=new Float32Array(FW*FH);pixels=ctx.createImageData(FW,FH);packed=new Uint32Array(pixels.data.buffer);filter.current.setAttribute('width',W);filter.current.setAttribute('height',H);mapImage.current.setAttribute('width',W);mapImage.current.setAttribute('height',H)};
  const frame=now=>{
   raf=0;if(!active||document.hidden)return;
   if(now-lastRender<16){raf=requestAnimationFrame(frame);return}lastRender=now;
   waves=waves.filter(w=>now-w.birth<1000);if(!waves.length){clear();return}
   values.fill(0);packed.fill(0xff808080);
   for(const wave of waves){const age=(now-wave.birth)/1000,fade=(1-age)**2,r=(65+age*75)*FW/W,cx=wave.x*FW/W,cy=wave.y*FH/H;
    const left=Math.max(0,Math.floor(cx-r)),right=Math.min(FW-1,Math.ceil(cx+r)),top=Math.max(0,Math.floor(cy-r)),bottom=Math.min(FH-1,Math.ceil(cy+r));
    for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const dx=(x-cx)/r,dy=(y-cy)/r,r2=dx*dx+dy*dy;if(r2>1)continue;const brush=(Math.exp(-5*r2)-.006737947)/.993262053*(.55+.45*Math.cos(Math.sqrt(r2)*Math.PI*6));values[y*FW+x]+=brush*fade;}
   }
   const data=pixels.data;
   for(let i=0;i<values.length;i++){const amount=Math.min(1,values[i]);if(amount<.0001)continue;const turn=amount*Math.PI*1.3;data[i*4]=128+Math.sin(turn)*amount*106;data[i*4+1]=128+Math.cos(turn)*amount*106;}
   ctx.putImageData(pixels,0,0);mapImage.current.setAttribute('href',field.toDataURL('image/png'));displacement.current.setAttribute('scale','46');
   active.style.filter='url("#portfolio-live-ripple")';active.dataset.pointerTrail='active';
   raf=requestAnimationFrame(frame);
  };
  const move=e=>{
   if(e.pointerType==='touch'||document.hidden||!(e.target instanceof Element))return;
   const resume=e.target.closest('.resume-viewer[data-stage="reading"]'),detail=e.target.closest('.project-viewer[data-stage="reading"]');if(paused&&!resume&&!detail)return;
   const node=detail?e.target.closest('.project-page-art'):resume?e.target.closest('.resume-image-host'):e.target.closest('.slide-canvas');
   if(!node||node.closest('[data-slide="home"]')){if(active)clear();return}
   activate(node);const r=node.getBoundingClientRect();if(!r.width||!r.height)return;
   const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
   if(Math.hypot(x-lastX,y-lastY)<12)return;lastX=x;lastY=y;
   waves.push({x,y,birth:performance.now()});if(waves.length>18)waves.shift();if(!raf)raf=requestAnimationFrame(frame);
  };
  const pause=e=>{paused=!!e.detail;clear()};const visibility=()=>{if(document.hidden)clear()};
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('scroll',clear,{passive:true,capture:true});window.addEventListener('resize',clear);window.addEventListener('portfolio:motion-pause',pause);document.addEventListener('visibilitychange',visibility);
  return()=>{clear();window.removeEventListener('pointermove',move);window.removeEventListener('scroll',clear,true);window.removeEventListener('resize',clear);window.removeEventListener('portfolio:motion-pause',pause);document.removeEventListener('visibilitychange',visibility)};
 },[]);
 return createPortal(<svg width="0" height="0" aria-hidden="true" style={{position:'fixed',pointerEvents:'none'}}><defs><filter ref={filter} id="portfolio-live-ripple" x="0" y="0" width="1920" height="1080" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feImage ref={mapImage} x="0" y="0" width="1920" height="1080" preserveAspectRatio="none" result="waves"/><feDisplacementMap ref={displacement} in="SourceGraphic" in2="waves" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>,document.body);
}
