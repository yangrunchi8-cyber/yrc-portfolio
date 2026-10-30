import {Fragment,useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';

// Immutable displacement texture: never replace an SVG image during a live frame.
export default function DesktopRipple(){
 const root=useRef(null);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const svg=root.current,filter=svg.querySelector('filter'),slots=[...svg.querySelectorAll('feImage')],alpha=[...svg.querySelectorAll('feFuncA')];
  const brush=document.createElement('canvas');brush.width=brush.height=128;
  const ctx=brush.getContext('2d'),pixels=ctx.createImageData(128,128);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
   const r2=((x-63.5)/63.5)**2+((y-63.5)/63.5)**2,i=(y*128+x)*4;
   const amount=r2<1?Math.max(0,(Math.exp(-5*r2)-Math.exp(-5))/(1-Math.exp(-5))*(.55+.45*Math.cos(Math.sqrt(r2)*Math.PI*6))):0;
   pixels.data[i]=128+Math.sin(amount*Math.PI*1.3)*106;pixels.data[i+1]=128+Math.cos(amount*Math.PI*1.3)*106;pixels.data[i+2]=128;pixels.data[i+3]=amount*255;
  }
  ctx.putImageData(pixels,0,0);
  let active=null,previous='',waves=[],raf=0,ready=false,disposed=false,paused=false,lastX=-1000,lastY=-1000;
  const clear=()=>{cancelAnimationFrame(raf);raf=0;waves=[];alpha.forEach(a=>a.setAttribute('slope','0'));if(active){active.style.filter=previous;active.dataset.pointerTrail='idle'}active=null;lastX=lastY=-1000};
  const image=new Image();image.onload=()=>{if(disposed)return;slots.forEach(s=>s.setAttribute('href',image.src));requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!disposed)ready=true}))};image.src=brush.toDataURL('image/png');
  const frame=now=>{
   raf=0;if(!active||!active.isConnected||document.hidden){clear();return}
   waves=waves.filter(w=>now-w.birth<1000);if(!waves.length){clear();return}
   slots.forEach((slot,i)=>{const w=waves[i];if(!w){alpha[i].setAttribute('slope','0');return}const age=(now-w.birth)/1000,r=65+age*75;slot.setAttribute('x',w.x-r);slot.setAttribute('y',w.y-r);slot.setAttribute('width',r*2);slot.setAttribute('height',r*2);alpha[i].setAttribute('slope',(1-age)**2)});
   active.style.filter='url("#desktop-stable-ripple")';active.dataset.pointerTrail='active';raf=requestAnimationFrame(frame);
  };
  const move=e=>{
   if(!ready||document.hidden||!(e.target instanceof Element))return;
   const resume=e.target.closest('.resume-viewer[data-stage="reading"]'),detail=e.target.closest('.project-viewer[data-stage="reading"]');if(paused&&!resume&&!detail)return;
   const node=detail?e.target.closest('.project-page-art'):resume?e.target.closest('.resume-image-host'):e.target.closest('.slide-canvas');
   if(!node||node.closest('[data-slide="home"]')){clear();return}
   if(node!==active){clear();active=node;previous=node.style.filter;filter.setAttribute('width',node.clientWidth);filter.setAttribute('height',node.clientHeight)}
   const r=node.getBoundingClientRect();if(!r.width||!r.height)return;
   const x=(e.clientX-r.left)*node.clientWidth/r.width,y=(e.clientY-r.top)*node.clientHeight/r.height;
   if(Math.hypot(x-lastX,y-lastY)<12)return;lastX=x;lastY=y;waves.push({x,y,birth:performance.now()});if(waves.length>12)waves.shift();if(!raf)raf=requestAnimationFrame(frame);
  };
  const pause=e=>{paused=!!e.detail;clear()},hidden=()=>{if(document.hidden)clear()};
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('scroll',clear,{passive:true,capture:true});window.addEventListener('resize',clear);window.addEventListener('portfolio:motion-pause',pause);document.addEventListener('visibilitychange',hidden);
  return()=>{disposed=true;clear();window.removeEventListener('pointermove',move);window.removeEventListener('scroll',clear,true);window.removeEventListener('resize',clear);window.removeEventListener('portfolio:motion-pause',pause);document.removeEventListener('visibilitychange',hidden)};
 },[]);
 return createPortal(<svg ref={root} width="0" height="0" aria-hidden="true" style={{position:'fixed',pointerEvents:'none'}}><defs><filter id="desktop-stable-ripple" x="0" y="0" width="1920" height="1080" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodColor="#808080" result="neutral"/>{Array.from({length:12},(_,i)=><Fragment key={i}><feImage x="0" y="0" width="1" height="1" preserveAspectRatio="none" result={`brush${i}`}/><feComponentTransfer in={`brush${i}`} result={`wave${i}`}><feFuncA type="linear" slope="0"/></feComponentTransfer></Fragment>)}<feMerge result="waves"><feMergeNode in="neutral"/>{Array.from({length:12},(_,i)=><feMergeNode key={i} in={`wave${i}`}/>)}</feMerge><feDisplacementMap in="SourceGraphic" in2="waves" scale="46" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>,document.body);
}
