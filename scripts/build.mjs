import {build} from 'esbuild';
await build({entryPoints:['src/main.jsx'],bundle:true,minify:true,outfile:'dist/app.js',jsx:'automatic',external:['/assets/*'],logLevel:'info'});
