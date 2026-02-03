type WorkflowStep = 'homepage' | 'gameRecommend' | 'gameAnalysisResult' | 'premise' | 'validation' | 'artStyle' | 'rules';

interface WorkflowHeaderProps {
  currentStep: WorkflowStep;
}

export default function WorkflowHeader({ currentStep }: WorkflowHeaderProps) {
  return (
    <>
      {/* Header */}
      <header className="border-b border-[#00ff88]/20 bg-[#0f0f0f]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse-glow"></div>
            <h1 className="text-2xl font-bold text-[#00ff88] font-mono">
              WORLD-BUILDING ENGINE
            </h1>
            <div className="flex-1"></div>
            <div className="text-xs text-gray-500 font-mono">
              v2.0.0
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-400 font-mono">
            Expert Council Analysis System | Seven Laws Framework
          </p>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'premise' ? 'bg-[#00ff88] text-black' :
                ['validation', 'artStyle', 'rules'].includes(currentStep) ? 'bg-green-500/20 text-green-400 border border-green-500' :
                'bg-gray-700 text-gray-400'
              }`}>1</div>
              <span className="text-sm font-mono text-gray-400">Core Premise</span>
            </div>
            <div className="flex-1 h-px bg-gray-800 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'validation' ? 'bg-[#00ff88] text-black' :
                ['artStyle', 'rules'].includes(currentStep) ? 'bg-green-500/20 text-green-400 border border-green-500' :
                'bg-gray-700 text-gray-400'
              }`}>2</div>
              <span className="text-sm font-mono text-gray-400">Validation</span>
            </div>
            <div className="flex-1 h-px bg-gray-800 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'artStyle' ? 'bg-[#00ff88] text-black' :
                currentStep === 'rules' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                'bg-gray-700 text-gray-400'
              }`}>2</div>
              <span className="text-sm font-mono text-gray-400">Art Style</span>
            </div>
            <div className="flex-1 h-px bg-gray-800 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'rules' ? 'bg-[#00ff88] text-black' : 'bg-gray-700 text-gray-400'
              }`}>3</div>
              <span className="text-sm font-mono text-gray-400">Rules</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
