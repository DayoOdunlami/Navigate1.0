'use client';

import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import clsx from 'clsx';
import {
  SlidersHorizontal,
  Sparkles,
  Bot,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type PanelKey = 'controls' | 'insights' | 'ai' | 'intelligence';

export interface PanelMeta {
  label: string;
  icon: typeof SlidersHorizontal;
  accent: string;
}

export interface PanelConfig {
  key: PanelKey;
  content: ReactNode;
  widthOffset?: number; // Adjust width relative to base
}

export interface FloatingPanelSystemProps {
  // Panels to display
  panels: PanelConfig[];
  
  // Initial state
  initialOpenPanels?: PanelKey[];
  initialPanelOrder?: PanelKey[];
  initialWidth?: number;
  
  // Callbacks
  onPanelToggle?: (panel: PanelKey, isOpen: boolean) => void;
  onFocusModeChange?: (focusMode: boolean) => void;
  
  // Customization
  panelMeta?: Partial<Record<PanelKey, PanelMeta>>;
  showFocusModeButton?: boolean;
  className?: string;
  position?: 'right' | 'left';
  topOffset?: number; // Distance from top in pixels
  bottomOffset?: number; // Distance from bottom in pixels
}

// ============================================================================
// DEFAULT PANEL METADATA
// ============================================================================

const DEFAULT_PANEL_META: Record<PanelKey, PanelMeta> = {
  controls: { label: 'Controls', icon: SlidersHorizontal, accent: '#006E51' },
  insights: { label: 'Insights', icon: Sparkles, accent: '#0f8b8d' },
  ai: { label: 'AI Copilot', icon: Bot, accent: '#7c3aed' },
  intelligence: { label: 'Intelligence', icon: Sparkles, accent: '#0f8b8d' },
};

// ============================================================================
// FLOATING PANEL COMPONENT
// ============================================================================

interface FloatingPanelProps {
  panelKey: PanelKey;
  meta: PanelMeta;
  width: number;
  collapsed: boolean;
  onCollapse: () => void;
  onClose: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  children: ReactNode;
}

function FloatingPanel({
  panelKey,
  meta,
  width,
  collapsed,
  onCollapse,
  onClose,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  children,
}: FloatingPanelProps) {
  if (collapsed) {
    return null;
  }

  const Icon = meta.icon;

  return (
    <div
      className="pointer-events-auto flex h-[80vh] max-h-[80vh] flex-col rounded-3xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur-xl"
      style={{ width }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-sm font-semibold cursor-move"
        style={{ color: meta.accent }}
        onDoubleClick={onCollapse}
        title="Double-click to collapse"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{meta.label}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <button
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className={clsx(
              'rounded-full p-1 transition-colors',
              canMoveLeft ? 'hover:bg-gray-100 hover:text-gray-600' : 'opacity-40 cursor-not-allowed'
            )}
            title="Move left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className={clsx(
              'rounded-full p-1 transition-colors',
              canMoveRight ? 'hover:bg-gray-100 hover:text-gray-600' : 'opacity-40 cursor-not-allowed'
            )}
            title="Move right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={onCollapse}
            className="rounded-full p-1 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Collapse panel"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// PANEL LAUNCHER BUTTONS
// ============================================================================

interface PanelLaunchersProps {
  panels: PanelConfig[];
  panelMeta: Record<PanelKey, PanelMeta>;
  openPanels: Set<PanelKey>;
  collapsedPanels: Record<PanelKey, boolean>;
  onToggle: (panel: PanelKey) => void;
  focusMode: boolean;
  onFocusModeToggle: () => void;
  showFocusModeButton: boolean;
}

function PanelLaunchers({
  panels,
  panelMeta,
  openPanels,
  collapsedPanels,
  onToggle,
  focusMode,
  onFocusModeToggle,
  showFocusModeButton,
}: PanelLaunchersProps) {
  return (
    <div className="flex items-center gap-2">
      {panels.map((panel) => {
        const meta = panelMeta[panel.key];
        const Icon = meta.icon;
        const isOpen = openPanels.has(panel.key);
        const isCollapsed = collapsedPanels[panel.key];
        const isActive = isOpen && !isCollapsed;

        return (
          <button
            key={panel.key}
            onClick={() => onToggle(panel.key)}
            className={clsx(
              'relative flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all',
              isActive
                ? 'bg-white text-gray-900 border-white'
                : 'bg-white/70 text-gray-500 hover:bg-white border-white/50'
            )}
            style={{ color: isActive ? meta.accent : undefined }}
            title={meta.label}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
      
      {showFocusModeButton && (
        <button
          onClick={onFocusModeToggle}
          className={clsx(
            'flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all',
            focusMode
              ? 'bg-[#006E51] text-white border-[#006E51]'
              : 'bg-white/70 text-gray-500 hover:bg-white border-white/50'
          )}
          title={focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
        >
          {focusMode ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FloatingPanelSystem({
  panels,
  initialOpenPanels,
  initialPanelOrder,
  initialWidth = 340,
  onPanelToggle,
  onFocusModeChange,
  panelMeta: customPanelMeta,
  showFocusModeButton = true,
  className,
  position = 'right',
  topOffset = 80,
  bottomOffset = 24,
}: FloatingPanelSystemProps) {
  // Merge default and custom panel metadata
  const panelMeta = { ...DEFAULT_PANEL_META, ...customPanelMeta };
  
  // Panel state
  const [openPanels, setOpenPanels] = useState<Set<PanelKey>>(() => {
    const initial = initialOpenPanels || panels.map(p => p.key);
    return new Set(initial);
  });
  
  const [panelOrder, setPanelOrder] = useState<PanelKey[]>(() => {
    return initialPanelOrder || panels.map(p => p.key);
  });
  
  const [collapsedPanels, setCollapsedPanels] = useState<Record<PanelKey, boolean>>(() => {
    const initial: Record<PanelKey, boolean> = {} as Record<PanelKey, boolean>;
    panels.forEach(p => { initial[p.key] = false; });
    return initial;
  });
  
  const [panelWidth, setPanelWidth] = useState(initialWidth);
  const [focusMode, setFocusMode] = useState(false);
  
  // Resize handling
  const resizeMeta = useRef({ active: false, startX: 0, startWidth: 0 });

  const handleResizing = useCallback((event: MouseEvent) => {
    if (!resizeMeta.current.active) return;
    const delta = position === 'right' 
      ? resizeMeta.current.startX - event.clientX
      : event.clientX - resizeMeta.current.startX;
    const nextWidth = Math.min(500, Math.max(280, resizeMeta.current.startWidth + delta));
    setPanelWidth(nextWidth);
  }, [position]);

  const handleResizeEnd = useCallback(() => {
    resizeMeta.current.active = false;
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizing]);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      resizeMeta.current = {
        active: true,
        startX: event.clientX,
        startWidth: panelWidth,
      };
      window.addEventListener('mousemove', handleResizing);
      window.addEventListener('mouseup', handleResizeEnd);
    },
    [handleResizeEnd, handleResizing, panelWidth]
  );

  // Cleanup resize listeners
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleResizing);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizing, handleResizeEnd]);

  // Panel operations
  const togglePanel = useCallback((panel: PanelKey) => {
    setOpenPanels(prev => {
      const next = new Set(prev);
      if (next.has(panel)) {
        // If collapsed, expand it; otherwise close it
        if (collapsedPanels[panel]) {
          setCollapsedPanels(c => ({ ...c, [panel]: false }));
          return next;
        }
        next.delete(panel);
        onPanelToggle?.(panel, false);
      } else {
        next.add(panel);
        setCollapsedPanels(c => ({ ...c, [panel]: false }));
        onPanelToggle?.(panel, true);
      }
      return next;
    });
  }, [collapsedPanels, onPanelToggle]);

  const toggleCollapse = useCallback((panel: PanelKey) => {
    setCollapsedPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  const movePanel = useCallback((panel: PanelKey, direction: 'left' | 'right') => {
    setPanelOrder(prev => {
      const currentIndex = prev.indexOf(panel);
      if (currentIndex === -1) return prev;
      const targetIndex = direction === 'left'
        ? Math.max(0, currentIndex - 1)
        : Math.min(prev.length - 1, currentIndex + 1);
      if (targetIndex === currentIndex) return prev;
      const next = [...prev];
      const [removed] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, removed);
      return next;
    });
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => {
      const next = !prev;
      onFocusModeChange?.(next);
      return next;
    });
  }, [onFocusModeChange]);

  // Compute panel width with offsets
  const computePanelWidth = useCallback((panel: PanelConfig) => {
    const offset = panel.widthOffset || 0;
    return Math.max(280, Math.min(520, panelWidth + offset));
  }, [panelWidth]);

  // Get ordered, open panels
  const visiblePanels = panelOrder
    .filter(key => openPanels.has(key))
    .map(key => panels.find(p => p.key === key)!)
    .filter(Boolean);

  const hasOpenPanels = visiblePanels.some(p => !collapsedPanels[p.key]);

  return (
    <>
      {/* Panel Launcher Buttons */}
      <div 
        className={clsx(
          'absolute z-30 flex items-center gap-2',
          position === 'right' ? 'right-6' : 'left-6'
        )}
        style={{ top: topOffset - 60 }}
      >
        <PanelLaunchers
          panels={panels}
          panelMeta={panelMeta}
          openPanels={openPanels}
          collapsedPanels={collapsedPanels}
          onToggle={togglePanel}
          focusMode={focusMode}
          onFocusModeToggle={toggleFocusMode}
          showFocusModeButton={showFocusModeButton}
        />
      </div>

      {/* Floating Panel Stack */}
      {hasOpenPanels && (
        <div
          className={clsx(
            'pointer-events-none absolute z-20 flex gap-4 transition-opacity duration-200',
            position === 'right' ? 'right-6' : 'left-6',
            focusMode ? 'opacity-0' : 'opacity-100',
            className
          )}
          style={{ 
            top: topOffset, 
            bottom: bottomOffset,
          }}
        >
          {/* Resize Handle */}
          <div 
            className={clsx(
              'relative flex items-center',
              position === 'right' ? 'pr-2' : 'pl-2',
              focusMode ? 'pointer-events-none' : 'pointer-events-auto'
            )}
          >
            <div
              className="h-20 w-1 rounded-full bg-white/80 shadow-md ring-1 ring-black/5 cursor-ew-resize hover:bg-gray-200 transition-colors"
              onMouseDown={handleResizeStart}
              title="Drag to resize panels"
            />
          </div>

          {/* Panel Stack */}
          <div 
            className={clsx(
              'flex items-start gap-4',
              focusMode ? 'pointer-events-none' : 'pointer-events-auto'
            )}
          >
            {visiblePanels.map((panel, index) => {
              const meta = panelMeta[panel.key];
              return (
                <FloatingPanel
                  key={panel.key}
                  panelKey={panel.key}
                  meta={meta}
                  width={computePanelWidth(panel)}
                  collapsed={collapsedPanels[panel.key]}
                  onCollapse={() => toggleCollapse(panel.key)}
                  onClose={() => togglePanel(panel.key)}
                  onMoveLeft={() => movePanel(panel.key, 'left')}
                  onMoveRight={() => movePanel(panel.key, 'right')}
                  canMoveLeft={index > 0}
                  canMoveRight={index < visiblePanels.length - 1}
                >
                  {panel.content}
                </FloatingPanel>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingPanelSystem;


