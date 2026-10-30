import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist'),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');let path=resolve(root,'.'+decodeURIComponent(url.pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
 if((await stat(path)).isDirectory())path=resolve(path,'index.html');
 const body=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(body);
}catch{res.writeHead(404);res.end('Not found')}}).listen(port,()=>console.log(`Portfolio: http://localhost:${port}`));
