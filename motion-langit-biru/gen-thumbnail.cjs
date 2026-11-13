// Thumbnail: 9:16 (Shorts) dan 16:9 (YouTube). Jalankan: node gen-thumbnail.cjs
const { chromium } = require('playwright'); const fs=require('fs');
const b64=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
const mascot=b64('mascot.png'), s1=b64('scene1.png');
const css=(W,H,k)=>`*{margin:0;padding:0;box-sizing:border-box}body{width:${W}px;height:${H}px;overflow:hidden;position:relative;font-family:'Liberation Sans','DejaVu Sans',sans-serif}
.bg{position:absolute;inset:0}
.h{position:absolute;left:0;right:0;text-align:center;font-weight:900;text-transform:uppercase;line-height:1;color:#FFC93C;-webkit-text-stroke:${k*14}px #1B1030;paint-order:stroke fill;text-shadow:0 ${k*10}px ${k*22}px rgba(0,0,0,.45)}
.sub{position:absolute;left:0;right:0;text-align:center;font-weight:700;color:#fff;background:rgba(15,12,40,.75);padding:${k*10}px ${k*30}px;border-radius:${k*24}px;width:max-content;left:50%;transform:translateX(-50%)}
.m{position:absolute}`;
const vert=`<style>${css(1080,1920,1)}
.h{top:200px;font-size:170px}.sub{top:760px;font-size:56px}.m{width:420px;right:60px;bottom:140px;transform:rotate(-6deg)}</style>
<img class="bg" src="${s1}" width="1080" height="1920">
<div class="h">Kenapa<br>langit<br>biru?</div><div class="sub">Padahal udara tidak berwarna 🤔</div><img class="m" src="${mascot}">`;
const land=`<style>${css(1280,720,.8)}
.h{left:60px;right:auto;top:110px;text-align:left;font-size:135px;width:1000px}.sub{top:520px;left:60px;transform:none;font-size:44px}.m{width:380px;right:50px;bottom:60px;transform:rotate(-6deg)}</style>
<svg class="bg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f7ad6"/><stop offset="1" stop-color="#9bd8ff"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/>
<circle cx="1080" cy="170" r="190" fill="#ffd34d" opacity=".18"/><circle cx="1080" cy="170" r="130" fill="#ffd34d" opacity=".3"/><circle cx="1080" cy="170" r="85" fill="#ffd34d"/>
<g fill="#fff" opacity=".9"><circle cx="880" cy="420" r="40"/><circle cx="930" cy="400" r="52"/><circle cx="990" cy="425" r="40"/><rect x="845" y="420" width="190" height="42" rx="21"/></g>
<path d="M0 600 Q300 520 620 590 T1280 560 V720 H0Z" fill="#3fae5a"/><path d="M0 660 Q350 610 700 655 T1280 640 V720 H0Z" fill="#2e8f49"/></svg>
<div class="h">Kenapa langit<br>biru?</div><div class="sub">Padahal udara tidak berwarna 🤔</div><img class="m" src="${mascot}">`;
(async()=>{const br=await chromium.launch();
 for(const [n,w,h,c] of [['thumbnail-shorts-9x16.png',1080,1920,vert],['thumbnail-youtube-16x9.png',1280,720,land]]){
  const p=await br.newPage({viewport:{width:w,height:h}});await p.setContent(`<body>${c}</body>`);await p.screenshot({path:n});}
 await br.close();console.log('ok')})();
