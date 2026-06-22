import { useMemo } from "react";
import { Html } from "@react-three/drei";
import type { HouseAnswers } from "@/types";

const SIZE: Record<string,{w:number;d:number}> = {
  tiny:{w:9,d:7}, compact:{w:11,d:8}, medium:{w:13,d:9.5}, large:{w:16,d:11}, villa:{w:20,d:14}
};

const ROOM_INFO: Record<string,{label:string;icon:string;floor:"wood"|"tile"|"carpet";c1:string;c2:string}> = {
  living:   {label:"Гостиная",       icon:"🛋",  floor:"wood",   c1:"#c8a878",c2:"#b89868"},
  kitchen:  {label:"Кухня",          icon:"🍳",  floor:"tile",   c1:"#e2ddd8",c2:"#d5d0ca"},
  dining:   {label:"Столовая",       icon:"🍽",  floor:"wood",   c1:"#c8a878",c2:"#b89868"},
  master:   {label:"Мастер-спальня", icon:"👑",  floor:"carpet", c1:"#c0b0d0",c2:"#b0a0c0"},
  bedroom:  {label:"Спальня",        icon:"🛏",  floor:"wood",   c1:"#a8b8c8",c2:"#98a8b8"},
  kids:     {label:"Детская",        icon:"🧸",  floor:"carpet", c1:"#b0cce0",c2:"#a0bcd0"},
  bathroom: {label:"Ванная",         icon:"🛁",  floor:"tile",   c1:"#d8e4ec",c2:"#c8d8e4"},
  laundry:  {label:"Прачечная",      icon:"🧺",  floor:"tile",   c1:"#d0d8e0",c2:"#c0c8d0"},
  office:   {label:"Кабинет",        icon:"💼",  floor:"wood",   c1:"#c8b880",c2:"#b8a870"},
  gym:      {label:"Спортзал",       icon:"💪",  floor:"tile",   c1:"#c0c880",c2:"#b0b870"},
  cinema:   {label:"Кинотеатр",      icon:"🎬",  floor:"carpet", c1:"#7a7080",c2:"#6a6070"},
  playroom: {label:"Игровая",        icon:"🎮",  floor:"carpet", c1:"#d0b8d0",c2:"#c0a8c0"},
  wardrobe: {label:"Гардероб",       icon:"👗",  floor:"wood",   c1:"#c0b0a0",c2:"#b0a090"},
  guest:    {label:"Гостевая",       icon:"🛌",  floor:"wood",   c1:"#a8c0c8",c2:"#98b0b8"},
  storage:  {label:"Кладовая",       icon:"📦",  floor:"tile",   c1:"#b8bcc4",c2:"#a8acb4"},
};

const PRIORITY = ["living","kitchen","dining","master","bedroom","bathroom","kids","office","guest","wardrobe","laundry","storage","gym","playroom","cinema"];

// ── Floor materials ───────────────────────────────────────
function WoodFloor({cx,cz,w,d,c1,c2}:{cx:number;cz:number;w:number;d:number;c1:string;c2:string}) {
  const n = Math.min(10, Math.max(3, Math.ceil(w/0.3)));
  const pw = w/n;
  return (
    <group position={[cx,0,cz]}>
      {Array.from({length:n},(_,i)=>(
        <mesh key={i} receiveShadow position={[-w/2+pw*(i+.5),0,0]}>
          <boxGeometry args={[pw-.012,0.04,d]} />
          <meshStandardMaterial color={i%2===0?c1:c2} roughness={.62} metalness={.03} envMapIntensity={.4} />
        </mesh>
      ))}
    </group>
  );
}

function TileFloor({cx,cz,w,d,c1,c2}:{cx:number;cz:number;w:number;d:number;c1:string;c2:string}) {
  const cols = Math.min(6,Math.max(2,Math.ceil(w/0.6)));
  const rows = Math.min(6,Math.max(2,Math.ceil(d/0.6)));
  const tw=w/cols, td=d/rows;
  return (
    <group position={[cx,0,cz]}>
      {Array.from({length:cols},(_,ci)=>
        Array.from({length:rows},(_,ri)=>(
          <mesh key={`${ci}-${ri}`} receiveShadow position={[-w/2+tw*(ci+.5),0,-d/2+td*(ri+.5)]}>
            <boxGeometry args={[tw-.025,0.04,td-.025]} />
            <meshStandardMaterial color={(ci+ri)%2===0?c1:c2} roughness={.38} metalness={.1} envMapIntensity={.5} />
          </mesh>
        ))
      )}
    </group>
  );
}

function CarpetFloor({cx,cz,w,d,c1}:{cx:number;cz:number;w:number;d:number;c1:string}) {
  return (
    <mesh receiveShadow position={[cx,0,cz]}>
      <boxGeometry args={[w,0.045,d]} />
      <meshStandardMaterial color={c1} roughness={.96} metalness={0} />
    </mesh>
  );
}

// ── Top-down furniture ─────────────────────────────────────
function FPSofa({x=0,z=0,rot=0,w=2.4,d=0.9,c="#6a7080"}:{x?:number;z?:number;rot?:number;w?:number;d?:number;c?:string}) {
  return (
    <group position={[x,.05,z]} rotation={[0,rot,0]}>
      <mesh receiveShadow><boxGeometry args={[w,.07,d*.65]} /><meshStandardMaterial color={c} roughness={.8} /></mesh>
      <mesh position={[0,.04,d*.34-.1]}><boxGeometry args={[w,.1,.19]} /><meshStandardMaterial color={c} roughness={.72} /></mesh>
      {[-w/2+.1,w/2-.1].map((cx,i)=>(
        <mesh key={i} position={[cx,.02,-d*.08]}><boxGeometry args={[.19,.09,d*.68]} /><meshStandardMaterial color={c} roughness={.72} /></mesh>
      ))}
    </group>
  );
}

function FPLoveseat({x=0,z=0,rot=0,w=1.5,d=0.8,c="#7a8090"}:{x?:number;z?:number;rot?:number;w?:number;d?:number;c?:string}) {
  return (
    <group position={[x,.05,z]} rotation={[0,rot,0]}>
      <mesh receiveShadow><boxGeometry args={[w,.07,d*.62]} /><meshStandardMaterial color={c} roughness={.8} /></mesh>
      <mesh position={[0,.04,d*.32-.1]}><boxGeometry args={[w,.1,.18]} /><meshStandardMaterial color={c} roughness={.72} /></mesh>
    </group>
  );
}

function FPCoffeeTable({x=0,z=0,w=0.9,d=0.5}:{x?:number;z?:number;w?:number;d?:number}) {
  return (
    <mesh receiveShadow position={[x,.04,z]}>
      <boxGeometry args={[w,.06,d]} /><meshStandardMaterial color="#9a8060" roughness={.52} metalness={.08} />
    </mesh>
  );
}

function FPTV({x=0,z=0,rot=0,w=1.8}:{x?:number;z?:number;rot?:number;w?:number}) {
  return (
    <group position={[x,.04,z]} rotation={[0,rot,0]}>
      <mesh receiveShadow><boxGeometry args={[w,.06,.08]} /><meshStandardMaterial color="#0a0a10" roughness={.1} metalness={.55} /></mesh>
    </group>
  );
}

function FPRug({x=0,z=0,w=2.2,d=1.6,c="#9a8070"}:{x?:number;z?:number;w?:number;d?:number;c?:string}) {
  return (
    <mesh receiveShadow position={[x,.025,z]}>
      <boxGeometry args={[w,.03,d]} /><meshStandardMaterial color={c} roughness={.96} />
    </mesh>
  );
}

function FPBed({x=0,z=0,rot=0,w=1.8,d=2.1,c="#e0d4c0"}:{x?:number;z?:number;rot?:number;w?:number;d?:number;c?:string}) {
  return (
    <group position={[x,.05,z]} rotation={[0,rot,0]}>
      <mesh receiveShadow><boxGeometry args={[w,.07,d*.78]} /><meshStandardMaterial color={c} roughness={.82} /></mesh>
      <mesh position={[0,.05,-d/2+.11]}><boxGeometry args={[w,.11,.22]} /><meshStandardMaterial color="#8a7060" roughness={.62} /></mesh>
      {[-w/4,w/4].map((cx,i)=>(
        <mesh key={i} position={[cx,.06,-d*.27]}><boxGeometry args={[w*.38,.09,.38]} /><meshStandardMaterial color="#f0e8e0" roughness={.72} /></mesh>
      ))}
      <mesh position={[0,.03,d*.1]}><boxGeometry args={[w-.1,.05,d*.52]} /><meshStandardMaterial color={c} roughness={.85} /></mesh>
    </group>
  );
}

function FPNightstand({x=0,z=0}:{x?:number;z?:number}) {
  return (
    <mesh receiveShadow position={[x,.05,z]}>
      <boxGeometry args={[.42,.07,.38]} /><meshStandardMaterial color="#8a6a40" roughness={.68} metalness={.05} />
    </mesh>
  );
}

function FPDiningSet({x=0,z=0,w=1.5,d=0.95,persons=4}:{x?:number;z?:number;w?:number;d?:number;persons?:number}) {
  const cs=.36;
  return (
    <group position={[x,.05,z]}>
      <mesh receiveShadow><boxGeometry args={[w,.07,d]} /><meshStandardMaterial color="#9a8060" roughness={.52} metalness={.06} /></mesh>
      {[[0,d/2+.22,0],[0,-(d/2+.22),Math.PI],[-(w/2+.22),0,Math.PI/2],[w/2+.22,0,-Math.PI/2]].slice(0,persons).map(([cx,cz,cr],i)=>(
        <group key={i} position={[cx,0,cz]} rotation={[0,cr,0]}>
          <mesh receiveShadow><boxGeometry args={[cs,.06,cs]} /><meshStandardMaterial color="#b89060" roughness={.72} /></mesh>
          <mesh position={[0,.03,-cs*.46]}><boxGeometry args={[cs,.1,.12]} /><meshStandardMaterial color="#b89060" roughness={.7} /></mesh>
        </group>
      ))}
    </group>
  );
}

function FPKitchen({x=0,z=0,w=4,d=3.5,cc="#d0ccc4"}:{x?:number;z?:number;w?:number;d?:number;cc?:string}) {
  return (
    <group position={[x,.05,z]}>
      {/* Back counter */}
      <mesh position={[0,.32,-d/2+.32]}><boxGeometry args={[w,.64,.62]} /><meshStandardMaterial color={cc} roughness={.5} metalness={.1} /></mesh>
      <mesh position={[0,.66,-d/2+.32]}><boxGeometry args={[w+.04,.05,.64]} /><meshStandardMaterial color="#e0ddd8" roughness={.22} metalness={.32} /></mesh>
      {/* Left counter */}
      <mesh position={[-w/2+.32,.32,0]}><boxGeometry args={[.62,.64,d*.5]} /><meshStandardMaterial color={cc} roughness={.5} metalness={.1} /></mesh>
      <mesh position={[-w/2+.32,.66,0]}><boxGeometry args={[.64,.05,d*.52]} /><meshStandardMaterial color="#e0ddd8" roughness={.22} metalness={.32} /></mesh>
      {/* Island */}
      <mesh position={[w*.18,.32,.15]}><boxGeometry args={[w*.38,.64,d*.28]} /><meshStandardMaterial color={cc} roughness={.5} metalness={.1} /></mesh>
      <mesh position={[w*.18,.66,.15]}><boxGeometry args={[w*.4,.05,d*.30]} /><meshStandardMaterial color="#e8e8e0" roughness={.2} metalness={.3} /></mesh>
      {/* Sink circle */}
      <mesh position={[w*.22,.68,-d/2+.32]}><cylinderGeometry args={[.18,.18,.04,10]} /><meshStandardMaterial color="#d8d8d0" roughness={.15} metalness={.5} /></mesh>
    </group>
  );
}

function FPBathroom({x=0,z=0,w=2.8,d=2.6}:{x?:number;z?:number;w?:number;d?:number}) {
  return (
    <group position={[x,.05,z]}>
      {/* Bathtub */}
      <mesh position={[-(w*.26),0,d*.18]} receiveShadow><boxGeometry args={[.76,.07,1.58]} /><meshStandardMaterial color="#f0ece8" roughness={.3} /></mesh>
      <mesh position={[-(w*.26),.05,d*.18]}><boxGeometry args={[.58,.04,1.38]} /><meshStandardMaterial color="#c8e4f0" roughness={.04} transparent opacity={.75} /></mesh>
      {/* Toilet */}
      <mesh position={[w*.28,0,d*.28]}><cylinderGeometry args={[.2,.2,.06,8]} /><meshStandardMaterial color="#f0ece8" roughness={.3} /></mesh>
      <mesh position={[w*.28,0,d*.28-.24]}><boxGeometry args={[.38,.06,.24]} /><meshStandardMaterial color="#f0ece8" roughness={.3} /></mesh>
      {/* Vanity */}
      <mesh position={[w*.28,0,-(d*.28)]} receiveShadow><boxGeometry args={[.72,.06,.52]} /><meshStandardMaterial color="#e8e4e0" roughness={.3} /></mesh>
      <mesh position={[w*.28,.04,-(d*.28)]}><cylinderGeometry args={[.16,.16,.04,10]} /><meshStandardMaterial color="#dcdcda" roughness={.14} metalness={.42} /></mesh>
    </group>
  );
}

function FPDesk({x=0,z=0,rot=0,w=1.6,c="#b08060"}:{x?:number;z?:number;rot?:number;w?:number;c?:string}) {
  return (
    <group position={[x,.05,z]} rotation={[0,rot,0]}>
      <mesh receiveShadow><boxGeometry args={[w,.06,.7]} /><meshStandardMaterial color={c} roughness={.55} metalness={.06} /></mesh>
      <mesh position={[0,.05,-.22]}><boxGeometry args={[.48,.07,.06]} /><meshStandardMaterial color="#1a1a18" roughness={.18} metalness={.48} /></mesh>
    </group>
  );
}

function FPWardrobe({x=0,z=0,rot=0,w=2.0,c="#b89870"}:{x?:number;z?:number;rot?:number;w?:number;c?:string}) {
  const n = Math.round(w/0.62);
  return (
    <group position={[x,.05,z]} rotation={[0,rot,0]}>
      <mesh receiveShadow><boxGeometry args={[w,.06,.6]} /><meshStandardMaterial color={c} roughness={.65} metalness={.05} /></mesh>
      {Array.from({length:n-1},(_,i)=>(
        <mesh key={i} position={[-w/2+(i+1)*(w/n),.05,0]}><boxGeometry args={[.02,.08,.58]} /><meshStandardMaterial color="#9a7850" roughness={.6} /></mesh>
      ))}
    </group>
  );
}

function FPTreadmill({x=0,z=0,rot=0}:{x?:number;z?:number;rot?:number}) {
  return (
    <mesh receiveShadow position={[x,.05,z]} rotation={[0,rot,0]}>
      <boxGeometry args={[.68,.06,1.55]} /><meshStandardMaterial color="#3a4050" roughness={.55} metalness={.3} />
    </mesh>
  );
}

// ── Door arc ─────────────────────────────────────────────
function DoorArc({x,z,rot=0,r=0.88}:{x:number;z:number;rot?:number;r?:number}) {
  const segs=10, sa=(Math.PI/2)/segs;
  return (
    <group position={[x,.03,z]} rotation={[0,rot,0]}>
      <mesh position={[r/2,0,0]}><boxGeometry args={[r,.04,.04]} /><meshStandardMaterial color="#a08858" roughness={.58} /></mesh>
      {Array.from({length:segs},(_,i)=>{
        const ma=(i+.5)*sa;
        return (
          <mesh key={i} position={[Math.cos(ma)*r,0,Math.sin(ma)*r]} rotation={[0,-ma,0]}>
            <boxGeometry args={[r*sa*.9,.04,.03]} /><meshStandardMaterial color="#a08858" roughness={.58} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Room label ─────────────────────────────────────────────
function RoomLabel({x,y,z,label,icon}:{x:number;y:number;z:number;label:string;icon:string}) {
  return (
    <Html position={[x,y,z]} center transform occlude={false}>
      <div style={{
        background:"rgba(8,12,22,0.92)", border:"1px solid rgba(255,255,255,0.14)",
        borderRadius:"7px", padding:"3px 9px", color:"white", fontSize:"12px",
        fontWeight:600, whiteSpace:"nowrap", pointerEvents:"none",
        fontFamily:"system-ui,sans-serif", backdropFilter:"blur(6px)",
        boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
      }}>
        {icon} {label}
      </div>
    </Html>
  );
}

// ── Wall segment ──────────────────────────────────────────
function Wall({x,z,w,d,color="#ccced4",h=1.6}:{x:number;z:number;w:number;d:number;color?:string;h?:number}) {
  return (
    <mesh castShadow receiveShadow position={[x,h/2,z]}>
      <boxGeometry args={[w,h,d]} /><meshStandardMaterial color={color} roughness={.72} metalness={.02} />
    </mesh>
  );
}

// ── Layout algorithm ──────────────────────────────────────
type Zone = {id:string; x:number; z:number; w:number; d:number};

function layoutRooms(rooms:string[], BW:number, BD:number): {zones:Zone[]; cols:number; rows:number; cellW:number; cellD:number} {
  const extT=0.25, intT=0.14;
  const iW=BW-extT*2, iD=BD-extT*2;
  const n=rooms.length;
  if(n===0) return {zones:[],cols:0,rows:0,cellW:0,cellD:0};
  const cols=n<=2?2:n<=4?2:3, rows=Math.ceil(n/cols);
  const cellW=(iW-(cols-1)*intT)/cols, cellD=(iD-(rows-1)*intT)/rows;
  const sorted=[...rooms].sort((a,b)=>{
    const ai=PRIORITY.indexOf(a), bi=PRIORITY.indexOf(b);
    return (ai===-1?99:ai)-(bi===-1?99:bi);
  });
  const zones:Zone[] = sorted.map((id,i)=>{
    const col=i%cols, row=Math.floor(i/cols);
    return {id, x:-iW/2+col*(cellW+intT)+cellW/2, z:iD/2-row*(cellD+intT)-cellD/2, w:cellW, d:cellD};
  });
  return {zones, cols, rows, cellW, cellD};
}

// ── Room cell ─────────────────────────────────────────────
function RoomCell({id,x,z,w,d}:{id:string;x:number;z:number;w:number;d:number}) {
  const info = ROOM_INFO[id];
  if(!info) return null;
  const fw=w-.16, fd=d-.16;
  const floor = info.floor==="wood"
    ? <WoodFloor cx={x} cz={z} w={fw} d={fd} c1={info.c1} c2={info.c2} />
    : info.floor==="tile"
    ? <TileFloor cx={x} cz={z} w={fw} d={fd} c1={info.c1} c2={info.c2} />
    : <CarpetFloor cx={x} cz={z} w={fw} d={fd} c1={info.c1} />;

  let fur: JSX.Element|null = null;
  const sw=Math.min(2.6,fw*.72), sd=Math.min(0.88,fd*.45);
  switch(id) {
    case "living":
      fur = <>
        <FPRug x={x} z={z-fd*.05} w={Math.min(3.0,fw*.78)} d={Math.min(2.0,fd*.52)} c="#9a8468" />
        <FPSofa x={x} z={z-fd*.2} w={sw} c="#5a6572" />
        <FPLoveseat x={x+fw*.32} z={z+fd*.05} rot={-Math.PI/2} w={Math.min(1.4,fd*.55)} c="#5a6572" />
        <FPCoffeeTable x={x} z={z+fd*.08} w={Math.min(.95,fw*.3)} d={.5} />
        <FPTV x={x} z={z+fd*.48} w={Math.min(1.7,fw*.55)} />
      </>;
      break;
    case "kitchen":
      fur = <FPKitchen x={x} z={z} w={fw} d={fd} />;
      break;
    case "dining":
      fur = <FPDiningSet x={x} z={z} w={Math.min(1.6,fw*.7)} d={Math.min(1.0,fd*.55)} persons={Math.min(6,Math.ceil(fw/0.55))} />;
      break;
    case "master": case "bedroom": case "guest":
      const bw=Math.min(1.8,fw*.58), bd=Math.min(2.1,fd*.65);
      fur = <>
        <FPRug x={x} z={z-fd*.05} w={Math.min(2.5,fw*.7)} d={Math.min(2.5,fd*.7)} c="#c0b0a0" />
        <FPBed x={x} z={z-fd*.08} w={bw} d={bd} c={id==="master"?"#d8c8b0":"#c8b898"} />
        <FPNightstand x={x-bw/2-.28} z={z-fd*.08-bd*.18} />
        <FPNightstand x={x+bw/2+.28} z={z-fd*.08-bd*.18} />
      </>;
      break;
    case "kids":
      fur = <>
        <FPRug x={x} z={z} w={Math.min(2.0,fw*.68)} d={Math.min(2.2,fd*.65)} c="#aabbd0" />
        <FPBed x={x} z={z} w={Math.min(1.3,fw*.55)} d={Math.min(1.8,fd*.6)} c="#c8e0f0" />
      </>;
      break;
    case "bathroom":
      fur = <FPBathroom x={x} z={z} w={fw} d={fd} />;
      break;
    case "office":
      fur = <>
        <FPDesk x={x} z={z-fd*.25} w={Math.min(1.6,fw*.7)} />
        <FPWardrobe x={x+fw*.32} z={z+fd*.38} rot={Math.PI/2} w={Math.min(1.5,fd*.55)} c="#a08060" />
      </>;
      break;
    case "wardrobe":
      fur = <FPWardrobe x={x} z={z} w={Math.min(2.2,fw*.82)} c="#b89870" />;
      break;
    case "gym":
      fur = <>
        <FPTreadmill x={x-fw*.22} z={z} />
        <FPTreadmill x={x+fw*.22} z={z} />
      </>;
      break;
    case "cinema":
      fur = <>
        <FPRug x={x} z={z+fd*.12} w={Math.min(3.2,fw*.78)} d={Math.min(2.0,fd*.52)} c="#4a4450" />
        <FPSofa x={x} z={z+fd*.12} w={Math.min(2.9,fw*.75)} c="#3a3848" />
        <FPTV x={x} z={z-fd*.45} w={Math.min(2.5,fw*.75)} />
      </>;
      break;
  }
  const doorRot = Math.PI/2 * (Math.floor(Math.random()*4));
  return (
    <>
      {floor}
      {fur}
      <DoorArc x={x+w/2} z={z-d/2} rot={Math.PI*1.5} r={Math.min(.88,Math.min(fw,fd)*.38)} />
      <RoomLabel x={x} y={2.0} z={z} label={info.label} icon={info.icon} />
    </>
  );
}

// ── House shell ───────────────────────────────────────────
function HouseShell({BW,BD,cols,rows,cellW,cellD}:{BW:number;BD:number;cols:number;rows:number;cellW:number;cellD:number}) {
  const extT=0.25, intT=0.14, iW=BW-extT*2, iD=BD-extT*2;
  return (
    <>
      {/* Base floor slab */}
      <mesh receiveShadow position={[0,-.06,0]}><boxGeometry args={[BW+.5,.12,BD+.5]} /><meshStandardMaterial color="#181c28" roughness={.92} /></mesh>
      {/* Exterior walls */}
      <Wall x={0} z={BD/2} w={BW} d={extT} color="#c8ccd4" />
      <Wall x={0} z={-BD/2} w={BW} d={extT} color="#c8ccd4" />
      <Wall x={-BW/2} z={0} w={extT} d={BD} color="#c8ccd4" />
      <Wall x={BW/2} z={0} w={extT} d={BD} color="#c8ccd4" />
      {/* Interior vertical walls */}
      {Array.from({length:cols-1},(_,i)=>{
        const bx=-iW/2+(i+1)*(cellW+intT)-intT/2;
        return <Wall key={`v${i}`} x={bx} z={0} w={intT} d={iD} color="#d8dce4" />;
      })}
      {/* Interior horizontal walls */}
      {Array.from({length:rows-1},(_,i)=>{
        const bz=iD/2-(i+1)*(cellD+intT)+intT/2;
        return <Wall key={`h${i}`} x={0} z={bz} w={iW} d={intT} color="#d8dce4" />;
      })}
      {/* Window highlights on exterior walls */}
      {[[-BW*.28,BD/2],[BW*.28,BD/2],[0,-BD/2],[-BW*.28,-BD/2]].map(([wx,wz],i)=>(
        <mesh key={`win${i}`} position={[wx,.55,wz]}><boxGeometry args={[1.05,1.1,.04]} /><meshStandardMaterial color="#a8d4ec" transparent opacity={.45} roughness={.02} metalness={.1} /></mesh>
      ))}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function FloorPlanModel({ answers }: { answers: HouseAnswers }) {
  const sp = SIZE[answers.size] ?? SIZE.medium;
  const { w: BW, d: BD } = sp;
  const floors = Math.min(parseInt(answers.floors,10)||2, 3);
  const allRooms = answers.rooms.length>0 ? answers.rooms : ["living","kitchen","bedroom","bathroom"];
  const sorted=[...allRooms].sort((a,b)=>{
    const ai=PRIORITY.indexOf(a), bi=PRIORITY.indexOf(b);
    return (ai===-1?99:ai)-(bi===-1?99:bi);
  });
  const perFloor = Math.ceil(sorted.length/floors);
  const floorRooms = Array.from({length:floors},(_,fi)=>sorted.slice(fi*perFloor,(fi+1)*perFloor));

  const layouts = useMemo(()=>
    floorRooms.map(rooms=>layoutRooms(rooms.length>0?rooms:["living","bathroom"], BW, BD)),
    [sorted.join(","), BW, BD, floors]
  );

  const floorGap = 9;

  return (
    <group>
      {layouts.map((layout,fi)=>(
        <group key={fi} position={[0,fi*floorGap,0]}>
          <HouseShell BW={BW} BD={BD} cols={layout.cols} rows={layout.rows} cellW={layout.cellW} cellD={layout.cellD} />
          {layout.zones.map((zone,zi)=>(
            <RoomCell key={`${fi}-${zone.id}-${zi}`} {...zone} />
          ))}
          {/* Floor indicator label */}
          <Html position={[-BW/2-2.0,.5,0]} transform occlude={false}>
            <div style={{color:"#4b5563",fontSize:"13px",fontWeight:700,whiteSpace:"nowrap",pointerEvents:"none",fontFamily:"system-ui,sans-serif"}}>
              {fi===0?"Первый этаж":fi===1?"Второй этаж":`${fi+1}-й этаж`}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
