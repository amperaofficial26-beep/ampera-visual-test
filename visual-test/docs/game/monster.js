import * as THREE from 'three';

export class ForestMonster {
  constructor(scene){
    this.group=new THREE.Group();this.group.position.set(8,.05,-2.5);this.time=0;
    const fur=new THREE.MeshStandardMaterial({color:0x314e3b,roughness:.82});const horn=new THREE.MeshStandardMaterial({color:0xc4b58b,roughness:.9});const eyeMat=new THREE.MeshBasicMaterial({color:0xffcf63});
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.52,.7,5,10),fur);body.position.y=.82;body.castShadow=true;this.group.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.46,12,10),fur);head.position.set(0,1.43,-.08);head.castShadow=true;this.group.add(head);
    for(const x of[-.27,.27]){const h=new THREE.Mesh(new THREE.ConeGeometry(.1,.55,6),horn);h.position.set(x,1.82,-.05);h.rotation.z=x>0?.45:-.45;this.group.add(h);const eye=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),eyeMat);eye.position.set(x*.65,1.47,-.43);this.group.add(eye);}
    for(const x of[-.28,.28]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.11,.14,.54,7),fur);leg.position.set(x,.29,.08);leg.castShadow=true;this.group.add(leg);}
    const glow=new THREE.PointLight(0x94e371,.8,3);glow.position.y=1.45;this.group.add(glow);scene.add(this.group);
  }
  update(dt,player){this.time+=dt;this.group.position.y=.05+Math.sin(this.time*2)*.035;const direction=player.group.position.clone().sub(this.group.position);direction.y=0;if(direction.length()<5)this.group.lookAt(player.group.position.x,this.group.position.y,player.group.position.z);}
}
