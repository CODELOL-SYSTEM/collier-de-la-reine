/* CINÉMATIQUE 3D « Le collier » — Three.js. Non skippable. Tout est procédural (aucun fichier à charger). */
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const $=i=>document.getElementById(i),PI=Math.PI,{clamp}=THREE.MathUtils;
const k=(t,a,b)=>clamp((t-a)/(b-a),0,1),sm=u=>u*u*(3-2*u),L=(a,b,u)=>a+(b-a)*u;
const M=(c,r=.85,m=0)=>{const o=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});if(m>0){o.envMap=ENV;o.envMapIntensity=.9}return o};
const add=(p,g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o};
const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),CP=(r,l)=>new THREE.CapsuleGeometry(r,l,6,16);
const ctex=(w,h,f,rx=1,ry=1)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=8;return t};

/* ---------- Rendu + post-traitement (bloom, vignette, grain, aberration chromatique) ---------- */
const PR=Math.min(devicePixelRatio,2);
const R=new THREE.WebGLRenderer({antialias:false});
R.setPixelRatio(PR);R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=2.2;$('stage').appendChild(R.domElement);
const ENV=new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(),.04).texture; // reflets pour métaux et pierres précieuses
const scene=new THREE.Scene();scene.background=new THREE.Color(0x070a14);scene.fog=new THREE.Fog(0x070a14,12,40);
const cam=new THREE.PerspectiveCamera(48,1,.05,80);
const composer=new EffectComposer(R,new THREE.WebGLRenderTarget(innerWidth*PR,innerHeight*PR,{type:THREE.HalfFloatType,samples:4}));
composer.addPass(new RenderPass(scene,cam));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.65,.75,1.0);composer.addPass(bloom);
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},time:{value:0}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}
  void main(){vec2 c=vUv-.5;float d=dot(c,c);vec2 o=c*d*.014;
    vec3 col=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);
    col*=1.-smoothstep(.08,.5,d)*.8;
    col+=(h(vUv*vec2(1920.,1080.))-.5)*.03;
    float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.1);col*=vec3(1.05,1.,.93);
    gl_FragColor=vec4(col,1.);}`});
composer.addPass(grade);composer.addPass(new OutputPass());
const resize=()=>{R.setSize(innerWidth,innerHeight);composer.setPixelRatio(PR);composer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};
addEventListener('resize',resize);resize();

/* ---------- Textures procédurales (couleur + relief, tuilées à la bonne échelle) ---------- */
const rng=s=>()=>(s=s*16807%2147483647)/2147483647;
const pair=(w,h,d)=>{const c=ctex(w,h,(g,W,H)=>d(g,W,H,rng(7),0)),b=ctex(w,h,(g,W,H)=>d(g,W,H,rng(7),1));b.colorSpace=THREE.NoColorSpace;return[c,b]};
const[stone,stoneB]=pair(512,512,(g,W,H,r,m)=>{
  g.fillStyle=m?'#101010':'#1e1b18';g.fillRect(0,0,W,H);
  for(let y=0;y<4;y++)for(let x=-1;x<5;x++){const X=x*128+(y%2)*64+4,Y=y*128+4,hu=28+r()*10,sa=6+r()*8,li=32+r()*18,gr=r();
    g.fillStyle=m?`hsl(0,0%,${50+gr*35}%)`:`hsl(${hu},${sa}%,${li}%)`;g.fillRect(X,Y,120,120);
    for(let i=0;i<600;i++){const lt=r()<.5,a=r()*.1,px=X+r()*120,py=Y+r()*120,sz=1+r()*3;g.fillStyle=`rgba(${lt?'255,255,255':'0,0,0'},${m?a*2:a})`;g.fillRect(px,py,sz,sz)}
    const e=g.createLinearGradient(0,Y,0,Y+120);e.addColorStop(0,'rgba(255,255,255,.08)');e.addColorStop(1,'rgba(0,0,0,.3)');g.fillStyle=e;g.fillRect(X,Y,120,120)}
  for(let i=0;i<14;i++){let x=r()*W,y=r()*H;g.strokeStyle=m?'rgba(0,0,0,.7)':'rgba(10,8,6,.6)';g.lineWidth=1;g.beginPath();g.moveTo(x,y);for(let j=0;j<6;j++){x+=(r()-.5)*24;y+=r()*14;g.lineTo(x,y)}g.stroke()}});
const[wood,woodB]=pair(512,256,(g,W,H,r,m)=>{
  for(let b=0;b<4;b++){const hu=24+r()*10,sa=40+r()*18,li=22+r()*16;g.fillStyle=m?'#777':`hsl(${hu},${sa}%,${li}%)`;g.fillRect(0,b*H/4,W,H/4)}
  for(let i=0;i<320;i++){const y0=r()*H,amp=1+r()*3,fr=.01+r()*.02,ph=r()*7,dk=r()<.7,a=.05+r()*.2,lw=.5+r()*1.5;
    g.strokeStyle=m?`rgba(${dk?'0,0,0':'255,255,255'},${a*1.5})`:(dk?`rgba(30,15,5,${a})`:`rgba(190,140,80,${a*.6})`);g.lineWidth=lw;
    g.beginPath();for(let x=0;x<=W;x+=8){const y=y0+Math.sin(x*fr+ph)*amp;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
  for(let n=0;n<3;n++){const x=r()*W,y=r()*H;for(let q=14;q>2;q-=2){g.strokeStyle=m?'rgba(0,0,0,.4)':`rgba(30,14,4,${.35-q*.01})`;g.lineWidth=1.2;g.beginPath();g.ellipse(x,y,q*1.8,q*.7,0,0,7);g.stroke()}
    g.fillStyle=m?'#000':'rgba(25,10,3,.6)';g.beginPath();g.ellipse(x,y,4,2,0,0,7);g.fill()}
  g.fillStyle=m?'#000':'rgba(15,8,3,.7)';for(let b=1;b<4;b++)g.fillRect(0,b*H/4-1,W,2)});
const tl=(t,w,h,s)=>{const c=t.clone();c.needsUpdate=true;c.repeat.set(Math.max(1,w/s),Math.max(1,h/s));return c};
const stoneM=(w,h,s=3)=>new THREE.MeshStandardMaterial({map:tl(stone,w,h,s),bumpMap:tl(stoneB,w,h,s),bumpScale:1.5,roughness:.93});
const woodM=(w,h,s=2.5)=>new THREE.MeshStandardMaterial({map:tl(wood,w,h,s),bumpMap:tl(woodB,w,h,s),bumpScale:1,roughness:.6});
const mStone=stoneM(1,1,1),mWood=woodM(1,1,1);

/* ---------- Lueurs, poussière, flammes ---------- */
const glows=[],dusts=[],fireC=[];
const glowTex=ctex(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h)});
const glow=(p,x,y,z,s,c)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));m.position.set(x,y,z);m.scale.set(s,s,1);m.userData.s=s;p.add(m);glows.push(m);return m};
function dust(p,cx,cy,cz,sx,sy,sz,n=140){const g=new THREE.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=cx+(Math.random()-.5)*sx;a[i*3+1]=cy+Math.random()*sy;a[i*3+2]=cz+(Math.random()-.5)*sz}
  g.setAttribute('position',new THREE.BufferAttribute(a,3));const m=new THREE.Points(g,new THREE.PointsMaterial({map:glowTex,size:.06,color:0xffd9a0,transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));p.add(m);dusts.push(m)}

/* ---------- Personnage articulé (squelette hiérarchique : hanches, genoux, épaules, coudes, doigts) ---------- */
function person(o){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const skin=M(o.skin||0xe8b894,.55),top=M(o.top,.85),bot=M(o.bot||o.top,.85),sock=M(o.sock||0xeeeeee,.9),hairM=M(o.hair||0x3a2a1a,.65),lace=M(0xf4f0e8,.8);
  add(body,CP(.17,.4),top,0,.38,0);
  add(body,new THREE.CylinderGeometry(.172,.172,.05,18),M(0x2a1a0e,.5),0,.2,0); // ceinture
  add(body,new THREE.CylinderGeometry(.045,.052,.1,12),skin,0,.74,0); // cou
  add(body,new THREE.TorusGeometry(.085,.022,8,18),lace,0,.72,0).rotation.x=PI/2; // jabot / collerette
  let dress=null;if(o.dress){dress=add(body,new THREE.ConeGeometry(.6,1,48,1,true),M(o.dress,.95),0,-.05,0);dress.material.side=2;
    add(body,new THREE.TorusGeometry(.6,.018,6,48),lace,0,-.55,0).rotation.x=PI/2}
  const head=new THREE.Group();head.position.y=.74;body.add(head);
  add(head,new THREE.SphereGeometry(.13,24,18),skin,0,.14,0).scale.set(1,1.08,1.02);
  add(head,new THREE.SphereGeometry(.14,18,14),hairM,0,.17,-.03);
  add(head,new THREE.SphereGeometry(.1,12,8),hairM,0,.255,.04).scale.set(1.2,.5,1); // frange
  if(o.long){[-1,1].forEach(q=>add(head,CP(.05,.2),hairM,q*.1,.03,-.05));add(head,CP(.1,.25),hairM,0,.0,-.1)}
  if(o.wig){const wm=M(0xf0eee8,1);add(head,new THREE.SphereGeometry(.17,18,14),wm,0,.23,-.07);[-1,1].forEach(q=>[0,1].forEach(j=>add(head,new THREE.SphereGeometry(.04,10,8),wm,q*.135,.1-j*.05,-.02)))}
  if(o.hat)add(head,new THREE.CylinderGeometry(.2,.24,.05,3),M(0x111111),0,.33,0);
  add(head,new THREE.SphereGeometry(.02,10,8),skin,0,.145,.133).scale.set(.9,1.1,1.4); // nez
  const pink=M(0xe0867a,.7);[-1,1].forEach(q=>{add(head,new THREE.SphereGeometry(.03,10,8),skin,q*.128,.145,-.005).scale.set(.45,1,.8);add(head,new THREE.SphereGeometry(.025,10,8),pink,q*.075,.12,.112).scale.set(1,.7,.3)}); // oreilles, joues
  const iris=M(o.eye||0x3a2410,.3),pup=M(0x050505),wh=M(0xf4f0e8,.4);
  [-.045,.045].forEach(x=>{add(head,new THREE.SphereGeometry(.02,12,10),wh,x,.17,.115);add(head,new THREE.SphereGeometry(.013,10,8),iris,x,.17,.128);add(head,new THREE.SphereGeometry(.007,8,8),pup,x,.17,.137)});
  const brows=[-.045,.045].map(x=>add(head,BX(.05,.012,.01),M(0x2a1a0e),x,.205,.125));
  const mouth=add(head,new THREE.TorusGeometry(.035,.007,6,14,PI),M(0x7a2a2a),0,.11,.124);mouth.rotation.z=PI;
  const sh=[],el=[],hands=[],hip=[],kn=[];
  for(const sx of[-1,1]){
    const s=new THREE.Group();s.position.set(sx*.22,.68,0);body.add(s);add(s,CP(.045,.21),top,0,-.15,0);add(s,new THREE.SphereGeometry(.052,12,10),top);
    const e=new THREE.Group();e.position.y=-.3;s.add(e);add(e,CP(.04,.2),top,0,-.14,0);add(e,new THREE.SphereGeometry(.044,10,8),top);
    const h=new THREE.Group();h.position.y=-.3;e.add(h);add(h,new THREE.SphereGeometry(.045,12,10),skin);
    const f=[0,1,2].map(i=>{const g=new THREE.Group();g.position.set((i-1)*.026,-.04,0);h.add(g);add(g,CP(.011,.03),skin,0,-.025,0);return g});
    sh.push(s);el.push(e);hands.push({g:h,f});
    const hp=new THREE.Group();hp.position.set(sx*.09,0,0);body.add(hp);add(hp,CP(.065,.3),bot,0,-.21,0);add(hp,new THREE.SphereGeometry(.07,12,10),bot);
    const kg=new THREE.Group();kg.position.y=-.42;hp.add(kg);add(kg,CP(.05,.28),sock,0,-.2,0);add(kg,new THREE.SphereGeometry(.055,10,8),bot);
    add(kg,BX(.09,.06,.18),M(0x111111,.4),0,-.42,.04);add(kg,BX(.05,.03,.02),M(0xc8a040,.3,.9),0,-.4,.13); // chaussure + boucle
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
const FL=new THREE.Color(3,1.6,.4),GL=new THREE.Color(2.2,1.1,.35);
function candle(p,x,y,z,i=6){add(p,new THREE.CylinderGeometry(.025,.03,.18,12),M(0xf2e6c8,.7),x,y+.09,z);
  const f=add(p,new THREE.SphereGeometry(.022,10,10),new THREE.MeshBasicMaterial({color:FL}),x,y+.2,z);f.castShadow=false;f.scale.y=1.5;
  glow(p,x,y+.21,z,.5,GL);
  const l=new THREE.PointLight(0xffa850,i,9,2);l.userData.b=i;l.position.set(x,y+.25,z);p.add(l);flames.push(l)}

/* ===== CUISINE + CABINET ===== */
add(K,BX(18,.2,12),stoneM(18,12),0,-.1,0);add(K,BX(18,4,.3),stoneM(18,4),0,2,-3.15);add(K,BX(.3,4,6.6),stoneM(6.6,4),-4,2,0);
add(K,BX(.3,1,6.6),stoneM(6.6,1),3,.5,0);add(K,BX(.3,1.8,6.6),stoneM(6.6,1.8),3,3.1,0);add(K,BX(.3,1.2,2.6),stoneM(2.6,1.2),3,1.6,-2);add(K,BX(.3,1.2,2.6),stoneM(2.6,1.2),3,1.6,2);
add(K,BX(.6,.06,1.4),mWood,3.1,.97,0);
// cadre en bois autour du petit trou + lumière chaude qui y passe
add(K,BX(.4,.1,1.6),mWood,3,2.15,0);[-.7,.7].forEach(z=>add(K,BX(.4,1.2,.1),mWood,3,1.6,z));
const holeL=new THREE.PointLight(0xffc888,4,5,2);holeL.position.set(3.4,1.5,0);K.add(holeL);
add(K,BX(2.8,.2,3),woodM(2.8,3),6.6,.9,0);add(K,BX(2.8,2.6,.2),stoneM(2.8,2.6),6.6,2.2,-1.5);add(K,BX(.2,2.6,3),stoneM(3,2.6),8.1,2.2,0);add(K,BX(.8,1.4,.5),mWood,7.3,1.7,-1.1);
add(K,new THREE.CircleGeometry(.12,16),new THREE.MeshBasicMaterial({color:0}),6.2,1.5,-1.39); // le petit trou
add(K,new THREE.CylinderGeometry(.08,.1,.4,12),M(0x2a2a30,.4,.6),6.4,1.2,0);
add(K,BX(1.8,.08,.9),mWood,-2.5,.75,1.5);[-1.3,-3.7].forEach(x=>[1.1,1.9].forEach(z=>add(K,BX(.08,.75,.08),mWood,x+.3,.37,z)));
candle(K,-2.2,.79,1.5);candle(K,-2.9,.79,1.4,4);
// vaisselle sur la table
add(K,new THREE.SphereGeometry(.09,16,8,0,PI*2,PI/2,PI/2),M(0x8a5a3a,.6),-2.0,.88,1.65).material.side=2;
add(K,new THREE.SphereGeometry(.09,14,10),M(0xb8844a,.9),-2.5,.82,1.7).scale.set(1.4,.7,.9);
// poutres, étagère et bocaux, barrique, sac
[-3.5,-1,1.5].forEach(x=>add(K,BX(.3,.3,12),mWood,x,3.85,0));
add(K,BX(2,.06,.3),mWood,-1,1.9,-2.95);
[[-1.6,0x7a3a1a],[-1.25,0x3a5a3a],[-.9,0x6a5a2a],[-.55,0x5a2a2a]].forEach(([x,c])=>add(K,new THREE.CylinderGeometry(.09,.09,.22,16),M(c,.35),x,2.04,-2.95));
add(K,new THREE.CylinderGeometry(.3,.3,.8,22),mWood,-3.6,.4,.3);[.15,.65].forEach(y=>add(K,new THREE.TorusGeometry(.305,.015,6,24),M(0x2a2a2a,.4,.7),-3.6,y,.3).rotation.x=PI/2);
add(K,new THREE.SphereGeometry(.25,14,10),M(0xb8a070,1),-3.5,.28,-.4).scale.y=1.2;
// cheminée ouverte : âtre, braises, bûches, flammes
add(K,BX(1.4,.15,.9),mStone,-3.5,.075,-1);add(K,BX(.2,1.7,.9),mStone,-3.9,.85,-1);
[-1.45,-.55].forEach(z=>add(K,BX(1.4,1.7,.15),mStone,-3.5,.85,z));add(K,BX(1.4,.2,.9),mStone,-3.5,1.8,-1);
add(K,BX(.6,.04,.5),new THREE.MeshBasicMaterial({color:new THREE.Color(2,.5,.1)}),-3.45,.17,-1).castShadow=false;
[[-.12,.3],[.1,-.2]].forEach(([dz,ry])=>{const lg=add(K,new THREE.CylinderGeometry(.07,.07,.6,10),M(0x2a1a10,.9),-3.45,.24,-1+dz);lg.rotation.z=PI/2;lg.rotation.y=ry});
for(let i=0;i<6;i++){const g=new THREE.ConeGeometry(.1,.5,10);g.translate(0,.25,0);const m=add(K,g,new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.1+i*.1,.2),transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}),-3.45+(Math.random()-.5)*.5,.2,-1+(Math.random()-.5)*.4);m.castShadow=m.receiveShadow=false;fireC.push(m)}
glow(K,-3.4,.55,-1,2,new THREE.Color(1.6,.55,.12));
const fire=new THREE.PointLight(0xff7a20,10,12,2);fire.userData.b=10;fire.position.set(-3.1,.7,-1);K.add(fire);flames.push(fire);
const moon=new THREE.DirectionalLight(0x9fb4e8,3.6);moon.position.set(9,7,4);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);moon.shadow.bias=-.0003;moon.shadow.normalBias=.02;
Object.assign(moon.shadow.camera,{left:-9,right:9,top:9,bottom:-9,far:30});moon.shadow.radius=4;K.add(moon);
K.add(new THREE.HemisphereLight(0x7a8ab0,0x302418,2.6),new THREE.AmbientLight(0x909098,1.4));const kl=new THREE.PointLight(0xffe0b0,14,14,2);kl.position.set(-1,2.8,.5);K.add(kl);
const cabL=new THREE.PointLight(0xffb070,6,8,2);cabL.position.set(6.3,2.2,.6);K.add(cabL);
dust(K,0,.3,0,14,3.5,8);
// tablettes en bois + vis (dévissables) + supports muraux
const plank=x=>{const b=new THREE.Group();add(b,BX(2.4,.05,.35),mWood);
  b.screws=[-.5,.5].map(dx=>{const s=new THREE.Group();s.position.set(dx,.03,0);add(s,new THREE.CylinderGeometry(.037,.037,.015,14),M(0x9a9a9a,.3,.9),0,.05,0);add(s,new THREE.CylinderGeometry(.012,.012,.1,8),M(0x777777,.3,.9),0,0,0);b.add(s);return s});
  [-.5,.5].forEach(dx=>add(K,BX(.08,.05,.3),mWood,x+dx,.7,-2.82));K.add(b);return b};
const A=plank(-2.2),B=plank(.5);A.position.set(-2.2,.75,-2.8);B.position.set(.5,.75,-2.8);
// collier : chaîne dorée + perles/diamants
const NK=new THREE.Group();add(NK,new THREE.TorusGeometry(.12,.004,8,48),M(0xd4a83a,.25,1));
const gemM=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.02,metalness:.3,emissive:0x8fc0ff,emissiveIntensity:.9,envMap:ENV,envMapIntensity:2.2});
for(let i=0;i<26;i++){const a=i/26*2*PI;add(NK,new THREE.IcosahedronGeometry(i%5?.012:.022,1),gemM,Math.cos(a)*.12,Math.sin(a)*.12,0)}
const nkL=new THREE.PointLight(0xaad4ff,.8,2);NK.add(nkL);glow(NK,0,0,0,.5,new THREE.Color(.5,.8,1.4));NK.position.set(6.4,1.5,0);K.add(NK);
const child=person({s:.6,top:0xf0ead8,bot:0x5a4a3a,hair:0x4a3020});K.add(child.root);
const mother=person({s:.9,top:0x8a6a4a,dress:0x4a5a7a,hair:0x2a1a10,long:1});mother.root.position.set(-2.5,0,.7);mother.root.rotation.y=0;K.add(mother.root);

/* ===== TABLE ===== */
add(TB,BX(14,.2,10),stoneM(14,10),0,-.1,0);add(TB,BX(14,5,.3),stoneM(14,5),0,2.5,-2.6);add(TB,BX(3,2.4,.05),M(0x6a1620,1),0,2.2,-2.4);
add(TB,BX(2.4,.08,1.1),mWood,0,.78,0);[-1,1].forEach(x=>[-.4,.4].forEach(z=>add(TB,BX(.08,.75,.08),mWood,x,.37,z)));
candle(TB,-.2,.82,0,7);candle(TB,.5,.82,.1,6);add(TB,new THREE.CylinderGeometry(.04,.03,.12,12),M(0xd4a83a,.25,1),.1,.88,-.2);
[[-.55,-.2],[.55,-.2],[.1,.4]].forEach(([x,z])=>add(TB,new THREE.CylinderGeometry(.11,.09,.015,20),M(0xe8e4d8,.3),x,.83,z));
[[-.75,.1],[.75,.1],[.3,.45]].forEach(([x,z])=>add(TB,new THREE.CylinderGeometry(.035,.022,.1,14),M(0xd4a83a,.2,1),x,.87,z));
add(TB,new THREE.CylinderGeometry(.04,.05,.28,14),M(0x1a3a22,.15,.1),-.9,.96,-.1);
TB.add(new THREE.HemisphereLight(0x8090b0,0x302418,2.6),new THREE.AmbientLight(0x908898,1.4));const fl=new THREE.PointLight(0xffd8b0,12,10,2);fl.position.set(0,1.7,1.6);TB.add(fl);
const dl=new THREE.SpotLight(0xffd8b0,220,14,.9,.6);dl.position.set(0,3.5,2.5);dl.target.position.set(0,1,-.5);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);dl.shadow.bias=-.0005;TB.add(dl,dl.target);
dust(TB,0,.3,0,6,3,4);
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
  add(g,BX(w,h,.02),new THREE.MeshStandardMaterial({map:tx,roughness:.9}));add(g,new THREE.SphereGeometry(.07,12,10),M(0xaa1111,.3),0,h/2-.12,.05);
  g.position.set(x,y,0);g.rotation.z=rot;BD.add(g);reveal.push({o:g,t:t0});return new THREE.Vector3(x,y+h/2-.12,.12)}
const pR=card('RAOUL',0,0,2.4,3,.03,'#e8dfc8',1,53.4),pC=card('COMTESSE BONNE',-5,2.2,2.2,2.6,-.06,'#efe6d0',1,54),pK=card('COMTE',5,2.2,2.2,2.6,.05,'#efe6d0',1,54.4),
  pH=card('HENRIETTE',-4.6,-3.2,2.2,2.6,.07,'#efe6d0',1,54.8),pL=card('COLLIER ?',4.6,-3,2.2,1.6,-.08,'#d9d0b0',0,55.2),pF=card('CABINET',0,4.2,2,1.3,.02,'#d9d0b0',0,55.6);
const Y=new THREE.Vector3(0,1,0);
function wire(a,b,t0){const d=new THREE.Vector3().subVectors(b,a),m=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,d.length(),6),M(0xc01818,.5));m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(Y,d.normalize());m.position.z+=.02;BD.add(m);reveal.push({o:m,t:t0})}
[[pR,pC],[pR,pK],[pR,pH],[pR,pL],[pR,pF],[pC,pK],[pH,pL]].forEach((w,i)=>wire(w[0],w[1],56+i*.25));
const stamp=new THREE.Mesh(new THREE.PlaneGeometry(4,1.3),new THREE.MeshBasicMaterial({transparent:true,map:ctex(512,160,(c,W,H)=>{c.strokeStyle=c.fillStyle='#c0141c';c.lineWidth=10;c.strokeRect(8,8,W-16,H-16);c.font='bold 100px Impact,sans-serif';c.textAlign='center';c.fillText('SUSPECT',W/2,H-38)})}));
stamp.position.set(0,-.4,.2);stamp.rotation.z=-.22;stamp.visible=false;BD.add(stamp);

/* ===== BIJOUTIER : Raoul vend le collier, la mère n'en sait rien ===== */
const JW=new THREE.Group(),LT=new THREE.Group();scene.add(JW,LT);JW.visible=LT.visible=false;
const own=(g,o)=>{if(o.parent!==g)g.add(o)},gold=M(0xe0b030,.2,.9),yrEl=$('year');
add(JW,BX(12,.2,8),woodM(12,8),0,-.1,-1);add(JW,BX(12,4,.3),woodM(12,4),0,2,-2.6);
for(let i=0;i<3;i++){add(JW,BX(5,.05,.3),mWood,0,1.3+i*.7,-2.4);for(let j=0;j<8;j++)add(JW,BX(.25,.18,.2),M(j%2?0x6a1a1a:0x1a2a5a,.5),-2.1+j*.6,1.42+i*.7,-2.4)}
add(JW,BX(3.2,.75,.8),mWood,0,.375,-.1);add(JW,BX(3.3,.06,.9),M(0x3a2410,.35),0,.75,-.1); // comptoir (dessus à y=.78)
// balance de bijoutier sur le comptoir
add(JW,new THREE.CylinderGeometry(.04,.06,.2,12),gold,-1.1,.88,-.1);add(JW,BX(.4,.015,.02),gold,-1.1,.98,-.1);[-.18,.18].forEach(x=>add(JW,new THREE.CylinderGeometry(.06,.05,.012,16),gold,-1.1+x,.88,-.1));
JW.add(new THREE.HemisphereLight(0x9a90a0,0x302418,2.4),new THREE.AmbientLight(0xa09080,1.2));
const jl=new THREE.PointLight(0xffd29a,14,12,2);jl.position.set(0,2.5,.8);jl.castShadow=true;jl.shadow.mapSize.set(1024,1024);jl.shadow.bias=-.0008;JW.add(jl);
glow(JW,0,.95,.3,1.6,new THREE.Color(.8,.5,.2));dust(JW,0,.3,-.5,8,3,5);
const jw=person({s:.9,top:0x3a2a20,hair:0xcccccc,skin:0xe3b48e});jw.root.position.set(0,0,-.7);JW.add(jw.root);
add(jw.head,new THREE.CylinderGeometry(.035,.035,.04,14),M(0x222222,.3,.8),.045,.17,.145).rotation.x=PI/2; // loupe
const coins=[];for(let i=0;i<45;i++){const c=add(JW,new THREE.CylinderGeometry(.04,.04,.008,16),gold,.25+(Math.random()-.5)*.35,.784+Math.floor(i/9)*.01,.05+(Math.random()-.5)*.25);c.visible=false;coins.push(c)}
const notes=[0,1,2,3].map(i=>{const n=add(JW,BX(.2,.005,.1),M(0xd9d0a8,.9),-.35,.783+i*.006,.1);n.rotation.y=(i-1.5)*.15;n.visible=false;return n});
const pouch=add(JW,new THREE.SphereGeometry(.1,14,12),M(0x5a3a1c,.8),0,.86,.15);pouch.scale.y=.8;pouch.visible=false;
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
add(LT,BX(10,.2,8),woodM(10,8),0,-.1,-1);add(LT,BX(10,4,.3),woodM(10,4),0,2,-2.6);add(LT,BX(1.2,1.4,.05),new THREE.MeshBasicMaterial({color:new THREE.Color(.5,.8,1.5)}),-2.2,2,-2.42);
add(LT,BX(2,.06,.9),mWood,0,.78,-.2);[-.9,.9].forEach(x=>[-.55,.15].forEach(z=>add(LT,BX(.07,.78,.07),mWood,x,.39,z)));
add(LT,BX(.5,.05,.5),mWood,0,.45,-.95);add(LT,BX(.5,.6,.05),mWood,0,.8,-1.2);
add(LT,BX(.5,.3,.35),M(0x4a2c14,.7),-.75,.96,-.2);const mound=add(LT,new THREE.SphereGeometry(.2,16,10),gold,-.75,1.1,-.2);mound.scale.y=.4;
candle(LT,.8,.81,-.5,6);LT.add(new THREE.HemisphereLight(0x8a90b0,0x302418,2.2),new THREE.AmbientLight(0x908090,1.2));
const ll=new THREE.PointLight(0x7a98e0,8,9,2);ll.position.set(-2.2,2,-1.5);const gl=new THREE.PointLight(0xffd060,3,3,2);gl.position.set(-.75,1.3,-.1);LT.add(ll,gl);
glow(LT,-.75,1.15,-.2,.9,new THREE.Color(1.5,1,.3));dust(LT,0,.3,-.5,6,3,4);
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

/* ---------- Audio (Web Audio API, tout est synthétisé : réverbération de pierre, musique générative, bruitages à modes) ---------- */
let AC,lp,out,NB,mg,musicTimer;
function ir(sec,decay){const n=AC.sampleRate*sec,b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let v=0;for(let i=0;i<n;i++){const t=i/n;v+=((Math.random()*2-1)-v)*(.2+.8*(1-t));d[i]=v*Math.pow(1-t,decay)}}return b}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function aInit(){AC=new(window.AudioContext||window.webkitAudioContext)();
  lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=20000;
  const comp=AC.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3;comp.knee.value=14;
  out=AC.createGain();out.connect(lp);lp.connect(comp);comp.connect(AC.destination);
  const cv=AC.createConvolver();cv.buffer=ir(2.8,2.6);const rs=AC.createGain();rs.gain.value=.4;out.connect(rs);rs.connect(cv);cv.connect(lp); // salle en pierre
  NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const w=AC.createBufferSource(),wf=AC.createBiquadFilter(),wg=AC.createGain(),lfo=AC.createOscillator(),lg=AC.createGain(),lf2=AC.createGain();w.buffer=NB;w.loop=true;wf.type='lowpass';wf.frequency.value=380;wg.gain.value=.07;
  w.connect(wf);wf.connect(wg);wg.connect(out);w.start(0,Math.random());lfo.frequency.value=.15;lg.gain.value=.04;lf2.gain.value=140;lfo.connect(lg);lg.connect(wg.gain);lfo.connect(lf2);lf2.connect(wf.frequency);lfo.start(); // vent qui respire
  const r1=AC.createBufferSource(),rf=AC.createBiquadFilter(),rg=AC.createGain();r1.buffer=NB;r1.loop=true;rf.type='lowpass';rf.frequency.value=150;rg.gain.value=.1;r1.connect(rf);rf.connect(rg);rg.connect(out);r1.start(0,Math.random()); // grondement sourd du feu
  // musique générative : cordes lentes + basse + arpège de piano + mélodie
  mg=AC.createGain();mg.gain.value=0;const mf=AC.createBiquadFilter();mf.type='lowpass';mf.frequency.value=2600;mg.connect(mf);mf.connect(out);
  const CH=[[45,57,60,64],[41,57,60,65],[48,55,60,64],[40,55,59,64]],MEL=[[[76,0],[79,1.5],[81,3]],[[77,0],[76,1.5],[72,3]],[[79,0],[76,1.5],[72,3]],[[71,0],[74,1.5],[76,3]]];
  const pluck=(f,t0,v)=>[[f,'triangle',1],[f*2,'sine',.35]].forEach(([fr,ty,a])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=fr;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v*a,t0+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+1.9);o.connect(g);g.connect(mg);o.start(t0);o.stop(t0+2)});
  const bar=(t0,c,bi)=>{
    c.forEach((m,i)=>[-7,7].forEach(dt=>{const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';o.frequency.value=mtof(m);o.detune.value=dt;f.type='lowpass';f.frequency.value=480+i*70;
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.04,t0+1.6);g.gain.setValueAtTime(.04,t0+3);g.gain.linearRampToValueAtTime(0,t0+5.2);o.connect(f);f.connect(g);g.connect(mg);o.start(t0);o.stop(t0+5.3)}));
    const bo=AC.createOscillator(),bg=AC.createGain();bo.type='sine';bo.frequency.value=mtof(c[0]);bg.gain.setValueAtTime(0,t0);bg.gain.linearRampToValueAtTime(.12,t0+.08);bg.gain.exponentialRampToValueAtTime(.0001,t0+3.8);bo.connect(bg);bg.connect(mg);bo.start(t0);bo.stop(t0+4);
    [0,1,2,3,2,1,2,3].forEach((ix,j)=>pluck(mtof(c[ix]+12),t0+j*.5,.05));
    MEL[bi].forEach(([m,dt])=>pluck(mtof(m),t0+dt,.09))};
  let nb=AC.currentTime+.2,bi=0;musicTimer=setInterval(()=>{while(nb<AC.currentTime+1){bar(nb,CH[bi%4],bi%4);nb+=4;bi++}},250)}
function nz(dur,f0,f1,v,type='bandpass',q=2,dl=0,at=0){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),n=AC.currentTime+dl;s.buffer=NB;s.loop=true;f.type=type;f.Q.value=q;
  f.frequency.setValueAtTime(f0,n);f.frequency.exponentialRampToValueAtTime(f1,n+dur);
  if(at){g.gain.setValueAtTime(.0001,n);g.gain.linearRampToValueAtTime(v,n+at)}else g.gain.setValueAtTime(v,n);
  g.gain.exponentialRampToValueAtTime(.0001,n+dur);s.connect(f);f.connect(g);g.connect(out);s.start(n,Math.random());s.stop(n+dur)}
function tn(fr,dur,v,type='sine',f2=fr,dl=0){const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+dl;o.type=type;o.frequency.setValueAtTime(fr,n);o.frequency.exponentialRampToValueAtTime(f2,n+dur);
  g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+dur);o.connect(g);g.connect(out);o.start(n);o.stop(n+dur)}
const modal=(fr,dur,v,dl=0)=>fr.forEach((f,i)=>tn(f,dur/(1+i*.5),v/(1+i*.7),'sine',f*.995,dl)); // résonances d'un objet qui sonne
const ping=(f,v=.05,dl=0)=>modal([f,f*2.76,f*5.4],.9,v,dl);
function vowel(f0,forms,t0,dur,v,kk=1,glide=1){const o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f0*glide,t0+dur);
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.02);g.gain.linearRampToValueAtTime(0,t0+dur);o.connect(g);
  forms.forEach(fr=>{const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=fr*kk;b.Q.value=7;g.connect(b);b.connect(out)});o.start(t0);o.stop(t0+dur+.02)}
const SFX={
  screw:()=>{nz(.06,900,300,.5,'lowpass',1); // la vis qui décolle
    for(let i=0;i<14;i++){const d=.1+Math.pow(i/13,1.3)*1.1; // cliquets qui ralentissent
      tn(2600+Math.random()*300,.025,.09,'square',1400,d);nz(.03,4000,2000,.1,'bandpass',2,d);tn(160,.05,.12,'triangle',100,d)}
    nz(1.1,1800,3200,.04,'bandpass',14,.1); // grincement métallique
    tn(3300,.3,.07,'sine',3000,1.25);tn(5100,.2,.03,'sine',4800,1.27)}, // tintement quand la vis sort
  scrape:()=>{nz(.8,600,250,.16,'bandpass',2.5,0,.15);tn(95,.7,.04,'sawtooth',65)},
  wood:(v=1)=>{modal([170,290,480,760],.4,.5*v);nz(.04,2200,700,.35*v,'bandpass',1.2)},
  creak:()=>{tn(90+Math.random()*40,.6,.07,'sawtooth',60+Math.random()*30);nz(.6,300,520,.07,'bandpass',12,0,.1)},
  step:()=>{const p=.8+Math.random()*.5;nz(.12,500*p,110,.45,'lowpass',1);tn(95*p,.14,.4,'sine',48);nz(.03,2000,900,.1,'bandpass',1)},
  hand:()=>{nz(.09,600,180,.22,'lowpass',1);tn(150,.08,.12,'sine',90)},
  cloth:()=>nz(.7,500,2200,.16,'bandpass',.7,0,.25),
  gems:()=>[0,1,2,3,4,5].forEach(i=>ping(2500+Math.random()*3500,.035,i*.07)),
  paper:()=>{for(let i=0;i<5;i++)nz(.05+Math.random()*.06,4500+Math.random()*2500,3000,.1,'bandpass',.8,i*.05+Math.random()*.03)},
  thud:()=>{tn(80,.5,.7,'sine',35);nz(.25,400,100,.5,'lowpass',1)},
  laugh:()=>[0,1,2,3,4].forEach(i=>{vowel(200-i*8,[800,1200],AC.currentTime+i*.22,.16,.5,1.15,.75);nz(.12,3000,1500,.05,'bandpass',1,i*.22)}),
  coin:()=>{ping(3000+Math.random()*1200,.05);nz(.02,5000,3000,.05,'bandpass',2)},
  crackle:()=>{nz(.02+Math.random()*.03,2000+Math.random()*4000,1000,.12+Math.random()*.1,'bandpass',1.5);if(Math.random()<.2)tn(120+Math.random()*100,.04,.15,'sine',60)},
  cricket:()=>[0,.06,.12].forEach(d=>tn(4300,.035,.012,'sine',4300,d))};
const SUB=$('sub');let subT;
function sub(txt,ms){SUB.textContent=txt;SUB.style.opacity=1;clearTimeout(subT);subT=setTimeout(()=>SUB.style.opacity=0,ms)}
/* Voix : chaque personnage a sa hauteur (p), sa vitesse (r), son index de voix système (i),
   sa fréquence de secours (f) et un décalage de formants (k) pour la voix synthétisée */
const VO={jw:{p:.5,r:.8,i:0,f:70,k:.9},ct:{p:.95,r:.85,i:1,f:105,k:1},ch:{p:1.7,r:1.2,i:2,f:150,k:1.2}};
function voices(){const sc=v=>(/thomas|paul|henri|jean|claude|antoine|nicolas|daniel|male|homme/i.test(v.name)?4:0)+(/natural|neural|premium|enhanced|google/i.test(v.name)?2:0)+(v.localService?0:1);
  return speechSynthesis.getVoices().filter(x=>x.lang&&x.lang.toLowerCase().startsWith('fr')).sort((a,b)=>sc(b)-sc(a))}
function babble(txt,v){ // voix de secours synthétisée (voyelles à formants), passe par le filtre « oreilles bouchées »
  const F={a:[800,1200],e:[500,1800],i:[300,2300],o:[500,900],u:[350,700],y:[300,2200]};let d=0;
  for(const ch of txt.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()){
    if(F[ch]){vowel(v.f*(1+.08*Math.sin(d*5)),F[ch],AC.currentTime+d,.12,.9,v.k);d+=.11}
    else if(ch===' ')d+=.08;else{setTimeout(()=>nz(.04,2500,1500,.15,'bandpass',1),d*1000);d+=.05}}}
function say(txt,who,ms=2500){
  const v=VO[who];sub(txt,ms);let ok=false;
  try{const ss=window.speechSynthesis;if(ss){const u=new SpeechSynthesisUtterance(txt),fr=voices();
    u.lang='fr-FR';u.pitch=v.p;u.rate=v.r;u.volume=1;if(fr.length)u.voice=fr[v.i%fr.length];
    u.onerror=()=>babble(txt,v);ss.speak(u);ok=true;setTimeout(()=>{if(!ss.speaking)babble(txt,v)},500)}}catch(e){}
  if(!ok)babble(txt,v)}

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
  // balancement du pont ; les tablettes frottent et vacillent au passage de l'ouverture
  const sq=t>=14&&t<15.6?Math.sin(PI*k(t,14,15.6))*.035:0,onB=t>=14.5&&t<27.4?Math.sin(t*3)*.004:0;if(t>=13.5)[A,B].forEach(b=>b.rotation.z=onB+sq);
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
 [13.5,15.2,[1.4,1.5,1.6],[2.4,1.35,1.3],[2.6,1.1,0],[3.6,1.2,0]], // vue côté cuisine : il s'engage dans l'ouverture
 [15.2,17.2,[5.0,1.6,1.8],[4.6,1.5,1.5],[3.4,1.2,0],[3.8,1.2,0]],  // contre-champ : il ressort avec les tablettes
 [17.2,21,[4.0,1.9,3.2],[6,1.7,3],[4.3,1.1,0],[6,1.1,0]],
 [21,24,[6.3,1.5,1.5],[6.2,1.45,1.2],[6.3,1.3,0],[6.3,1.3,0]],
 [24,28,[5.5,2.2,3.5],[3.5,1.7,3.3],[4.5,1.1,0],[3.2,1,0]],
 [28,34.4,[.3,1.5,3.8],[.9,1.4,3.9],[2.0,.5,.8],[2.3,.5,2.4]],
 [34.4,45,[0,1.45,3.2],[-.2,1.3,2.3],[0,1,-.8],[-.2,1.1,-.8]],
 [45,51.6,[-.55,1.35,.6],[-.55,1.32,.1],[-.55,1.3,-.95],[-.55,1.28,-.95]],
 [51.6,70,[0,0,12],[0,0,4.2],[0,0,0],[0,0,0]]];
function camAt(t,A=S){const s=A.find(a=>t>=a[0]&&t<a[1])||A[A.length-1],u=sm(k(t,s[0],s[1]));
  cam.position.set(...s[2].map((v,i)=>L(v,s[3][i],u)));cam.position.y+=Math.sin(t*1.3)*.008;cam.position.x+=Math.sin(t*.9)*.004;cam.lookAt(...s[4].map((v,i)=>L(v,s[5][i],u)));cam.rotateZ(Math.sin(t*.7)*.006)}

/* ---------- Événements sonores / voix (temps en secondes) ---------- */
const E=[];const ev=(t,f)=>E.push([t,f]);
[1,2.3,5.4,6.7].forEach(t=>ev(t,SFX.screw));ev(3.6,()=>SFX.wood());ev(7.6,()=>SFX.wood());ev(4.5,()=>SFX.wood(.7));
[4.95,5.2,5.4].forEach((t,i)=>ev(t,()=>SFX.wood(.5/(i+1))));ev(8.6,()=>SFX.wood(.5));ev(9,()=>SFX.wood(.4));
for(let t=9.2;t<12;t+=.38)ev(t,SFX.step);for(let t=28.7;t<31;t+=.38)ev(t,SFX.step);
ev(12.9,()=>SFX.wood());ev(13.3,()=>SFX.wood(.8));ev(14,SFX.creak);
ev(13.9,SFX.scrape);ev(14.6,SFX.cloth);ev(15.1,SFX.scrape); // passage dans l'ouverture
for(let t=14.6;t<21;t+=.62){ev(t,SFX.hand);ev(t+.3,SFX.hand)}for(let t=15;t<21;t+=1.4)ev(t,SFX.creak);
for(let t=24.5;t<27.4;t+=.45){ev(t,SFX.hand);ev(t+.22,SFX.hand)}ev(25,SFX.creak);ev(26.3,SFX.creak);
ev(22.6,SFX.gems);ev(23.1,SFX.cloth);ev(23.4,SFX.cloth);
ev(37.4,()=>say('Mon Dieu…','jw',1800));ev(40.2,()=>say('Tiens, mon petit.','jw',2000));ev(35.2,()=>SFX.wood(.3));
for(let i=0;i<20;i++)ev(40.4+i*.05,SFX.coin);for(let i=0;i<8;i++)ev(41.9+i*.1,SFX.coin);ev(42,SFX.cloth);
for(let i=0;i<16;i++){ev(LS+i*.85+.15,SFX.coin);ev(LS+i*.85+.45,SFX.paper);ev(LS+i*.85+.75,SFX.hand)}
ev(OFF+36.9,()=>say('Le chevalier Floriani…','ct'));ev(OFF+40.4,()=>say('Ce petit avait tendu une main','ct'));
ev(OFF+44,()=>say('Deux mains !','ch'));ev(OFF+44.9,SFX.laugh);
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
  glows.forEach((s,i)=>{const g=.85+Math.sin(t*11+i*3)*.08+Math.random()*.08;s.scale.set(s.userData.s*g,s.userData.s*g,1)});
  fireC.forEach((m,i)=>m.scale.set(1+Math.sin(t*9+i)*.15,.75+Math.sin(t*13+i*2)*.3+Math.random()*.2,1));
  dusts.forEach((m,i)=>{m.position.y=Math.sin(t*.25+i)*.08;m.position.x=Math.cos(t*.2+i)*.08});
  grade.uniforms.time.value=t%7;
  if(q<51&&Math.random()<dt*6)SFX.crackle();
  if(t<T1&&Math.random()<dt*2)SFX.cricket(); // grillons dehors, la nuit
  lp.frequency.value=t>=T3&&q<44?250*Math.pow(80,k(q,34.5,44)):20000; // oreilles bouchées → net (volume constant)
  const qq=Math.max(q,0);mg.gain.setTargetAtTime(t<.5?0:.55+.5*k(qq,50,60)*(qq<64?1:1-k(qq,64,66)),AC.currentTime,.3);
}
function loop(now){if(!running)return;requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.1);last=now;clock+=dt;
  while(E.length&&E[0][0]<=clock)E.shift()[1]();frame(Math.min(clock,END),dt);composer.render();if(clock>=END)finish()}
function finish(){running=false;over=true;clearInterval(musicTimer);speechSynthesis.cancel();setTimeout(()=>AC.close(),500);$('stage').remove();SUB.remove();yrEl.remove();fade.remove();$('bars').remove();document.body.style.overflow='auto';$('site').style.display='flex'}

/* ---------- Démarrage : chargement → « Mettez du son » → cinématique (non skippable) ---------- */
['keydown','keyup','contextmenu','wheel','touchmove','dragstart'].forEach(e=>addEventListener(e,ev=>{if(running)ev.preventDefault()},{passive:false}));
setTimeout(()=>{R.compile(scene,cam);$('load').style.display='none';$('start').style.display='flex'},50);
$('go').onclick=()=>{aInit();try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.getVoices();speechSynthesis.speak(u)}catch(e){}$('start').remove();running=true;last=performance.now();requestAnimationFrame(loop)};
