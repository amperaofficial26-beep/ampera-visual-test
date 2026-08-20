import * as THREE from 'three';

// Detail dinding khusus rumah Tudor: rangka kayu, pola X/V, plaster lapuk dan retakan.
export function addTudorWallDetails(group, { width, depth, lowerHeight, upperHeight, woodMaterial }) {
  const front = -depth / 2 - 0.074;
  const back = depth / 2 + 0.074;
  const baseY = lowerHeight;
  const beamDepth = .115;

  // FRAME DEPAN: garis horizontal dan vertikal.
  for (const y of [baseY + .07, baseY + upperHeight * .48, baseY + upperHeight - .07]) {
    group.add(beam(width + .08, .12, beamDepth, 0, y, front, woodMaterial));
  }
  for (const x of [-width * .43, -width * .145, width * .145, width * .43]) {
    group.add(beam(.12, upperHeight, beamDepth, x, baseY + upperHeight / 2, front, woodMaterial));
  }

  // Pola X besar pada dua panel utama, ciri khas half-timbered Tudor.
  addXBrace(group, -width * .285, baseY + upperHeight / 2, front - .018, upperHeight * .94, woodMaterial);
  addXBrace(group, width * .285, baseY + upperHeight / 2, front - .018, upperHeight * .94, woodMaterial);

  // FRAME BELAKANG: lebih sederhana tetapi tetap membuat rumah bagus dari semua sisi.
  for (const y of [baseY + .08, baseY + upperHeight - .08]) {
    group.add(beam(width + .04, .1, .09, 0, y, back, woodMaterial));
  }
  for (const x of [-width * .4, 0, width * .4]) {
    group.add(beam(.1, upperHeight, .09, x, baseY + upperHeight / 2, back, woodMaterial));
  }

  // Balok sisi kiri dan kanan dengan pola V agar facade tidak flat saat pemain mengitari rumah.
  for (const side of [-1, 1]) {
    const sideX = side * (width / 2 + .065);
    group.add(beam(.1, upperHeight, .1, sideX, baseY + upperHeight / 2, 0, woodMaterial));
    addSideBrace(group, sideX, baseY + upperHeight * .54, -depth * .22, upperHeight * .85, woodMaterial, side);
    addSideBrace(group, sideX, baseY + upperHeight * .54, depth * .22, upperHeight * .85, woodMaterial, -side);
  }

  addWeathering(group, width, depth, lowerHeight, upperHeight);
}

function beam(w, h, d, x, y, z, material) {
  const part = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  part.position.set(x, y, z);
  part.castShadow = part.receiveShadow = true;
  return part;
}
function addXBrace(group, x, y, z, height, material) {
  for (const sign of [-1, 1]) {
    const brace = beam(.095, height, .105, x, y, z, material);
    brace.rotation.z = sign * .64;
    group.add(brace);
  }
}
function addSideBrace(group, x, y, z, height, material, direction) {
  const brace = beam(.105, height, .09, x, y, z, material);
  brace.rotation.z = direction * .62;
  brace.rotation.y = Math.PI / 2;
  group.add(brace);
}
function addWeathering(group, width, depth, lowerHeight, upperHeight) {
  // Noda plaster: plane transparan, sangat tipis, agar dinding terlihat tua dan tidak flat.
  const stainMat = new THREE.MeshBasicMaterial({ color: 0x8d7c62, transparent: true, opacity: .14, depthWrite: false });
  const crackMat = new THREE.MeshBasicMaterial({ color: 0x5b5044, transparent: true, opacity: .32, depthWrite: false });
  const front = -depth / 2 - .081;
  const stains = [[-.84,lowerHeight+.42,.24,.16],[.69,lowerHeight+1.2,.18,.28],[-.15,lowerHeight+1.48,.22,.12]];
  for (const [x,y,w,h] of stains) {
    const stain = new THREE.Mesh(new THREE.PlaneGeometry(w,h), stainMat);
    stain.position.set(x,y,front); group.add(stain);
  }
  // Retakan kecil pada plaster, hanya sebagai detail visual ringan.
  for (const [x,y] of [[-.58,lowerHeight+1.02],[.58,lowerHeight+.68]]) {
    const crack = new THREE.Mesh(new THREE.PlaneGeometry(.022,.32), crackMat);
    crack.position.set(x,y,front-.003); crack.rotation.z = x < 0 ? .34 : -.28; group.add(crack);
  }
}
