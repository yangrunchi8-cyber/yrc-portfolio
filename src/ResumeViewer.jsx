import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import SpecularButton from './SpecularButton';
import {getResumeAssets} from './resumeAssets';
import {useTransitionDiagnostics} from './transitionDiagnostics';
import './ResumeViewer.css';
export default function ResumeViewer({origin,onClose}){
 const viewer=useRef(null),photo=useRef(null),resumeHost=useRef(null),end=useRef(null);
 const [stage,setStage]=useState('transitioning'),[atBottom,setAtBottom]=useState(false);
 useTransitionDiagnostics(viewer,photo,origin);
 useLayoutEffect(()=>{
  const app=document.getElementById('root'),before=document.body.style.overflow,wasInert=app.inert;
  document.body.style.overflow='hidden';app.inert=true;app.classList.add('resume-transitioning');
  window.dispatchEvent(new CustomEvent('portfolio:motion-pause',{detail:true}));
  const assets=getResumeAssets();
  // These are the same DOM images that were decoded before the photo became clickable.
  resumeHost.current.append(assets.resume);photo.current.append(assets.portrait);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=reduce?1:620;
  const entering=viewer.current.animate([
   {opacity:0,transform:'translate3d(0,18px,0)',offset:0},
   {opacity:0,transform:'translate3d(0,18px,0)',offset:.12,easing:'cubic-bezier(.22,1,.36,1)'},
   {opacity:1,transform:'translate3d(0,0,0)',offset:1}
  ],{duration,fill:'both'});
  const leaving=photo.current.animate([
   {opacity:1,transform:'translate3d(0,0,0) scale(1)',offset:0,easing:'cubic-bezier(.22,1,.36,1)'},
   {opacity:0,transform:'translate3d(0,-5px,0) scale(1.045)',offset:.58},
   {opacity:0,transform:'translate3d(0,-5px,0) scale(1.045)',offset:1}
  ],{duration,fill:'both'});
  // Share one timeline, without a React update or resource wait between phases.
  const sharedStart=document.timeline.currentTime;
  if(sharedStart!==null){entering.startTime=sharedStart;leaving.startTime=sharedStart;}
  let alive=true;
  entering.finished.then(()=>{if(alive){viewer.current.style.opacity='1';viewer.current.style.transform='none';entering.cancel();setStage('reading')}}).catch(()=>{});
  return()=>{alive=false;entering.cancel();leaving.cancel();assets.resume.remove();assets.portrait.remove();document.body.style.overflow=before;app.inert=wasInert;app.classList.remove('resume-transitioning');window.dispatchEvent(new CustomEvent('portfolio:motion-pause',{detail:false}))};
 },[origin]);
 useEffect(()=>{
  const key=e=>{if(e.key==='Escape'){e.preventDefault();onClose()}if(e.key==='Tab'){e.preventDefault();const button=viewer.current.querySelector('button');(button??viewer.current).focus({preventScroll:true})}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[onClose]);
 useEffect(()=>{
  if(stage!=='reading')return;
  viewer.current.focus({preventScroll:true});
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setAtBottom(true);observer.disconnect()}},{root:viewer.current,threshold:.7});observer.observe(end.current);return()=>observer.disconnect();
 },[stage]);
 return createPortal(<>
  <div ref={viewer} className="resume-viewer" data-stage={stage} role="dialog" aria-modal="true" aria-label="阳润驰个人简历" tabIndex={-1}>
   <div className="resume-document"><div ref={resumeHost} className="resume-image-host"/><div className="resume-end-space"/><div ref={end} className="resume-end" aria-hidden="true"/></div>
   {atBottom&&<div className="resume-return"><SpecularButton size="md" radius={28} tint="#eadbff" tintOpacity={.8} blur={18} textColor="#63448a" lineColor="#fffaff" baseColor="#aa7ed8" intensity={1.15} idleIntensity={.5} autoAnimate speed={.5} glow={1} followMouse onClick={onClose} aria-label="Back to Profile"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 5 3 12l7 7M3 12h12a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg><span>Back to Profile</span></SpecularButton></div>}
  </div>
  {stage!=='reading'&&<div ref={photo} className="resume-photo-transition" aria-hidden="true" style={{left:origin.left,top:origin.top,width:origin.width,height:origin.height,borderRadius:origin.radius}}/>}
 </>,document.body);
}
