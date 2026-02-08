const c=document.getElementById("game");const ctx=c.getContext("2d");
let w=c.width,h=c.height;
let state="menu";
let bird,npc,pipes,score,best,spawnT,lastT,speed,gravity,jump,bgx;
const musicBtn=document.getElementById("music-btn");const music=new Audio("assets/backsound.mp3");music.loop=true;music.volume=.6;let musicStarted=false;let musicMuted=false;function updateMusicBtn(){if(!musicBtn)return;if(musicMuted){musicBtn.textContent="🔇";musicBtn.classList.add("muted")}else{musicBtn.textContent="🎵";musicBtn.classList.remove("muted")}}if(musicBtn){musicBtn.addEventListener("click",()=>{musicMuted=!musicMuted;music.muted=musicMuted;updateMusicBtn();if(!musicStarted){music.play().then(()=>{musicStarted=true}).catch(()=>{})}});updateMusicBtn()}
const overlay=document.getElementById("overlay"),popupText=document.getElementById("popupText"),popupNext=document.getElementById("popupNext");
const messages=["hey there!","are you ok?","just in case no one told you...","i am really proud of you ❤️","you know what?","maybe we won't meet again :(","but it's ok :)","there was a time when the two of us were together...","and i was happy at that time :')","and i just wanna say...","i hope you find good in life...","and life in good :)","see yaa ;)))"];
let popupIndex=0,typingPos=0,typingTimer=null,popupTriggered=false;
const typingSfx=new Audio("assets/typing.mp3");typingSfx.preload="auto";typingSfx.volume=.5;let typeSfxLast=0;
const nextSfx=new Audio("assets/clicknext.wav");nextSfx.preload="auto";nextSfx.volume=.8;
function openPopup(){if(!overlay)return;state="popup";overlay.classList.remove("hidden");popupIndex=0;startTyping(messages[popupIndex])}
function closePopup(){if(!overlay)return;overlay.classList.add("hidden");state="play"}
function startTyping(msg){if(typingTimer)clearInterval(typingTimer);typingPos=0;popupText.textContent="";typingTimer=setInterval(()=>{typingPos++;popupText.textContent=msg.slice(0,typingPos);const ch=msg[typingPos-1];const now=performance.now();if(ch&&ch!==" "&&now-typeSfxLast>40){typeSfxLast=now;try{typingSfx.currentTime=0;typingSfx.play()}catch{}}if(typingPos>=msg.length){clearInterval(typingTimer);typingTimer=null}},32)}
if(popupNext){popupNext.addEventListener("click",()=>{try{nextSfx.currentTime=0;nextSfx.play()}catch{}if(typingTimer){clearInterval(typingTimer);typingTimer=null;popupText.textContent=messages[popupIndex];return}popupIndex++;if(popupIndex<messages.length){startTyping(messages[popupIndex])}else{closePopup()}})}
const npcImg=new Image();let npcReady=false;npcImg.src="assets/npc_girl.png";npcImg.onload=()=>{npcReady=true};
const boyIdle=new Image(),boyFlap=new Image();let boyIdleReady=false,boyFlapReady=false;boyIdle.src="assets/boy_0.png";boyFlap.src="assets/boy_1.png";boyIdle.onload=()=>{boyIdleReady=true};boyFlap.onload=()=>{boyFlapReady=true};
const jumpSfx=new Audio("assets/Jump_SFX.wav");jumpSfx.preload="auto";jumpSfx.volume=.4;
const passSfx=new Audio("assets/PassingObstacle.wav");passSfx.preload="auto";passSfx.volume=.4;
const hitSfx=new Audio("assets/HitWall.wav");hitSfx.preload="auto";hitSfx.volume=1;
function reset(){bird={x:80,y:h/2,w:40,h:28,vy:0};npc={x:140,y:h/2-30,w:36,h:26,vy:0};pipes=[];score=0;spawnT=0;speed=2.4;gravity=0.45;jump=-8.5;bgx=0}
function spawn(){const gapH=160;const topMin=60;const bottomMin=80;const gapY=Math.max(topMin,Math.min(h-bottomMin-gapH,Math.random()*(h-gapH)));pipes.push({x:w+40,w:64,gapY,gapH,scored:false})}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function update(dt){bird.vy+=gravity;bird.y+=bird.vy;bgx+=speed*0.6;const nextPipe=pipes.find(p=>p.x+p.w>npc.x);const ty=nextPipe?nextPipe.gapY+nextPipe.gapH/2:h/2;const ay=(ty-npc.y)*0.06;npc.vy+=ay;npc.vy*=0.94;npc.y+=npc.vy;if(npc.y<0)npc.y=0;if(npc.y+npc.h>h)npc.y=h-npc.h;for(let i=pipes.length-1;i>=0;i--){const p=pipes[i];p.x-=speed;if(p.x+p.w<0)pipes.splice(i,1)}
spawnT+=dt;if(spawnT>1400){spawn();spawnT=0}
 for(const p of pipes){const top={x:p.x,y:0,w:p.w,h:p.gapY};const bot={x:p.x,y:p.gapY+p.gapH,w:p.w,h:h-(p.gapY+p.gapH)};if(collide(bird,top)||collide(bird,bot)||bird.y<0||bird.y+bird.h>h){if(state!=="over"){try{hitSfx.currentTime=0;hitSfx.play()}catch{}}state="over";best=Math.max(best||0,score)}if(!p.scored&&p.x+p.w<bird.x){score++;p.scored=true;try{passSfx.currentTime=0;passSfx.play()}catch{}if(score===3&&!popupTriggered){popupTriggered=true;openPopup()}}}
}
function draw(){ctx.clearRect(0,0,w,h);const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#ff9a3c");sky.addColorStop(0.5,"#f06292");sky.addColorStop(1,"#3b1d5a");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);ctx.fillStyle="rgba(255,209,128,.6)";ctx.beginPath();ctx.arc(w*0.75,h-70,34,0,Math.PI*2);ctx.fill();const m1=((bgx*0.2)%w),m2=((bgx*0.4)%w);ctx.fillStyle="#4a2a6a";ctx.beginPath();ctx.moveTo(-m1,h-110);ctx.lineTo(w*0.10-m1,h-180);ctx.lineTo(w*0.25-m1,h-140);ctx.lineTo(w*0.40-m1,h-190);ctx.lineTo(w*0.55-m1,h-145);ctx.lineTo(w*0.72-m1,h-175);ctx.lineTo(w*0.90-m1,h-130);ctx.lineTo(w+20,h-110);ctx.lineTo(w+20,h);ctx.lineTo(-40,h);ctx.closePath();ctx.fill();ctx.fillStyle="#2f1846";ctx.beginPath();ctx.moveTo(-m2,h-80);ctx.lineTo(w*0.12-m2,h-140);ctx.lineTo(w*0.28-m2,h-100);ctx.lineTo(w*0.45-m2,h-150);ctx.lineTo(w*0.62-m2,h-95);ctx.lineTo(w*0.80-m2,h-130);ctx.lineTo(w+20,h-80);ctx.lineTo(w+20,h);ctx.lineTo(-40,h);ctx.closePath();ctx.fill();ctx.fillStyle="#1a0e2e";for(let i=0;i<12;i++){const x=((i*80)-(bgx%80));const by=h-60;ctx.fillRect(x-2,by-14,4,14);ctx.beginPath();ctx.moveTo(x,by-24);ctx.lineTo(x-10,by-10);ctx.lineTo(x+10,by-10);ctx.closePath();ctx.fill()}ctx.fillStyle="#3a2438";ctx.fillRect(0,h-40,w,40);for(const p of pipes){ctx.fillStyle="#2fb44b";ctx.fillRect(p.x,0,p.w,p.gapY);ctx.fillRect(p.x,p.gapY+p.gapH,p.w,h-(p.gapY+p.gapH));ctx.fillStyle="#238b39";ctx.fillRect(p.x-4,p.gapY-10,p.w+8,10);ctx.fillRect(p.x-4,p.gapY+p.gapH,p.w+8,10)}
ctx.save();ctx.translate(npc.x+npc.w/2,npc.y+npc.h/2);ctx.rotate(Math.max(-0.3,Math.min(0.5,npc.vy*0.03)));ctx.globalAlpha=.9;if(npcReady){const r=1.2;const bw=npc.w*r,bh=npc.h*r;ctx.drawImage(npcImg,-bw/2,-bh/2,bw,bh)}else{ctx.fillStyle="#ff7fb6";ctx.fillRect(-npc.w/2,-npc.h/2,npc.w,npc.h)}ctx.globalAlpha=1;ctx.restore();
ctx.save();ctx.translate(bird.x+bird.w/2,bird.y+bird.h/2);ctx.rotate(Math.max(-0.4,Math.min(0.6,bird.vy*0.03)));ctx.shadowColor="rgba(0,0,0,.35)";ctx.shadowBlur=12;ctx.shadowOffsetY=2;const useFlap=state==="menu"?false:(bird.vy<0);if((useFlap&&boyFlapReady)||(!useFlap&&boyIdleReady)){const r=1.2;const bw=bird.w*r,bh=bird.h*r;ctx.drawImage(useFlap?boyFlap:boyIdle,-bw/2,-bh/2,bw,bh)}else{ctx.fillStyle="#6e8fff";ctx.fillRect(-bird.w/2,-bird.h/2,bird.w,bird.h)}ctx.restore();
ctx.shadowBlur=0;ctx.fillStyle="#004c68";ctx.textAlign="left";ctx.font="700 28px system-ui";ctx.strokeStyle="rgba(255,255,255,.85)";ctx.lineWidth=4;ctx.strokeText(String(score),14,36);ctx.fillText(String(score),14,36);
if(state==="menu"){
  ctx.fillStyle="#004c68";
  ctx.textAlign="center";

  // Judul game
  ctx.font="700 26px system-ui";
  ctx.fillText("FluffyMan", w/2, 220);

  // Created by (baris di bawahnya)
  ctx.font="400 14px system-ui";
  ctx.globalAlpha = 0.75;
  ctx.fillText("a small game by gimb", w/2, 242);
  ctx.globalAlpha = 1;

  // Instruction
  ctx.font="500 18px system-ui";
  ctx.fillText("Press Space or Tap", w/2, 280);
}
if(state==="over"){ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(0,0,w,h);ctx.fillStyle="#ffffff";ctx.textAlign="center";ctx.font="700 26px system-ui";ctx.fillText("Game Over",w/2,240);ctx.font="500 18px system-ui";ctx.fillText("Score "+score+"  Best "+(best||score),w/2,276);ctx.fillText("Press Space or Tap to Restart",w/2,312)}
}
function loop(ts){if(!lastT)lastT=ts;const dt=ts-lastT;lastT=ts;if(state==="play")update(dt);draw();requestAnimationFrame(loop)}
function flap(){try{jumpSfx.currentTime=0;jumpSfx.play()}catch{}if(!musicStarted){music.play().then(()=>{musicStarted=true}).catch(()=>{})}if(state==="menu"){state="play";reset();bird.vy=jump;return}if(state==="play"){bird.vy=jump}else if(state==="over"){state="menu"}}
window.addEventListener("keydown",e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();flap()}});
c.addEventListener("pointerdown",flap);
window.addEventListener("resize",()=>{const r=Math.min(1,Math.min(window.innerWidth/440,window.innerHeight/660));c.style.transform=`scale(${r})`;c.style.transformOrigin="center"});
reset();draw();requestAnimationFrame(loop);
