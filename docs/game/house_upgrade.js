import * as THREE from 'three';

// Menambahkan lantai kedua pada bangunan GLB berbentuk kotak.
export function addSecondFloor(scene, model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const width = Math.max(size.x, size.z) * .82;
  const depth = Math.min(size.x, size.z) * .88;
  const floorHeight = 2.15;
  const group = new THREE.Group();
  group.name = `second_floor_${model.name}`;
  group.position.set(center.x, box.max.y, center.z);
  group.rotation.y = model.rotation.y;

  const plaster = new THREE.MeshStandardMaterial({ color:0xdfd1b3, roughness:.9 });
  const wood = new THREE.MeshStandardMaterial({ color:0x38261c, roughness:.82 });
  const roof = new THREE.MeshStandardMaterial({ color:0xa84d35, roughness:.78 });
  const glass = new THREE.MeshStandardMaterial({ color:0x7bb8ca, roughness:.22, metalness:.08, emissive:0x173548, emissiveIntensity:.2 });

  // Lantai dua lebih kecil dari lantai batu bawah: menghasilkan overhang medieval yang jelas.
  const walls = part(new THREE.BoxGeometry(width, floorHeight, depth), plaster, 0, floorHeight/2, 0);
  group.add(walls);
  const ledge = part(new THREE.BoxGeometry(width+0.18,.14,depth+0.18), wood,0,.06,0);group.add(ledge);

  // Rangka kayu depan: garis vertikal, horizontal dan pola silang Tudor.
  const front = -depth/2-.055;
  for(const x of[-width*.38,0,width*.38])group.add(part(new THREE.BoxGeometry(.12,floorHeight,.1),wood,x,floorHeight/2,front));
  for(const y of[.08,floorHeight*.52,floorHeight-.08])group.add(part(new THREE.BoxGeometry(width+.05,.11,.1),wood,0,y,front));
  for(const sign of[-1,1]){const brace=part(new THREE.BoxGeometry(.1,floorHeight*.92,.1),wood,sign*width*.19,floorHeight/2,front-.02);brace.rotation.z=sign*.68;group.add(brace);}

  // Dua jendela dengan frame kayu.
  for(const x of[-width*.24,width*.24]){
    const frame=part(new THREE.BoxGeometry(.48,.62,.08),wood,x,floorHeight*.62,front-.02);group.add(frame);
    const window=new THREE.Mesh(new THREE.PlaneGeometry(.35,.47),glass);window.position.set(x,floorHeight*.62,front-.075);group.add(window);
  }

  // Balkon depan kecil dengan pagar.
  const balcony=part(new THREE.BoxGeometry(width*.55,.12,.55),wood,0,floorHeight*.32,-depth/2-.3);group.add(balcony);
  for(const x of[-width*.24,width*.24])group.add(part(new THREE.BoxGeometry(.06,.38,.06),wood,x,floorHeight*.5,-depth/2-.52));
  group.add(part(new THREE.BoxGeometry(width*.55,.06,.06),wood,0,floorHeight*.68,-depth/2-.52));

  // Atap pelana sederhana di atas lantai kedua.
  const roofMesh=new THREE.Mesh(gableRoof(width+0.45,depth+0.48,floorHeight-.02,floorHeight+1.15),roof);
  roofMesh.castShadow=roofMesh.receiveShadow=true;group.add(roofMesh);
  const chimney=part(new THREE.BoxGeometry(.28,.85,.28),new THREE.MeshStandardMaterial({color:0x6d6a63,roughness:.9}),width*.25,floorHeight+1.0,.25);group.add(chimney);
  scene.add(group);
}
function part(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;return m;}
function gableRoof(width,depth,eaveY,ridgeY){
  const hw=width/2,hd=depth/2;
  const vertices=new Float32Array([-hw,eaveY,-hd,hw,eaveY,-hd,0,ridgeY,-hd,-hw,eaveY,hd,hw,eaveY,hd,0,ridgeY,hd]);
  const indices=[0,1,2,3,5,4,0,3,4,0,4,1,1,4,5,1,5,2,2,5,3,2,3,0];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
