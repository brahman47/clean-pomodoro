import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCw, Settings, Save, Palette, VenetianMask, Sparkles, Wand2, Notebook, X, Download, Upload } from 'lucide-react';

// --- Gradient Presets ---
const gradientPresets = [
  { name: 'Sunset', colors: ['#ff7e5f', '#feb47b'] },
  { name: 'Ocean', colors: ['#2b5876', '#4e4376'] },
  { name: 'Forest', colors: ['#134E5E', '#71B280'] },
  { name: 'Mojito', colors: ['#1d976c', '#93f9b9'] },
  { name: 'Cosmic', colors: ['#ff00cc', '#333399'] },
  { name: 'Peach', colors: ['#FFECD2', '#FCB69F'] },
];

// --- Mock shadcn/ui components (Enhanced Styling) ---
// Base Button component
const Button = ({ children, className, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg active:shadow-sm transform hover:scale-105 active:scale-95 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Input component
const Input = ({ className, type, ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${type === 'color' ? 'p-0.5 cursor-pointer' : ''} ${className}`}
    {...props}
  />
);

// Label component
const Label = ({ children, className, ...props }) => (
  <label className={`block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5 ${className}`} {...props}>
    {children}
  </label>
);

// Card component
const Card = ({ children, className, ...props }) => (
  <div className={`rounded-3xl border text-card-foreground shadow-xl backdrop-blur-md transition-transform duration-300 ease-out ${className}`} {...props}>
    {children}
  </div>
);

// CardHeader, CardTitle, CardContent, CardFooter
const CardHeader = ({ children, className, ...props }) => ( <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div> );
const CardTitle = ({ children, className, ...props }) => ( <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3> );
const CardContent = ({ children, className, ...props }) => ( <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div> );
const CardFooter = ({ children, className, ...props }) => ( <div className={`flex items-center p-6 pt-4 border-t border-white/10 ${className}`} {...props}>{children}</div> );

// Radio Group component
const RadioGroup = ({ children, className, ...props }) => ( <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`} {...props}>{children}</div> );
const RadioGroupItem = ({ id, value, name, checked, onChange, children }) => ( <div className="flex items-center space-x-2 cursor-pointer"><input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="peer relative h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 after:absolute after:left-1/2 after:top-1/2 after:h-0 after:w-0 after:rounded-full after:bg-current after:transition-all after:duration-200 after:content-[''] after:-translate-x-1/2 after:-translate-y-1/2 checked:after:h-2 checked:after:w-2"/><Label htmlFor={id} className="mb-0 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{children}</Label></div> );


// --- Main Pomodoro Clock App Component ---
function App() {
  // --- State Variables ---
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Background Customization State
  const [backgroundType, setBackgroundType] = useState('theme');
  const [bgColor1, setBgColor1] = useState('#dc2626');
  const [bgColor2, setBgColor2] = useState('#3b82f6');
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Notepad State
  const [showNotepad, setShowNotepad] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [notepadBgColor, setNotepadBgColor] = useState('#ffffff');

  // Refs
  const tempWorkRef = useRef(String(workDuration / 60));
  const tempBreakRef = useRef(String(breakDuration / 60));
  const [tempBgType, setTempBgType] = useState(backgroundType);
  const [tempColor1, setTempColor1] = useState(bgColor1);
  const [tempColor2, setTempColor2] = useState(bgColor2);
  const [tempSelectedPreset, setTempSelectedPreset] = useState(selectedPreset);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const notepadColorInputRef = useRef(null);

  // --- Helper Functions ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Effects ---
  // Timer Effect remains the same
  useEffect(() => {
    const switchSession = () => {
      console.log(isWorkSession ? "Work session finished!" : "Break finished!");
      const nextIsWorkSession = !isWorkSession;
      const nextDuration = nextIsWorkSession ? workDuration : breakDuration;
      setIsWorkSession(nextIsWorkSession);
      setTimeLeft(nextDuration);
      setIsRunning(false);
    };
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(intervalRef.current); switchSession();
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, isWorkSession, workDuration, breakDuration]);

  // --- Control Handlers ---
  // handleStartPause, handleReset, handleToggleSettings, handleSaveSettings remain the same
  const handleStartPause = useCallback(() => { if (timeLeft <= 0) return; setIsRunning(!isRunning); }, [isRunning, timeLeft]);
  const handleReset = useCallback(() => { clearInterval(intervalRef.current); setIsRunning(false); setIsWorkSession(true); setTimeLeft(workDuration); }, [workDuration]);
  const handleToggleSettings = useCallback(() => { if (isRunning) setIsRunning(false); if (!showSettings) { tempWorkRef.current = String(workDuration / 60); tempBreakRef.current = String(breakDuration / 60); setTempBgType(backgroundType); setTempColor1(bgColor1); setTempColor2(bgColor2); setTempSelectedPreset(selectedPreset); } setShowSettings(!showSettings); setShowNotepad(false); }, [showSettings, isRunning, workDuration, breakDuration, backgroundType, bgColor1, bgColor2, selectedPreset]);
  const handleSaveSettings = useCallback(() => { const newWorkMinutesStr = tempWorkRef.current; const newBreakMinutesStr = tempBreakRef.current; const newWorkMinutes = parseInt(newWorkMinutesStr, 10); const newBreakMinutes = parseInt(newBreakMinutesStr, 10); if (isNaN(newWorkMinutes) || newWorkMinutes <= 0 || isNaN(newBreakMinutes) || newBreakMinutes <= 0) { alert("Please enter valid positive numbers for durations."); return; } const newWorkSeconds = newWorkMinutes * 60; const newBreakSeconds = newBreakMinutes * 60; setWorkDuration(newWorkSeconds); setBreakDuration(newBreakSeconds); setBackgroundType(tempBgType); setBgColor1(tempColor1); setBgColor2(tempColor2); setSelectedPreset(tempSelectedPreset); if (!isRunning) { setTimeLeft(isWorkSession ? newWorkSeconds : newBreakSeconds); } setShowSettings(false); }, [ isRunning, isWorkSession, tempBgType, tempColor1, tempColor2, tempSelectedPreset, setWorkDuration, setBreakDuration, setTimeLeft, setShowSettings, setBackgroundType, setBgColor1, setBgColor2, setSelectedPreset ]);

  // --- Notepad Handlers ---
  // handleToggleNotepad, handleExportNote, handleImportNote, triggerFileInput remain the same
  const handleToggleNotepad = useCallback(() => { setShowNotepad(!showNotepad); setShowSettings(false); }, [showNotepad]);
  const handleExportNote = useCallback(() => { if (!noteContent) { alert("Note is empty!"); return; } const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'pomodoro-note.txt'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); }, [noteContent]);
  const handleImportNote = useCallback((event) => { const file = event.target.files[0]; if (!file) return; if (file.type !== 'text/plain') { alert('Please select a valid .txt file.'); return; } const reader = new FileReader(); reader.onload = (e) => { setNoteContent(e.target.result); }; reader.onerror = (e) => { console.error("Error reading file:", e); alert("Failed to read file."); }; reader.readAsText(file); event.target.value = null; }, []);
  const triggerFileInput = () => { fileInputRef.current?.click(); };


  // --- Dynamic Styling & Calculations ---
  // (This section remains the same as the previous version)
  const currentSessionTotalDuration = isWorkSession ? workDuration : breakDuration;
  const progress = currentSessionTotalDuration > 0 ? (currentSessionTotalDuration - timeLeft) / currentSessionTotalDuration : 0;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  let themeColorClass = '';
  let textColorClass = 'text-white';
  let cardBgClass = '';
  let borderColorClass = 'border-transparent';
  let buttonBgClass = '';
  let buttonStyle = {};
  let progressBgStrokeColor = ''; // Background of the progress circle
  let backgroundStyle = {};
  let isGradientBg = false;
  const workColor = '#ef4444'; const breakColor = '#3b82f6';
  const workColorLight = 'rgba(239, 68, 68, 0.2)'; const breakColorLight = 'rgba(59, 130, 246, 0.2)';
  const workGradient = 'from-red-500 to-red-600'; const breakGradient = 'from-blue-500 to-blue-600';
  if (backgroundType === 'theme') {
    themeColorClass = isWorkSession ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-blue-400 to-blue-600';
    cardBgClass = 'bg-black/20 border-white/20';
    buttonBgClass = `bg-gradient-to-r ${isWorkSession ? workGradient : breakGradient} text-white`;
    progressBgStrokeColor = isWorkSession ? workColorLight : breakColorLight;
    isGradientBg = true;
  } else if (backgroundType === 'solid') {
    backgroundStyle = { background: bgColor1 };
    cardBgClass = 'bg-black/30 border-white/20';
    buttonBgClass = `text-white shadow-lg`;
    buttonStyle = { background: bgColor1 };
    progressBgStrokeColor = 'rgba(255, 255, 255, 0.15)';
  } else if (backgroundType === 'gradient' || backgroundType === 'preset') {
    backgroundStyle = { background: `linear-gradient(to bottom right, ${bgColor1}, ${bgColor2})` };
    cardBgClass = 'bg-black/25 border-white/20';
    buttonBgClass = `text-white shadow-lg`;
    buttonStyle = { background: `linear-gradient(to right, ${bgColor1}, ${bgColor2})` };
    progressBgStrokeColor = 'rgba(255, 255, 255, 0.15)';
    isGradientBg = true;
  }
  const progressStrokeColor = isWorkSession ? workColor : breakColor;
  const animatedGradientClass = isGradientBg ? 'animate-gradient-bg' : '';


  return (
    <div
        className={`min-h-screen flex flex-col items-center justify-center font-sans p-4 transition-colors duration-500 overflow-hidden relative ${themeColorClass} ${textColorClass} ${animatedGradientClass}`}
        style={{ ...backgroundStyle, perspective: '1000px', backgroundSize: isGradientBg ? '200% 200%' : 'cover' }}
    >
      {/* --- Settings Modal (structure remains the same) --- */}
      {showSettings && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-lg bg-white text-gray-800 shadow-2xl transform scale-100 animate-scale-in overflow-y-auto max-h-[90vh]">
                <CardHeader className="border-b sticky top-0 bg-white z-10"><CardTitle className="text-2xl font-bold text-center text-gray-900">Settings</CardTitle></CardHeader>
                <CardContent className="space-y-6 pt-6 pb-4">
                    {/* Duration */}
                    <fieldset className="space-y-4 border rounded-lg p-4"><legend className="text-lg font-medium px-1 text-gray-800">Timers</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-1"><Label htmlFor="work-duration" className="text-gray-700">Work Duration (min)</Label><Input id="work-duration" type="number" min="1" defaultValue={tempWorkRef.current} onChange={(e) => tempWorkRef.current = e.target.value} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"/></div><div className="space-y-1"><Label htmlFor="break-duration" className="text-gray-700">Break Duration (min)</Label><Input id="break-duration" type="number" min="1" defaultValue={tempBreakRef.current} onChange={(e) => tempBreakRef.current = e.target.value} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"/></div></div></fieldset>
                    {/* Background */}
                    <fieldset className="space-y-4 border rounded-lg p-4"><legend className="text-lg font-medium px-1 text-gray-800 flex items-center"><Palette className="mr-2 h-5 w-5 text-indigo-600"/> Background Style</legend><RadioGroup className="text-gray-700 pb-2 border-b"><RadioGroupItem id="bg-theme" name="bgType" value="theme" checked={tempBgType === 'theme'} onChange={(e) => setTempBgType(e.target.value)}><VenetianMask className="mr-1 h-4 w-4"/> Theme</RadioGroupItem><RadioGroupItem id="bg-solid" name="bgType" value="solid" checked={tempBgType === 'solid'} onChange={(e) => setTempBgType(e.target.value)}>Solid</RadioGroupItem><RadioGroupItem id="bg-preset" name="bgType" value="preset" checked={tempBgType === 'preset'} onChange={(e) => setTempBgType(e.target.value)}><Sparkles className="mr-1 h-4 w-4"/> Presets</RadioGroupItem><RadioGroupItem id="bg-gradient" name="bgType" value="gradient" checked={tempBgType === 'gradient'} onChange={(e) => setTempBgType(e.target.value)}><Wand2 className="mr-1 h-4 w-4"/> Custom Gradient</RadioGroupItem></RadioGroup>
                        {/* Conditional Inputs */}
                        {tempBgType === 'solid' && (<div className="space-y-1 animate-fade-in"><Label htmlFor="color1-solid" className="text-gray-700">Choose Color</Label><Input id="color1-solid" type="color" value={tempColor1} onChange={(e) => setTempColor1(e.target.value)} className="h-10 w-full"/></div>)}
                        {tempBgType === 'preset' && (<div className="space-y-3 animate-fade-in"><Label className="text-gray-700">Select a Preset</Label><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{gradientPresets.map(p => (<button key={p.name} type="button" onClick={() => {setTempColor1(p.colors[0]); setTempColor2(p.colors[1]); setTempSelectedPreset(p.name); setTempBgType('preset');}} className={`h-16 rounded-lg border-2 transition-all duration-150 ${tempSelectedPreset === p.name ? 'border-indigo-500 ring-2 ring-indigo-300 scale-105' : 'border-gray-300 hover:border-gray-400'}`} style={{ background: `linear-gradient(to right, ${p.colors[0]}, ${p.colors[1]})` }} title={p.name}><span className="block text-center text-xs font-medium text-white mix-blend-difference p-1">{p.name}</span></button>))}</div></div>)}
                        {tempBgType === 'gradient' && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-fade-in"><div className="space-y-1"><Label htmlFor="color1-custom" className="text-gray-700">Gradient Start</Label><Input id="color1-custom" type="color" value={tempColor1} onChange={(e) => setTempColor1(e.target.value)} className="h-10 w-full"/></div><div className="space-y-1"><Label htmlFor="color2-custom" className="text-gray-700">Gradient End</Label><Input id="color2-custom" type="color" value={tempColor2} onChange={(e) => setTempColor2(e.target.value)} className="h-10 w-full"/></div></div>)}
                    </fieldset>
                </CardContent>
                <CardFooter className="flex justify-end space-x-3 bg-gray-50 rounded-b-3xl sticky bottom-0 z-10"><Button variant="outline" onClick={handleToggleSettings} className="text-gray-700 border border-gray-300 bg-white hover:bg-gray-100 shadow-sm active:shadow-xs h-10 px-4 py-2">Cancel</Button><Button onClick={handleSaveSettings} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 h-10 px-4 py-2"><Save className="mr-2 h-4 w-4" /> Save Changes</Button></CardFooter>
            </Card>
         </div>
      )}

      {/* --- Notepad Panel (structure remains the same) --- */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white text-gray-800 shadow-2xl rounded-l-3xl border-l border-gray-200 transform transition-transform duration-500 ease-in-out z-40 flex flex-col ${showNotepad ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: notepadBgColor }}>
            {/* Notepad Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-300/50 sticky top-0 z-10 backdrop-blur-sm" style={{backgroundColor: `${notepadBgColor}E6`}}>
                <h3 className="text-lg font-semibold flex items-center"><Notebook className="mr-2 h-5 w-5"/> Notepad</h3>
                 <div className="flex items-center space-x-2"><Label htmlFor="notepad-color-input" className="text-xs mb-0 text-gray-600">Color:</Label><button type="button" onClick={() => notepadColorInputRef.current?.click()} className="w-6 h-6 rounded-full border border-gray-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400" style={{ backgroundColor: notepadBgColor }} title="Change notepad background"/><input id="notepad-color-input" ref={notepadColorInputRef} type="color" value={notepadBgColor} onChange={(e) => setNotepadBgColor(e.target.value)} className="absolute w-0 h-0 opacity-0 pointer-events-none"/></div>
                <button onClick={handleToggleNotepad} className="p-1 rounded-full hover:bg-gray-500/10 text-gray-600" title="Close Notepad"><X size={20}/></button>
            </div>
            {/* Notepad Content */}
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Jot down your thoughts..." className="flex-grow p-4 text-sm outline-none resize-none bg-transparent notepad-textarea" style={{ color: 'inherit' }}/>
            {/* Notepad Footer */}
            <div className="p-3 border-t border-gray-300/50 flex justify-end space-x-2 sticky bottom-0 z-10 backdrop-blur-sm" style={{backgroundColor: `${notepadBgColor}E6`}}>
                <input type="file" ref={fileInputRef} onChange={handleImportNote} accept=".txt" className="hidden"/>
                <Button onClick={triggerFileInput} variant="outline" className="h-9 px-3 py-1 text-xs bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm active:shadow-xs rounded-lg"><Upload size={14} className="mr-1"/> Import (.txt)</Button>
                <Button onClick={handleExportNote} variant="outline" className="h-9 px-3 py-1 text-xs bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm active:shadow-xs rounded-lg"><Download size={14} className="mr-1"/> Export (.txt)</Button>
            </div>
      </div>


      {/* --- Main Clock Display --- */}
      <Card className={`group w-full max-w-md relative overflow-hidden ${cardBgClass} ${borderColorClass} hover:-rotate-y-3 hover:rotate-x-1 hover:shadow-2xl`}>
         {/* Shine Effect */}
         <div className="absolute inset-0 top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine z-10 pointer-events-none"></div>
         {/* Header */}
         <CardHeader className="text-center pb-2 pt-8 relative z-20"><CardTitle className={`text-2xl font-semibold tracking-wider ${textColorClass} opacity-90`}>{isWorkSession ? 'FOCUS' : 'BREAK'}</CardTitle></CardHeader>
         {/* Content */}
         <CardContent className="flex flex-col items-center justify-center pt-4 pb-8 relative z-20">
            {/* Timer SVG */}
            <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-8 filter drop-shadow-lg">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                    {/* Background Circle */}
                    <circle cx="150" cy="150" r={radius} fill="transparent" stroke={progressBgStrokeColor} strokeWidth="18"/>
                    {/* Progress Circle - Removed problematic comment */}
                    <circle
                        cx="150" cy="150" r={radius} fill="transparent"
                        stroke={progressStrokeColor}
                        strokeWidth="18" strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round" transform="rotate(-90 150 150)"
                        style={{ transition: 'stroke-dashoffset 0.3s linear, stroke 0.5s ease' }}
                    />
                </svg>
                {/* Timer Text */}
                <div className={`relative z-10 text-7xl font-bold font-mono tabular-nums ${textColorClass} tracking-tighter`}>{formatTime(timeLeft)}</div>
            </div>
            {/* Control Buttons */}
            <div className="flex space-x-4">
                <Button onClick={handleStartPause} className={`${buttonBgClass} h-12 px-6`} style={buttonStyle} disabled={timeLeft <= 0 && !isRunning} title={timeLeft <= 0 && !isRunning ? "Reset timer or change settings" : (isRunning ? "Pause Timer" : "Start Timer")}>
                    {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                    {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={handleReset} className={`${buttonBgClass} h-12 px-6`} style={buttonStyle}>
                    <RotateCw className="mr-2 h-5 w-5"/> Reset
                </Button>
                <Button onClick={handleToggleSettings} className={`${buttonBgClass} w-12 h-12 p-0 flex items-center justify-center`} style={buttonStyle} title="Open Settings">
                    <Settings className="h-5 w-5"/>
                </Button>
                <Button onClick={handleToggleNotepad} className={`${buttonBgClass} w-12 h-12 p-0 flex items-center justify-center`} style={buttonStyle} title="Open Notepad">
                    <Notebook className="h-5 w-5"/>
                </Button>
            </div>
         </CardContent>
      </Card>

       {/* Footer Info (remains the same) */}
       <footer className="mt-10 text-center text-xs opacity-60">
            <p className={textColorClass}>Pomodoro Timer</p>
            <p className={textColorClass}>Work: {workDuration / 60}m | Break: {breakDuration / 60}m</p>
            {backgroundType !== 'theme' && (<p className={`${textColorClass} mt-1`}>BG: {backgroundType === 'solid' ? `Solid (${bgColor1})` : backgroundType === 'preset' ? `Preset (${selectedPreset || 'Custom'})` : `Gradient (${bgColor1} to ${bgColor2})`}</p>)}
        </footer>

        {/* Global Styles and Animations (remains mostly the same) */}
        <style jsx global>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes gradient-bg-animation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            @keyframes shine-animation { 0% { transform: translateX(-100%) skewX(-20deg); } 100% { transform: translateX(calc(100% + 200px)) skewX(-20deg); } }

            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
            .animate-gradient-bg { animation: gradient-bg-animation 15s ease infinite; }
            .animate-shine { animation: shine-animation 1.2s ease-out; }

            /* Custom radio button styling */
            input[type='radio'].form-radio:checked { border-color: #6366f1; background-color: #6366f1; }
            input[type='radio'].form-radio:checked::after { background-color: white; }
            input[type='radio'].form-radio { border-color: #a5b4fc; }

            /* Style color input */
            input[type="color"] { -webkit-appearance: none; -moz-appearance: none; appearance: none; background-color: transparent; border: 1px solid #d1d5db; border-radius: 0.5rem; cursor: pointer; padding: 0; }
            input[type="color"]::-webkit-color-swatch { border-radius: 0.375rem; border: none; }
            input[type="color"]::-moz-color-swatch { border-radius: 0.375rem; border: none; }

            /* Ensure group-hover works for shine */
            .group:hover .animate-shine { animation: shine-animation 1.2s ease-out; }

            /* Style notepad textarea placeholder */
            .notepad-textarea::placeholder { color: inherit; opacity: 0.6; }
            /* Optional: Style scrollbar for notepad textarea */
            .notepad-textarea::-webkit-scrollbar { width: 8px; }
            .notepad-textarea::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
            .notepad-textarea::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.3); border-radius: 4px; }
            .notepad-textarea::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.4); }
        `}</style>
    </div>
  );
}

export default App;
