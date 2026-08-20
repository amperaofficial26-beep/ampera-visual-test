import * as THREE from 'three';

export class Player {
  constructor(scene){
    this.group=new THREE.Group();this.group.position.set(0,.05,2.8);this.speed=4.4;
    const cloth=new THREE.MeshStandardMaterial({color:0x4878b8,roughness:.72});const skin=new THREE.MeshStandardMaterial({color:0xdca37f,roughness:.8});const leather=new THREE.MeshStandardMaterial({color:0x563a2b,roughness:.84});
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.52,5,10),cloth);body.position.y=.86;body.castShadow=true;this.group.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),skin);head.position.y=1.52;head.castShadow=true;this.group.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.255,12,8,0,Math.PI*2,0,Math.PI*.5),new THREE.MeshStandardMaterial({color:0x322722,roughness:.9}));hair.position.y=1.59;this.group.add(hair);
    for(const x of[-.13,.13]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.5,7),leather);leg.position.set(x,.32,0);leg.castShadow=true;this.group.add(leg);}
    const pack=new THREE.Mesh(new THREE.BoxGeometry(.34,.38,.15),leather);pack.position.set(0,.95,.26);this.group.add(pack);
    scene.add(this.group);
  }
  update(dt,keys,camera){
    const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();
    const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).normalize();
    const move=new THREE.Vector3();if(keys.KeyW||keys.ArrowUp)move.add(forward);if(keys.KeyS||keys.ArrowDown)move.sub(forward);if(keys.KeyD||keys.ArrowRight)move.add(right);if(keys.KeyA||keys.ArrowLeft)move.sub(right);
    if(move.lengthSq()>0){move.normalize();this.group.position.addScaledVector(move,this.speed*dt);this.group.rotation.y=Math.atan2(move.x,move.z);}
    this.group.position.x=THREE.MathUtils.clamp(this.group.position.x,-16,16);this.group.position.z=THREE.MathUtils.clamp(this.group.position.z,-25,12);
  }
}
