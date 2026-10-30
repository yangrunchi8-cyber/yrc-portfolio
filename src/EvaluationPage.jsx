import {useEffect,useRef,useState} from 'react';
import './EvaluationPage.css';
const CX=1383,CY=568,R=369;
const labels=[
 ['用户需求','User Needs Evaluation',1333,149,'start'],
 ['常规用研','General User Research',1548,179,'start'],
 ['用户流程','User Flows',1693,300,'start'],
 ['信息架构','Information Architecture',1765,440,'start'],
 ['原型','Prototyping',1780,605,'start'],
 ['沟通演讲','Communication and Speech',1735,764,'start'],
 ['交互设计','Interaction Design',1610,913,'start'],
 ['可用性评估','Usability Evaluation',1501,992,'middle'],
 ['用户界面设计','Visual Design',1276,992,'middle'],
 ['整合创新','Integrated Innovation',1155,917,'end'],
 ['管理能力','Management',1025,765,'end'],
 ['协作','Collaboration',982,605,'end'],
 ['创造力','Creativity',991,441,'end'],
 ['设计思维','Design Thinking',1066,301,'end'],
 ['敏捷','Agile',1185,180,'start']
];
const axes=Array.from({length:15},(_,i)=>{const angle=(-90+i*24)*Math.PI/180;return [CX+R*Math.cos(angle),CY+R*Math.sin(angle)]});
const light=[[1383,277],[1488,338],[1571,400],[1622,490],[1591,590],[1605,695],[1555,805],[1429,772],[1324,853],[1260,736],[1230,656],[1095,597],[1108,478],[1167,374],[1280,338]];
const dark=[[1383,324],[1456,405],[1519,447],[1582,504],[1531,584],[1511,641],[1508,736],[1415,710],[1340,772],[1282,709],[1283,625],[1116,595],[1157,494],[1180,384],[1304,391]];
function Range({points,color,opacity}){return <><polygon points={points.map(p=>p.join(',')).join(' ')} fill={color} fillOpacity={opacity} stroke={color} strokeWidth="1.4"/>{points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4.2" fill={color}/>)}</>}
export default function EvaluationPage({mobile=false}){
 const root=useRef(null),copy=useRef(null),outer=useRef(null),pale=useRef(null),deep=useRef(null);
 const [start,setStart]=useState(false);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setStart(true);observer.disconnect()}},{threshold:.35});observer.observe(root.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{
  if(!start)return;let alive=true;const animations=[];
  async function play(){
   await Promise.all([...root.current.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));if(!alive)return;
   const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
   async function animate(element,frames,duration){if(!alive)return false;const a=element.animate(frames,{duration:reduce?1:duration,fill:'both'});animations.push(a);try{await a.finished}catch{return false}return alive}
   root.current.dataset.phase='text';
   if(!await animate(copy.current,[{opacity:0,transform:'translate3d(0,42px,0)',easing:'cubic-bezier(.23,1,.32,1)'},{opacity:1,transform:'translate3d(0,0,0)'}],1450))return;
   const frames=[{opacity:0,transform:'perspective(1200px) rotateX(32deg) scale(.08)',offset:0,easing:'cubic-bezier(.16,1,.3,1)'},{opacity:1,transform:'perspective(1200px) rotateX(-2deg) scale(1.035)',offset:.8,easing:'ease-out'},{opacity:1,transform:'perspective(1200px) rotateX(0deg) scale(1)',offset:1}];
   root.current.dataset.phase='outer';if(!await animate(outer.current,frames,900))return;
   root.current.dataset.phase='light';if(!await animate(pale.current,frames,800))return;
   root.current.dataset.phase='dark';if(!await animate(deep.current,frames,800))return;
   root.current.dataset.phase='complete';
  }play();return()=>{alive=false;animations.forEach(a=>a.cancel())};
 },[start]);
 return <section id="evaluation" className="evaluation-page" ref={root} aria-label="自我评价：结语与个人能力雷达图">
  <div className="evaluation-art">
   <img className="evaluation-background" src="/assets/evaluation-background.webp" width="5760" height="3240" alt=""/>
   <div ref={copy} className="evaluation-copy">   <img className="evaluation-copy-image" src="/assets/evaluation-copy.webp" width="1600" height="1780" alt="结语：创意设计一直是我热爱的专业，在美学之外更是通过多样化思维解决问题的过程。我喜欢观察用户行为，在创造的过程中不断表达我的思路和视角。所有的能力都不是一蹴而就的，我也愿意不断地改善自己身上的短板。成为更好的自己。图例：目前能力、提升方向。"/>{mobile&&<div className="mobile-evaluation-text"><span className="mobile-kicker">SELF EVALUATION</span><h2>结语</h2><p>创意设计一直是我热爱的专业，在美学之外更是通过多样化思维解决问题的过程。我喜欢观察用户行为，在创造的过程中不断表达我的思路和视角。所有的能力都不是一蹴而就的，我也愿意不断地改善自己身上的短板。</p><p>“成为更好的自己”</p><div className="mobile-radar-key"><span>目前能力</span><span>提升方向</span></div></div>}</div>
   <svg ref={outer} className="evaluation-radar-layer" viewBox={mobile?'865 95 1120 950':'0 0 2048 1152'} role="img" aria-label="个人能力的十五个维度及雷达图坐标网格">
    <circle cx={CX} cy={CY} r={R} fill="#fff" fillOpacity=".22" stroke="#fff" strokeOpacity=".95" strokeWidth="2.7" strokeDasharray="5 7"/>
    {[291,209,148,88].map(r=><circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#fff" strokeOpacity=".78" strokeWidth="2.5" strokeDasharray="5 7"/>)}
    {axes.map(([x,y],i)=><g key={i}><path d={`M${CX},${CY}L${x},${y}`} stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeDasharray="6 7"/><circle cx={x} cy={y} r="5" fill="#fff"/></g>)}
    {labels.map(([cn,en,x,y,anchor])=><text key={cn} x={x} y={y} textAnchor={anchor} fill="#fff" fontFamily="Arial, PingFang SC, Microsoft YaHei, sans-serif"><tspan x={x} fontSize="20" fontWeight="600">{cn}</tspan><tspan x={x} dy="27" fontSize="17" fontWeight="300" fillOpacity=".85">{en}</tspan></text>)}
    <circle cx={CX} cy={CY} r="12" fill="#d4a5fa" stroke="#b77cea" strokeWidth="2"/>
   </svg>
   <svg ref={pale} className="evaluation-radar-layer" viewBox={mobile?'865 95 1120 950':'0 0 2048 1152'} role="img" aria-label="浅紫范围图：提升方向"><Range points={light} color="#c06aff" opacity=".3"/></svg>
   <svg ref={deep} className="evaluation-radar-layer" viewBox={mobile?'865 95 1120 950':'0 0 2048 1152'} role="img" aria-label="深紫范围图：目前能力"><Range points={dark} color="#a000ff" opacity=".32"/><circle cx={CX} cy={CY} r="12" fill="#dab1fc" stroke="#bd8ae8" strokeWidth="2"/></svg>
  </div>
  {mobile&&<details className="mobile-ability-list"><summary>查看 15 项能力维度</summary><ul>{labels.map(([cn,en])=><li key={cn}><b>{cn}</b><span>{en}</span></li>)}</ul></details>}
 </section>
}
