/* CINÉMATIQUE 3D « Le collier » — Three.js. Non skippable. Tout est procédural (aucun fichier à charger). */
import * as THREE from 'three';
const $=i=>document.getElementById(i),PI=Math.PI,{clamp}=THREE.MathUtils;
const k=(t,a,b)=>clamp((t-a)/(b-a),0,1),sm=u=>u*u*(3-2*u),L=(a,b,u)=>a+(b-a)*u;
const M=(c,r=.85,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const add=(p,g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o};
const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),CP=(r,l)=>new THREE.CapsuleGeometry(r,l,4,8);
const ctex=(w,h,f,rx=1,ry=1)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=4;return t};

/* ---------- Rendu ---------- */
const R=new THREE.WebGLRenderer({antialias:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=2.2;$('stage').appendChild(R.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x070a14);scene.fog=new THREE.Fog(0x070a14,12,40);
const cam=new THREE.PerspectiveCamera(48,1,.05,80);
const resize=()=>{R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};
addEventListener('resize',resize);resize();

/* ---------- Matériaux procéduraux ---------- */
const stone=ctex(256,256,(g,w,h)=>{g.fillStyle='#4a443c';g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=-1;x<4;x++){g.fillStyle=`hsl(32,9%,${34+Math.random()*16}%)`;g.fillRect(x*64+(y%2)*32+2,y*64+2,60,60)}},4,2);
const wood=ctex(128,128,(g,w,h)=>{g.fillStyle='#7a5230';g.fillRect(0,0,w,h);for(let i=0;i<40;i++){g.strokeStyle=`rgba(40,22,8,${Math.random()*.35})`;g.beginPath();g.moveTo(0,Math.random()*h);g.bezierCurveTo(40,Math.random()*h,90,Math.random()*h,w,Math.random()*h);g.stroke()}});
const mStone=new THREE.MeshStandardMaterial({map:stone,roughness:.95}),mWood=new THREE.MeshStandardMaterial({map:wood,roughness:.8});

/* ---------- Personnage articulé (squelette hiérarchique : hanches, genoux, épaules, coudes, doigts) ---------- */
function person(o){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const skin=M(o.skin||0xe8b894,.6),top=M(o.top,.9),bot=M(o.bot||o.top,.9),sock=M(o.sock||0xeeeeee,.9);
  add(body,CP(.17,.4),top,0,.38,0);
  let dress=null;if(o.dress){dress=add(body,new THREE.ConeGeometry(.6,1,24,1,true),M(o.dress,.95),0,-.05,0);dress.material.side=2}
  const head=new THREE.Group();head.position.y=.74;body.add(head);
  add(head,new THREE.SphereGeometry(.13,20,16),skin,0,.14,0);
  add(head,new THREE.SphereGeometry(.14,16,12),M(o.hair||0x3a2a1a,.9),0,.17,-.03);
  if(o.wig){const wm=M(0xf0eee8,1);add(head,new THREE.SphereGeometry(.17,16,12),wm,0,.23,-.07);[-1,1].forEach(q=>[0,1].forEach(j=>add(head,new THREE.SphereGeometry(.04,10,8),wm,q*.135,.1-j*.05,-.02)))}
  if(o.hat)add(head,new THREE.CylinderGeometry(.2,.24,.05,3),M(0x111111),0,.33,0);
  const eye=M(0x1a1008),wh=M(0xf4f0e8,.4);[-.045,.045].forEach(x=>{add(head,new THREE.SphereGeometry(.02,10,8),wh,x,.17,.115);add(head,new THREE.SphereGeometry(.011,8,8),eye,x,.17,.133)});
  const brows=[-.045,.045].map(x=>add(head,BX(.05,.012,.01),M(0x2a1a0e),x,.205,.125));
  const mouth=add(head,new THREE.TorusGeometry(.035,.007,6,14,PI),M(0x7a2a2a),0,.11,.124);mouth.rotation.z=PI;
  const sh=[],el=[],hands=[],hip=[],kn=[];
  for(const sx of[-1,1]){
    const s=new THREE.Group();s.position.set(sx*.22,.68,0);body.add(s);add(s,CP(.045,.21),top,0,-.15,0);
    const e=new THREE.Group();e.position.y=-.3;s.add(e);add(e,CP(.04,.2),top,0,-.14,0);
    const h=new THREE.Group();h.position.y=-.3;e.add(h);add(h,new THREE.SphereGeometry(.045,10,8),skin);
    const f=[0,1,2].map(i=>{const g=new THREE.Group();g.position.set((i-1)*.026,-.04,0);h.add(g);add(g,CP(.011,.03),skin,0,-.025,0);return g});
    sh.push(s);el.push(e);hands.push({g:h,f});
    const hp=new THREE.Group();hp.position.set(sx*.09,0,0);body.add(hp);add(hp,CP(.065,.3),bot,0,-.21,0);
    const kg=new THREE.Group();kg.position.y=-.42;hp.add(kg);add(kg,CP(.05,.28),sock,0,-.2,0);add(kg,BX(.09,.06,.18),M(0x111111,.5),0,-.42,.04);
    hip.push(hp);kn.push(kg);
  }
  root.scale.setScalar(o.s);
  return{root,body,head,brows,mouth,sh,el,hands,hip,kn,dress};
}
let T=0;const T1=31.6,T2=44.1,T3=58.5,OFF=T3-34.4,LS=44.7; // fins de scènes : cuisine, bijoutier, lettres ; décalage table/tableau
const curl=(p,i,v)=>p.hands[i].f.forEach(f=>f.rotation.x=-v*1.3);
function face(p,e=0,sur=0,talk=0){ // e: 0 sourire → 1 regard dur ; sur: surprise ; talk: bouche qui parle
  p.mouth.scale.y=clamp(L(1,.12,e)+sur+talk*Math.abs(Math.sin(T*13))*.8,.12,1.8);
  p.brows[0].rotation.z=-e*.5;p.brows[1].rotation.z=e*.5;p.brows.forEach(b=>b.position.y=.205-e*.012+sur*.03);
}
function stand(p,w=0,t=T){ // debout / marche
  const a=Math.sin(t*7)*w;p.body.rotation.x=0;p.head.rotation.x=0;
  p.hip[0].rotation.x=a*.5;p.hip[1].rotation.x=-a*.5;p.kn[0].rotation.x=Math.max(0,-a)*.7;p.kn[1].rotation.x=Math.max(0,a)*.7;
  p.sh[0].rotation.set(-a*.4,0,-.08);p.sh[1].rotation.set(a*.4,0,.08);p.el.forEach(e=>e.rotation.x=-.2);
}
function crawl(p,pit,t,w){ // 4 pattes : tronc penché, mains au sol, genoux au sol
  const a=Math.sin(t*5)*w;p.body.rotation.x=pit;p.head.rotation.x=-pit+.55;
  [0,1].forEach(i=>{const d=i?a:-a;p.sh[i].rotation.set(-pit+d*.5,0,i?.05:-.05);p.hip[i].rotation.set(-pit-d*.4,0,0);p.kn[i].rotation.x=PI/2+.1;p.el[i].rotation.x=-.1});
}
function sit(p){p.body.rotation.x=0;p.hip.forEach(h=>h.rotation.x=-PI/2);p.kn.forEach(n=>n.rotation.x=PI/2);p.sh.forEach(s=>s.rotation.x=-.8);p.el.forEach(e=>e.rotation.x=-.6)}

/* ---------- Groupes de scènes ---------- */
const K=new THREE.Group(),TB=new THREE.Group(),BD=new THREE.Group();scene.add(K,TB,BD);TB.visible=BD.visible=false;
const flames=[];
function candle(p,x,y,z,i=6){add(p,new THREE.CylinderGeometry(.025,.03,.18,10),M(0xf2e6c8),x,y+.09,z);
  const f=add(p,new THREE.SphereGeometry(.022,8,8),new THREE.MeshBasicMaterial({color:0xffc060}),x,y+.2,z);f.castShadow=false;
  const l=new THREE.PointLight(0xffa850,i,9,2);l.userData.b=i;l.position.set(x,y+.25,z);p.add(l);flames.push(l)}

/* ===== CUISINE + FENÊTRE + CABINET ===== */
add(K,BX(18,.2,12),mStone,0,-.1,0);add(K,BX(18,4,.3),mStone,0,2,-3.15);add(K,BX(.3,4,6.6),mStone,-4,2,0);
add(K,BX(.3,1,6.6),mStone,3,.5,0);add(K,BX(.3,1.8,6.6),mStone,3,3.1,0);add(K,BX(.3,1.2,2.6),mStone,3,1.6,-2);add(K,BX(.3,1.2,2.6),mStone,3,1.6,2);
add(K,BX(.6,.06,1.4),mWood,3.1,.97,0);
add(K,BX(2.8,.2,3),mWood,6.6,.9,0);add(K,BX(2.8,2.6,.2),mStone,6.6,2.2,-1.5);add(K,BX(.2,2.6,3),mStone,8.1,2.2,0);add(K,BX(.8,1.4,.5),mWood,7.3,1.7,-1.1);
add(K,new THREE.CircleGeometry(.12,16),new THREE.MeshBasicMaterial({color:0}),6.2,1.5,-1.39); // le petit trou
add(K,new THREE.CylinderGeometry(.08,.1,.4,12),M(0x2a2a30,.4,.6),6.4,1.2,0);
add(K,BX(1.8,.08,.9),mWood,-2.5,.75,1.5);[-1.3,-3.7].forEach(x=>[1.1,1.9].forEach(z=>add(K,BX(.08,.75,.08),mWood,x+.3,.37,z)));
candle(K,-2.2,.79,1.5);candle(K,-2.9,.79,1.4,4);
add(K,BX(1.4,1.1,.8),mStone,-3.5,.55,-1);const fire=new THREE.PointLight(0xff7a20,10,12,2);fire.userData.b=10;fire.position.set(-3.1,.7,-1);K.add(fire);flames.push(fire);
add(K,new THREE.SphereGeometry(.3,10,8),new THREE.MeshBasicMaterial({color:0xff7a20}),-3.2,.5,-1).castShadow=false;
const moon=new THREE.DirectionalLight(0x9fb4e8,3.6);moon.position.set(9,7,4);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);
Object.assign(moon.shadow.camera,{left:-9,right:9,top:9,bottom:-9,far:30});moon.shadow.radius=4;K.add(moon);
K.add(new THREE.HemisphereLight(0x7a8ab0,0x302418,2.6),new THREE.AmbientLight(0x909098,1.4));const kl=new THREE.PointLight(0xffe0b0,14,14,2);kl.position.set(-1,2.8,.5);K.add(kl);
const cabL=new THREE.PointLight(0xffb070,6,8,2);cabL.position.set(6.3,2.2,.6);K.add(cabL);
// tablettes en bois + vis (dévissables) + supports muraux
const plank=x=>{const b=new THREE.Group();add(b,BX(2.4,.05,.35),mWood);
  b.screws=[-.5,.5].map(dx=>{const s=new THREE.Group();s.position.set(dx,.03,0);add(s,new THREE.CylinderGeometry(.037,.037,.015,12),M(0x9a9a9a,.3,.9),0,.05,0);add(s,new THREE.CylinderGeometry(.012,.012,.1,8),M(0x777777,.3,.9),0,0,0);b.add(s);return s});
  [-.5,.5].forEach(dx=>add(K,BX(.08,.05,.3),mWood,x+dx,.7,-2.82));K.add(b);return b};
const A=plank(-2.2),B=plank(.5);A.position.set(-2.2,.75,-2.8);B.position.set(.5,.75,-2.8);
// collier : chaîne dorée + perles/diamants
const NK=new THREE.Group();add(NK,new THREE.TorusGeometry(.12,.004,6,40),M(0xd4a83a,.3,1));
for(let i=0;i<26;i++){const a=i/26*2*PI;add(NK,new THREE.IcosahedronGeometry(i%5?.012:.022,1),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.02,metalness:.2,emissive:0x8fc0ff,emissiveIntensity:.6}),Math.cos(a)*.12,Math.sin(a)*.12,0)}
const nkL=new THREE.PointLight(0xaad4ff,.8,2);NK.add(nkL);NK.position.set(6.4,1.5,0);K.add(NK);
const child=person({s:.6,top:0xf0ead8,bot:0x5a4a3a,hair:0x4a3020});child.root.traverse(o=>0);K.add(child.root);
const mother=person({s:.9,top:0x8a6a4a,dress:0x4a5a7a,hair:0x2a1a10});mother.root.position.set(-2.5,0,.7);mother.root.rotation.y=0;K.add(mother.root);

/* ===== TABLE ===== */
add(TB,BX(14,.2,10),mStone,0,-.1,0);add(TB,BX(14,5,.3),mStone,0,2.5,-2.6);add(TB,BX(3,2.4,.05),M(0x6a1620,1),0,2.2,-2.4);
add(TB,BX(2.4,.08,1.1),mWood,0,.78,0);[-1,1].forEach(x=>[-.4,.4].forEach(z=>add(TB,BX(.08,.75,.08),mWood,x,.37,z)));
candle(TB,-.2,.82,0,7);candle(TB,.5,.82,.1,6);add(TB,new THREE.CylinderGeometry(.04,.03,.12,10),M(0xd4a83a,.3,1),.1,.88,-.2);
TB.add(new THREE.HemisphereLight(0x8090b0,0x302418,2.6),new THREE.AmbientLight(0x908898,1.4));const fl=new THREE.PointLight(0xffd8b0,12,10,2);fl.position.set(0,1.7,1.6);TB.add(fl);
const dl=new THREE.SpotLight(0xffd8b0,220,14,.9,.6);dl.position.set(0,3.5,2.5);dl.target.position.set(0,1,-.5);TB.add(dl,dl.target);
const count=person({s:.9,top:0x1b2a5c,wig:1,skin:0xf0cfb4});count.root.position.set(-.55,.5,-.95);
const contessa=person({s:.9,top:0x7a1f3d,dress:0x7a1f3d,wig:1,skin:0xf2d4bc});contessa.root.position.set(.55,.5,-.95);
const chev=person({s:.9,top:0x222222,hair:0x111111,hat:1});chev.root.position.set(.1,.5,.95);chev.root.rotation.y=PI;
[count,contessa,chev].forEach(p=>{sit(p);TB.add(p.root)});
[-.55,.55].forEach(x=>add(TB,BX(.5,.05,.5),mWood,x,.42,-.95));add(TB,BX(.5,.05,.5),mWood,.1,.42,.95);

/* ===== TABLEAU D'ENQUÊTE ===== */
add(BD,BX(26,14,.3),new THREE.MeshStandardMaterial({map:ctex(128,128,(g,w,h)=>{g.fillStyle='#8a6a48';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle=`rgba(${60+Math.random()*60|0},40,20,.25)`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}},4,3),roughness:1}),0,0,-.2);
const bdL=new THREE.SpotLight(0xffe8c0,600,40,.6,.6);bdL.position.set(0,2,10);BD.add(bdL,bdL.target);BD.add(new THREE.AmbientLight(0x998877,2.4));
const reveal=[];
function card(txt,x,y,w,h,rot,col,photo,t0){
  const g=new THREE.Group(),tx=ctex(256,Math.round(256*h/w),(c,W,H)=>{c.fillStyle=col;c.fillRect(0,0,W,H);if(photo){c.fillStyle='#777';c.fillRect(20,16,W-40,H*.62);c.fillStyle='#333';c.beginPath();c.arc(W/2,H*.32,30,0,7);c.fill();c.fillRect(W/2-52,H*.46,104,H*.3)}
    c.fillStyle='#1a1410';c.font=`bold ${W/(txt.length>8?9:6)}px Georgia`;c.textAlign='center';c.fillText(txt,W/2,H-18)});
  add(g,BX(w,h,.02),new THREE.MeshStandardMaterial({map:tx,roughness:.9}));add(g,new THREE.SphereGeometry(.07,10,8),M(0xaa1111,.3),0,h/2-.12,.05);
  g.position.set(x,y,0);g.rotation.z=rot;BD.add(g);reveal.push({o:g,t:t0});return new THREE.Vector3(x,y+h/2-.12,.12)}
const pR=card('RAOUL',0,0,2.4,3,.03,'#e8dfc8',1,53.4),pC=card('COMTESSE BONNE',-5,2.2,2.2,2.6,-.06,'#efe6d0',1,54),pK=card('COMTE',5,2.2,2.2,2.6,.05,'#efe6d0',1,54.4),
  pH=card('HENRIETTE',-4.6,-3.2,2.2,2.6,.07,'#efe6d0',1,54.8),pL=card('COLLIER ?',4.6,-3,2.2,1.6,-.08,'#d9d0b0',0,55.2),pF=card('CABINET',0,4.2,2,1.3,.02,'#d9d0b0',0,55.6);
const Y=new THREE.Vector3(0,1,0);
function wire(a,b,t0){const d=new THREE.Vector3().subVectors(b,a),m=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,d.length(),5),M(0xc01818,.5));m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(Y,d.normalize());m.position.z+=.02;BD.add(m);reveal.push({o:m,t:t0})}
[[pR,pC],[pR,pK],[pR,pH],[pR,pL],[pR,pF],[pC,pK],[pH,pL]].forEach((w,i)=>wire(w[0],w[1],56+i*.25));
const stamp=new THREE.Mesh(new THREE.PlaneGeometry(4,1.3),new THREE.MeshBasicMaterial({transparent:true,map:ctex(512,160,(c,W,H)=>{c.strokeStyle=c.fillStyle='#c0141c';c.lineWidth=10;c.strokeRect(8,8,W-16,H-16);c.font='bold 100px Impact,sans-serif';c.textAlign='center';c.fillText('SUSPECT',W/2,H-38)})}));
stamp.position.set(0,-.4,.2);stamp.rotation.z=-.22;stamp.visible=false;BD.add(stamp);

/* ===== BIJOUTIER : Raoul vend le collier, la mère n'en sait rien ===== */
const JW=new THREE.Group(),LT=new THREE.Group();scene.add(JW,LT);JW.visible=LT.visible=false;
const own=(g,o)=>{if(o.parent!==g)g.add(o)},gold=M(0xe0b030,.25,.9),yrEl=$('year');
add(JW,BX(12,.2,8),mWood,0,-.1,-1);add(JW,BX(12,4,.3),mWood,0,2,-2.6);
for(let i=0;i<3;i++){add(JW,BX(5,.05,.3),mWood,0,1.3+i*.7,-2.4);for(let j=0;j<8;j++)add(JW,BX(.25,.18,.2),M(j%2?0x6a1a1a:0x1a2a5a,.6),-2.1+j*.6,1.42+i*.7,-2.4)}
add(JW,BX(3.2,.75,.8),mWood,0,.375,-.1);add(JW,BX(3.3,.06,.9),M(0x3a2410,.4),0,.75,-.1); // comptoir (dessus à y=.78)
JW.add(new THREE.HemisphereLight(0x9a90a0,0x302418,2.4),new THREE.AmbientLight(0xa09080,1.2));
const jl=new THREE.PointLight(0xffd29a,14,12,2);jl.position.set(0,2.5,.8);JW.add(jl);
const jw=person({s:.9,top:0x3a2a20,hair:0xcccccc,skin:0xe3b48e});jw.root.position.set(0,0,-.7);JW.add(jw.root);
add(jw.head,new THREE.CylinderGeometry(.035,.035,.04,12),M(0x222222,.3,.8),.045,.17,.145).rotation.x=PI/2; // loupe
const coins=[];for(let i=0;i<45;i++){const c=add(JW,new THREE.CylinderGeometry(.04,.04,.008,12),gold,.25+(Math.random()-.5)*.35,.784+Math.floor(i/9)*.01,.05+(Math.random()-.5)*.25);c.visible=false;coins.push(c)}
const notes=[0,1,2,3].map(i=>{const n=add(JW,BX(.2,.005,.1),M(0xd9d0a8,.9),-.35,.783+i*.006,.1);n.rotation.y=(i-1.5)*.15;n.visible=false;return n});
const pouch=add(JW,new THREE.SphereGeometry(.1,12,10),M(0x5a3a1c,.8),0,.86,.15);pouch.scale.y=.8;pouch.visible=false;
function jeweler(t){
  own(JW,child.root);own(JW,NK);const c=child,j=jw,out=sm(k(t,43,44.1));
  c.root.position.set(0,.52,L(.8,3,out));c.root.rotation.y=L(PI,0,sm(k(t,42.8,43.4)));stand(c,out>0?1:0);
  if(out===0){c.sh.forEach(s=>s.rotation.x=-L(1.2,2.6,1-sm(k(t,34.6,35.8))));c.el.forEach(e=>e.rotation.x=-.2)}
  if(t>41.8&&t<43)c.sh.forEach(s=>s.rotation.x=-1.0-Math.sin((t-41.8)*5)*.2); // il ramasse l'argent
  face(c,0);
  const ex=sm(k(t,35.8,36.6)),jb=t>39.2&&t<40.4?Math.sin(PI*k(t,39.2,40.4)):0;
  stand(j,0);j.root.position.y=-.6*jb;j.body.rotation.x=t<39?.18*ex:0;
  j.sh.forEach(s=>s.rotation.x=-ex);j.el.forEach(e=>e.rotation.x=-.9*ex-.2);j.head.rotation.x=.3*ex;if(t>41.4&&t<42.6)j.sh[1].rotation.x=-1.3;
  face(j,0,t>37.2&&t<39?.5:0,(t>37.5&&t<38.5)||(t>40.3&&t<41.5)?1:0);
  NK.visible=t<42.6;
  if(t<35.2){c.root.updateMatrixWorld(true);c.hands[1].g.getWorldPosition(V);NK.position.copy(V);NK.rotation.set(0,t,0)}
  else if(t<41.5){NK.position.set(0,.8,.42);NK.rotation.set(-PI/2,0,t*.3)}
  else{j.root.updateMatrixWorld(true);j.hands[1].g.getWorldPosition(V);NK.position.set(0,.8,.42).lerp(V,sm(k(t,41.5,42.4)));NK.rotation.set(0,0,0)}
  const m=t<41.8?k(t,40.4,41.4):1-k(t,41.8,43); // l'argent apparaît puis Raoul le prend
  coins.forEach((q,i)=>q.visible=i<45*m);notes.forEach((n,i)=>n.visible=m>(i+1)/5);pouch.visible=t>40.3&&t<42.2;
}
const SJ=[[T1,36,[-.9,1.35,2.2],[-.6,1.2,1.7],[0,.85,.5],[0,.85,.4]],[36,39.4,[.9,1.2,1.2],[.5,1.1,.9],[0,.9,-.2],[0,.85,.3]],[39.4,T2+.2,[0,1.1,2.3],[0,1,1.7],[0,.85,.4],[0,.85,.4]]];
/* ===== LETTRES : 1885 → 1892, Raoul glisse l'argent dans des lettres pour sa mère ===== */
add(LT,BX(10,.2,8),mWood,0,-.1,-1);add(LT,BX(10,4,.3),mWood,0,2,-2.6);add(LT,BX(1.2,1.4,.05),new THREE.MeshBasicMaterial({color:0x8fa8d8}),-2.2,2,-2.42);
add(LT,BX(2,.06,.9),mWood,0,.78,-.2);[-.9,.9].forEach(x=>[-.55,.15].forEach(z=>add(LT,BX(.07,.78,.07),mWood,x,.39,z)));
add(LT,BX(.5,.05,.5),mWood,0,.45,-.95);add(LT,BX(.5,.6,.05),mWood,0,.8,-1.2);
add(LT,BX(.5,.3,.35),M(0x4a2c14,.7),-.75,.96,-.2);const mound=add(LT,new THREE.SphereGeometry(.2,12,8),gold,-.75,1.1,-.2);mound.scale.y=.4;
candle(LT,.8,.81,-.5,6);LT.add(new THREE.HemisphereLight(0x8a90b0,0x302418,2.2),new THREE.AmbientLight(0x908090,1.2));
const ll=new THREE.PointLight(0x7a98e0,8,9,2);ll.position.set(-2.2,2,-1.5);const gl=new THREE.PointLight(0xffd060,3,3,2);gl.position.set(-.75,1.3,-.1);LT.add(ll,gl);
const envM=new THREE.MeshStandardMaterial({map:ctex(128,86,(c,W,H)=>{c.fillStyle='#efe4c8';c.fillRect(0,0,W,H);c.fillStyle='#3a2a1a';c.font='italic 22px Georgia';c.textAlign='center';c.fillText('À Maman',W/2,H/2+8)}),roughness:.9});
const envs=[];for(let i=0;i<17;i++){const e=add(LT,BX(.3,.012,.2),envM,.75,.81+i*.013,-.2);e.rotation.y=(Math.random()-.5)*.3;e.visible=false;envs.push(e)}
const cur=envs[16],bill=add(LT,BX(.12,.004,.06),M(0xd9d0a8,.9),0,0,0);bill.visible=false;
function letters(t){
  own(LT,child.root);const c=child,kk=Math.max(0,t-LS),idx=Math.min(15,Math.floor(kk/.85)),u=kk/.85-Math.floor(kk/.85);
  c.root.scale.setScalar(L(.62,.92,Math.min(kk/13.6,1))); // Raoul grandit au fil des années
  c.root.position.set(0,.5,-.95);c.root.rotation.y=0;sit(c);
  c.sh[0].rotation.set(-.9,0,-.6*Math.sin(PI*k(u,0,.35)));c.sh[1].rotation.set(-.9,0,.3*Math.sin(PI*k(u,.55,.85)));c.head.rotation.x=.4;face(c,0);
  envs.forEach((e,i)=>e.visible=i<16&&i<idx+(u>.9?1:0));
  cur.visible=u<.9;cur.position.set(L(0,.75,sm(k(u,.8,.9))),.81,-.2);cur.scale.y=1+k(u,.3,.5);
  const b=sm(k(u,.1,.45));bill.visible=u>.1&&u<.45;bill.position.set(L(-.75,0,b),L(.99,.83,b)+Math.sin(PI*b)*.1,-.2);
  yrEl.textContent=1885+Math.min(7,Math.floor(kk/1.7));yrEl.style.opacity=k(t,LS-.5,LS)*(1-k(t,T3-1.3,T3-.2));
  camAt(t,SL);
}
const SL=[[T2,LS+7,[.9,1.5,2.7],[.4,1.4,2.2],[0,.95,-.4],[0,.95,-.4]],[LS+7,T3+1,[-.4,1.3,1.8],[0,1.2,1.5],[0,.9,-.4],[.2,.88,-.3]]];

/* ---------- Audio (Web Audio API, tout est synthétisé) ---------- */
let AC,lp,out,NB,mg;
function aInit(){AC=new(window.AudioContext||window.webkitAudioContext)();lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=20000;out=AC.createGain();out.connect(lp);lp.connect(AC.destination);
  NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const w=AC.createBufferSource(),wf=AC.createBiquadFilter(),wg=AC.createGain(),lfo=AC.createOscillator(),lg=AC.createGain();w.buffer=NB;w.loop=true;wf.type='lowpass';wf.frequency.value=380;wg.gain.value=.07;
  w.connect(wf);wf.connect(wg);wg.connect(out);w.start();lfo.frequency.value=.15;lg.gain.value=.04;lfo.connect(lg);lg.connect(wg.gain);lfo.start(); // vent
  mg=AC.createGain();mg.gain.value=0;const mf=AC.createBiquadFilter();mf.type='lowpass';mf.frequency.value=900;mg.connect(mf);mf.connect(out); // musique
  [110,164.8,220,261.6,329.6].forEach((f,i)=>{const o=AC.createOscillator();o.type=i<2?'sawtooth':'triangle';o.frequency.value=f*(1+(i%2?.003:-.003));o.connect(mg);o.start()})}
function nz(dur,f0,f1,v,type='bandpass',q=2){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),n=AC.currentTime;s.buffer=NB;s.loop=true;f.type=type;f.Q.value=q;
  f.frequency.setValueAtTime(f0,n);f.frequency.exponentialRampToValueAtTime(f1,n+dur);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+dur);s.connect(f);f.connect(g);g.connect(out);s.start(n);s.stop(n+dur)}
function tn(fr,dur,v,type='sine',f2=fr,dl=0){const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+dl;o.type=type;o.frequency.setValueAtTime(fr,n);o.frequency.exponentialRampToValueAtTime(f2,n+dur);
  g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+dur);o.connect(g);g.connect(out);o.start(n);o.stop(n+dur)}
const SFX={
  screw:()=>{nz(1.2,900,2400,.25,'bandpass',8);tn(180,1.2,.05,'sawtooth',320)},
  wood:(v=1)=>{nz(.12,500,150,.5*v,'lowpass',1);tn(140,.1,.25*v,'triangle',70)},
  creak:()=>{tn(90+Math.random()*40,.5,.06,'sawtooth',60+Math.random()*30);nz(.5,300,500,.06,'bandpass',12)},
  step:()=>nz(.08,300,120,.35,'lowpass',1),
  hand:()=>{nz(.07,400,150,.2,'lowpass',1)},
  cloth:()=>nz(.5,1500,4000,.18,'bandpass',1),
  gems:()=>[0,1,2,3,4,5].forEach(i=>tn(2500+Math.random()*3500,.6,.04,'sine',undefined,i*.07)),
  paper:()=>{nz(.25,2500,5000,.15,'bandpass',.7);tn(2400,.05,.05,'square')},
  thud:()=>{tn(80,.5,.7,'sine',35);nz(.25,400,100,.5,'lowpass',1)},
  laugh:()=>[0,1,2,3,4].forEach(i=>{tn(230,.16,.1,'sawtooth',170,i*.22);tn(460,.16,.04,'square',340,i*.22)}),
  coin:()=>{tn(3200+Math.random()*1500,.25,.08,'sine');tn(5200,.2,.04,'sine')},
  crackle:()=>nz(.03,3000,1500,.08+Math.random()*.08,'bandpass',1)};
const SUB=$('sub');let subT;
function sub(txt,ms){SUB.textContent=txt;SUB.style.opacity=1;clearTimeout(subT);subT=setTimeout(()=>SUB.style.opacity=0,ms)}
function babble(txt,pitch){ // voix de secours synthétisée (voyelles à formants), passe par le filtre « oreilles bouchées »
  const F={a:[800,1200],e:[500,1800],i:[300,2300],o:[500,900],u:[350,700],y:[300,2200]},f0=70+pitch*80;let d=0;
  for(const ch of txt.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()){
    if(F[ch]){const n=AC.currentTime+d,o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f0*(1+.08*Math.sin(d*5)),n);
      g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(.9,n+.02);g.gain.linearRampToValueAtTime(0,n+.12);o.connect(g);
      F[ch].forEach(fr=>{const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=fr;b.Q.value=7;g.connect(b);b.connect(out)});o.start(n);o.stop(n+.13);d+=.11}
    else if(ch===' ')d+=.08;else{setTimeout(()=>nz(.04,2500,1500,.15,'bandpass',1),d*1000);d+=.05}}}
function say(txt,pitch,rate,ms=2500){
  sub(txt,ms);let ok=false;
  try{const ss=window.speechSynthesis;if(ss){const u=new SpeechSynthesisUtterance(txt);u.lang='fr-FR';u.pitch=pitch;u.rate=rate;u.volume=1;
    const v=ss.getVoices().find(v=>v.lang&&v.lang.startsWith('fr'));if(v)u.voice=v;u.onerror=()=>babble(txt,pitch);ss.speak(u);ok=true;
    setTimeout(()=>{if(!ss.speaking)babble(txt,pitch)},500)}}catch(e){}
  if(!ok)babble(txt,pitch)}

/* ---------- Physique simple des objets (gravité + rebond, intégré pas à pas) ---------- */
function toss(tau,p0,v0){let[x,y,z]=p0,vx=v0[0],vy=0,vz=v0[2];for(let i=0;i<tau*120;i++){vy-=9.8/120;x+=vx/120;y+=vy/120;z+=vz/120;if(y<.03){y=.03;vy=-vy*.3;vx*=.6;vz*=.6;if(Math.abs(vy)<.3)vy=0}}return[x,y,z]}

/* ---------- Chorégraphie de l'enfant (état en fonction du temps) ---------- */
function cs(t){ // x,z,y,yaw,pit,w(marche),uw(dévissage)
  let x=-2.2,z=-2.3,y=.52,yaw=PI,pit=0,w=0,uw=0,cr=0;
  if(t>=1&&t<3.6||t>=5.4&&t<8)uw=1;
  if(t>=4.2&&t<5.4){const u=sm(k(t,4.2,5.4));x=L(-2.2,.5,u);yaw=PI-PI/2*Math.sin(PI*u);w=1}
  else if(t>=5.4&&t<9){x=.5}
  else if(t>=9&&t<12){const u=sm(k(t,9,12));x=L(.5,2.4,u);z=L(-2.3,0,u);yaw=L(PI,.69,k(t,9,9.6));w=1}
  else if(t>=12&&t<13.5){x=2.4;z=0;yaw=L(.69,PI/2,sm(k(t,12,12.6)))}
  else if(t>=13.5&&t<14.5){const u=sm(k(t,13.5,14.5));x=L(2.4,3.2,u);z=0;y=L(.52,1.29,u);pit=1.35*u;yaw=PI/2}
  else if(t>=14.5&&t<21){x=L(3.2,5.8,k(t,14.5,21));z=0;y=1.29;pit=1.35;cr=1;yaw=PI/2}
  else if(t>=21&&t<23.5){x=5.8;z=0;y=1.29;pit=L(1.35,.45,sm(k(t,21,22)));yaw=PI/2;cr=-1}
  else if(t>=23.5&&t<24.4){const u=sm(k(t,23.5,24.4));x=5.8;z=0;y=1.29;pit=L(.45,1.35,u);yaw=L(PI/2,-PI/2,u);cr=-1}
  else if(t>=24.4&&t<27.4){x=L(5.8,3.2,k(t,24.4,27.4));z=0;y=1.29;pit=1.35;cr=1;yaw=-PI/2}
  else if(t>=27.4&&t<28.6){const u=sm(k(t,27.4,28.6));x=L(3.2,2.4,u);z=0;y=L(1.29,.52,u);pit=1.35*(1-u);yaw=-PI/2}
  else if(t>=28.6){const u=k(t,28.6,31);x=2.4;z=L(0,3.4,u);yaw=L(-PI/2,0,sm(k(t,28.6,29.3)));w=1} // il repart discrètement
  return{x,z,y,yaw,pit,w,uw,cr}}
const hold=(s,dy=0)=>[s.x+Math.sin(s.yaw)*.3,.5+dy,s.z+Math.cos(s.yaw)*.3];
const V=new THREE.Vector3();
function kitchen(t){
  const s=cs(t),c=child;c.root.position.set(s.x,s.y+Math.abs(Math.sin(t*7))*.01*s.w,s.z);c.root.rotation.y=s.yaw;
  if(s.cr)crawl(c,s.pit,t,s.cr>0?1:0);else if(s.pit>.2)crawl(c,s.pit,t,0);else stand(c,s.w);
  if(s.uw){c.sh[0].rotation.set(-2.0,0,-.35);c.sh[1].rotation.set(-2.0,0,.35);c.el.forEach(e=>e.rotation.x=-.5);c.head.rotation.x=.5;
    c.hands.forEach((h,i)=>{h.g.rotation.y=Math.sin(t*9+i*3)*.8});curl(c,0,1);curl(c,1,1)}else c.hands.forEach(h=>h.g.rotation.y=0);
  if(t>=8&&t<13.5&&!s.uw){c.sh.forEach(q=>q.rotation.x=-1.1);c.el.forEach(e=>e.rotation.x=-.8)} // porte les tablettes
  if(t>=22&&t<23.3){c.sh[1].rotation.x=-2.1-s.pit;c.el[1].rotation.x=-.3;curl(c,1,1)}
  face(c,0,0,0);
  // tablettes : dévissage (vis qui tournent et sortent), chute avec rebond, transport, pont
  const sc=(P,t0)=>P.screws.forEach((v,i)=>{const p=k(t,t0+i*1.3,t0+i*1.3+1.3);v.rotation.y=p*22;v.position.y=.03+p*.1});
  sc(A,1);sc(B,5.4);
  const h=hold(s),hs=cs(4.6),h46=hold(hs);
  if(t<3.6)A.position.set(-2.2,.75,-2.8);
  else if(t<4.3){const u=sm(k(t,3.6,4.3));A.position.set(L(-2.2,h[0],u),L(.75,.5,u),L(-2.8,h[2],u))}
  else if(t<4.6)A.position.set(...hold(s));
  else if(t<8.6)A.position.set(...toss(Math.min(t-4.6,4),h46,[2,0,-.6]));
  else if(t<9.3){const f=toss(4,h46,[2,0,-.6]),u=sm(k(t,8.6,9.3)),q=hold(s,.06);A.position.set(L(f[0],q[0],u),L(f[1],q[1],u),L(f[2],q[2],u))}
  else if(t<12)A.position.set(...hold(s,.06));
  else{const u=sm(k(t,12,13.2)),q=hold(cs(12),.06);A.position.set(L(q[0],4.2,u),L(q[1],.975,u)+Math.sin(PI*u)*.2,L(q[2],-.2,u))}
  if(t<7.6)B.position.set(.5,.75,-2.8);
  else if(t<8.4){const u=sm(k(t,7.6,8.4));B.position.set(L(.5,h[0],u),L(.75,.5,u),L(-2.8,h[2],u))}
  else if(t<12)B.position.set(...hold(s));
  else{const u=sm(k(t,12.2,13.5)),q=hold(cs(12));B.position.set(L(q[0],4.2,u),L(q[1],.975,u)+Math.sin(PI*u)*.2,L(q[2],.2,u))}
  const hr=t>=4&&t<12;A.rotation.y=B.rotation.y=hr?(s.yaw-PI/2)*(t<4.6?sm(k(t,3.6,4.3)):1):0;if(t>=12){const u=sm(k(t,12,13.5));A.rotation.y=B.rotation.y=L(cs(12).yaw-PI/2,0,u)}
  if(t>=4.6&&t<8.6)A.rotation.y=0.3;if(t>=12.5)A.rotation.y=B.rotation.y=0;
  // balancement du pont quand l'enfant avance dessus
  const onB=t>=14.5&&t<27.4?Math.sin(t*3)*.004:0;if(t>=13.5)[A,B].forEach(b=>b.rotation.z=onB);
  // collier
  NK.rotation.y=t*.8;NK.visible=t<23.3;
  if(t>=22&&t<23.3){c.root.updateMatrixWorld(true);c.hands[1].g.getWorldPosition(V);NK.position.copy(V)}
  else NK.position.set(6.4,1.5,0);
  // mère
  stand(mother,0);mother.sh.forEach((q,i)=>q.rotation.x=-1.0+Math.sin(t*3+i)*.15);mother.el.forEach(e=>e.rotation.x=-1.0);face(mother,0); // elle pétrit, sans rien voir
}
function tableScene(t){
  stand(mother,0);
  const e=sm(k(t,46,48));face(count,e,0,(t>36.9&&t<38.6)||(t>40.4&&t<42.6)?1:0);face(contessa,0);face(chev,0,0,t>44&&t<44.9?1:0);
  chev.body.rotation.x=t>45&&t<47?Math.sin(t*22)*.05:0;count.head.rotation.x=e*.1;
}
function boardScene(t){
  reveal.forEach(r=>{const u=sm(k(t,r.t,r.t+.4));r.o.visible=u>0;r.o.scale.setScalar(.4+.6*u)});
  const u=k(t,57,57.25);stamp.visible=u>0;stamp.scale.setScalar(L(3,1,u)*(t>57.25&&t<57.6?1+Math.sin((t-57.25)*60)*.02:1));
  bdL.position.x=Math.sin(t*.7)*.5;
}

/* ---------- Caméra de cinéma (plans : [début, fin, pos A, pos B, cible A, cible B]) ---------- */
const S=[
 [0,1,[-1,1.8,2.6],[-1.2,1.6,1.8],[-1.8,.9,-2.5],[-1.8,.9,-2.5]],
 [1,4.2,[-1.3,1.15,-1.1],[-1.6,1.1,-1.5],[-2.2,.85,-2.6],[-2.2,.8,-2.6]],
 [4.2,8.2,[-.3,1.2,-1.0],[-.4,1.1,-1.4],[.4,.85,-2.6],[.5,.8,-2.6]],
 [8.2,13.5,[-.5,1.7,1.8],[2,1.5,2.8],[.5,.6,-1],[2.8,.8,0]],
 [13.5,14.5,[2.2,1.5,2.5],[3.4,1.8,3],[2.8,.7,0],[3.4,1.1,0]],
 [14.5,21,[3.6,1.9,3.2],[6,1.7,3],[3.5,1.1,0],[6,1.1,0]],
 [21,24,[6.3,1.5,1.5],[6.2,1.45,1.2],[6.3,1.3,0],[6.3,1.3,0]],
 [24,28,[5.5,2.2,3.5],[3.5,1.7,3.3],[4.5,1.1,0],[3.2,1,0]],
 [28,34.4,[.3,1.5,3.8],[.9,1.4,3.9],[2.0,.5,.8],[2.3,.5,2.4]],
 [34.4,45,[0,1.45,3.2],[-.2,1.3,2.3],[0,1,-.8],[-.2,1.1,-.8]],
 [45,51.6,[-.55,1.35,.6],[-.55,1.32,.1],[-.55,1.3,-.95],[-.55,1.28,-.95]],
 [51.6,70,[0,0,12],[0,0,4.2],[0,0,0],[0,0,0]]];
function camAt(t,A=S){const s=A.find(a=>t>=a[0]&&t<a[1])||A[A.length-1],u=sm(k(t,s[0],s[1]));
  cam.position.set(...s[2].map((v,i)=>L(v,s[3][i],u)));cam.position.y+=Math.sin(t*1.3)*.008;cam.lookAt(...s[4].map((v,i)=>L(v,s[5][i],u)))}

/* ---------- Événements sonores / voix (temps en secondes) ---------- */
const E=[];const ev=(t,f)=>E.push([t,f]);
ev(.5,()=>mg.gain.value=.05);
[1,2.3,5.4,6.7].forEach(t=>ev(t,SFX.screw));ev(3.6,()=>SFX.wood());ev(7.6,()=>SFX.wood());ev(4.5,()=>SFX.wood(.7));
[4.95,5.2,5.4].forEach((t,i)=>ev(t,()=>SFX.wood(.5/(i+1))));ev(8.6,()=>SFX.wood(.5));ev(9,()=>SFX.wood(.4));
for(let t=9.2;t<12;t+=.38)ev(t,SFX.step);for(let t=28.7;t<31;t+=.38)ev(t,SFX.step);
ev(12.9,()=>SFX.wood());ev(13.3,()=>SFX.wood(.8));ev(14,SFX.creak);
for(let t=14.6;t<21;t+=.62){ev(t,SFX.hand);ev(t+.3,SFX.hand)}for(let t=15;t<21;t+=1.4)ev(t,SFX.creak);
for(let t=24.5;t<27.4;t+=.45){ev(t,SFX.hand);ev(t+.22,SFX.hand)}ev(25,SFX.creak);ev(26.3,SFX.creak);
ev(22.6,SFX.gems);ev(23.1,SFX.cloth);ev(23.4,SFX.cloth);
ev(37.4,()=>say('Mon Dieu…',.7,.85,1800));ev(40.2,()=>say('Tiens, mon petit.',.7,.9,2000));ev(35.2,()=>SFX.wood(.3));
for(let i=0;i<20;i++)ev(40.4+i*.05,SFX.coin);for(let i=0;i<8;i++)ev(41.9+i*.1,SFX.coin);ev(42,SFX.cloth);
for(let i=0;i<16;i++){ev(LS+i*.85+.15,SFX.coin);ev(LS+i*.85+.45,SFX.paper);ev(LS+i*.85+.75,SFX.hand)}
ev(OFF+36.9,()=>say('Le chevalier Floriani…',.55,.8));ev(OFF+40.4,()=>say('Ce petit avait tendu une main',.55,.9));
ev(OFF+44,()=>say('Deux mains !',.8,1.1));ev(OFF+44.9,SFX.laugh);
for(let t=OFF+53.4;t<OFF+56;t+=.4)ev(t,SFX.paper);for(let t=OFF+56;t<OFF+58;t+=.25)ev(t,()=>tn(500,.15,.05,'triangle',300));ev(OFF+57,SFX.thud);
E.sort((a,b)=>a[0]-b[0]);

/* ---------- Boucle principale ---------- */
const END=66+OFF,fade=$('fade');let clock=0,last=0,running=false,over=false;
function frame(t,dt){
  let f=0;const q=t-OFF;T=t;
  K.visible=t<T1;JW.visible=t>=T1&&t<T2;LT.visible=t>=T2&&t<T3;TB.visible=t>=T3&&q<51.6;BD.visible=q>=51.6;
  if(t<T1){kitchen(t);camAt(t);f=Math.max(1-k(t,.2,1.8),k(t,30,31.4))}
  else if(t<T2){jeweler(t);camAt(t,SJ);f=Math.max(1-k(t,T1+.2,T1+1.7),k(t,T2-1.5,T2-.1))}
  else if(t<T3){letters(t);f=Math.max(1-k(t,T2+.2,T2+1.6),k(t,T3-1.5,T3-.1))}
  else if(q<51.6){T=q;tableScene(q);camAt(q);f=Math.max(1-k(q,34.5,37),k(q,49.5,51.2))}
  else{T=q;boardScene(q);camAt(q);f=Math.max(1-k(q,52,54),k(q,63.5,65.5))}
  if(t<T2)yrEl.style.opacity=0;
  fade.style.opacity=f;
  flames.forEach((l,i)=>l.intensity=l.userData.b*(.85+Math.sin(t*13+i*2)*.08+Math.random()*.08));
  if(q<51&&Math.random()<dt*6)SFX.crackle();
  lp.frequency.value=t>=T3&&q<44?250*Math.pow(80,k(q,34.5,44)):20000; // oreilles bouchées → net (volume constant)
  const qq=Math.max(q,0);mg.gain.value=t<.5?0:.05+.13*k(qq,50,60)*(qq<64?1:1-k(qq,64,66));
}
function loop(now){if(!running)return;requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.1);last=now;clock+=dt;
  while(E.length&&E[0][0]<=clock)E.shift()[1]();frame(Math.min(clock,END),dt);R.render(scene,cam);if(clock>=END)finish()}
function finish(){running=false;over=true;speechSynthesis.cancel();setTimeout(()=>AC.close(),500);$('stage').remove();SUB.remove();yrEl.remove();fade.remove();document.body.style.overflow='auto';$('site').style.display='flex'}

/* ---------- Démarrage : chargement → « Mettez du son » → cinématique (non skippable) ---------- */
['keydown','keyup','contextmenu','wheel','touchmove','dragstart'].forEach(e=>addEventListener(e,ev=>{if(running)ev.preventDefault()},{passive:false}));
setTimeout(()=>{R.compile(scene,cam);$('load').style.display='none';$('start').style.display='flex'},50);
$('go').onclick=()=>{aInit();try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.getVoices();speechSynthesis.speak(u)}catch(e){}$('start').remove();running=true;last=performance.now();requestAnimationFrame(loop)};
