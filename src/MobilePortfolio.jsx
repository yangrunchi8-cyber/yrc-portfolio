import {Fragment,useEffect,useRef,useState,useCallback} from 'react';
import CoverIntro from './CoverIntro';
import ProfilePage from './ProfilePage';
import EvaluationPage from './EvaluationPage';
import ClosingPage from './ClosingPage';
import RotatingFlower from './RotatingFlower';
import ProjectViewer,{prepareProject} from './ProjectViewer';
import UniversalRipple from './UniversalRipple';
import './MobilePortfolio.css';
function Section({id,children,className=''}){
 const ref=useRef(null),inside=useRef(false);const [visit,setVisit]=useState(0),[entered,setEntered]=useState(false);
 useEffect(()=>{const io=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!inside.current){inside.current=true;setVisit(v=>v+1);setEntered(true)}else if(!e.isIntersecting&&inside.current){inside.current=false;setEntered(false)}},{rootMargin:'-12% 0px -12%',threshold:0});io.observe(ref.current);return()=>io.disconnect()},[]);
 return <section ref={ref} id={id} className={`mobile-section ${className}`} data-entered={entered?'true':'false'} data-visit={visit}><Fragment key={visit}>{children}</Fragment></section>
}
function Projects({items,onOpen}){
 const list=useRef(null);const [active,setActive]=useState(0);
 const change=()=>{const card=list.current.firstElementChild;const i=Math.max(0,Math.min(items.length-1,Math.round(list.current.scrollLeft/(card.offsetWidth+16))));setActive(i);prepareProject(items[i].project)};
 return <><div className="mobile-project-heading mobile-rise"><span className="mobile-kicker">SELECTED WORKS / 06</span><h2>CONTENTS</h2><RotatingFlower className="mobile-directory-flower"/></div>
 <p className="mobile-swipe-hint mobile-rise">左右滑动探索 · 点击项目查看详情</p>
 <div className="mobile-project-list" ref={list} onScroll={change} aria-label="作品目录，左右滑动浏览">
 {items.map((item,i)=><button key={item.project.slug} className="mobile-project-card" onClick={()=>onOpen(item)} onFocus={()=>prepareProject(item.project)} aria-label={`查看${item.title}项目详情`}><img src={item.src} width="1920" height="1080" alt={item.title} loading={i===0?'eager':'lazy'}/><span className="mobile-card-info"><span><b>{item.title}</b><small>{item.subtitle}</small></span><span aria-hidden="true">↗</span></span></button>)}
 </div><div className="mobile-project-pagination"><span>{String(active+1).padStart(2,'0')} / 06</span><div>{items.map((item,i)=><button key={item.project.slug} aria-label={`切换到${item.title}`} aria-current={active===i?'true':undefined} onClick={()=>list.current.children[i].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest',inline:'center'})}><i/></button>)}</div></div>
 <a className="mobile-next mobile-rise" href="#mobile-evaluation">继续浏览个人能力 ↓</a></>
}
export default function MobilePortfolio({items}){
 const [large,setLarge]=useState(null);const close=useCallback(()=>setLarge(null),[]);
 return <div className="mobile-portfolio">
 <Section id="home" className="mobile-home"><nav className="mobile-topbar"><a href="#home">RINCH <span>© 2026</span></a><a href="#works">WORKS ↗</a></nav><div className="mobile-hero mobile-rise"><p className="mobile-kicker">阳润驰 / PERSONAL PORTFOLIO</p><h1>PORTFOLIO</h1><p>UI 设计 · 视觉设计 · 交互设计</p><RotatingFlower className="mobile-hero-flower"/></div><div className="mobile-cover-preview"><CoverIntro/></div><div className="mobile-home-actions mobile-rise"><a href="#about">认识我 ↓</a><a href="#works">浏览作品 ↗</a></div></Section>
 <Section id="mobile-about" className="mobile-about"><ProfilePage mobile/></Section>
 <Section id="works" className="mobile-works"><Projects items={items} onOpen={setLarge}/></Section>
 <Section id="mobile-evaluation" className="mobile-evaluation"><EvaluationPage mobile/></Section>
 <Section id="mobile-closing" className="mobile-closing"><p className="mobile-kicker mobile-rise">UI / VISUAL / INTERACTION DESIGN</p><h2 className="mobile-rise">THANKS</h2><ClosingPage/><a className="mobile-back-top mobile-rise" href="#home">返回首页 ↑</a><p className="mobile-signature">RINCH / 2026</p></Section>
 <UniversalRipple/>{large&&<ProjectViewer project={large.project} cover={large.src} onClosed={close}/>}</div>
}
