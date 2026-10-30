import {useCallback,useEffect,useRef,useState} from 'react';
import RefineFrame from './RefineFrame';
import RotatingFlower from './RotatingFlower';
import ResumeViewer from './ResumeViewer';
import {prepareResumeAssets} from './resumeAssets';
import './ProfilePage.css';
const BIO='ISTJ的白羊，一个致力于把人生玩成开放世界的RPG“生活家”，同时兼任家中两位猫主子的终身仆人。擅长用J人的思维来做计划，然后点燃热情去执行，主打一个“计划内的冒险”。无论是学习新技能还是团队合作，我都像解锁新地图一样充满干劲。';
export default function ProfilePage({mobile=false}){
 const root=useRef(null),photoButton=useRef(null);
 const [started,start]=useState(false),[status,setStatus]=useState('queued'),[ready,setReady]=useState(false),[origin,setOrigin]=useState(null),[open,setOpen]=useState(false),[assetsReady,setAssetsReady]=useState(false);
 useEffect(()=>{let alive=true;prepareResumeAssets().then(()=>{if(alive)setAssetsReady(true)}).catch(()=>{});return()=>{alive=false}},[]);
 const resolved=useCallback(()=>setReady(true),[]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){start(true);observer.disconnect()}},{threshold:.3});observer.observe(root.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!started)return;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const timers=(reduce?[[0,'complete']]:[[100,'generating'],[1500,'refining'],[2650,'complete']]).map(([ms,s])=>setTimeout(()=>setStatus(s),ms));return()=>timers.forEach(clearTimeout)},[started]);
 const openResume=()=>{const rect=photoButton.current.getBoundingClientRect();setOrigin({clickedAt:performance.now(),left:rect.left,top:rect.top,width:rect.width,height:rect.height,radius:parseFloat(getComputedStyle(photoButton.current).borderRadius)});setOpen(true)};
 const closeResume=useCallback(()=>{setOpen(false);requestAnimationFrame(()=>{root.current.scrollIntoView({behavior:'instant',block:'start'});photoButton.current?.focus({preventScroll:true})})},[]);
 return <section id="about" ref={root} className={`profile-page ${started?'profile-entered':''}`} aria-label="第二页：阳润驰自我介绍">
  <div className="profile-art">
   {mobile&&<div className="mobile-profile-heading"><span className="mobile-kicker">PERSONAL PROFILE / 01</span><h2>Hey!</h2></div>}
   <svg className="profile-artwork" viewBox="0 0 3840 2160" role="img" aria-label="阳润驰的个人简介、联系方式及教育经历">
    <defs><mask id="profile-photo-cutout"><rect width="3840" height="2160" fill="white"/><rect x="1392" y="660" width="1208" height="1380" rx="60" fill="black"/></mask></defs>
    <image href="/assets/profile-no-flower.png" width="3840" height="2160" mask="url(#profile-photo-cutout)"/>
   </svg>
   <RotatingFlower className="flower-profile"/>
   <button ref={photoButton} className="profile-photo" disabled={!ready||!assetsReady} onClick={openResume} aria-label="点击照片了解更多的我">
    {started&&<RefineFrame status={status} aspectRatio="1208 / 1380" width={1208} radius={60} background="#6458ce" color="#ffffff" stageDuration={280} sweep showStatus={false} onResolved={resolved}><img src="/assets/profile-portrait.png" alt="阳润驰的童年照片"/></RefineFrame>}
   </button>
   {ready&&assetsReady&&<div className="profile-hint" aria-hidden="true"><span className="profile-hint-circle"/><span>点击照片了解更多的我</span></div>}
   <div className="profile-readable"><h2>阳润驰（Rinch）</h2><p>{BIO}</p><h3>联系方式</h3><p>邮箱 1124618579@qq.com · 手机 18990975961 · 微信 yrc18990975961</p><h3>教育经历</h3><p>西南交通大学（211，双一流），设计（视觉传达方向），27届毕业生。成都师范学院，艺术设计学（数字媒体方向），艺术学士。</p></div>
  </div>
  <a className="profile-next" href="#works">继续探索作品 <span>↓</span></a>
  {open&&origin&&<ResumeViewer origin={origin} onClose={closeResume}/>}
 </section>
}
