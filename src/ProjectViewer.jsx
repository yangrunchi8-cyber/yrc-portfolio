import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import SpecularButton from './SpecularButton';
import './ProjectViewer.css';
const covers=new Map();
export function prepareProject(project){
 if(!project||covers.has(project.slug))return;
 const image=new Image(),page=project.pages[0];image.decoding='async';image.sizes='(max-width: 1920px) 100vw, 1920px';if(page.src2x)image.srcset=`${page.src} 1920w, ${page.src2x} 3840w`;image.src=page.src;image.decode().catch(()=>{});covers.set(project.slug,image);
}
function BackIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
export default function ProjectViewer({project,cover,onClosed}){
 const root=useRef(null),scroller=useRef(null),back=useRef(null),closing=useRef(false),closeAction=useRef(null);
 const [stage,setStage]=useState('entering'),[page,setPage]=useState(1),[zoom,setZoom]=useState(false);
 useLayoutEffect(()=>{
  const node=root.current,app=document.getElementById('root'),before=document.body.style.overflow,beforeHtml=document.documentElement.style.overflow,inert=app.inert,focus=document.activeElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const address=`#project/${project.slug}`;
  document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';app.inert=true;
  window.dispatchEvent(new CustomEvent('portfolio:motion-pause',{detail:true}));
  history.pushState({portfolioProject:project.slug},'',address);
  let alive=true,leaving=null;
  const entering=node.animate([{opacity:0,transform:'translate3d(0,24px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:reduce?1:620,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  entering.finished.then(()=>{if(alive&&!closing.current){node.style.opacity='1';entering.cancel();setStage('reading');back.current?.focus({preventScroll:true})}}).catch(()=>{});
  const close=(fromHistory=false)=>{
   if(closing.current)return;closing.current=true;setStage('leaving');
   if(!fromHistory&&location.hash===address)history.back();
   const current=getComputedStyle(node).opacity;entering.cancel();
   leaving=node.animate([{opacity:current,transform:'translate3d(0,0,0)'},{opacity:0,transform:'translate3d(0,12px,0)'}],{duration:reduce?1:360,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
   leaving.finished.then(()=>{if(alive)onClosed()}).catch(()=>{});
  };
  closeAction.current=close;
  const pop=()=>{if(location.hash!==address)close(true)};
  const key=e=>{
   if(e.key==='Escape'){e.preventDefault();close()}
   if(e.key==='PageDown'||e.key==='PageUp'){e.preventDefault();scroller.current.scrollBy({top:scroller.current.clientHeight*(e.key==='PageDown'?.9:-.9),behavior:reduce?'instant':'smooth'})}
   if(e.key==='Tab'){
    const nodes=[...node.querySelectorAll('button:not([disabled]),a[href]')];const first=nodes[0],last=nodes.at(-1);
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===node)){e.preventDefault();last?.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
   }
  };
  window.addEventListener('popstate',pop);window.addEventListener('keydown',key);
  return()=>{alive=false;entering.cancel();leaving?.cancel();window.removeEventListener('popstate',pop);window.removeEventListener('keydown',key);document.body.style.overflow=before;document.documentElement.style.overflow=beforeHtml;app.inert=inert;window.dispatchEvent(new CustomEvent('portfolio:motion-pause',{detail:false}));focus?.focus?.({preventScroll:true})};
 },[project,onClosed]);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(visible[0])setPage(Number(visible[0].target.dataset.page))},{root:scroller.current,threshold:[.1,.3,.5,.7]});
  root.current.querySelectorAll('.project-page').forEach(e=>observer.observe(e));return()=>observer.disconnect();
 },[project]);
 return createPortal(<div ref={root} className="project-viewer" data-stage={stage} data-project={project.slug} role="dialog" aria-modal="true" aria-label={`${project.title} · 项目详情`} tabIndex={-1}>
  <div className="project-controls"><button ref={back} className="project-back" onClick={()=>closeAction.current?.()} aria-label="返回作品目录"><BackIcon/><span>Back to Contents</span></button>
  <button className="project-zoom" onClick={()=>setZoom(z=>!z)} aria-pressed={zoom}>{zoom?'适合屏幕':'放大阅读'}</button><div className="project-position" aria-live="polite"><span>{project.title}</span><b>{String(page).padStart(2,'0')} / {String(project.pageCount).padStart(2,'0')}</b></div>
  </div><div ref={scroller} className="project-scroll" data-zoom={zoom?'true':'false'} tabIndex={0} aria-label="项目详情滚动区域"><article className="project-document" aria-label={`${project.title}，共 ${project.pageCount} 页`}>
   {project.pages.map((p,i)=><figure key={p.src} className="project-page" data-page={i+1} data-design-width="1920" style={{aspectRatio:`${p.width} / ${p.height}`}} aria-label={`${project.title} · 第 ${i+1} 页`}>
    <div className="project-page-art" style={i===0?{backgroundImage:`url("${cover}")`}:undefined}>
     <img src={p.src} srcSet={p.src2x?`${p.src} 1920w, ${p.src2x} 3840w`:undefined} sizes="(max-width: 1920px) 100vw, 1920px" width={p.width} height={p.height} alt={`${project.title} · 第 ${i+1} / ${project.pageCount} 页`} loading={i<2?'eager':'lazy'} fetchPriority={i===0?'high':'auto'} decoding="async" onLoad={e=>e.currentTarget.classList.add('is-loaded')}/>
    </div>
   </figure>)}
   <footer className="project-end"><span>{project.title} · END</span><SpecularButton size="md" radius={28} tint="#eadbff" tintOpacity={.8} textColor="#63448a" baseColor="#aa7ed8" autoAnimate speed={.5} onClick={()=>closeAction.current?.()} aria-label="返回作品目录"><BackIcon/><span>Back to Contents</span></SpecularButton></footer>
  </article></div>
 </div>,document.body);
}
