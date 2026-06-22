import { useMemo, useEffect } from "react";
import * as THREE from "three";
import type { HouseAnswers } from "@/types";

type Opening = { cx: number; cy: number; ow: number; oh: number; type?: "door" | "win" };
type Mat = { color: string; roughness: number; metalness: number };

const SIZE: Record<string, { w:number; d:number; fh:number }> = {
  tiny:    { w:9,   d:7,   fh:3.0 },
  compact: { w:11,  d:8,   fh:3.1 },
  medium:  { w:13,  d:9.5, fh:3.2 },
  large:   { w:16,  d:11,  fh:3.3 },
  villa:   { w:20,  d:14,  fh:3.4 },
};

const CMAP: Record<string,string> = {
  white:"#f0ede8", gray:"#8e9098", black:"#2a2e35", beige:"#c9aa80", sand:"#d4b87a",
  graphite:"#4a5060", wood_white:"#c8a070", stone_gray:"#919090", brown:"#8a6040", combo:"#9898a0",
};

const SM: Record<string,{ r:number; m:number; roof:string; frame:string; belt:string; clad:string }> = {
  minimal:       { r:.36, m:.03, roof:"#1a1e24", frame:"#101418", belt:"#eaeae6", clad:"#6a8a90" },
  modern:        { r:.38, m:.06, roof:"#181c24", frame:"#121620", belt:"#e6e4e0", clad:"#7a5c38" },
  hitech:        { r:.20, m:.25, roof:"#080c18", frame:"#060a14", belt:"#242c3e", clad:"#18202e" },
  scandinavian:  { r:.68, m:.01, roof:"#405060", frame:"#5a4030", belt:"#e8e0d4", clad:"#a07850" },
  classic:       { r:.60, m:.01, roof:"#8a7060", frame:"#60503a", belt:"#e8dcc8", clad:"#c0a878" },
  chalet:        { r:.82, m:.01, roof:"#2a1a08", frame:"#40280a", belt:"#d0a868", clad:"#805828" },
  japanese:      { r:.62, m:.01, roof:"#181210", frame:"#2a1a08", belt:"#e0d8c4", clad:"#c8a060" },
  mediterranean: { r:.70, m:.01, roof:"#c84820", frame:"#8a5a30", belt:"#f0e0c0", clad:"#d09060" },
  loft:          { r:.70, m:.09, roof:"#141820", frame:"#161a20", belt:"#545250", clad:"#3c3838" },
  eco:           { r:.74, m:.01, roof:"#385028", frame:"#384820", belt:"#c8d8a8", clad:"#608040" },
};

// ── ProceduralWall ───────────────────────────────────────
function Wall({ w, h, t, ops, mat }: { w:number; h:number; t:number; ops:Opening[]; mat:Mat }) {
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-w/2,0); sh.lineTo(w/2,0); sh.lineTo(w/2,h); sh.lineTo(-w/2,h); sh.closePath();
    for (const o of ops) {
      const hole = new THREE.Path();
      const hw2=o.ow/2+.03, hh2=o.oh/2+.03;
      hole.moveTo(o.cx-hw2,o.cy-hh2); hole.lineTo(o.cx+hw2,o.cy-hh2);
      hole.lineTo(o.cx+hw2,o.cy+hh2); hole.lineTo(o.cx-hw2,o.cy+hh2); hole.closePath();
      sh.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth:t, bevelEnabled:false });
    g.translate(0,0,-t/2); return g;
  }, [w,h,t, JSON.stringify(ops)]);
  useEffect(() => () => { geo.dispose(); }, [geo]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color={mat.color} roughness={mat.roughness} metalness={mat.metalness} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Window fill ──────────────────────────────────────────
function WinFill({ cx,cy,ow,oh,t,fc,p=2 }: { cx:number;cy:number;ow:number;oh:number;t:number;fc:string;p?:number }) {
  return (
    <group position={[cx,cy,0]}>
      <mesh castShadow><boxGeometry args={[ow+.16,oh+.16,t+.04]} /><meshStandardMaterial color={fc} roughness={.25} metalness={.72} /></mesh>
      <mesh><boxGeometry args={[ow-.02,oh-.02,.06]} /><meshPhysicalMaterial color="#b8d8ec" roughness={.02} metalness={.0} transmission={.74} transparent thickness={.15} ior={1.5} envMapIntensity={4} /></mesh>
      {Array.from({length:p-1},(_,i)=>(
        <mesh key={i} castShadow position={[-ow/2+(ow/p)*(i+1),0,.05]}>
          <boxGeometry args={[.06,oh-.06,.09]} /><meshStandardMaterial color={fc} roughness={.25} metalness={.72} />
        </mesh>
      ))}
      <mesh castShadow position={[0,0,.05]}><boxGeometry args={[ow-.06,.05,.07]} /><meshStandardMaterial color={fc} roughness={.25} metalness={.72} /></mesh>
      {/* Sill */}
      <mesh castShadow position={[0,-oh/2-.07,.1]}><boxGeometry args={[ow+.35,.09,t+.26]} /><meshStandardMaterial color={fc} roughness={.45} metalness={.42} /></mesh>
    </group>
  );
}

// ── Door fill ────────────────────────────────────────────
function DoorFill({ cx,cy,ow,oh,t,fc }: { cx:number;cy:number;ow:number;oh:number;t:number;fc:string }) {
  return (
    <group position={[cx,cy,0]}>
      <mesh castShadow><boxGeometry args={[ow+.18,oh+.16,t+.04]} /><meshStandardMaterial color={fc} roughness={.42} metalness={.38} /></mesh>
      <mesh castShadow position={[0,0,.05]}><boxGeometry args={[ow-.08,oh-.08,.07]} /><meshStandardMaterial color="#3a2810" roughness={.62} metalness={.04} /></mesh>
      <mesh position={[0,oh*.18,.11]}><boxGeometry args={[ow*.52,oh*.3,.04]} /><meshStandardMaterial color="#a8d8ec" transparent opacity={.52} roughness={.03} /></mesh>
      <mesh castShadow position={[ow*.28,0,.14]}><cylinderGeometry args={[.03,.03,.16,6]} /><meshStandardMaterial color="#c8b060" roughness={.16} metalness={.9} /></mesh>
      {[0,1].map(i=>(
        <mesh key={i} receiveShadow position={[0,-oh/2-.09-i*.13,t/2+.18+i*.22]}>
          <boxGeometry args={[ow+.52+i*.35,.14,.46+i*.14]} /><meshStandardMaterial color={fc} roughness={.68} metalness={.1} />
        </mesh>
      ))}
    </group>
  );
}

// ── Wall group ───────────────────────────────────────────
function WallGroup({ ww,wh,wt,ops,mat,fc, pos,rot }: {
  ww:number;wh:number;wt:number;ops:Opening[];mat:Mat;fc:string;
  pos:[number,number,number];rot:[number,number,number];
}) {
  return (
    <group position={pos} rotation={rot}>
      <Wall w={ww} h={wh} t={wt} ops={ops} mat={mat} />
      {ops.filter(o=>o.type!=="door").map((o,i)=><WinFill key={i} cx={o.cx} cy={o.cy} ow={o.ow} oh={o.oh} t={wt} fc={fc} />)}
      {ops.filter(o=>o.type==="door").map((o,i)=><DoorFill key={i} cx={o.cx} cy={o.cy} ow={o.ow} oh={o.oh} t={wt} fc={fc} />)}
    </group>
  );
}

function makeOps(ww:number,fh:number,wW:number,wH:number,cnt:number,door:boolean):Opening[] {
  const ops:Opening[]=[];
  const sp=ww/(cnt+1), cy=fh*.50;
  if(door) ops.push({cx:0,cy:1.3,ow:1.06,oh:2.58,type:"door"});
  for(let i=0;i<cnt;i++){
    const cx=-ww/2+sp*(i+1);
    if(door&&Math.abs(cx)<1.65) continue;
    ops.push({cx,cy,ow:wW,oh:wH,type:"win"});
  }
  return ops;
}

// ── Belt course ──────────────────────────────────────────
function BeltCourse({ w,d,y,color }:{w:number;d:number;y:number;color:string}) {
  const t=.28, h=.18, ext=.08;
  return (
    <group position={[0,y,0]}>
      {[[0,h/2,d/2+t/2,w+ext*2,h,t],[0,h/2,-d/2-t/2,w+ext*2,h,t],
        [-w/2-t/2,h/2,0,t,h,d],[w/2+t/2,h/2,0,t,h,d]
      ].map(([px,py,pz,gw,gh,gd],i)=>(
        <mesh key={i} castShadow position={[px,py,pz]}>
          <boxGeometry args={[gw,gh,gd]} /><meshStandardMaterial color={color} roughness={.38} metalness={.12} />
        </mesh>
      ))}
    </group>
  );
}

// ── Entry portico ────────────────────────────────────────
function EntryPortico({ baseD, fh, wallColor, fc }:{baseD:number;fh:number;wallColor:string;fc:string}) {
  const pw=4.8, pd=2.4, ph=fh;
  return (
    <group position={[0,0,baseD/2]}>
      {/* Overhang slab */}
      <mesh castShadow receiveShadow position={[0,ph+.15,pd/2+.1]}>
        <boxGeometry args={[pw+.5,.24,pd+.6]} />
        <meshStandardMaterial color={wallColor} roughness={.42} metalness={.08} />
      </mesh>
      {/* Soffit */}
      <mesh position={[0,ph-.02,pd/2+.1]}>
        <boxGeometry args={[pw+.3,.06,pd+.4]} />
        <meshStandardMaterial color="#e8e4dc" roughness={.85} />
      </mesh>
      {/* Columns */}
      {[-pw/2+.35, pw/2-.35].map((cx,i)=>(
        <group key={i} position={[cx,0,pd]}>
          <mesh castShadow position={[0,.12,0]}><boxGeometry args={[.38,.24,.38]} /><meshStandardMaterial color={fc} roughness={.52} /></mesh>
          <mesh castShadow position={[0,ph/2,0]}><cylinderGeometry args={[.13,.16,ph,8]} /><meshStandardMaterial color={fc} roughness={.42} metalness={.05} /></mesh>
          <mesh castShadow position={[0,ph+.05,0]}><boxGeometry args={[.32,.22,.32]} /><meshStandardMaterial color={fc} roughness={.42} /></mesh>
        </group>
      ))}
      {/* Recessed ceiling light */}
      <mesh position={[0,ph-.04,pd*.35]}>
        <boxGeometry args={[2.,.08,.35]} />
        <meshStandardMaterial color="#fff8e0" emissive="#fff8d0" emissiveIntensity={.8} roughness={.2} />
      </mesh>
      <pointLight position={[0,ph-.06,pd*.35]} intensity={2.2} color="#fff8c8" distance={6} />
    </group>
  );
}

// ── Facade cladding ──────────────────────────────────────
function FacadeCladding({ baseW,fh,yBase,z,color }:{baseW:number;fh:number;yBase:number;z:number;color:string}) {
  const pw=Math.min(baseW*.38,5.5);
  const n=Math.round(pw/.38);
  const sw=pw/n;
  const c2 = useMemo(()=>{
    const c=new THREE.Color(color); c.multiplyScalar(.82); return `#${c.getHexString()}`;
  },[color]);
  return (
    <group position={[0,yBase,z+.14]}>
      {Array.from({length:n},(_,i)=>(
        <mesh key={i} castShadow position={[-pw/2+sw*(i+.5),fh/2,0]}>
          <boxGeometry args={[sw-.02,fh-.06,.07]} />
          <meshStandardMaterial color={i%2===0?color:c2} roughness={.76} metalness={.02} />
        </mesh>
      ))}
    </group>
  );
}

// ── Roofs ────────────────────────────────────────────────
function FlatRoof({w,d,h,color}:{w:number;d:number;h:number;color:string}) {
  return (
    <group position={[0,h,0]}>
      <mesh castShadow receiveShadow><boxGeometry args={[w+.55,.3,d+.55]} /><meshStandardMaterial color={color} roughness={.55} metalness={.1} /></mesh>
      {[[0,.38,(d+.56)/2,w+.9,.75,.16],[0,.38,-(d+.56)/2,w+.9,.75,.16],[-(w+.56)/2,.38,0,.16,.75,d+.9],[(w+.56)/2,.38,0,.16,.75,d+.9]].map(([px,py,pz,gw,gh,gd],i)=>(
        <mesh key={i} castShadow position={[px,py,pz]}><boxGeometry args={[gw,gh,gd]} /><meshStandardMaterial color={color} roughness={.55} metalness={.1} /></mesh>
      ))}
    </group>
  );
}

function GabledRoof({w,d,h,rh,color}:{w:number;d:number;h:number;rh:number;color:string}) {
  const geo=useMemo(()=>{
    const sh=new THREE.Shape();
    sh.moveTo(-w/2-.48,0); sh.lineTo(w/2+.48,0); sh.lineTo(0,rh); sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:d+.96,bevelEnabled:false}); g.translate(0,0,-(d+.96)/2); return g;
  },[w,d,rh]);
  useEffect(()=>()=>{geo.dispose()},[geo]);
  return (
    <group position={[0,h,0]}>
      <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.72} metalness={.05} side={THREE.DoubleSide} /></mesh>
      <mesh castShadow position={[0,rh+.07,0]}><boxGeometry args={[.22,.15,d+1.12]} /><meshStandardMaterial color={color} roughness={.6} metalness={.08} /></mesh>
      <mesh receiveShadow position={[0,-.1,0]}><boxGeometry args={[w+1.0,.14,d+1.0]} /><meshStandardMaterial color="#e8e0d0" roughness={.8} /></mesh>
    </group>
  );
}

function HippedRoof({w,d,h,rh,color}:{w:number;d:number;h:number;rh:number;color:string}) {
  const hw=w/2+.48, hd=d/2+.48, rw=w*.44;
  const geo=useMemo(()=>{
    const v=new Float32Array([-rw/2,rh,0,rw/2,rh,0,hw,0,hd,-hw,0,hd, rw/2,rh,0,-rw/2,rh,0,-hw,0,-hd,hw,0,-hd, -rw/2,rh,0,-hw,0,hd,-hw,0,-hd, rw/2,rh,0,hw,0,-hd,hw,0,hd]);
    const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(v,3));
    g.setIndex([0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,11,12,13]); g.computeVertexNormals(); return g;
  },[w,d,rh]);
  useEffect(()=>()=>{geo.dispose()},[geo]);
  return (
    <group position={[0,h,0]}>
      <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.72} metalness={.04} side={THREE.DoubleSide} /></mesh>
      <mesh receiveShadow position={[0,-.1,0]}><boxGeometry args={[w+1.0,.14,d+1.0]} /><meshStandardMaterial color="#e8e0d0" roughness={.8} /></mesh>
    </group>
  );
}

function SlantedRoof({w,d,h,color}:{w:number;d:number;h:number;color:string}) {
  const rh=2.2, ang=Math.atan2(rh,d), len=Math.sqrt(d*d+rh*rh);
  return (
    <group position={[0,h,0]}>
      <mesh castShadow receiveShadow rotation={[ang,0,0]} position={[0,rh/2,0]}>
        <boxGeometry args={[w+.6,.2,len+.6]} /><meshStandardMaterial color={color} roughness={.6} metalness={.08} />
      </mesh>
    </group>
  );
}

function GreenRoof({w,d,h,color}:{w:number;d:number;h:number;color:string}) {
  return (
    <group position={[0,h,0]}>
      <mesh castShadow receiveShadow><boxGeometry args={[w+.55,.3,d+.55]} /><meshStandardMaterial color={color} roughness={.55} /></mesh>
      <mesh receiveShadow position={[0,.24,0]}><boxGeometry args={[w+.2,.2,d+.2]} /><meshStandardMaterial color="#3a7a3a" roughness={.95} /></mesh>
      {Array.from({length:14},(_,i)=>(
        <mesh key={i} castShadow position={[((i%5)-2)*(w/5),(Math.floor(i/5)-1.2)*(d/3)+.42,0]}>
          <sphereGeometry args={[.28+(i%3)*.05,5,4]} /><meshStandardMaterial color={i%2===0?"#2d6a2d":"#3d8a3d"} roughness={.9} />
        </mesh>
      ))}
    </group>
  );
}

function RoofTerrace({w,d,h,color}:{w:number;d:number;h:number;color:string}) {
  return (
    <group position={[0,h,0]}>
      <mesh castShadow receiveShadow><boxGeometry args={[w+.55,.3,d+.55]} /><meshStandardMaterial color={color} roughness={.55} /></mesh>
      {[[0,.55,(d+.56)/2,w+.64,.06,.06],[0,.55,-(d+.56)/2,w+.64,.06,.06],[-(w+.56)/2,.55,0,.06,.06,d+.64],[(w+.56)/2,.55,0,.06,.06,d+.64]].map(([px,py,pz,gw,gh,gd],i)=>(
        <mesh key={i} castShadow position={[px,py,pz]}><boxGeometry args={[gw,gh,gd]} /><meshStandardMaterial color="#888" roughness={.28} metalness={.72} /></mesh>
      ))}
      {/* Roof lounge */}
      <mesh castShadow position={[0,.28,d*.15]}><boxGeometry args={[2.,.06,.8]} /><meshStandardMaterial color="#c8b898" roughness={.7} /></mesh>
      <mesh castShadow position={[0,.48,d*.15-.38]} rotation={[.5,0,0]}><boxGeometry args={[1.9,.06,.7]} /><meshStandardMaterial color="#c8b898" roughness={.7} /></mesh>
    </group>
  );
}

// ── Foundation ───────────────────────────────────────────
function Foundation({w,d,color}:{w:number;d:number;color:string}) {
  return (
    <mesh receiveShadow castShadow position={[0,-.22,0]}>
      <boxGeometry args={[w+.45,.44,d+.45]} /><meshStandardMaterial color={color} roughness={.75} metalness={.04} />
    </mesh>
  );
}

// ── Balcony ──────────────────────────────────────────────
function Balcony({x,y,z,w,d,fc}:{x:number;y:number;z:number;w:number;d:number;fc:string}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow><boxGeometry args={[w,.13,d]} /><meshStandardMaterial color="#d0cec6" roughness={.58} metalness={.1} /></mesh>
      {[[0,.52,d/2,w,.05,.05],[-w/2,.52,0,.05,.05,d],[w/2,.52,0,.05,.05,d]].map(([px,py,pz,rw,rh,rd],i)=>(
        <mesh key={i} castShadow position={[px,py,pz]}><boxGeometry args={[rw,rh,rd]} /><meshStandardMaterial color={fc} roughness={.28} metalness={.78} /></mesh>
      ))}
      {Array.from({length:Math.floor(w/.6)},(_,i)=>(
        <mesh key={i} castShadow position={[-w/2+.3+i*.6,.27,d/2]}>
          <boxGeometry args={[.04,.54,.04]} /><meshStandardMaterial color={fc} roughness={.28} metalness={.78} />
        </mesh>
      ))}
    </group>
  );
}

// ── Columns ──────────────────────────────────────────────
function Columns({baseW,cnt,color}:{baseW:number;cnt:number;color:string}) {
  return (
    <group>
      {Array.from({length:cnt},(_,i)=>{
        const cx=-baseW/2+1.2+(i*(baseW-2.4))/Math.max(cnt-1,1);
        return (
          <group key={i} position={[cx,0,0]}>
            <mesh castShadow position={[0,.12,0]}><boxGeometry args={[.52,.24,.52]} /><meshStandardMaterial color={color} roughness={.55} /></mesh>
            <mesh castShadow position={[0,2.1,0]}><cylinderGeometry args={[.19,.23,4.2,8]} /><meshStandardMaterial color={color} roughness={.52} /></mesh>
            <mesh castShadow position={[0,4.3,0]}><boxGeometry args={[.52,.24,.52]} /><meshStandardMaterial color={color} roughness={.52} /></mesh>
          </group>
        );
      })}
    </group>
  );
}

// ── Trees ────────────────────────────────────────────────
function RoundTree({x,z,s=1}:{x:number;z:number;s?:number}) {
  return (
    <group position={[x,0,z]} scale={[s,s,s]}>
      <mesh castShadow receiveShadow position={[0,1.15,0]}><cylinderGeometry args={[.12,.17,2.3,7]} /><meshStandardMaterial color="#5a3a18" roughness={.88} /></mesh>
      {([
        [0,    2.8, 0,    2.1, .32, "#2a6820"],
        [.15,  3.5, .1,   1.78,.28, "#306828"],
        [-.12, 4.1, .06,  1.48,.24, "#357030"],
        [.08,  4.6,-.09,  1.18,.20, "#38742e"],
        [0,    5.0, 0,    .82, .17, "#3a7030"],
        [0,    5.3, 0,    .48, .14, "#3a7030"],
      ] as [number,number,number,number,number,string][]).map(([dx,dy,dz,r,h,c],i)=>(
        <mesh key={i} castShadow position={[dx,dy,dz]}>
          <cylinderGeometry args={[r,r*1.1,h,9]} />
          <meshStandardMaterial color={c} roughness={.9} />
        </mesh>
      ))}
    </group>
  );
}

function CypressTree({x,z,s=1}:{x:number;z:number;s?:number}) {
  return (
    <group position={[x,0,z]} scale={[s,s,s]}>
      <mesh castShadow receiveShadow position={[0,1.1,0]}><cylinderGeometry args={[.07,.12,2.2,6]} /><meshStandardMaterial color="#4a3010" roughness={.88} /></mesh>
      {([
        [0, 2.5, 0,   .42, .58, "#1e5018"],
        [0, 3.1, 0,   .38, .58, "#1e5018"],
        [0, 3.7, 0,   .33, .54, "#215518"],
        [0, 4.3, 0,   .28, .52, "#245a1a"],
        [0, 4.8, 0,   .23, .48, "#245a1a"],
        [0, 5.3, 0,   .18, .44, "#276020"],
        [0, 5.75,0,   .13, .4,  "#276020"],
        [0, 6.15,0,   .09, .38, "#2a6022"],
        [0, 6.5, 0,   .05, .28, "#2a6022"],
      ] as [number,number,number,number,number,string][]).map(([dx,dy,dz,r,h,c],i)=>(
        <mesh key={i} castShadow position={[dx,dy,dz]}>
          <cylinderGeometry args={[r*.85,r,h,8]} />
          <meshStandardMaterial color={c} roughness={.9} />
        </mesh>
      ))}
    </group>
  );
}

function Bush({x,z,s=1}:{x:number;z:number;s?:number}) {
  return (
    <group position={[x,0,z]} scale={[s,s,s]}>
      <mesh castShadow position={[0,.50,0]}><sphereGeometry args={[.54,8,6]} /><meshStandardMaterial color="#3a7a28" roughness={.92} /></mesh>
      <mesh castShadow position={[.34,.38,.08]}><sphereGeometry args={[.36,7,5]} /><meshStandardMaterial color="#2d6a22" roughness={.9} /></mesh>
      <mesh castShadow position={[-.30,.36,.22]}><sphereGeometry args={[.30,7,5]} /><meshStandardMaterial color="#357030" roughness={.92} /></mesh>
      <mesh castShadow position={[.08,.30,-.28]}><sphereGeometry args={[.24,6,4]} /><meshStandardMaterial color="#2a6020" roughness={.9} /></mesh>
    </group>
  );
}

// ── Lounge chair ─────────────────────────────────────────
function LoungeChair({x,y,z,rot=0,color="#e8e4d8"}:{x:number;y:number;z:number;rot?:number;color?:string}) {
  return (
    <group position={[x,y,z]} rotation={[0,rot,0]}>
      <mesh castShadow receiveShadow position={[0,.24,0]}><boxGeometry args={[1.95,.18,.7]} /><meshStandardMaterial color={color} roughness={.72} metalness={.04} /></mesh>
      <mesh castShadow position={[-.65,.52,0]} rotation={[0,0,-.35]}><boxGeometry args={[.72,.16,.66]} /><meshStandardMaterial color={color} roughness={.72} metalness={.04} /></mesh>
      <mesh castShadow position={[.72,.24,0]}><boxGeometry args={[.5,.18,.7]} /><meshStandardMaterial color={color} roughness={.72} /></mesh>
      {[[-.82,0,.34],[.82,0,.34],[-.82,0,-.34],[.82,0,-.34]].map(([lx,ly,lz],i)=>(
        <mesh key={i} castShadow position={[lx,.12,lz]}><boxGeometry args={[.04,.24,.04]} /><meshStandardMaterial color="#c0a870" roughness={.25} metalness={.75} /></mesh>
      ))}
    </group>
  );
}

// ── Luxury car ───────────────────────────────────────────
function LuxuryCar({x,z,rot=0,color="#c8c8cc"}:{x:number;z:number;rot?:number;color?:string}) {
  const glassM = <meshPhysicalMaterial color="#0a1820" roughness={.0} metalness={.05} transmission={.82} transparent thickness={.12} ior={1.5} envMapIntensity={3} />;
  return (
    <group position={[x,0,z]} rotation={[0,rot,0]}>
      {/* Lower body */}
      <mesh castShadow receiveShadow position={[0,.48,0]}><boxGeometry args={[4.92,.68,2.04]} /><meshPhysicalMaterial color={color} roughness={.14} metalness={.88} clearcoat={1} clearcoatRoughness={.08} envMapIntensity={3} /></mesh>
      {/* Cabin */}
      <mesh castShadow position={[.1,.98,0]}><boxGeometry args={[2.55,.58,1.80]} /><meshPhysicalMaterial color={color} roughness={.14} metalness={.88} clearcoat={1} clearcoatRoughness={.08} envMapIntensity={3} /></mesh>
      {/* Hood slope — front */}
      <mesh castShadow position={[1.68,.72,0]} rotation={[0,0,-.28]}><boxGeometry args={[1.38,.08,2.0]} /><meshPhysicalMaterial color={color} roughness={.14} metalness={.88} clearcoat={1} clearcoatRoughness={.08} envMapIntensity={3} /></mesh>
      {/* Trunk slope — rear */}
      <mesh castShadow position={[-1.55,.72,0]} rotation={[0,0,.3]}><boxGeometry args={[1.22,.08,2.0]} /><meshPhysicalMaterial color={color} roughness={.14} metalness={.88} clearcoat={1} clearcoatRoughness={.08} envMapIntensity={3} /></mesh>
      {/* Front windshield */}
      <mesh position={[1.35,.99,0]} rotation={[0,0,-.52]}><boxGeometry args={[.72,.05,1.66]} />{glassM}</mesh>
      {/* Rear windshield */}
      <mesh position={[-1.12,.97,0]} rotation={[0,0,.54]}><boxGeometry args={[.68,.05,1.62]} />{glassM}</mesh>
      {/* Side windows */}
      {([-1,1] as number[]).map(s=>(
        <mesh key={s} position={[.1,.98,s*.91]}><boxGeometry args={[2.4,.48,.04]} />{glassM}</mesh>
      ))}
      {/* Wheels */}
      {([[-1.52,.33,1.04],[-1.52,.33,-1.04],[1.52,.33,1.04],[1.52,.33,-1.04]] as [number,number,number][]).map(([wx,wy,wz],i)=>(
        <group key={i} position={[wx,wy,wz]}>
          {/* Tire */}
          <mesh castShadow rotation={[Math.PI/2,0,0]}>
            <torusGeometry args={[.25,.09,8,20]} />
            <meshStandardMaterial color="#111111" roughness={.88} />
          </mesh>
          {/* Rim disc */}
          <mesh castShadow rotation={[Math.PI/2,0,0]}>
            <cylinderGeometry args={[.19,.19,.12,14]} />
            <meshStandardMaterial color="#c4c8cc" roughness={.12} metalness={.92} envMapIntensity={2} />
          </mesh>
          {/* Spokes */}
          {Array.from({length:5},(_,si)=>(
            <mesh key={si} castShadow rotation={[Math.PI/2,si*Math.PI/2.5,0]}>
              <boxGeometry args={[.05,.36,.04]} /><meshStandardMaterial color="#b8bcbf" roughness={.18} metalness={.9} />
            </mesh>
          ))}
          {/* Hub cap */}
          <mesh rotation={[Math.PI/2,0,0]} position={[0,0,wz>0?.06:-.06]}>
            <cylinderGeometry args={[.055,.055,.04,8]} />
            <meshStandardMaterial color="#e0e0e0" roughness={.08} metalness={.95} />
          </mesh>
        </group>
      ))}
      {/* Headlights */}
      {([-1,1] as number[]).map(s=>(
        <group key={s} position={[2.44,.5,s*.68]}>
          <mesh><boxGeometry args={[.07,.18,.34]} /><meshStandardMaterial color="#e8f0ff" emissive="#a0c4ff" emissiveIntensity={1.8} roughness={.06} /></mesh>
          <pointLight intensity={4} color="#d0e8ff" distance={8} />
        </group>
      ))}
      {/* Tail lights */}
      {([-1,1] as number[]).map(s=>(
        <mesh key={s} position={[-2.45,.52,s*.66]}>
          <boxGeometry args={[.06,.16,.3]} /><meshStandardMaterial color="#ff2020" emissive="#cc1010" emissiveIntensity={1.2} roughness={.1} />
        </mesh>
      ))}
      {/* Front bumper */}
      <mesh castShadow position={[2.44,.28,0]}><boxGeometry args={[.1,.22,1.92]} /><meshStandardMaterial color="#1a1a1e" roughness={.42} metalness={.38} /></mesh>
      {/* Rear bumper */}
      <mesh castShadow position={[-2.44,.28,0]}><boxGeometry args={[.1,.22,1.92]} /><meshStandardMaterial color="#1a1a1e" roughness={.42} metalness={.38} /></mesh>
      {/* Grill */}
      <mesh castShadow position={[2.47,.48,0]}><boxGeometry args={[.06,.28,1.35]} /><meshStandardMaterial color="#0a0a0c" roughness={.55} metalness={.52} /></mesh>
    </group>
  );
}

// ── Outdoor furniture ────────────────────────────────────
function OutdoorDining({x,z}:{x:number;z:number}) {
  return (
    <group position={[x,0,z]}>
      <mesh castShadow receiveShadow position={[0,.78,0]}><cylinderGeometry args={[.65,.65,.06,10]} /><meshStandardMaterial color="#c8b898" roughness={.65} /></mesh>
      {[[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dz],i)=>(
        <group key={i} position={[dx,.0,dz]}>
          <mesh castShadow position={[0,.42,0]}><cylinderGeometry args={[.2,.2,.06,8]} /><meshStandardMaterial color="#d0c8b8" roughness={.7} /></mesh>
          <mesh castShadow position={[0,.72,0]}><boxGeometry args={[.42,.06,.38]} /><meshStandardMaterial color="#d0c8b8" roughness={.7} /></mesh>
        </group>
      ))}
    </group>
  );
}

// ── Garage ───────────────────────────────────────────────
function Garage({x,baseD,fh}:{x:number;baseD:number;fh:number}) {
  const gw=5.5, gd=6.5, gh=fh*1.05;
  return (
    <group position={[x,0,baseD/2+gd/2+.2]}>
      {[[0,gh/2,gd/2,gw,gh,.22],[0,gh/2,-gd/2,gw,gh,.22],[-gw/2,gh/2,0,.22,gh,gd],[gw/2,gh/2,0,.22,gh,gd]].map(([px,py,pz,mw,mh,md],i)=>(
        <mesh key={i} castShadow receiveShadow position={[px,py,pz]}><boxGeometry args={[mw,mh,md]} /><meshStandardMaterial color="#c0bcb4" roughness={.72} /></mesh>
      ))}
      <mesh castShadow position={[0,gh*.38,gd/2+.02]}><boxGeometry args={[gw-.44,gh*.72,.08]} /><meshStandardMaterial color="#303840" roughness={.28} metalness={.52} /></mesh>
      {Array.from({length:5},(_,i)=>(
        <mesh key={i} castShadow position={[0,.28+i*.38,gd/2+.07]}><boxGeometry args={[gw-.5,.05,.04]} /><meshStandardMaterial color="#404850" roughness={.28} metalness={.62} /></mesh>
      ))}
      <mesh castShadow receiveShadow position={[0,gh+.14,0]}><boxGeometry args={[gw+.4,.28,gd+.4]} /><meshStandardMaterial color="#404848" roughness={.55} metalness={.1} /></mesh>
    </group>
  );
}

// ── Pool ─────────────────────────────────────────────────
function Pool({baseD}:{baseD:number}) {
  return (
    <group position={[0,0,-(baseD/2+4.2)]}>
      <mesh receiveShadow position={[0,-.35,0]}><boxGeometry args={[5.6,.7,3.6]} /><meshStandardMaterial color="#3888a8" roughness={.18} /></mesh>
      <mesh position={[0,-.04,0]}><boxGeometry args={[5.25,.08,3.28]} /><meshStandardMaterial color="#40c8f0" transparent opacity={.65} roughness={.04} metalness={.04} envMapIntensity={2} /></mesh>
      <mesh receiveShadow position={[0,-.02,0]}><boxGeometry args={[7.2,.08,5.8]} /><meshStandardMaterial color="#d8d0c0" roughness={.82} /></mesh>
      {/* Pool light underwater */}
      <pointLight position={[0,-.3,0]} intensity={1.8} color="#40c8f8" distance={7} />
    </group>
  );
}

// ── Carport ──────────────────────────────────────────────
function Carport({x,baseD}:{x:number;baseD:number}) {
  const cw=4.5, cd=6, ch=2.55;
  return (
    <group position={[x,0,baseD/2+cd/2+.2]}>
      {[[-cw/2+.1,ch/2,-cd/2+.1],[cw/2-.1,ch/2,-cd/2+.1],[-cw/2+.1,ch/2,cd/2-.1],[cw/2-.1,ch/2,cd/2-.1]].map(([px,py,pz],i)=>(
        <mesh key={i} castShadow position={[px,py,pz]}><cylinderGeometry args={[.08,.08,ch,6]} /><meshStandardMaterial color="#484848" roughness={.4} metalness={.5} /></mesh>
      ))}
      <mesh castShadow position={[0,ch+.07,0]}><boxGeometry args={[cw+.3,.14,cd+.3]} /><meshStandardMaterial color="#606060" roughness={.38} metalness={.32} transparent opacity={.88} /></mesh>
    </group>
  );
}

// ── Street lamp ──────────────────────────────────────────
function StreetLamp({x,z}:{x:number;z:number}) {
  return (
    <group position={[x,0,z]}>
      <mesh castShadow position={[0,2.5,0]}><cylinderGeometry args={[.04,.06,5,5]} /><meshStandardMaterial color="#3a3a40" roughness={.4} metalness={.6} /></mesh>
      <mesh castShadow position={[.22,5,0]}><cylinderGeometry args={[.04,.04,.42,5]} /><meshStandardMaterial color="#3a3a40" roughness={.4} metalness={.6} /></mesh>
      <mesh position={[.42,5,0]}><boxGeometry args={[.26,.19,.19]} /><meshStandardMaterial color="#2a2a28" emissive="#fff8a0" emissiveIntensity={.9} roughness={.28} /></mesh>
      <pointLight position={[.42,4.85,0]} intensity={2} color="#fff4c0" distance={10} />
    </group>
  );
}

// ── Fence ────────────────────────────────────────────────
function Fence({baseW,baseD,color}:{baseW:number;baseD:number;color:string}) {
  const p=4.5, hw=baseW/2+p, hd=baseD/2+p;
  return (
    <group>
      {[[0,.52,hd,hw*2,1.04,.12],[0,.52,-hd,hw*2,1.04,.12],[-hw,.52,0,.12,1.04,hd*2],[hw,.52,0,.12,1.04,hd*2]].map(([px,py,pz,fw,fh,fd],i)=>(
        <mesh key={i} castShadow position={[px,py,pz]}><boxGeometry args={[fw,fh,fd]} /><meshStandardMaterial color={color} roughness={.72} metalness={.05} /></mesh>
      ))}
      <mesh castShadow position={[0,.65,hd-.04]}><boxGeometry args={[1.45,1.28,.09]} /><meshStandardMaterial color="#4a3820" roughness={.6} metalness={.1} /></mesh>
    </group>
  );
}

// ── Path ─────────────────────────────────────────────────
function Path({baseD}:{baseD:number}) {
  return (
    <group>
      {/* Driveway concrete */}
      <mesh receiveShadow position={[0,.01,baseD/2+4.5]}><boxGeometry args={[3.5,.06,9]} /><meshStandardMaterial color="#c8c0b0" roughness={.88} /></mesh>
      {Array.from({length:9},(_,i)=>(
        <mesh key={i} receiveShadow position={[0,.01,baseD/2+1.6+i*.9]}><boxGeometry args={[1.05,.06,.76]} /><meshStandardMaterial color="#d8d0c0" roughness={.85} /></mesh>
      ))}
    </group>
  );
}

// ── BBQ ──────────────────────────────────────────────────
function BBQ({baseW,baseD}:{baseW:number;baseD:number}) {
  return (
    <group position={[baseW/2+2.2,0,baseD/2+2.2]}>
      <mesh castShadow position={[0,.56,0]}><cylinderGeometry args={[.36,.33,1.1,8]} /><meshStandardMaterial color="#2a2a28" roughness={.38} metalness={.52} /></mesh>
      <mesh castShadow position={[0,1.16,0]}><cylinderGeometry args={[.37,.37,.09,8]} /><meshStandardMaterial color="#1a1a18" roughness={.28} metalness={.62} /></mesh>
      <mesh receiveShadow position={[.45,.01,.45]}><boxGeometry args={[3.6,.06,3.6]} /><meshStandardMaterial color="#c0b8a8" roughness={.88} /></mesh>
    </group>
  );
}

// ── Solar panels ─────────────────────────────────────────
function SolarPanels({baseD,totalH}:{baseD:number;totalH:number}) {
  return (
    <group position={[0,totalH+.2,baseD*.18]}>
      {Array.from({length:3},(_,col)=>Array.from({length:2},(_,row)=>(
        <mesh key={`${col}-${row}`} castShadow rotation={[-.32,0,0]} position={[(col-1)*2.2,0,row*1.55-.78]}>
          <boxGeometry args={[1.92,.06,1.08]} /><meshStandardMaterial color="#1a2540" roughness={.18} metalness={.42} envMapIntensity={1.5} />
        </mesh>
      )))}
    </group>
  );
}

// ── Terrace ──────────────────────────────────────────────
function Terrace({baseW,z,fc}:{baseW:number;z:number;fc:string}) {
  const tw=Math.min(baseW*.65,8);
  return (
    <group position={[0,0,z]}>
      <mesh receiveShadow castShadow position={[0,-.05,0]}><boxGeometry args={[tw,.15,2.9]} /><meshStandardMaterial color="#c8b898" roughness={.78} metalness={.04} /></mesh>
      {[[0,.52,1.45,tw,.05,.05],[-tw/2,.52,0,.05,.05,2.9],[tw/2,.52,0,.05,.05,2.9]].map(([px,py,pz,rw,rh,rd],i)=>(
        <mesh key={i} castShadow position={[px,py,pz]}><boxGeometry args={[rw,rh,rd]} /><meshStandardMaterial color={fc} roughness={.28} metalness={.78} /></mesh>
      ))}
    </group>
  );
}

// ── Garden ───────────────────────────────────────────────
function Garden({baseW}:{baseW:number}) {
  return (
    <group>
      {[[-baseW/2-1.6,.02,-1],[baseW/2+1.6,.02,-1]].map(([px,py,pz],i)=>(
        <mesh key={i} receiveShadow position={[px,py,pz]}><boxGeometry args={[1.45,.08,3.1]} /><meshStandardMaterial color="#3a5a1a" roughness={.9} /></mesh>
      ))}
      {Array.from({length:10},(_,i)=>(
        <mesh key={i} castShadow position={[-baseW/2-1.6+(i%2)*(baseW+3.2),.22,-2.3+Math.floor(i/2)*1.4]}>
          <sphereGeometry args={[.18,5,4]} /><meshStandardMaterial color={["#f06080","#f0c030","#80c0f0","#f080a0","#b060e0"][i%5]} emissive={["#c04060","#c09010","#50a0c0","#c06080","#8040b0"][i%5]} emissiveIntensity={.2} roughness={.8} />
        </mesh>
      ))}
    </group>
  );
}

// ── Interior warm glow ───────────────────────────────────
function InteriorGlow({BW,BD,FH,floors}:{BW:number;BD:number;FH:number;floors:number}) {
  return (
    <>
      {Array.from({length:floors},(_,fi)=>(
        <group key={fi}>
          {/* Main center — warm amber */}
          <pointLight position={[0,fi*FH+FH*.55,0]} intensity={6} color="#ff9040" distance={FH*3.2} />
          {/* Side fills */}
          <pointLight position={[-BW*.22,fi*FH+FH*.50,BD*.12]} intensity={3.2} color="#ff8030" distance={FH*2.2} />
          <pointLight position={[BW*.22,fi*FH+FH*.46,-BD*.12]} intensity={2.8} color="#ffaa50" distance={FH*2.0} />
        </group>
      ))}
    </>
  );
}

// ── Facade uplight ────────────────────────────────────────
function FacadeUplight({x,z,color="#ffb060"}:{x:number;z:number;color?:string}) {
  return (
    <group position={[x,.04,z]}>
      <mesh position={[0,.04,0]}>
        <cylinderGeometry args={[.13,.1,.07,8]} />
        <meshStandardMaterial color="#2a2a28" roughness={.4} metalness={.5} />
      </mesh>
      <pointLight intensity={4.2} color={color} distance={9.5} />
    </group>
  );
}

// ── Garden bollard light ──────────────────────────────────
function Bollard({x,z}:{x:number;z:number}) {
  return (
    <group position={[x,0,z]}>
      <mesh castShadow position={[0,.44,0]}>
        <cylinderGeometry args={[.042,.055,.88,6]} />
        <meshStandardMaterial color="#252520" roughness={.45} metalness={.62} />
      </mesh>
      {/* Head cap */}
      <mesh position={[0,.9,0]}>
        <cylinderGeometry args={[.09,.07,.1,8]} />
        <meshStandardMaterial color="#1a1a18" emissive="#ffe880" emissiveIntensity={2.2} roughness={.28} />
      </mesh>
      <pointLight position={[0,.86,0]} intensity={2.2} color="#ffe0a0" distance={5.5} />
    </group>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function HouseModel({ answers }: { answers: HouseAnswers }) {
  const sp = SIZE[answers.size] ?? SIZE.medium;
  const { w: BW, d: BD, fh: FH } = sp;
  const floors = Math.min(parseInt(answers.floors,10)||2, 3);
  const extras = answers.extras;
  const style = answers.style ?? "modern";
  const sm = SM[style] ?? SM.modern;
  const wc = CMAP[answers.color] ?? "#e8e4e0";
  const mat: Mat = { color:wc, roughness:sm.r, metalness:sm.m };
  const totalH = floors * FH;
  const WT = .22;

  const pano = extras.includes("panoramic") || ["hitech","loft","modern","minimal"].includes(style);
  const wW = pano ? 2.55 : 1.15;
  const wH = pano ? FH-.50 : 1.14;
  const fwC = pano ? 2 : 3;
  const swC = pano ? 1 : 2;
  const isModern = ["modern","minimal","hitech","loft"].includes(style);
  const cantileverD = isModern ? BD * .07 : 0;

  return (
    <group>
      <Foundation w={BW} d={BD} color={sm.frame} />

      {Array.from({length:floors},(_,fi)=>{
        const yB=fi*FH, isG=fi===0;
        const frontOps=makeOps(BW,FH,wW,wH,fwC,isG);
        const backOps=makeOps(BW,FH,wW,wH,fwC,false);
        const sideOps=makeOps(BD,FH,wW,wH,swC,false);
        return (
          <group key={fi}>
            <WallGroup ww={BW} wh={FH} wt={WT} ops={frontOps} mat={mat} fc={sm.frame} pos={[0,yB,BD/2]} rot={[0,0,0]} />
            <WallGroup ww={BW} wh={FH} wt={WT} ops={backOps} mat={mat} fc={sm.frame} pos={[0,yB,-BD/2]} rot={[0,Math.PI,0]} />
            <WallGroup ww={BD} wh={FH} wt={WT} ops={sideOps} mat={mat} fc={sm.frame} pos={[-BW/2,yB,0]} rot={[0,Math.PI/2,0]} />
            <WallGroup ww={BD} wh={FH} wt={WT} ops={sideOps} mat={mat} fc={sm.frame} pos={[BW/2,yB,0]} rot={[0,-Math.PI/2,0]} />

            {/* Floor slab */}
            {fi>0 && <mesh receiveShadow position={[0,yB,0]}><boxGeometry args={[BW,.18,BD]} /><meshStandardMaterial color="#d8d4d0" roughness={.8} /></mesh>}

            {/* Belt course at each floor top */}
            <BeltCourse w={BW} d={BD} y={yB+FH-.01} color={sm.belt} />

            {/* Facade cladding on front (between belt courses) */}
            {(style==="scandinavian"||style==="modern"||style==="minimal"||style==="eco") && (
              <FacadeCladding baseW={BW} fh={FH} yBase={yB} z={BD/2+WT/2} color={sm.clad} />
            )}

            {extras.includes("balcony") && fi>0 && (
              <Balcony x={0} y={yB} z={BD/2+1.05} w={Math.min(4,BW*.5)} d={1.85} fc={sm.frame} />
            )}

            {/* Cantilever slab — overhang on upper floors for modern villa silhouette */}
            {fi>0 && isModern && cantileverD>0 && (
              <mesh castShadow receiveShadow position={[0,yB-.16,BD/2+cantileverD/2]}>
                <boxGeometry args={[BW+.28,.22,cantileverD+.28]} />
                <meshStandardMaterial color={sm.belt} roughness={.20} metalness={.24} envMapIntensity={2} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Entry Portico */}
      <EntryPortico baseD={BD} fh={FH} wallColor={wc} fc={sm.frame} />

      {/* Top slab */}
      <mesh receiveShadow castShadow position={[0,totalH,0]}><boxGeometry args={[BW+.35,.2,BD+.35]} /><meshStandardMaterial color="#d0ccc8" roughness={.75} metalness={.04} /></mesh>

      {/* Roof */}
      {answers.roof==="flat"         && <FlatRoof w={BW} d={BD} h={totalH} color={sm.roof} />}
      {answers.roof==="gabled"       && <GabledRoof w={BW} d={BD} h={totalH} rh={Math.max(1.9,BW*.18)} color={sm.roof} />}
      {answers.roof==="hipped"       && <HippedRoof w={BW} d={BD} h={totalH} rh={Math.max(1.9,BW*.16)} color={sm.roof} />}
      {answers.roof==="slanted"      && <SlantedRoof w={BW} d={BD} h={totalH} color={sm.roof} />}
      {answers.roof==="green"        && <GreenRoof w={BW} d={BD} h={totalH} color={sm.roof} />}
      {answers.roof==="terrace_roof" && <RoofTerrace w={BW} d={BD} h={totalH} color={sm.roof} />}

      {style==="classic" && (
        <group position={[0,0,BD/2+WT/2]}>
          <Columns baseW={Math.min(BW,9)} cnt={floors>1?4:3} color="#f0ede8" />
        </group>
      )}

      {/* Extras */}
      {extras.includes("garage1") && <Garage x={BW/2+3.2} baseD={BD} fh={FH} />}
      {!extras.includes("garage1")&&extras.includes("carport") && <Carport x={BW/2+2.6} baseD={BD} />}
      {extras.includes("pool") && <Pool baseD={BD} />}
      {extras.includes("pool") && (
        <>
          <LoungeChair x={-1.2} y={0} z={-(BD/2+7.5)} rot={0} />
          <LoungeChair x={1.2} y={0} z={-(BD/2+7.5)} rot={Math.PI} />
          <LoungeChair x={-1.2} y={0} z={-(BD/2+8.4)} rot={0} />
          <LoungeChair x={1.2} y={0} z={-(BD/2+8.4)} rot={Math.PI} />
          <OutdoorDining x={3} z={-(BD/2+7.5)} />
        </>
      )}
      {extras.includes("fence") && <Fence baseW={BW} baseD={BD} color={sm.frame} />}
      {extras.includes("bbq") && <BBQ baseW={BW} baseD={BD} />}
      {extras.includes("solar") && <SolarPanels baseD={BD} totalH={totalH} />}
      {extras.includes("terrace_front") && <Terrace baseW={BW} z={BD/2+1.55} fc={sm.frame} />}
      {extras.includes("terrace_back")  && <Terrace baseW={BW} z={-(BD/2+1.55)} fc={sm.frame} />}
      {extras.includes("path") && <Path baseD={BD} />}
      {extras.includes("garden") && <Garden baseW={BW} />}

      {/* Car near garage */}
      {extras.includes("garage1") && <LuxuryCar x={BW/2+2.5} z={BD/2+8} rot={Math.PI*.15} color="#c8c0b8" />}
      {!extras.includes("garage1") && BW>11 && <LuxuryCar x={BW/2+2} z={BD/2+6} rot={Math.PI*.1} color="#d0c8c0" />}

      {/* Landscape */}
      <RoundTree x={-BW/2-3.8} z={-BD/2-3.2} s={1.2} />
      <RoundTree x={BW/2+3.8} z={-BD/2-3.2} s={1.0} />
      <RoundTree x={-BW/2-2.8} z={BD/2+5.5} s={.9} />
      <RoundTree x={BW/2+2.8} z={BD/2+6} s={1.1} />
      {BW>12 && <RoundTree x={0} z={-BD/2-6} s={1.35} />}

      {/* Cypress trees for formal sides */}
      <CypressTree x={-BW/2-1.4} z={BD/2+1.5} s={.9} />
      <CypressTree x={BW/2+1.4} z={BD/2+1.5} s={.9} />
      {BW>14 && <><CypressTree x={-BW/2-1.4} z={-BD/2-1.5} s={.85} /><CypressTree x={BW/2+1.4} z={-BD/2-1.5} s={.85} /></>}

      <Bush x={-BW/2-1.25} z={BD/2+.9} s={.9} />
      <Bush x={BW/2+1.25} z={BD/2+.9} s={.85} />
      <Bush x={-1.9} z={BD/2+.7} s={.7} />
      <Bush x={1.9} z={BD/2+.7} s={.72} />
      <Bush x={-BW/2-.9} z={-BD/2-.9} s={.78} />
      <Bush x={BW/2+.9} z={-BD/2-.9} s={.78} />

      {extras.includes("lights") && (
        <>
          <StreetLamp x={-BW/2-1.1} z={BD/2+3.5} />
          <StreetLamp x={BW/2+1.1} z={BD/2+3.5} />
        </>
      )}

      {/* ── Interior warm glow — bleeds through windows ─── */}
      <InteriorGlow BW={BW} BD={BD} FH={FH} floors={floors} />

      {/* ── Facade uplights (wall wash) ─────────────────── */}
      <FacadeUplight x={-BW*.30} z={BD/2+.45} color="#ffb060" />
      <FacadeUplight x={0}       z={BD/2+.45} color="#ffc070" />
      <FacadeUplight x={BW*.30}  z={BD/2+.45} color="#ffb060" />
      {isModern && <FacadeUplight x={-BW*.22} z={-BD/2-.42} color="#ffe090" />}
      {isModern && <FacadeUplight x={BW*.22}  z={-BD/2-.42} color="#ffe090" />}

      {/* ── Garden path bollards ─────────────────────────── */}
      <Bollard x={-1.05} z={BD/2+2.0} />
      <Bollard x={1.05}  z={BD/2+2.0} />
      <Bollard x={-1.05} z={BD/2+4.2} />
      <Bollard x={1.05}  z={BD/2+4.2} />
      <Bollard x={-1.05} z={BD/2+6.3} />
      <Bollard x={1.05}  z={BD/2+6.3} />
    </group>
  );
}
