import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
// Opcode table: value = 1 + (immBytes | pops<<3 | pushes<<5); 0 = unknown opcode.
// Built once into a typed array so the hot loop does a plain indexed load.
const E={0:1,1:34,2:37,3:9,4:73,5:81,6:113,7:121,16:49,17:49,18:49,19:49,20:49,21:49,22:49,23:41,24:49,25:49,26:49,27:41,28:49,29:49,30:49,32:49,33:49,34:49,48:3,49:11,50:11,51:3,52:1,64:41,65:17,80:9,81:9,82:33,83:9},T=new Uint8Array(256);
for(const k in E)T[+k]=E[k];
const B=new Uint8Array(65536);
let N=0;
function run(p:Uint8Array,q:Uint8Array):number{
 const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),n=p.length,l=q.length;
 let s=0,c=0,pc=0,t=0,i=0;N=0;
 for(;;){
  if(t===1e6)return 10;
  if(pc<0||pc>=n)return 9;
  const op=p[pc],v=T[op];
  if(!v)return 5;
  const w=v-1,m=w&7,a=(w>>3)&3,u=(w>>5)&3;
  if(pc+m>=n)return 9;
  t++;
  const nx=pc+1+m;
  if(s<a)return 2;
  if(s-a+u>256)return 3;
  pc=nx;
  if(op<8){
   if(op===0)return 0;
   if(op===1)D[s++]=(p[nx-1]<<24)>>24;
   else if(op===2)D[s++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;
   else if(op===3)s--;
   else if(op===4){D[s]=D[s-1];s++;}
   else if(op===5){const z=D[s-1];D[s-1]=D[s-2];D[s-2]=z;}
   else if(op===6){D[s]=D[s-2];s++;}
   else{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;}
  }else if(op===23)D[s-1]=-D[s-1]|0;
  else if(op===27)D[s-1]=~D[s-1];
  else if(op<35){
   const b=D[s-1],a=D[s-2];let r=0;
   if(op===16)r=a+b|0;
   else if(op===17)r=a-b|0;
   else if(op===18)r=Math.imul(a,b);
   else if(op===19){if(!b)return 4;r=a===-2147483648&&b===-1?a:a/b|0;}
   else if(op===20){if(!b)return 4;r=b===-1?0:a%b|0;}
   else if(op===21){if(!b)return 4;r=Math.floor((a>>>0)/(b>>>0))|0;}
   else if(op===22){if(!b)return 4;r=(a>>>0)%(b>>>0)|0;}
   else if(op===24)r=a&b;
   else if(op===25)r=a|b;
   else if(op===26)r=a^b;
   else if(op===28)r=a<<(b&31);
   else if(op===29)r=a>>(b&31);
   else if(op===30)r=a>>>(b&31)|0;
   else if(op===32)r=a===b?1:0;
   else if(op===33)r=a<b?1:0;
   else r=(a>>>0)<(b>>>0)?1:0;
   D[s-2]=r;s--;
  }else if(op<53){
   if(op===52){if(!c)return 8;pc=C[--c];}
   else if(op===51){if(c===64)return 7;C[c++]=nx;pc=p[nx-2]|p[nx-1]<<8;}
   else{
    const r=(p[nx-2]|p[nx-1]<<8)<<16>>16;
    let k=op===48;
    if(op!==48){const z=D[--s];k=op===49?z===0:z!==0;}
    if(k)pc=nx+r;
   }
  }else if(op===64){const a=D[s-1];if(a<0||a>255)return 6;D[s-1]=M[a];}
  else if(op===65){const a=D[s-1],z=D[s-2];if(a<0||a>255)return 6;s-=2;M[a]=z;}
  else if(op===80){const b=Buffer.from(String(D[s-1]));if(N+b.length>65536)return 11;s--;B.set(b,N);N+=b.length;}
  else if(op===81){if(N>=65536)return 11;B[N++]=D[--s]&255;}
  else if(op===82)D[s++]=i<l?q[i++]:-1;
  else return D[--s]&255;
 }
}
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const d of readdirSync(I).sort()){
 const x=run(readFileSync(join(I,d,'program.bin')),readFileSync(join(I,d,'input.bin')));
 mkdirSync(join(O,d),{recursive:true});
 writeFileSync(join(O,d,'stdout.bin'),B.subarray(0,N));
 writeFileSync(join(O,d,'exit.txt'),x+'\n');
}
