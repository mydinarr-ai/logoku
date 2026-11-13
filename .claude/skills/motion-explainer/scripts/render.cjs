#!/usr/bin/env node
/**
 * render.cjs — storyboard.json -> video MP4 vertikal (gaya explainer motion)
 *
 * Pakai:
 *   node render.cjs <storyboard.json> <output.mp4> [--draft]
 *
 * --draft  = 540x960 @ 15fps (cepat, untuk cek alur). Tanpa flag = 1080x1920 @ 30fps.
 *
 * Cara kerja: tiap frame digambar di Chromium (Playwright) dari HTML animasi,
 * di-screenshot, lalu dikirim ke ffmpeg. Audio (voice over / musik) di-mix oleh ffmpeg.
 * Path gambar/audio di storyboard dihitung relatif terhadap lokasi storyboard.json.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const [, , sbPath, outPath, ...flags] = process.argv;
if (!sbPath || !outPath) {
  console.error('Pakai: node render.cjs <storyboard.json> <output.mp4> [--draft]');
  process.exit(1);
}
const draft = flags.includes('--draft');
const sb = JSON.parse(fs.readFileSync(sbPath, 'utf8'));
const baseDir = path.dirname(path.resolve(sbPath));
const W = draft ? 540 : 1080;
const H = draft ? 960 : 1920;
const FPS = draft ? 15 : (sb.fps || 30);
const S = W / 1080; // faktor skala supaya layout sama di draft & final

const theme = Object.assign(
  {
    headlineFill: '#FFC93C',
    headlineStroke: '#1B1030',
    captionColor: '#FFFFFF',
    captionBg: 'rgba(15,12,40,0.72)',
    accent: '#FFC93C',
    fontHeadline: "'Anton','Bebas Neue','Impact','Liberation Sans','DejaVu Sans',sans-serif",
    fontBody: "'Poppins','Montserrat','Liberation Sans','DejaVu Sans',sans-serif",
  },
  sb.theme || {}
);

const abs = (p) => (p ? (path.isAbsolute(p) ? p : path.join(baseDir, p)) : null);
const toDataUri = (p) => {
  const f = abs(p);
  if (!f || !fs.existsSync(f)) return null;
  const ext = path.extname(f).slice(1).toLowerCase().replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${fs.readFileSync(f).toString('base64')}`;
};

const scenes = (sb.scenes || []).map((s, i) => ({
  headline: '',
  caption: '',
  motion: ['zoom-in', 'pan-left', 'zoom-out', 'pan-right'][i % 4],
  duration: 4,
  ...s,
  imageData: toDataUri(s.image),
}));
if (!scenes.length) { console.error('Storyboard tidak punya scene.'); process.exit(1); }

let acc = 0;
scenes.forEach((s) => { s.start = acc; acc += s.duration; });
const total = acc;
const mascot = toDataUri(sb.mascot);

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#0d0a24}
#stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#0d0a24}
.bg{position:absolute;inset:-12%;background-size:cover;background-position:center;will-change:transform}
.shade{position:absolute;inset:0;background:
  linear-gradient(to bottom,rgba(10,8,30,.55) 0%,rgba(10,8,30,0) 30%,rgba(10,8,30,0) 62%,rgba(10,8,30,.65) 100%)}
.hl{position:absolute;left:${60*S}px;right:${60*S}px;top:${150*S}px;text-align:center;
  font-family:${theme.fontHeadline};font-weight:900;text-transform:uppercase;
  font-size:${112*S}px;line-height:1.02;letter-spacing:${2*S}px;color:${theme.headlineFill};
  -webkit-text-stroke:${10*S}px ${theme.headlineStroke};paint-order:stroke fill;
  text-shadow:0 ${8*S}px ${18*S}px rgba(0,0,0,.45);transform-origin:50% 50%}
.cap{position:absolute;left:${70*S}px;right:${70*S}px;bottom:${300*S}px;text-align:center;
  font-family:${theme.fontBody};font-weight:700;font-size:${50*S}px;line-height:1.3;color:${theme.captionColor}}
.cap span{background:${theme.captionBg};padding:${6*S}px ${22*S}px;border-radius:${18*S}px;
  -webkit-box-decoration-break:clone;box-decoration-break:clone}
.bar{position:absolute;left:0;bottom:0;height:${10*S}px;background:${theme.accent}}
.brand{position:absolute;right:${50*S}px;top:${60*S}px;font-family:${theme.fontBody};font-weight:700;
  font-size:${30*S}px;color:#fff;opacity:.85}
.mascot{position:absolute;right:${30*S}px;bottom:${70*S}px;width:${230*S}px;will-change:transform}
#fade{position:absolute;inset:0;background:#0d0a24;opacity:0;pointer-events:none}
</style></head><body><div id="stage">
<div class="bg" id="bg"></div><div class="shade"></div>
<div class="hl" id="hl"></div>
<div class="cap" id="cap"><span id="capt"></span></div>
<div class="brand" id="brand"></div>
${mascot ? '<img class="mascot" id="mascot" src="' + mascot + '">' : ''}
<div class="bar" id="bar"></div><div id="fade"></div>
</div>
<script>
const scenes=${JSON.stringify(scenes.map(({ imageData, ...r }) => ({ ...r, hasImg: !!imageData })))};
const imgs=${JSON.stringify(scenes.map((s) => s.imageData))};
const TOTAL=${total}, BRAND=${JSON.stringify(sb.brand || '')};
const $=id=>document.getElementById(id);
const ease=t=>1-Math.pow(1-t,3);
const back=t=>{const c=1.70158,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
$('brand').textContent=BRAND;
let cur=-1;
function setT(t){
  let i=scenes.findIndex(s=>t>=s.start&&t<s.start+s.duration); if(i<0)i=scenes.length-1;
  const s=scenes[i], lt=t-s.start, p=Math.min(1,lt/s.duration);
  if(i!==cur){cur=i;
    const bg=$('bg');
    bg.style.backgroundImage=imgs[i]?'url('+imgs[i]+')':'none';
    bg.style.background=imgs[i]?'':(s.bg||'linear-gradient(160deg,#1b1060,#0d0a24 70%)');
    if(imgs[i]){bg.style.backgroundImage='url('+imgs[i]+')';bg.style.backgroundSize='cover';}
    $('hl').textContent=s.headline||''; $('hl').style.display=s.headline?'block':'none';
    $('capt').textContent=s.caption||''; $('cap').style.display=s.caption?'block':'none';
  }
  // gerak kamera (Ken Burns)
  let sc=1,tx=0;
  const m=s.motion;
  if(m==='zoom-in')sc=1+0.10*p; else if(m==='zoom-out')sc=1.10-0.10*p;
  else if(m==='pan-left'){sc=1.06;tx=(0.5-p)*${60*S};} else if(m==='pan-right'){sc=1.06;tx=(p-0.5)*${60*S};}
  else sc=1.02;
  $('bg').style.transform='translateX('+tx+'px) scale('+sc+')';
  // headline: pop in
  const hp=Math.min(1,lt/0.45);
  $('hl').style.transform='scale('+(0.4+0.6*back(hp))+')'; $('hl').style.opacity=Math.min(1,lt/0.18);
  // caption: slide-up
  const cp=Math.min(1,Math.max(0,(lt-0.25)/0.4));
  $('cap').style.opacity=cp; $('cap').style.transform='translateY('+((1-ease(cp))*${40*S})+'px)';
  // maskot: goyang pelan
  const mc=$('mascot'); if(mc)mc.style.transform='translateY('+Math.sin(t*3)*${12*S}+'px) rotate('+Math.sin(t*2)*3+'deg)';
  // transisi: fade cepat antar scene
  const edge=Math.min(lt,s.duration-lt);
  $('fade').style.opacity=(i>0&&lt<0.2)?(1-lt/0.2)*0.9:((i<scenes.length-1&&s.duration-lt<0.12)?(1-(s.duration-lt)/0.12)*0.9:0);
  $('bar').style.width=(t/TOTAL*100)+'%';
}
window.setT=setT;
</script></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  const audio = abs(sb.audio), music = abs(sb.music);
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  let n = 1;
  const hasA = audio && fs.existsSync(audio), hasM = music && fs.existsSync(music);
  if (hasA) { args.push('-i', audio); n++; }
  if (hasM) { args.push('-stream_loop', '-1', '-i', music); }
  if (hasA && hasM) {
    args.push('-filter_complex', `[2:a]volume=0.14[m];[1:a][m]amix=inputs=2:duration=first[a]`, '-map', '0:v', '-map', '[a]');
  } else if (hasA) {
    args.push('-map', '0:v', '-map', '1:a');
  } else if (hasM) {
    args.push('-filter_complex', `[1:a]volume=0.25[a]`, '-map', '0:v', '-map', '[a]');
  }
  args.push('-t', String(total), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', draft ? 'veryfast' : 'medium',
    '-crf', draft ? '28' : '18', '-r', String(FPS));
  if (hasA || hasM) args.push('-c:a', 'aac', '-b:a', '160k');
  args.push('-movflags', '+faststart', path.resolve(outPath));

  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r) => ff.on('close', r));
  const frames = Math.round(total * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.setT(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: draft ? 80 : 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % (FPS * 5) === 0) process.stderr.write(`\r${Math.round((f / frames) * 100)}%`);
  }
  ff.stdin.end();
  await done;
  await browser.close();
  console.error(`\nSelesai: ${outPath} (${total}s, ${W}x${H}@${FPS}fps${hasA ? ', ada VO' : ''})`);
})();
