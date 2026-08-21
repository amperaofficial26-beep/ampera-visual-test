import * as THREE from 'three';

// Jalan naik perlahan menuju hill/menara pada ujung desa.
export function roadHeight(z){return THREE.MathUtils.clamp((-z-3)*.16,0,3.6);}
export function terrainHeight(x,z){
  const roadInfluence=Math.exp(-(x*x)/13);
  const rolling=Math.sin(x*.34)*.34+Math.cos(z*.27)*.25+Math.sin((x+z)*.55)*.12;
  const smallDetail=Math.sin(x*1.3+z*.8)*.05;
  // Plateau datar di bawah Bell Tower. Bagian tengah rata, tepinya turun lembut ke tanjakan jalan.
  const distanceFromTower=Math.sqrt((x*x)/28+((z+34)*(z+34))/22);
  const plateau=2.15*(1-THREE.MathUtils.smoothstep(distanceFromTower,2.4,6.5));
  // Di tengah jalan tanah mengikuti elevasi jalan; pinggir desa tetap memiliki bukit kecil organik.
  return roadHeight(z)*roadInfluence+plateau+(rolling+smallDetail)*(1-roadInfluence*.88);
}
