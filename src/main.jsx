import React,{useState,useEffect,useCallback} from 'react';
import{createRoot}from'react-dom/client';
import CircularCarousel from './CircularCarousel';
import CoverIntro from './CoverIntro';
import ProfilePage from './ProfilePage';
import EvaluationPage from './EvaluationPage';
import ClosingPage from './ClosingPage';
import './style.css';
import SlideFrame,{useDeckScale} from './SlideFrame';
import UniversalRipple from './UniversalRipple';
import ProjectViewer,{prepareProject} from './ProjectViewer';
import projectDetails from './projectDetails.json';
import RotatingFlower from './RotatingFlower';
import './UnifiedDeck.css';
const titles=['妙呀 AI 创作平台','抖音 · 聊天互动玩法','SnapGo Camera','豫物新生','傈僳族品牌研究','书籍和插画'];
const subtitles=['C2M EXPERIENCE DESIGN','SOCIAL INTERACTION','APP / UI & UX','CULTURAL IP DESIGN','BRAND & VISUAL IDENTITY','BOOK & ILLUSTRATION'];
const items=titles.map((title,i)=>({src:`/assets/project-${i+1}.jpg`,title,subtitle:subtitles[i],alt:title,project:projectDetails[i]}));
function DesktopApp(){useDeckScale();const[paused,pause]=useState(false),[active,setActive]=useState(0),[large,show]=useState(null);const closeProject=useCallback(()=>show(null),[]);const selectProject=useCallback(index=>{setActive(index);prepareProject(projectDetails[index])},[]);return <><SlideFrame name="home"><section id="home" className="cover-page" aria-label="阳润驰个人作品集封面"><CoverIntro desktopTrailFix/><a className="cover-next" href="#about" aria-label="向下查看自我介绍">认识我 <span>↓</span></a></section></SlideFrame><SlideFrame name="about"><ProfilePage/></SlideFrame><SlideFrame name="works"><div id="works"><div className="directory-heading"><img src="/assets/directory-heading-no-flower.png" width="3840" height="600" alt="CONTENTS — UI DESIGN / IP DESIGN / INTERACTION DESIGN / BRAND DESIGN"/><RotatingFlower className="flower-directory"/><h1 className="directory-heading-readable">CONTENTS</h1></div><main><div className="gallery"><CircularCarousel items={items} preset="cylinder" intro="rise" cardWidth={640} aspectRatio={1920/1080} gap={64} curve={0} tilt={-10} perspective={2800} speed={7} cornerRadius={24} captions fadeColor="#f2f1ed" depthFade={0.25} innerShade={0.86} autoplay={paused||large?'off':'drift'} onChange={selectProject} onItemClick={item=>show(item)} /></div><div className="toolbar"><span>← 拖动探索 →<small>悬停暂停 · 点击作品查看详情</small></span><button onClick={()=>pause(!paused)} aria-label={paused?'继续旋转':'暂停旋转'}>{paused?'▶ 继续旋转':'Ⅱ 暂停旋转'}</button><button className="view" onClick={()=>show(items[active])}>查看当前作品 ↗</button></div></main></div></SlideFrame><SlideFrame name="evaluation"><EvaluationPage/></SlideFrame><SlideFrame name="closing"><ClosingPage/></SlideFrame><UniversalRipple desktopSafe/>{large&&<ProjectViewer project={large.project} cover={large.src} onClosed={closeProject}/>}</>};
// All devices render the same fixed 1920 × 1080 design, scaled by SlideFrame.
function App(){return <DesktopApp/>}
createRoot(document.getElementById('root')).render(<App/>);
