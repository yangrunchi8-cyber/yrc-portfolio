import {useEffect} from 'react';
// Opt-in local diagnostics; no work is scheduled for ordinary visitors.
export function useTransitionDiagnostics(viewer,photo,origin){useEffect(()=>{
 if(!new URLSearchParams(location.search).has('transitionPerf'))return;
 let raf=0,last=0,first=null;const gaps=[];let longTasks=0;const start=origin.clickedAt??performance.now();
 let observer;try{observer=new PerformanceObserver(list=>{longTasks+=list.getEntries().length});observer.observe({type:'longtask'})}catch{}
 function frame(now){if(last)gaps.push(now-last);last=now;if(first===null&&photo.current?.getAnimations().some(a=>a.playState==='running'))first=now;const sorted=[...gaps].sort((a,b)=>a-b);if(viewer.current)viewer.current.dataset.performance=JSON.stringify({clickToAnimationMs:first===null?null:Math.round(first-start),frames:gaps.length,p95FrameMs:Math.round((sorted[Math.floor(sorted.length*.95)]??0)*10)/10,maxFrameMs:Math.round(Math.max(0,...gaps)*10)/10,framesOver34Ms:gaps.filter(n=>n>34).length,longTasks});if(photo.current)raf=requestAnimationFrame(frame);else observer?.disconnect()}
 raf=requestAnimationFrame(frame);return()=>{cancelAnimationFrame(raf);observer?.disconnect()};
 },[viewer,photo,origin]);}
