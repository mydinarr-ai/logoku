// Membuat gambar scene (PNG 1080x1920) + maskot dari SVG. Jalankan: node gen-visual.cjs
const { chromium } = require('playwright');
const W=1080,H=1920;
const svg=(inner,defs='')=>`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${inner}</svg>`;
const F="font-family:'Liberation Sans','DejaVu Sans',sans-serif;font-weight:700";
const cloud=(x,y,s=1,o=1)=>`<g transform="translate(${x},${y}) scale(${s})" opacity="${o}" fill="#fff"><circle cx="0" cy="0" r="60"/><circle cx="70" cy="-25" r="75"/><circle cx="150" cy="5" r="60"/><rect x="-50" y="0" width="250" height="60" rx="30"/></g>`;
const skyGrad=(id,a,b)=>`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const stars=(n,seed=7)=>{let r=seed,o='';for(let i=0;i<n;i++){r=(r*9301+49297)%233280;const x=r/233280*W;r=(r*9301+49297)%233280;const y=r/233280*H;r=(r*9301+49297)%233280;const s=1+r/233280*3;o+=`<circle cx="${x}" cy="${y}" r="${s}" fill="#fff" opacity="${.4+s/6}"/>`}return o};
const hills=`<path d="M0 1500 Q250 1380 520 1470 T1080 1420 V1920 H0Z" fill="#3fae5a"/><path d="M0 1600 Q300 1500 600 1580 T1080 1540 V1920 H0Z" fill="#2e8f49"/><path d="M0 1720 Q350 1650 700 1710 T1080 1690 V1920 H0Z" fill="#23733a"/>`;
const house=`<g transform="translate(120,1240)"><rect x="0" y="40" width="150" height="110" fill="#f4e3c1"/><polygon points="-15,45 75,-30 165,45" fill="#c0563a"/><rect x="55" y="85" width="40" height="65" fill="#8a5a3c"/></g>`;
const sun=(x,y,r,c='#ffd34d')=>`<circle cx="${x}" cy="${y}" r="${r*1.9}" fill="${c}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r*1.4}" fill="${c}" opacity=".3"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;

const scenes={};
// 1 hook
scenes.scene1=svg(`<rect width="${W}" height="${H}" fill="url(#g)"/>${sun(820,720,110)}${cloud(120,820,1.2)}${cloud(620,1010,.9,.9)}${hills}${house}`,skyGrad('g','#1f7ad6','#9bd8ff'));
// 2 prisma
const cols=['#8b00ff','#4b0082','#1e6bff','#1fb85a','#ffe033','#ff9a1f','#ff2b2b'];
const fan=cols.map((c,i)=>`<polygon points="620,900 1080,${690+i*55} 1080,${745+i*55}" fill="${c}" opacity=".95"/>`).join('');
scenes.scene2=svg(`<rect width="${W}" height="${H}" fill="url(#g)"/>${stars(60)}${sun(190,900,95)}<polygon points="290,880 620,890 620,910 290,920" fill="#fff" opacity=".95"/><polygon points="500,1040 600,760 700,1040" fill="#bfe6ff" opacity=".55" stroke="#fff" stroke-width="5"/>${fan}<text x="540" y="1230" text-anchor="middle" font-size="46" fill="#fff" style="${F}">Putih = campuran semua warna</text>`,skyGrad('g','#0e0a2e','#2a1a6b'));
// 3 tabrakan
let dots='',scat='';const pts=[[560,860],[420,1010],[700,1020],[300,760],[780,740],[560,1180],[380,1260],[760,1240]];
pts.forEach(([x,y],i)=>{dots+=`<circle cx="${x}" cy="${y}" r="16" fill="#e8f4ff" opacity=".9"/>`;for(let a=0;a<8;a++){const ang=a*Math.PI/4+i;scat+=`<line x1="${x+Math.cos(ang)*26}" y1="${y+Math.sin(ang)*26}" x2="${x+Math.cos(ang)*(70+(i%3)*15)}" y2="${y+Math.sin(ang)*(70+(i%3)*15)}" stroke="#2f7bff" stroke-width="7" stroke-linecap="round" opacity=".9"/>`}});
scenes.scene3=svg(`<rect width="${W}" height="${H}" fill="url(#g)"/>${sun(170,600,85)}<line x1="240" y1="670" x2="520" y2="840" stroke="#fff" stroke-width="16" stroke-linecap="round"/>${scat}${dots}<text x="540" y="1420" text-anchor="middle" font-size="44" fill="#fff" style="${F}">molekul udara</text>`,skyGrad('g','#0b3f8f','#2f8fe0'));
// 4 gelombang
const wave=(y,amp,len,c,w=9)=>{let d=`M60 ${y}`;for(let x=60;x<=1020;x+=4){d+=` L${x} ${y+Math.sin((x-60)/len*2*Math.PI)*amp}`}return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`};
const bs=[...Array(6)].map((_,i)=>{const x=200+i*140;return `<line x1="${x}" y1="800" x2="${x-25}" y2="725" stroke="#2f7bff" stroke-width="7" stroke-linecap="round"/><line x1="${x}" y1="780" x2="${x+45}" y2="705" stroke="#2f7bff" stroke-width="7" stroke-linecap="round"/><line x1="${x}" y1="840" x2="${x-30}" y2="920" stroke="#2f7bff" stroke-width="7" stroke-linecap="round"/>`}).join('');
scenes.scene4=svg(`<rect width="${W}" height="${H}" fill="url(#g)"/><text x="540" y="650" text-anchor="middle" font-size="50" fill="#5fb0ff" style="${F}">BIRU · gelombang pendek</text>${wave(830,50,70,'#2f7bff')}${bs}<text x="540" y="1090" text-anchor="middle" font-size="50" fill="#ff6b6b" style="${F}">MERAH · gelombang panjang</text>${wave(1200,50,260,'#ff3b3b')}`,skyGrad('g','#0c1a4a','#162f7a'));
// 5 kok bukan ungu
const bars=[['#8b00ff',.38,'Ungu'],['#2f7bff',.8,'Biru'],['#1fb85a',.95,'Hijau'],['#ffe033',1,'Kuning'],['#ff9a1f',.95,'Jingga'],['#ff2b2b',.88,'Merah']];
const bar=bars.map(([c,v,n],i)=>{const h=520*v,x=110+i*150;return `<rect x="${x}" y="${1180-h}" width="110" height="${h}" rx="14" fill="${c}"/><text x="${x+55}" y="1235" text-anchor="middle" font-size="34" fill="#fff" style="${F}">${n}</text>`}).join('');
scenes.scene5=svg(`<rect width="${W}" height="${H}" fill="url(#g)"/><text x="540" y="610" text-anchor="middle" font-size="46" fill="#fff" style="${F}">Cahaya matahari (kurang lebih)</text>${bar}<path d="M110 1180 H1010" stroke="#fff" stroke-width="5"/><text x="540" y="1290" text-anchor="middle" font-size="40" fill="#ffd34d" style="${F}">+ mata kita kurang peka pada ungu</text>`,skyGrad('g','#160c3a','#3a1a7a'));
// 6 senja
scenes.scene6=svg(`<rect width="${W}" height="${H}" fill="url(#g)"/>${sun(540,1160,130,'#fff1a8')}${cloud(100,820,1.1,.7)}${cloud(650,960,.9,.6)}<path d="M0 1260 H1080 V1920 H0Z" fill="#2a1840"/><path d="M0 1260 Q140 1190 260 1260 T540 1250 T820 1265 T1080 1240 V1320 H0Z" fill="#1d1030"/>`,skyGrad('g','#4a2a8a','#ff8a3d'));
// 7 CTA
scenes.scene7=svg(`<rect width="${W}" height="${H}" fill="url(#g)"/>${stars(120,3)}<circle cx="540" cy="900" r="170" fill="#fff6c9"/><circle cx="610" cy="860" r="150" fill="#1a1060"/>`,skyGrad('g','#0d0a24','#1b1060'));
const mascot=svg(`<g transform="translate(150,330)"><g fill="#fff"><circle cx="200" cy="260" r="150"/><circle cx="380" cy="230" r="170"/><circle cx="560" cy="270" r="140"/><rect x="60" y="260" width="640" height="170" rx="85"/></g><ellipse cx="320" cy="320" rx="26" ry="36" fill="#222"/><ellipse cx="450" cy="320" rx="26" ry="36" fill="#222"/><circle cx="312" cy="305" r="9" fill="#fff"/><circle cx="442" cy="305" r="9" fill="#fff"/><ellipse cx="270" cy="375" rx="30" ry="18" fill="#ffb3c1"/><ellipse cx="500" cy="375" rx="30" ry="18" fill="#ffb3c1"/><path d="M345 372 Q385 412 425 372" fill="none" stroke="#222" stroke-width="9" stroke-linecap="round"/></g>`);

(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H}});
  for(const [n,s] of Object.entries(scenes)){await p.setContent(`<body style="margin:0">${s}</body>`);await p.screenshot({path:n+'.png'});}
  await p.setContent(`<body style="margin:0;background:transparent">${mascot}</body>`);
  await p.screenshot({path:'mascot-full.png',omitBackground:true,clip:{x:140,y:320,width:700,height:480}});
  await b.close();console.log('ok');
})();
