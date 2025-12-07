'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  UnifiedNetworkGraph,
  ClusterMode,
  PrimaryClusterBy,
  SecondaryClusterBy,
  ColorBy,
} from './UnifiedNetworkGraphNested';

import { unifiedEntities, unifiedRelationships } from '@/data/unified';

const PRESETS = {
  nested: {
    label: 'Domain → Entity Type',
    clusterMode: 'nested' as ClusterMode,
    primaryClusterBy: 'domain' as PrimaryClusterBy,
    secondaryClusterBy: 'entityType' as SecondaryClusterBy,
    colorBy: 'secondaryCluster' as ColorBy,
  },
  nestedByMode: {
    label: 'Domain → Transport Mode',
    clusterMode: 'nested' as ClusterMode,
    primaryClusterBy: 'domain' as PrimaryClusterBy,
    secondaryClusterBy: 'mode' as SecondaryClusterBy,
    colorBy: 'secondaryCluster' as ColorBy,
  },
  byDomain: {
    label: 'By Domain (single level)',
    clusterMode: 'single' as ClusterMode,
    primaryClusterBy: 'domain' as PrimaryClusterBy,
    secondaryClusterBy: 'entityType' as SecondaryClusterBy,
    colorBy: 'entityType' as ColorBy,
  },
};

type PresetKey = keyof typeof PRESETS;
type LayoutMode = 'sidebar' | 'floating';
type SidebarTab = 'controls' | 'insights' | 'chat';

export function NetworkGraphDemoV5() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('sidebar');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('controls');
  const [floatingControlsOpen, setFloatingControlsOpen] = useState(true);
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [preset, setPreset] = useState<PresetKey>('nested');
  const [clusterMode, setClusterMode] = useState<ClusterMode>(PRESETS.nested.clusterMode);
  const [primaryClusterBy, setPrimaryClusterBy] = useState<PrimaryClusterBy>(PRESETS.nested.primaryClusterBy);
  const [secondaryClusterBy, setSecondaryClusterBy] = useState<SecondaryClusterBy>(PRESETS.nested.secondaryClusterBy);
  const [colorBy, setColorBy] = useState<ColorBy>(PRESETS.nested.colorBy);

  const [showHulls, setShowHulls] = useState(true);
  const [clusterTightness, setClusterTightness] = useState(0.5);
  const [clusterSpacing, setClusterSpacing] = useState(0.8);

  const [reheatAlpha, setReheatAlpha] = useState(0.3);
  const [velocityDecay, setVelocityDecay] = useState(0.7);
  const [maxVelocity, setMaxVelocity] = useState(18);
  const [maxDistance, setMaxDistance] = useState(1000);

  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: 'Hi! Ask me about any selected entity or cluster.' },
  ]);

  const currentConfig = useMemo(() => {
    return { clusterMode, primaryClusterBy, secondaryClusterBy, colorBy };
  }, [clusterMode, primaryClusterBy, secondaryClusterBy, colorBy]);

  const handlePresetChange = (key: PresetKey) => {
    setPreset(key);
    const p = PRESETS[key];
    setClusterMode(p.clusterMode);
    setPrimaryClusterBy(p.primaryClusterBy);
    setSecondaryClusterBy(p.secondaryClusterBy);
    setColorBy(p.colorBy);
  };

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatInput.trim()) return;
    setChatHistory((prev) => [...prev, { role: 'user', text: chatInput }]);
    setChatHistory((prev) => [
      ...prev,
      {
        role: 'ai',
        text:
          selectedEntity
            ? `Quick insight about ${selectedEntity.name}: This is a ${selectedEntity.entityType} in ${selectedEntity.domain}.`
            : 'Select an entity to get richer insights.',
      },
    ]);
    setChatInput('');
  };

  const graphElement = (
    <UnifiedNetworkGraph
      entities={unifiedEntities}
      relationships={unifiedRelationships}
      mode={viewMode}
      colorBy={currentConfig.colorBy}
      clusterMode={currentConfig.clusterMode}
      primaryClusterBy={currentConfig.primaryClusterBy}
      secondaryClusterBy={currentConfig.secondaryClusterBy}
      showHulls={showHulls}
      clusterTightness={clusterTightness}
      clusterSpacing={clusterSpacing}
      reheatAlpha={reheatAlpha}
      velocityDecay={velocityDecay}
      maxVelocity={maxVelocity}
      maxDistance={maxDistance}
      onNodeSelect={setSelectedEntity}
      fitToCanvas
      clickToFocus
    />
  );

  const controlsPanel = (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">View Mode</p>
        <div className="flex gap-2">
          {(['2d', '3d'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 rounded-md border px-2 py-1 text-sm ${
                viewMode === mode ? 'bg-[#006E51] text-white border-[#006E51]' : 'bg-white text-gray-600'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Preset</p>
        <select
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value as PresetKey)}
          className="w-full rounded-md border px-2 py-1 text-sm text-gray-700"
        >
          {Object.entries(PRESETS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Show Hulls</span>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={showHulls}
            onChange={(e) => setShowHulls(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#006E51] focus:ring-[#006E51]/20"
          />
        </label>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Cluster Tightness ({clusterTightness.toFixed(1)})</label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={clusterTightness}
          onChange={(e) => setClusterTightness(parseFloat(e.target.value))}
          className="w-full accent-[#006E51]"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Cluster Spacing ({clusterSpacing.toFixed(2)})</label>
        <input
          type="range"
          min="0.3"
          max="1.5"
          step="0.05"
          value={clusterSpacing}
          onChange={(e) => setClusterSpacing(parseFloat(e.target.value))}
          className="w-full accent-[#006E51]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Velocity Decay</label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={velocityDecay}
            onChange={(e) => setVelocityDecay(parseFloat(e.target.value))}
            className="w-full accent-purple-600"
          />
          <p className="text-[11px] text-gray-500 mt-1">{velocityDecay.toFixed(2)}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Max Velocity</label>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={maxVelocity}
            onChange={(e) => setMaxVelocity(parseInt(e.target.value))}
            className="w-full accent-purple-600"
          />
          <p className="text-[11px] text-gray-500 mt-1">{maxVelocity}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Max Distance</label>
          <input
            type="range"
            min="200"
            max="1000"
            step="50"
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseInt(e.target.value))}
            className="w-full accent-purple-600"
          />
          <p className="text-[11px] text-gray-500 mt-1">{maxDistance}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Primary Cluster by</label>
          <select
            value={primaryClusterBy}
            onChange={(e) => setPrimaryClusterBy(e.target.value as PrimaryClusterBy)}
            className="w-full rounded-md border px-2 py-1 text-sm text-gray-700"
          >
            <option value="domain">Domain</option>
            <option value="entityType">Entity Type</option>
            <option value="mode">Transport Mode</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Secondary Cluster by</label>
          <select
            value={secondaryClusterBy}
            onChange={(e) => setSecondaryClusterBy(e.target.value as SecondaryClusterBy)}
            className="w-full rounded-md border px-2 py-1 text-sm text-gray-700"
            disabled={clusterMode !== 'nested'}
          >
            <option value="entityType">Entity Type</option>
            <option value="mode">Transport Mode</option>
            <option value="theme">Strategic Theme</option>
            <option value="sector">Sector</option>
          </select>
        </div>
      </div>
    </div>
  );

  const insightsPanel = selectedEntity ? (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
      <p className="text-xs uppercase tracking-wide text-emerald-600 mb-1">Selected</p>
      <p className="font-semibold text-emerald-900">{selectedEntity.name}</p>
      <p className="text-emerald-700 text-xs mt-1">
        {selectedEntity.entityType} · {selectedEntity.domain.toUpperCase()}
      </p>
      <p className="text-emerald-700 text-xs mt-2">
        {selectedEntity.description?.slice(0, 160) || 'No description available.'}
      </p>
    </div>
  ) : (
    <p className="text-xs text-gray-500">Select a node to view insights.</p>
  );

  const chatPanel = (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
        {chatHistory.map((msg, idx) => (
          <div
            key={`chat-${idx}-${msg.role}`}
            className={`rounded-lg px-3 py-2 ${
              msg.role === 'ai' ? 'bg-slate-100 text-slate-700' : 'bg-[#006E51]/10 text-[#006E51]'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className="border-t border-gray-100 p-2">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask about selected entity..."
          className="w-full rounded-lg border px-3 py-1.5 text-sm focus:border-[#006E51] focus:outline-none"
        />
      </form>
    </div>
  );

  const sidebarLayout = (
    <div className="flex flex-1">
      <div className="relative flex-1 bg-slate-50">{graphElement}</div>
      <aside className="w-[360px] border-l border-gray-200 bg-white flex flex-col">
        <div className="flex items-center border-b border-gray-100">
          {(['controls', 'insights', 'chat'] as SidebarTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setSidebarTab(tab)}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                sidebarTab === tab ? 'border-b-2 border-[#006E51] text-[#006E51]' : 'text-gray-500'
              }`}
            >
              {tab === 'controls' ? 'Controls' : tab === 'insights' ? 'Insights' : 'AI Chat'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sidebarTab === 'controls' && controlsPanel}
          {sidebarTab === 'insights' && insightsPanel}
          {sidebarTab === 'chat' && chatPanel}
        </div>
      </aside>
    </div>
  );

  const floatingLayout = (
    <div className="relative flex-1 bg-slate-50">
      {graphElement}

      {/* Floating Controls Button */}
      <button
        onClick={() => setFloatingControlsOpen((prev) => !prev)}
        className="absolute left-4 top-4 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium shadow"
      >
        {floatingControlsOpen ? 'Hide Controls' : 'Show Controls'}
      </button>

      {floatingControlsOpen && (
        <div className="absolute left-4 top-16 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600">Controls</p>
            <span className="text-[11px] text-gray-400">Floating stack</span>
          </div>
          {controlsPanel}
        </div>
      )}

      {/* Floating Insights */}
      {selectedEntity && (
        <div className="absolute left-4 bottom-4 w-80 rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-emerald-600 uppercase">Insights</p>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-[11px] text-emerald-500 hover:text-emerald-700"
            >
              Clear
            </button>
          </div>
          {insightsPanel}
        </div>
      )}

      {/* Floating Chat */}
      <div className="absolute right-4 bottom-4">
        {floatingChatOpen ? (
          <div className="w-80 rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <p className="text-xs font-semibold text-gray-600">AI Copilot</p>
              <button
                onClick={() => setFloatingChatOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <div className="max-h-[320px]">{chatPanel}</div>
          </div>
        ) : (
          <button
            onClick={() => setFloatingChatOpen(true)}
            className="rounded-full bg-[#006E51] px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            AI Chat
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Unified Graph V5</p>
          <h1 className="text-lg font-semibold text-gray-900">Compare Layout Options</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-gray-500">Layout:</span>
          {(['sidebar', 'floating'] as LayoutMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setLayoutMode(mode)}
              className={`rounded-full border px-3 py-1 ${
                layoutMode === mode ? 'border-[#006E51] bg-[#006E51]/10 text-[#006E51]' : 'border-gray-200 text-gray-600'
              }`}
            >
              {mode === 'sidebar' ? 'Docked Sidebar' : 'Floating Stack'}
            </button>
          ))}
        </div>
      </header>

      {layoutMode === 'sidebar' ? sidebarLayout : floatingLayout}

      <footer className="border-t border-gray-200 bg-white px-6 py-2 text-xs text-gray-500 flex justify-between">
        <span>
          Hover to highlight connections · Click to focus · Scroll to zoom · Drag to pan{' '}
          {viewMode === '3d' && '· Right-drag to rotate'}
        </span>
        <span className="text-gray-400">Preset: {PRESETS[preset].label}</span>
      </footer>
    </div>
  );
}

export default NetworkGraphDemoV5;



