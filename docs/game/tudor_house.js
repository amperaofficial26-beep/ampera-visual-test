import * as THREE from 'three';
import { addTudorWallDetails } from './tudor_wall_details.js';

// Material procedural PBR ringan: tidak membutuhkan file texture eksternal.
function canvasTexture(draw, repeatX=1, repeatY=1) {
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=384;
  const ctx=canvas.getContext('2d');draw(ctx,canvas.width,canvas.height);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(repeatX,repeatY);tex.anisotropy=4;return tex;
}
function speckle(ctx,w,h,count,alpha){for(let i=0;i<count;i++){ctx.fillStyle=`rgba(35,28,21,${Math.random()*alpha})`;ctx.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*3);}}
function stoneTexture(){return canvasTexture((ctx,w,h)=>{
  ctx.fillStyle='#6d6a62';ctx.fillRect(0,0,w,h);
  // Batu dengan ukuran dan posisi tidak seragam, agar tidak terlihat sebagai pattern berulang.
  let y=0,row=0;while(y<h){const rh=27+Math.random()*22;let x=-(row%2)*(12+Math.random()*18);while(x<w){const rw=36+Math.random()*38;ctx.fillStyle=['#7f786d','#625f59','#91877a','#716b63'][Math.floor(Math.random()*4)];ctx.fillRect(x+2,y+2,rw-4,rh-4);ctx.strokeStyle='rgba(43,40,35,.75)';ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,rw-4,rh-4);x+=rw;}y+=rh;row++;}speckle(ctx,w,h,1800,.13);
},1.35,1.35)}
function plasterTexture(){return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#e3d8bf';ctx.fillRect(0,0,w,h);speckle(ctx,w,h,2200,.07);for(let i=0;i<22;i++){ctx.strokeStyle='rgba(111,92,67,.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(Math.random()*w,Math.random()*h);ctx.lineTo(Math.random()*w,Math.random()*h);ctx.stroke();}},1.45,1.45)}
function woodTexture(){return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#2d211b';ctx.fillRect(0,0,w,h);for(let i=0;i<115;i++){ctx.strokeStyle=`rgba(151,96,56,${.10+Math.random()*.18})`;ctx.lineWidth=.7+Math.random()*2;ctx.beginPath();ctx.moveTo(0,Math.random()*h);ctx.bezierCurveTo(w*.3,Math.random()*h,w*.7,Math.random()*h,w,Math.random()*h);ctx.stroke();}},1,4)}
function roofTexture(){return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#93432f';ctx.fillRect(0,0,w,h);for(let y=0;y<h;y+=28){for(let x=-(y/28%2)*17;x<w;x+=34){const shade=['#b65d42','#94432f','#a94e36'][Math.floor(Math.random()*3)];ctx.fillStyle=shade;ctx.fillRect(x+1,y+2,31,23);ctx.strokeStyle='rgba(58,28,22,.68)';ctx.lineWidth=1.5;ctx.strokeRect(x+1,y+2,31,23);}}speckle(ctx,w,h,900,.08);},2.2,3.3)}
const tex={stone:stoneTexture(),plaster:plasterTexture(),wood:woodTexture(),roof:roofTexture()};
const stoneMat=new THREE.MeshStandardMaterial({map:tex.stone,bumpMap:tex.stone,bumpScale:.18,roughness:.94});
const plasterMat=new THREE.MeshStandardMaterial({map:tex.plaster,bumpMap:tex.plaster,bumpScale:.07,roughness:.91});
const woodMat=new THREE.MeshStandardMaterial({map:tex.wood,bumpMap:tex.wood,bumpScale:.1,roughness:.82});
// DoubleSide memperbaiki atap yang tampak tembus ketika kamera melihat dari arah belakang/bawah.
const roofMat=new THREE.MeshStandardMaterial({map:tex.roof,bumpMap:tex.roof,bumpScale:.13,roughness:.77,side:THREE.DoubleSide});
const glassMat=new THREE.MeshStandardMaterial({color:0x8dc7d7,roughness:.22,metalness:.1,emissive:0x183047,emissiveIntensity:.22});

const LOWER_H=1.65,UPPER_H=1.72,LOWER_W=2.72,LOWER_D=2.28,UPPER_W=3.18,UPPER_D=2.65;

// RUMAH TUDOR: lower floor batu, upper floor plaster yang menjorok keluar, rangka kayu exposed, dan atap pelana.
export function createTudorHouse(x,z,rotation=0,scale=1,variant=0){
  const house=new THREE.Group();house.position.set(x,0,z);house.rotation.y=rotation+(variant%2?-.045:.04);house.scale.setScalar(scale);
  // 1. Ground floor batu: lebih sempit dan lebih tinggi, memberi rasio rumah yang besar terhadap player.
  house.add(mesh(new THREE.BoxGeometry(LOWER_W,LOWER_H,LOWER_D),stoneMat,0,LOWER_H/2,0));addStoneCorners(house);
  // 2. Upper floor plaster: lebih besar daripada batu bawah untuk overhang/jetty Tudor.
  house.add(mesh(new THREE.BoxGeometry(UPPER_W,UPPER_H,UPPER_D),plasterMat,0,LOWER_H+UPPER_H/2,0));
  addTudorWallDetails(house,{width:UPPER_W,depth:UPPER_D,lowerHeight:LOWER_H,upperHeight:UPPER_H,woodMaterial:woodMat});
  // 3. Gable roof: lebih lebar dari upper floor sehingga ada eave/overhang yang jelas.
  const roof=new THREE.Mesh(gableRoofGeometry(3.62,3.08,LOWER_H+UPPER_H-.03,LOWER_H+UPPER_H+1.62),roofMat);roof.castShadow=roof.receiveShadow=true;house.add(roof);addRoofEaves(house);
  // 4. Pintu dan jendela.
  addDoor(house);addWindows(house);addChimney(house,variant);if(variant%2===0)addFlowerBox(house,.92,LOWER_H+1.02,-UPPER_D/2-.05);
  return house;
}
function mesh(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;}
function addStoneCorners(g){for(const [x,z] of[[-LOWER_W/2+.13,-LOWER_D/2+.12],[LOWER_W/2-.13,-LOWER_D/2+.12],[-LOWER_W/2+.13,LOWER_D/2-.12],[LOWER_W/2-.13,LOWER_D/2-.12]])g.add(mesh(new THREE.BoxGeometry(.23,LOWER_H+.08,.23),stoneMat,x,(LOWER_H+.08)/2,z));}
function addTimberFrame(g){
  const front=-UPPER_D/2-.066,base=LOWER_H;
  // Horizontal beams, vertical beams, lalu diagonal braces: pola khas exposed half-timber frame.
  for(const y of[base+.06,base+.74,base+UPPER_H-.06])g.add(mesh(new THREE.BoxGeometry(UPPER_W+.07,.12,.12),woodMat,0,y,front));
  for(const x of[-UPPER_W*.42,0,UPPER_W*.42])g.add(mesh(new THREE.BoxGeometry(.12,UPPER_H,.12),woodMat,x,base+UPPER_H/2,front));
  for(const sign of[-1,1]){const brace=mesh(new THREE.BoxGeometry(.105,1.78,.11),woodMat,sign*UPPER_W*.21,base+UPPER_H/2,front-.018);brace.rotation.z=sign*.72;g.add(brace);}
  // Timber pada dua sisi overhang supaya rumah tidak flat dari angle eksplorasi pemain.
  for(const z of[-UPPER_D/2+.13,UPPER_D/2-.13])for(const x of[-UPPER_W/2-.03,UPPER_W/2+.03])g.add(mesh(new THREE.BoxGeometry(.12,UPPER_H,.12),woodMat,x,base+UPPER_H/2,z));
}
function gableRoofGeometry(width,depth,eaveY,ridgeY){
  const hw=width/2,hd=depth/2;const vertices=new Float32Array([-hw,eaveY,-hd,hw,eaveY,-hd,0,ridgeY,-hd,-hw,eaveY,hd,hw,eaveY,hd,0,ridgeY,hd]);
  const indices=[0,1,2,3,5,4,0,3,4,0,4,1,1,4,5,1,5,2,2,5,3,2,3,0];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1,0,0,1,0,.5,1],2));return geo;
}
function addRoofEaves(g){const y=LOWER_H+UPPER_H+.03;for(const z of[-1.57,1.57])g.add(mesh(new THREE.BoxGeometry(3.72,.12,.13),woodMat,0,y,z));}
function addDoor(g){const door=mesh(new THREE.PlaneGeometry(.58,1.02),woodMat,0,.55,-LOWER_D/2-.018);g.add(door);const arch=new THREE.Mesh(new THREE.TorusGeometry(.29,.05,7,14,Math.PI),stoneMat);arch.position.set(0,1.05,-LOWER_D/2-.045);arch.rotation.z=Math.PI;g.add(arch);}
function addWindows(g){const y=LOWER_H+UPPER_H*.57,front=-UPPER_D/2-.078;for(const x of[-.9,.9]){const frame=mesh(new THREE.BoxGeometry(.52,.61,.075),woodMat,x,y,front);const glass=new THREE.Mesh(new THREE.PlaneGeometry(.39,.47),glassMat);glass.position.set(x,y,front-.045);g.add(frame,glass);g.add(mesh(new THREE.BoxGeometry(.04,.48,.025),woodMat,x,y,front-.065));g.add(mesh(new THREE.BoxGeometry(.4,.04,.025),woodMat,x,y,front-.065));}}
function addChimney(g,variant){const x=variant%2?.82:-.82;g.add(mesh(new THREE.BoxGeometry(.32,.98,.32),stoneMat,x,LOWER_H+UPPER_H+1.02,.38));g.add(mesh(new THREE.BoxGeometry(.46,.11,.46),stoneMat,x,LOWER_H+UPPER_H+1.54,.38));}
function addFlowerBox(g,x,y,z){g.add(mesh(new THREE.BoxGeometry(.64,.18,.22),woodMat,x,y,z));for(let i=0;i<6;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.06,6,5),new THREE.MeshStandardMaterial({color:i%2?0x4c7438:0x81a25a,roughness:.9}));leaf.position.set(x-.23+i*.09,y+.18,z-.03);g.add(leaf);const flower=new THREE.Mesh(new THREE.SphereGeometry(.035,6,5),new THREE.MeshBasicMaterial({color:i%2?0xff6382:0xffe275}));flower.position.set(x-.23+i*.09,y+.26,z-.03);g.add(flower);}}
