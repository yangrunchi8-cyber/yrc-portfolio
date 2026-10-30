let assets=null,pending=null;
export function prepareResumeAssets(){
 if(assets)return Promise.resolve(assets);
 if(pending)return pending;
 const load=async(src,alt)=>{const image=new Image();image.decoding='async';image.alt=alt;image.src=src;await image.decode();return image};
 pending=Promise.all([
  load('/assets/resume-hd.jpg','阳润驰个人简历：项目经历、荣誉奖项、教育经历与实习经历'),
  load('/assets/profile-portrait.png','')
 ]).then(([resume,portrait])=>{resume.draggable=false;resume.width=1920;resume.height=2717;assets={resume,portrait};return assets}).catch(error=>{pending=null;throw error});
 return pending;
}
export function getResumeAssets(){return assets}
