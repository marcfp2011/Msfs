JavaScript
import React, { useState, useEffect } from 'react';
import { 
  Plane, Wifi, BatteryCharging, Gauge, ArrowRight, 
  ShieldCheck, FileText, Map, Settings, AlertTriangle, 
  CheckCircle2, RefreshCw, Send
} from 'lucide-react';

export default function AirbusEFBApp() {
  // Navegación lateral
  const [activeTab, setActiveTab] = useState('takeoff');

  // Estados de Entorno (Inputs)
  const [airport, setAirport] = useState('LEMD');
  const [runway, setRunway] = useState('36L');
  const [runwayCondition, setRunwayCondition] = useState('DRY');
  const [windDirection, setWindDirection] = useState(220);
  const [windSpeed, setWindSpeed] = useState(15);
  const [oat, setOat] = useState(16);
  const [qnh, setQnh] = useState(1025);

  // Estados de Configuración Aeronave
  const [tow, setTow] = useState(64.2); // Toneladas
  const [flaps, setFlaps] = useState('CONF 2');
  const [packs, setPacks] = useState('OFF');
  const [antiIce, setAntiIce] = useState('OFF');

  // Estados Calculados (Outputs)
  const [computed, setComputed] = useState(true);
  const [v1, setV1] = useState(142);
  const [vr, setVr] = useState(145);
  const [v2, setV2] = useState(149);
  const [flexTemp, setFlexTemp] = useState(58);
  const [pitchTrim, setPitchTrim] = useState('UP 0.5°');
  const [cgPercent, setCgPercent] = useState(28.4);
  const [stopMargin, setStopMargin] = useState(1420);
  const [mcduSent, setMcduSent] = useState(false);

  // Recálculo dinámico de prestaciones al cambiar parámetros
  useEffect(() => {
    // Algoritmo simplificado de prestaciones aeronáuticas para la demo interactiva
    const weightFactor = (tow - 60) * 1.2;
    const flapFactor = flaps === 'CONF 1+F' ? 3 : flaps === 'CONF 2' ? 0 : -2;
    const envFactor = (oat - 15) * 0.2;

    const calculatedV1 = Math.round(135 + weightFactor + flapFactor + envFactor);
    const calculatedVR = Math.round(calculatedV1 + 3);
    const calculatedV2 = Math.round(calculatedVR + 4);
    
    // Temperatura Flex invertida respecto al peso
    const calculatedFlex = Math.round(68 - (tow - 50) * 0.7 - (oat > 15 ? (oat - 15) * 0.5 : 0));
    
    // Margen de parada disponible en la pista 36L (4179m de TODA)
    const calculatedMargin = Math.round(4179 - (2200 + (tow - 50) * 35));

    setV1(calculatedV1);
    setVr(calculatedVR);
    setV2(calculatedV2);
    setFlexTemp(Math.max(calculatedFlex, oat + 10));
    setStopMargin(Math.max(calculatedMargin, 200));
    
    // Centro de Gravedad variable en función del peso
    const calculatedCG = (25.0 + (tow - 55) * 0.35).toFixed(1);
    setCgPercent(calculatedCG);
    setPitchTrim(`UP ${(calculatedCG > 27 ? (calculatedCG - 27) * 0.25 : 0).toFixed(1)}°`);

    setMcduSent(false);
  }, [tow, flaps, oat, runwayCondition, windSpeed]);

  const handleMCDUSync = () => {
    setMcduSent(true);
    setTimeout(() => setMcduSent(false), 4000);
  };

  return (
    <div className="w-full h-screen bg-[#070a0f] text-slate-200 font-sans flex flex-col select-none overflow-hidden">
      
      {/* BARRA SUPERIOR DE CABINA (TOPBAR) */}
      <header className="h-11 bg-gradient-to-b from-[#161c28] to-[#0e131d] border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 font-mono text-xs px-2 py-0.5 rounded font-bold tracking-wide">
            A320neo (PW1100G)
          </span>
          <span className="text-xs font-mono text-slate-400">
            FLT <span className="text-amber-400 font-bold">IBE320</span> | {airport} ➔ EGLL
          </span>
        </div>

        <div className="text-xs font-bold text-slate-400 tracking-widest uppercase hidden md:block">
          AIRBUS FlySmart+ EFB
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ACARS ONLINE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 flex items-center gap-1">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400"/> 98%
          </span>
          <span className="bg-[#18202f] border border-slate-700 text-cyan-400 font-bold px-2 py-0.5 rounded">
            09:51:40 Z
          </span>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* BARRA DE NAVEGACIÓN LATERAL */}
        <aside className="w-48 bg-[#0d111a] border-r border-slate-800 p-2 flex flex-col justify-between">
          <div className="space-y-1">
            {[
              { id: 'takeoff', label: 'PERF TAKEOFF', icon: '🚀' },
              { id: 'landing', label: 'PERF LANDING', icon: '🛬' },
              { id: 'load', label: 'LOAD & FUEL', icon: '⚖️' },
              { id: 'checklists', label: 'CHECKLISTS', icon: '📋' },
              { id: 'charts', label: 'CHARTS & MAPS', icon: '🗺️' },
              { id: 'docs', label: 'FCOM / MEL', icon: '📄' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 border border-cyan-400/50 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <span className="text-sm">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-center">
            <div className="text-[9px] text-slate-500 font-mono">AIRBUS EFB OS</div>
            <div className="text-xs text-cyan-400 font-mono font-bold">v3.8.2 REALTIME</div>
          </div>
        </aside>

        {/* ÁREA DE TRABAJO TÁCTICO */}
        <main className="flex-1 p-3 grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#070a0f] overflow-y-auto">
          
          {/* COLUMNA 1: ENTRADA DE PARÁMETROS */}
          <section className="bg-[#111622] border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-cyan-400 tracking-wider">ENTORNO Y CONFIGURACIÓN</span>
                <span className="text-[10px] font-mono text-slate-500">{airport} / {runway}</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* PISTA */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">PISTA</span>
                  <div className="flex gap-1 font-mono">
                    <select 
                      value={runway} 
                      onChange={e => setRunway(e.target.value)}
                      className="bg-[#090d14] border border-cyan-500/50 text-cyan-400 px-2 py-1 rounded font-bold outline-none cursor-pointer"
                    >
                      <option value="36L">36L (4,179m)</option>
                      <option value="36R">36R (4,350m)</option>
                      <option value="18L">18L (3,700m)</option>
                    </select>
                  </div>
                </div>

                {/* CONDICION DE PISTA */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ESTADO PISTA</span>
                  <select 
                    value={runwayCondition} 
                    onChange={e => setRunwayCondition(e.target.value)}
                    className="bg-[#090d14] border border-slate-700 text-emerald-400 font-mono px-2 py-1 rounded font-bold outline-none cursor-pointer"
                  >
                    <option value="DRY">DRY / CLEAN</option>
                    <option value="WET">WET / GOOD</option>
                    <option value="CONTAMINATED">STANDING WATER</option>
                  </select>
                </div>

                {/* VIENTO */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">VIENTO (° / KT)</span>
                  <div className="flex gap-1 font-mono items-center">
                    <input 
                      type="number" 
                      value={windDirection} 
                      onChange={e => setWindDirection(Number(e.target.value))}
                      className="w-12 bg-[#090d14] border border-slate-700 text-white text-center rounded py-0.5 font-bold outline-none"
                    />
                    <span className="text-slate-600">/</span>
                    <input 
                      type="number" 
                      value={windSpeed} 
                      onChange={e => setWindSpeed(Number(e.target.value))}
                      className="w-12 bg-[#090d14] border border-slate-700 text-white text-center rounded py-0.5 font-bold outline-none"
                    />
                  </div>
                </div>

                {/* TEMPERATURA Y QNH */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">OAT (°C) / QNH (hPa)</span>
                  <div className="flex gap-1 font-mono">
                    <input 
                      type="number" 
                      value={oat} 
                      onChange={e => setOat(Number(e.target.value))}
                      className="w-12 bg-[#090d14] border border-slate-700 text-white text-center rounded py-0.5 font-bold outline-none"
                    />
                    <input 
                      type="number" 
                      value={qnh} 
                      onChange={e => setQnh(Number(e.target.value))}
                      className="w-14 bg-[#090d14] border border-slate-700 text-white text-center rounded py-0.5 font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800/80 my-2 pt-2"></div>

                {/* PESO DE DESPEGUE (TOW SLIDER + INPUT) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-bold">TAKEOFF WEIGHT (TOW)</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input 
                        type="number" 
                        step="0.1" 
                        value={tow} 
                        onChange={e => setTow(Number(e.target.value))}
                        className="w-16 bg-[#090d14] border border-amber-500/60 text-amber-400 text-center rounded py-0.5 font-bold text-sm outline-none"
                      />
                      <span className="text-slate-500 text-xs">TONS</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="52" 
                    max="77" 
                    step="0.1" 
                    value={tow} 
                    onChange={e => setTow(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* FLAPS */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">CONFIG FLAPS</span>
                  <div className="flex gap-1">
                    {['CONF 1+F', 'CONF 2', 'CONF 3'].map(f => (
                      <button
                        key={f}
                        onClick={() => setFlaps(f)}
                        className={`text-[10px] font-mono font-bold px-2 py-1 rounded transition ${
                          flaps === f 
                            ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400' 
                            : 'bg-[#090d14] border border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PACKS */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">AIR COND / PACKS</span>
                  <button 
                    onClick={() => setPacks(packs === 'OFF' ? 'ON' : 'OFF')}
                    className={`font-mono text-xs font-bold px-3 py-0.5 rounded border ${
                      packs === 'OFF' ? 'bg-[#090d14] border-emerald-500/50 text-emerald-400' : 'bg-amber-500/20 border-amber-500 text-amber-400'
                    }`}
                  >
                    {packs}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800 mt-4">
              BASE DE DATOS OPERATIVA: REV 2026.08
            </div>
          </section>

          {/* COLUMNA 2: RESULTADOS Y VELOCIDADES */}
          <section className="bg-[#111622] border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-emerald-400 tracking-wider">PRESTACIONES & VELOCIDADES</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  COMPUTED ✓
                </span>
              </div>

              {/* CARD DE EMPUJE FLEX */}
              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/50 rounded-lg p-3 text-center mb-3 shadow-inner">
                <span className="text-[10px] text-emerald-300 font-bold tracking-wider uppercase">EMPUJE DE DESPEGUE (THRUST)</span>
                <div className="text-3xl font-mono font-black text-emerald-400 tracking-tight my-0.5">
                  FLEX {flexTemp}°C
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  TARGET N1: {(86.0 + (flexTemp * 0.05)).toFixed(1)}% | TOGA: 68°C
                </div>
              </div>

              {/* CARDS DE VELOCIDADES V1, VR, V2 */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#090d14] border border-cyan-500/40 rounded-lg p-2 text-center shadow-lg">
                  <span className="text-[10px] font-bold text-slate-400 block">V1</span>
                  <span className="text-2xl font-mono font-black text-cyan-400 leading-none">{v1}</span>
                  <span className="text-[8px] text-slate-500 block mt-1">KNOTS</span>
                </div>
                <div className="bg-[#090d14] border border-cyan-500/40 rounded-lg p-2 text-center shadow-lg">
                  <span className="text-[10px] font-bold text-slate-400 block">VR</span>
                  <span className="text-2xl font-mono font-black text-cyan-400 leading-none">{vr}</span>
                  <span className="text-[8px] text-slate-500 block mt-1">KNOTS</span>
                </div>
                <div className="bg-[#090d14] border border-cyan-500/40 rounded-lg p-2 text-center shadow-lg">
                  <span className="text-[10px] font-bold text-slate-400 block">V2</span>
                  <span className="text-2xl font-mono font-black text-cyan-400 leading-none">{v2}</span>
                  <span className="text-[8px] text-slate-500 block mt-1">KNOTS</span>
                </div>
              </div>

              {/* DATOS TÉCNICOS ADICIONALES */}
              <div className="bg-[#090d14] p-2.5 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">PITCH TRIM:</span>
                  <span className="text-cyan-400 font-bold">{pitchTrim} / {cgPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ENG OUT ACC ALT:</span>
                  <span className="text-white font-bold">1500 FT AGL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">STOP MARGIN:</span>
                  <span className={`font-bold ${stopMargin < 500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    +{stopMargin.toLocaleString()} M
                  </span>
                </div>
              </div>
            </div>

            {/* BOTÓN ENVIAR A MCDU */}
            <button 
              onClick={handleMCDUSync}
              className={`w-full text-slate-950 font-black text-xs py-3 rounded-lg tracking-wider uppercase shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${
                mcduSent 
                  ? 'bg-emerald-400 shadow-emerald-500/20' 
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/20 active:scale-[0.98]'
              }`}
            >
              {mcduSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" /> SENT TO MCDU PRESET
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" /> SEND DATA TO MCDU PRESET
                </>
              )}
            </button>
          </section>

          {/* COLUMNA 3: GRÁFICOS Y ENVOLVENTE CG */}
          <section className="bg-[#111622] border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-amber-400 tracking-wider">VISUALIZACIÓN DE PISTA Y CG</span>
                <span className="text-[10px] font-mono text-slate-500">RUNWAY {runway}</span>
              </div>

              {/* GRÁFICO DINÁMICO DE PISTA */}
              <div className="bg-[#090d14] border border-slate-800 rounded-lg p-2 text-center mb-3">
                <span className="text-[9px] text-slate-500 font-mono block mb-1">MARGEN DE FRENADO Y DESPEGUE</span>
                <svg width="100%" height="70" viewBox="0 0 220 70">
                  <rect x="10" y="20" width="200" height="30" fill="#18202f" stroke="#334155" strokeWidth="1" rx="2" />
                  <line x1="15" y1="35" x2="205" y2="35" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6,4" />
                  <line x1="20" y1="23" x2="20" y2="47" stroke="#ffffff" strokeWidth="3" />
                  <line x1="200" y1="23" x2="200" y2="47" stroke="#ffffff" strokeWidth="3" />
                  <text x="30" y="39" fill="#00e5ff" fontSize="9" fontFamily="monospace" fontWeight="bold">{runway}</text>
                  
                  {/* Avión en pista */}
                  <polygon points="55,35 45,30 45,40" fill="#f59e0b" />
                  
                  {/* Corchete del margen de parada */}
                  <line x1="130" y1="12" x2="200" y2="12" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="130" y1="10" x2="130" y2="14" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="200" y1="10" x2="200" y2="14" stroke="#10b981" strokeWidth="1.5" />
                  <text x="165" y="8" fill="#10b981" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    STOP MARGIN +{stopMargin}M
                  </text>
                </svg>
              </div>

              {/* ENVOLVENTE DINÁMICA DE CENTRO DE GRAVEDAD (% MAC vs TOW) */}
              <div className="bg-[#090d14] border border-slate-800 rounded-lg p-2 text-center">
                <span className="text-[9px] text-slate-500 font-mono block mb-1">ENVOLVENTE DE CENTRO DE GRAVEDAD (% MAC)</span>
                <svg width="100%" height="95" viewBox="0 0 220 95">
                  {/* Ejes */}
                  <line x1="25" y1="10" x2="25" y2="80" stroke="#334155" strokeWidth="1" />
                  <line x1="25" y1="80" x2="205" y2="80" stroke="#334155" strokeWidth="1" />
                  
                  {/* Polígono de límites CG certificado */}
                  <polygon points="45,80 45,40 75,15 185,15 185,80" fill="rgba(0,229,255,0.08)" stroke="#00e5ff" strokeWidth="1.5" />
                  
                  {/* Punto Dinámico de TOW / CG */}
                  {(() => {
                    // Mapeo de TOW (52t a 77t) a eje Y (75 a 20)
                    const cy = Math.max(20, Math.min(75, 75 - ((tow - 52) / (77 - 52)) * 55));
                    // Mapeo de CG% (15% a 40%) a eje X (45 a 185)
                    const cx = Math.max(45, Math.min(185, 45 + ((cgPercent - 15) / (40 - 15)) * 140));
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r="4" fill="#f59e0b" className="transition-all duration-300" />
                        <circle cx={cx} cy={cy} r="8" fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" />
                        <text x={cx + 8} y={cy + 3} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          TOW {tow}T ({cgPercent}%)
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            <div className="text-[9px] text-emerald-400 font-mono text-center pt-2 border-t border-slate-800 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> DENTRO DE LÍMITES CERTIFICADOS DE CG
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
