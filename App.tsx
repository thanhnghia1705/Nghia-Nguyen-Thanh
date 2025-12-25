
import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import { generateSpell, getMysticAdvice } from './services/geminiService';
import { SpellInfo } from './types';

const App: React.FC = () => {
  const [currentSpell, setCurrentSpell] = useState<SpellInfo>({
    name: "Eldritch Shield",
    description: "The primary defensive barrier of Kamar-Taj.",
    incantation: "Protego Maximus",
    color: "#fb923c"
  });
  
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSpellRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const input = chatInput;
    setChatInput("");
    setIsGenerating(true);
    
    setChatHistory(prev => [...prev, { role: 'user', content: input }]);

    try {
      // If the user asks for a spell, generate it
      if (input.toLowerCase().includes("spell") || input.toLowerCase().includes("magic")) {
        const spell = await generateSpell(input);
        setCurrentSpell(spell);
        setChatHistory(prev => [...prev, { 
          role: 'model', 
          content: `I have prepared the ${spell.name}. It is described as: ${spell.description}. Recite: "${spell.incantation}"` 
        }]);
      } else {
        const advice = await getMysticAdvice([{ role: 'user', content: input }]);
        setChatHistory(prev => [...prev, { role: 'model', content: advice }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', content: "The mystical energies are unstable. Try again." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a] text-slate-200">
      {/* Sidebar / Chat */}
      <div className="w-96 h-full border-r border-orange-900/30 flex flex-col bg-[#0d0d0d]">
        <div className="p-6 border-b border-orange-900/30">
          <h1 className="text-2xl font-serif font-bold text-orange-500 tracking-tighter">KAMAR-TAJ</h1>
          <p className="text-xs text-orange-300/60 uppercase tracking-widest mt-1 font-mono">Sanctum Sanctorum Terminal</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-orange-900/10 p-4 rounded-lg border border-orange-900/20 text-sm italic text-orange-200/80">
            "Wong is monitoring the Sanctum. Ask him for a new spell or mystic guidance."
          </div>
          
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-orange-600/20 border border-orange-600/40 text-orange-100' 
                  : 'bg-slate-800/40 border border-slate-700 text-slate-300'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex items-center space-x-2 text-orange-400 text-xs animate-pulse">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
              <span>Consulting the archives...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSpellRequest} className="p-4 border-t border-orange-900/30">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="e.g. Give me a fire spell"
              className="w-full bg-black border border-orange-900/40 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors pr-12"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="absolute right-2 top-1.5 p-1 text-orange-500 hover:text-orange-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        <div className="w-full h-full max-w-6xl max-h-[80vh] bg-black/40 rounded-3xl overflow-hidden border border-orange-900/20 backdrop-blur-md shadow-2xl relative">
          <CameraView currentSpell={currentSpell} />
          
          {/* Overlay Stats */}
          <div className="absolute top-6 right-6 flex flex-col items-end pointer-events-none">
            <div className="bg-black/60 border border-orange-500/30 px-3 py-1.5 rounded-md backdrop-blur-sm">
              <div className="text-[10px] text-orange-400 font-mono uppercase tracking-widest mb-1">Mana Frequency</div>
              <div className="flex space-x-1 h-3 items-end">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-orange-500/50" 
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute top-6 left-6 pointer-events-none">
            <div className="text-xs font-mono text-orange-500/60 uppercase tracking-[0.2em] mb-4">Tracking Enabled</div>
            <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
               <span className="text-[10px] text-green-400/80 font-mono">NEURAL_NET_V3_ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Floating Controls Hint */}
        <div className="absolute bottom-10 right-10 flex flex-col space-y-3">
          <div className="bg-black/80 border border-orange-500/20 p-4 rounded-xl backdrop-blur-md max-w-xs">
            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Mystic Instructions</h4>
            <ul className="text-[11px] space-y-2 text-slate-400">
              <li>• Show your hand to the camera to summon the portal.</li>
              <li>• Pinch your fingers together to scale the shield down.</li>
              <li>• Spread your thumb and index to expand the magic circle.</li>
              <li>• Ask Wong for specific spells to change the color and effects.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
