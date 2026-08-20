import * as THREE from 'three';

// ==============================================
// 1. PROCEDURAL TEXTURES (tanpa file image besar)
// ==============================================
function canvasTexture(draw, repeatX=1, repeatY=1) {
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext('2d');draw(ctx,canvas.width,canvas.height);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(repeatX,repeatY);
  texture.anisotropy=4;return texture;
}
function noise(ctx,w,h,amount=800,alpha=.12){for(let i=0;i<amount;i++){ctx.fillStyle=`rgba(40,32,24,${Math.random()*alpha})`;ctx.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2);}}
function stoneTexture(){return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#766f65';ctx.fillRect(0,0,w,h);for(let row=0;row<7;row++){const y=row*38;const offset=(row%2)*22;for(let x=-offset;x<w;x+=48){ctx.fillStyle=['#81796e','#68645d','#928879'][Math.floor(Math.random()*3)];ctx.fillRect(x+2,y+2,43,33);ctx.strokeStyle='rgba(41,39,35,.7)';ctx.strokeRect(x+2,y+2,43,33);}}noise(ctx,w,h,900,.16);},2,2)}
function plasterTexture(){return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#e2d5b8';ctx.fillRect(0,0,w,h);noise(ctx,w,h,1300,.08);for(let i=0;i<16;i++){ctx.strokeStyle='rgba(116,98,75,.12)';ctx.beginPath();ctx.moveTo(Math.random()*w,Math.random()*h);ctx.lineTo(Math.random()*w,Math.random()*h);ctx.stroke();}},2,2)}
function woodTexture(){return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#30241d';ctx.fillRect(0,0,w,h);for(let i=0;i<70;i++){ctx.strokeStyle=`rgba(143,91,52,${.12+Math.random()*.16})`;ctx.lineWidth=1+Math.random()*2;ctx.beginPath();ctx.moveTo(0,Math.random()*h);ctx.bezierCurveTo(w*.3,Math.random()*h,w*.7,Math.random()*h,w,Math.random()*h);ctx.stroke();}},1,4)}
function roofTexture(){return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#9d4e36';ctx.fillRect(0,0,w,h);for(let y=0;y<h;y+=23){ctx.fillStyle=y%46===0?'#b76545':'#89402f';ctx.fillRect(0,y,w,18);ctx.strokeStyle='rgba(66,32,25,.5)';ctx.beginPath();ctx.moveTo(0,y+18);ctx.lineTo(w,y+18);ctx.stroke();for(let x=(y/23%2)*14;x<w;x+=28){ctx.strokeRect(x,y,25,18);}}noise(ctx,w,h,600,.1);},2,3)}

const textures={stone:stoneTexture(),plaster:plasterTexture(),wood:woodTexture(),roof:roofTexture()};
const stoneMat=new THREE.MeshStandardMaterial({map:textures.stone,bumpMap:textures.stone,bumpScale:.13,roughness:.93});
const plasterMat=new THREE.MeshStandardMaterial({map:textures.plaster,bumpMap:textures.plaster,bumpScale:.055,roughness:.9});
const woodMat=new THREE.MeshStandardMaterial({map:textures.wood,bumpMap:textures.wood,bumpScale:.09,roughness:.82});
const roofMat=new THREE.MeshStandardMaterial({map:textures.roof,bumpMap:textures.roof,bumpScale:.1,roughness:.78});
const glassMat=new THREE.MeshStandardMaterial({color:0x86c9e1,roughness:.2,metalness:.08,emissive:0x18334a,emissiveIntensity:.25});

// ==============================================
// 2. GEOMETRY RUMAH TUDOR
// ==============================================
export function createTudorHouse(x,z,rotation=0,scale=1,variant=0){
  const house=new THREE.Group();house.position.set(x,0,z);house.rotation.y=rotation+(variant%2?-.035:.035);house.scale.setScalar(scale);

  // Ground floor: batu lebih kecil daripada lantai atas.
  const lower=mesh(new THREE.BoxGeometry(2.42,1.28,2.05),stoneMat,0,.64,0);house.add(lower);
  addStoneCornerBlocks(house,2.42,2.05);

  // Upper floor: menjorok keluar / jetty khas rumah Tudor.
  const upper=mesh(new THREE.BoxGeometry(2.76,1.3,2.34),plasterMat,0,1.91,0);house.add(upper);
  addTimberFrame(house,2.76,2.34);

  // Atap pelana terjal dan strip genteng procedural.
  const roof=new THREE.Mesh(gableRoofGeometry(3.15,2.68,2.54,4.0),roofMat);roof.castShadow=roof.receiveShadow=true;house.add(roof);
  addChimney(house,variant);

  // Detail fasad: pintu kayu, jendela berbingkai, bunga.
  addDoor(house);addWindows(house);if(variant%2===0)addFlowerBox(house,.78,1.72,-1.2);
  return house;
}
function mesh(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;}
function addStoneCornerBlocks(g,w,d){for(const [x,z] of[[-w/2+.12,-d/2+.1],[w/2-.12,-d/2+.1],[-w/2+.12,d/2-.1],[w/2-.12,d/2-.1]]){const p=mesh(new THREE.BoxGeometry(.2,1.38,.2),stoneMat,x,.69,z);g.add(p);}}

// ==============================================
// 3. RANGKA KAYU EXPOSED TIMBER FRAME
// ==============================================
function addTimberFrame(g,w,d){
  // Balok horizontal dan vertikal menempel pada plaster bagian depan.
  for(const y of[1.29,1.38,2.52])g.add(mesh(new THREE.BoxGeometry(w+.06,.105,.105),woodMat,0,y,-d/2-.055));
  for(const x of[-w*.42,0,w*.42])g.add(mesh(new THREE.BoxGeometry(.105,1.3,.11),woodMat,x,1.91,-d/2-.06));
  // Dua diagonal untuk pola Tudor yang jelas.
  for(const sign of[-1,1]){const brace=mesh(new THREE.BoxGeometry(.09,1.37,.09),woodMat,sign*w*.22,1.91,-d/2-.075);brace.rotation.z=sign*.72;g.add(brace);}
  // Kayu di sisi rumah agar tidak terlihat flat dari kamera samping.
  for(const z of[-d/2+.1,d/2-.1]){const side=mesh(new THREE.BoxGeometry(.11,1.3,.11),woodMat,w/2+.04,1.91,z);g.add(side);}
}

// ==============================================
// 4. ATAP PELANA (gable roof) BUKAN PYRAMID
// ==============================================
function gableRoofGeometry(width,depth,eaveY,ridgeY){
  const hw=width/2,hd=depth/2;
  const vertices=new Float32Array([-hw,eaveY,-hd, hw,eaveY,-hd, 0,ridgeY,-hd, -hw,eaveY,hd, hw,eaveY,hd, 0,ridgeY,hd]);
  const indices=[0,1,2, 3,5,4, 0,3,4,0,4,1, 1,4,5,1,5,2, 2,5,3,2,3,0];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1, 0,0,1,0,.5,1],2));return geo;
}
function addChimney(g,variant){const chimney=mesh(new THREE.BoxGeometry(.28,.9,.28),stoneMat,variant%2?.7:-.7,3.22,.35);g.add(chimney);const cap=mesh(new THREE.BoxGeometry(.4,.1,.4),stoneMat,chimney.position.x,3.69,.35);g.add(cap);}

// ==============================================
// 5. JENDELA, PINTU, FLOWER BOX
// ==============================================
function addDoor(g){const door=mesh(new THREE.PlaneGeometry(.48,.77),woodMat,0,.47,-1.031);g.add(door);const arch=new THREE.Mesh(new THREE.TorusGeometry(.24,.045,6,12,Math.PI),stoneMat);arch.position.set(0,.86,-1.055);arch.rotation.z=Math.PI;g.add(arch);}
function addWindows(g){for(const x of[-.78,.78]){const frame=mesh(new THREE.BoxGeometry(.43,.48,.06),woodMat,x,1.94,-1.205);const glass=new THREE.Mesh(new THREE.PlaneGeometry(.31,.34),glassMat);glass.position.set(x,1.94,-1.24);g.add(frame,glass);const crossV=mesh(new THREE.BoxGeometry(.035,.35,.025),woodMat,x,1.94,-1.255);const crossH=mesh(new THREE.BoxGeometry(.31,.035,.025),woodMat,x,1.94,-1.255);g.add(crossV,crossH);}}
function addFlowerBox(g,x,y,z){const box=mesh(new THREE.BoxGeometry(.55,.17,.21),woodMat,x,y,z);g.add(box);for(let i=0;i<5;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.055,6,5),new THREE.MeshStandardMaterial({color:i%2?0x557c3f:0x8ba856,roughness:.9}));leaf.position.set(x-.19+i*.095,y+.17,z-.02);g.add(leaf);const flower=new THREE.Mesh(new THREE.SphereGeometry(.035,6,5),new THREE.MeshBasicMaterial({color:i%2?0xff6682:0xffe174}));flower.position.set(x-.19+i*.095,y+.24,z-.02);g.add(flower);}}
