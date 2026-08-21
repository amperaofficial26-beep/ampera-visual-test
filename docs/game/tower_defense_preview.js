import * as THREE from 'three';
import { terrainHeight } from './terrain.js';

// Preview statis tower defense lima lantai; belum memiliki sistem battle/upgrade.
export function addTowerDefensePreview(scene){
  const x=0,z=28,baseY=terrainHeight(x,z);
  const tower=new THREE.Group();tower.name='tower_defense_preview';tower.position.set(x,baseY,z);scene.add(tower);
  const stone=new THREE.MeshStandardMaterial({color:0x536071,roughness:.72,metalness:.12});
  const dark=new THREE.MeshStandardMaterial({color:0x303846,roughness:.7,metalness:.2});
  const base=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.85,.62,10),stone);base.position.y=.31;base.castShadow=base.receiveShadow=true;tower.add(base);
  const weapons=[
    {key:'CANNON',color:0xff774e},
    {key:'TESLA',color:0x65cfff},
    {key:'FREEZE',color:0x83f6ff},
    {key:'ROCKET',color:0xffc85b},
    {key:'LASER',color:0xd68bff},
  ];
  weapons.forEach((weapon,index)=>addFloor(tower,index,weapon,stone,dark));
  // Batu tanda agar pemain dapat menemukan preview di luar gerbang desa.
  const sign=new THREE.Mesh(new THREE.BoxGeometry(3.2,.8,.18),new THREE.MeshStandardMaterial({color:0x392f2a,roughness:.82}));sign.position.set(0,1.5,2.8);tower.add(sign);
  const signLight=new THREE.PointLight(0x9ecfff,1.2,5);signLight.position.set(0,2,2.4);tower.add(signLight);
}
function addFloor(tower,index,weapon,stone,dark){
  const y=.78+index*1.03,group=new THREE.Group();group.position.y=y;
  const width=2.08-index*.11;
  const body=new THREE.Mesh(new THREE.BoxGeometry(width,.83,width),stone);body.castShadow=body.receiveShadow=true;group.add(body);
  const rim=new THREE.Mesh(new THREE.BoxGeometry(width+.16,.11,width+.16),dark);rim.position.y=.42;group.add(rim);
  const glow=new THREE.MeshBasicMaterial({color:weapon.color});
  // Rune cahaya depan: membedakan setiap lantai dari jauh.
  const rune=new THREE.Mesh(new THREE.PlaneGeometry(.38,.38),glow);rune.position.set(0,.05,-width/2-.011);group.add(rune);
  for(const x of[-width*.38,width*.38]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.8,6),dark);p.position.set(x,.4,-width*.38);group.add(p);}
  addWeapon(group,weapon,index,glow,dark,width);const light=new THREE.PointLight(weapon.color,.55,3.2);light.position.y=.5;group.add(light);tower.add(group);
}
function addWeapon(group,weapon,index,glow,dark,width){
  if(weapon.key==='CANNON'){const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.16,.25,.9,10),dark);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.5,-width*.48);group.add(barrel);}
  if(weapon.key==='TESLA'){for(let i=0;i<3;i++){const spike=new THREE.Mesh(new THREE.ConeGeometry(.1,.65,5),glow);const a=i*Math.PI*2/3;spike.position.set(Math.cos(a)*.3,.45,Math.sin(a)*.3);group.add(spike);}}
  if(weapon.key==='FREEZE'){const crystal=new THREE.Mesh(new THREE.ConeGeometry(.3,.9,6),glow);crystal.position.y=.48;group.add(crystal);}
  if(weapon.key==='ROCKET'){const tube=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.82,8),dark);tube.rotation.x=Math.PI/2;tube.position.set(0,.48,-width*.45);group.add(tube);const tip=new THREE.Mesh(new THREE.ConeGeometry(.18,.38,7),glow);tip.rotation.x=-Math.PI/2;tip.position.set(0,.48,-width*.88);group.add(tip);}
  if(weapon.key==='LASER'){const orb=new THREE.Mesh(new THREE.SphereGeometry(.3,12,10),glow);orb.position.y=.64;group.add(orb);const ring=new THREE.Mesh(new THREE.TorusGeometry(.43,.045,7,16),glow);ring.rotation.x=Math.PI/2;ring.position.y=.64;group.add(ring);}
}
