import {mkdtempSync,cpSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const staging=mkdtempSync(join(tmpdir(),'throit-build-'));
try {
 for(const item of ['src','public','index.html','package.json','vite.config.ts']) cpSync(join(root,item),join(staging,item),{recursive:true});
 symlinkSync(join(root,'node_modules'),join(staging,'node_modules'),'dir');
 const result=spawnSync(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'build'],{cwd:staging,stdio:'inherit'});
 if(result.status!==0) process.exitCode=result.status||1;
 else cpSync(join(staging,'dist'),join(root,'dist'),{recursive:true});
} finally {rmSync(staging,{recursive:true,force:true});}
