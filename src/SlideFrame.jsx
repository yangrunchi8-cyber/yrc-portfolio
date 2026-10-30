import {Fragment,useEffect,useLayoutEffect,useRef,useState} from 'react';
export function useDeckScale(){useLayoutEffect(()=>{const update=()=>{const scale=Math.min(document.documentElement.clientWidth/1920,innerHeight/1080);document.documentElement.style.setProperty('--slide-scale',String(scale))};update();const ro=new ResizeObserver(update);ro.observe(document.documentElement);window.addEventListener('resize',update);return()=>{ro.disconnect();window.removeEventListener('resize',update)}},[])}
// Hysteresis: replay after a real exit, never while hovering at a page boundary.
export default function SlideFrame({name,children}){
 const node=useRef(null),inside=useRef(false);
 const [entered,setEntered]=useState(false),[visit,setVisit]=useState(0);
 useEffect(()=>{const io=new IntersectionObserver(([entry])=>{
  if(!inside.current&&entry.intersectionRatio>=.5){inside.current=true;setVisit(n=>n+1);setEntered(true)}
  else if(inside.current&&entry.intersectionRatio<=.12){inside.current=false;setEntered(false)}
 },{threshold:[0,.12,.5,1]});io.observe(node.current);return()=>io.disconnect()},[]);
 return <div ref={node} className="slide-shell" data-slide={name} data-visit={visit} data-entered={entered?'true':'false'}><div className="slide-canvas" data-ripple-host data-design-width="1920" data-design-height="1080"><Fragment key={visit}>{children}</Fragment></div></div>
}
