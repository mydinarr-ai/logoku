# Musik latar orisinal (pad + arpeggio lembut). Jalankan: python3 gen-musik.py -> musik.wav
import numpy as np, wave
SR=44100; DUR=42.0; BPM=84; beat=60/BPM
t=np.arange(int(SR*DUR))/SR
f=lambda m:440*2**((m-69)/12)
chords=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,67]]  # Cmaj7, Am7, Fmaj7, G
out=np.zeros_like(t)
def env_pluck(n,a=0.005,d=0.35):
    x=np.arange(n)/SR; return np.minimum(x/a,1)*np.exp(-x/d)
bar=4*beat
for i in range(int(DUR/bar)+1):
    ch=chords[i%4]; s=int(i*bar*SR); n=int(bar*SR*1.05)
    if s>=len(t): break
    n=min(n,len(t)-s); x=np.arange(n)/SR
    env=np.minimum(x/0.6,1)*np.minimum((bar*1.05-x)/0.5,1).clip(0,1)
    pad=sum(np.sin(2*np.pi*f(m-12)*x)+0.4*np.sin(2*np.pi*f(m-12)*2*x+0.3) for m in ch)/len(ch)
    out[s:s+n]+=0.30*pad*env
    # arpeggio per setengah beat
    seq=[ch[0]+12,ch[1]+12,ch[2]+12,ch[3]+12,ch[2]+12,ch[1]+12,ch[2]+12,ch[1]+12]
    for k,m in enumerate(seq):
        ps=s+int(k*beat/2*SR)
        if ps>=len(t): break
        L=min(int(0.6*SR),len(t)-ps); xx=np.arange(L)/SR
        tone=np.sin(2*np.pi*f(m)*xx)+0.25*np.sin(2*np.pi*f(m)*2*xx)
        out[ps:ps+L]+=0.16*tone*env_pluck(L)
    # bass nada akar di beat 1 dan 3
    for k in (0,2):
        ps=s+int(k*beat*SR); L=min(int(0.9*SR),len(t)-ps)
        if L<=0: break
        xx=np.arange(L)/SR
        out[ps:ps+L]+=0.22*np.sin(2*np.pi*f(ch[0]-24)*xx)*env_pluck(L,0.01,0.6)
# kick sangat lembut + hi-hat tipis agar terasa bergerak
rng=np.random.default_rng(1)
for k in range(int(DUR/beat)):
    ps=int(k*beat*SR)
    if k%4 in (0,2):
        L=int(0.25*SR); xx=np.arange(L)/SR
        out[ps:ps+L]+=0.18*np.sin(2*np.pi*(55+90*np.exp(-xx*25))*xx)*np.exp(-xx*14)
    ps2=int((k+0.5)*beat*SR); L=int(0.05*SR)
    if ps2+L<len(t): out[ps2:ps2+L]+=0.04*rng.standard_normal(L)*np.exp(-np.arange(L)/SR*80)
fade=np.minimum(t/1.5,1)*np.minimum((DUR-t)/2.5,1)
out*=fade; out/=np.abs(out).max()*1.15
st=np.stack([out,np.roll(out,int(0.012*SR))],1)
w=wave.open('musik.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
