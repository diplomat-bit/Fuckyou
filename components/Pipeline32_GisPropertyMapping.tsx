

// --- CONSOLIDATED FROM: ./pipelines/Pipeline32_GisPropertyMapping.tsx ---

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Map as MapIcon,
  Layers,
  Compass,
  Globe,
  ShieldAlert,
  Mountain,
  Droplets,
  Ruler,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Download,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Crosshair,
  Building2,
  Sliders,
  Filter,
  Trees,
  SunMedium,
  Radio,
  FileSpreadsheet,
  Check,
  ChevronRight,
  TrendingUp,
  MapPin,
  Flame,
  Wind
} from 'lucide-react';

// --- Types & Interfaces ---

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface ParcelRecord {
  id: string;
  apn: string; // Assessor Parcel Number
  address: string;
  owner: string;
  zoning: 'R-1' | 'R-3' | 'C-2' | 'M-1' | 'PUD' | 'AG-20';
  zoningDescription: string;
  lotSizeSqFt: number;
  lotSizeAcres: number;
  assessedValue: number;
  improvementValue: number;
  landValue: number;
  taxYear: number;
  elevationMeters: number;
  slopePercentage: number;
  floodZone: 'Zone X (Minimal)' | 'Zone AE (100-yr)' | 'Zone VE (Coastal)' | 'Zone A';
  floodRiskScore: number; // 0 - 100
  wildfireRisk: 'Low' | 'Moderate' | 'High' | 'Very High';
  soilType: string;
  wetlandOverlapPct: number;
  solarPotentialKwhYr: number;
  centroid: GeoCoordinate;
  polygonCoords: [number, number][]; // SVG space coordinates
  status: 'Compliant' | 'Non-Conforming' | 'Pending Review' | 'Violation Detected';
  setbackViolations: boolean;
}

export interface GisLayerConfig {
  id: string;
  name: string;
  category: 'base' | 'cadastral' | 'environmental' | 'infrastructure' | 'planning';
  icon: React.ReactNode;
  visible: boolean;
  opacity: number;
  color: string;
  count?: number;
}

export interface PipelineStage {
  id: number;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'warning';
  durationMs: number;
  recordsProcessed: number;
  crs: string; // Coordinate Reference System
}

export interface SpatialMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'good' | 'warning' | 'alert';
}

// --- Mock Dataset for GIS Parcels ---

const MOCK_PARCELS: ParcelRecord[] = [
  {
    id: 'PAR-8921-A',
    apn: '042-180-019-000',
    address: '4820 Skyline Ridge Blvd, Austin, TX 78746',
    owner: 'Vanguard Real Estate Holdings LLC',
    zoning: 'R-1',
    zoningDescription: 'Single-Family Residential Large Lot',
    lotSizeSqFt: 38400,
    lotSizeAcres: 0.88,
    assessedValue: 1450000,
    improvementValue: 980000,
    landValue: 470000,
    taxYear: 2024,
    elevationMeters: 284.5,
    slopePercentage: 8.2,
    floodZone: 'Zone X (Minimal)',
    floodRiskScore: 12,
    wildfireRisk: 'Moderate',
    soilType: 'Tarrant-Rock outcrop complex (0-15% slope)',
    wetlandOverlapPct: 0.0,
    solarPotentialKwhYr: 18450,
    centroid: { lat: 30.2941, lng: -97.7912 },
    polygonCoords: [[60, 60], [180, 50], [210, 160], [80, 180]],
    status: 'Compliant',
    setbackViolations: false
  },
  {
    id: 'PAR-8922-B',
    apn: '042-180-020-000',
    address: '4832 Skyline Ridge Blvd, Austin, TX 78746',
    owner: 'Crestview Horizon Trust',
    zoning: 'R-1',
    zoningDescription: 'Single-Family Residential Large Lot',
    lotSizeSqFt: 45200,
    lotSizeAcres: 1.04,
    assessedValue: 1890000,
    improvementValue: 1250000,
    landValue: 640000,
    taxYear: 2024,
    elevationMeters: 278.2,
    slopePercentage: 14.6,
    floodZone: 'Zone AE (100-yr)',
    floodRiskScore: 78,
    wildfireRisk: 'High',
    soilType: 'Brackett gravelly clay loam',
    wetlandOverlapPct: 14.2,
    solarPotentialKwhYr: 21300,
    centroid: { lat: 30.2948, lng: -97.7895 },
    polygonCoords: [[180, 50], [310, 40], [330, 150], [210, 160]],
    status: 'Pending Review',
    setbackViolations: true
  },
  {
    id: 'PAR-8923-C',
    apn: '042-180-021-000',
    address: '1100 Barton Creek Pkwy, Austin, TX 78746',
    owner: 'Apex Global Logistics Partners',
    zoning: 'C-2',
    zoningDescription: 'General Commercial Service / Retail',
    lotSizeSqFt: 112000,
    lotSizeAcres: 2.57,
    assessedValue: 4850000,
    improvementValue: 3100000,
    landValue: 1750000,
    taxYear: 2024,
    elevationMeters: 242.0,
    slopePercentage: 3.1,
    floodZone: 'Zone X (Minimal)',
    floodRiskScore: 24,
    wildfireRisk: 'Low',
    soilType: 'Austin silty clay',
    wetlandOverlapPct: 0.0,
    solarPotentialKwhYr: 68900,
    centroid: { lat: 30.2915, lng: -97.788 },
    polygonCoords: [[210, 160], [330, 150], [360, 270], [230, 290]],
    status: 'Compliant',
    setbackViolations: false
  },
  {
    id: 'PAR-8924-D',
    apn: '042-180-022-000',
    address: '1120 Barton Creek Pkwy, Austin, TX 78746',
    owner: 'GreenTree Mixed Development LLC',
    zoning: 'PUD',
    zoningDescription: 'Planned Unit Development',
    lotSizeSqFt: 165000,
    lotSizeAcres: 3.79,
    assessedValue: 7200000,
    improvementValue: 4900000,
    landValue: 2300000,
    taxYear: 2024,
    elevationMeters: 235.1,
    slopePercentage: 4.8,
    floodZone: 'Zone AE (100-yr)',
    floodRiskScore: 84,
    wildfireRisk: 'Moderate',
    soilType: 'Volente clay loam',
    wetlandOverlapPct: 22.8,
    solarPotentialKwhYr: 94500,
    centroid: { lat: 30.2898, lng: -97.7865 },
    polygonCoords: [[330, 150], [480, 130], [510, 260], [360, 270]],
    status: 'Violation Detected',
    setbackViolations: true
  },
  {
    id: 'PAR-8925-E',
    apn: '042-180-023-000',
    address: '4910 Highland Valley Rd, Austin, TX 78746',
    owner: 'Travis County Parkland Preserve',
    zoning: 'AG-20',
    zoningDescription: 'Agricultural & Conservation District (20ac min)',
    lotSizeSqFt: 435600,
    lotSizeAcres: 10.0,
    assessedValue: 2100000,
    improvementValue: 150000,
    landValue: 1950000,
    taxYear: 2024,
    elevationMeters: 310.8,
    slopePercentage: 22.4,
    floodZone: 'Zone X (Minimal)',
    floodRiskScore: 5,
    wildfireRisk: 'Very High',
    soilType: 'Rough stony land (Edwards limestone)',
    wetlandOverlapPct: 1.2,
    solarPotentialKwhYr: 152000,
    centroid: { lat: 30.2975, lng: -97.795 },
    polygonCoords: [[80, 180], [230, 290], [170, 420], [30, 310]],
    status: 'Compliant',
    setbackViolations: false
  },
  {
    id: 'PAR-8926-F',
    apn: '042-180-024-000',
    address: '4950 Highland Valley Rd, Austin, TX 78746',
    owner: 'Highland Ridge Estates Inc',
    zoning: 'R-3',
    zoningDescription: 'Multi-Family Residential Medium Density',
    lotSizeSqFt: 88500,
    lotSizeAcres: 2.03,
    assessedValue: 3950000,
    improvementValue: 2800000,
    landValue: 1150000,
    taxYear: 2024,
    elevationMeters: 260.4,
    slopePercentage: 6.7,
    floodZone: 'Zone X (Minimal)',
    floodRiskScore: 18,
    wildfireRisk: 'Low',
    soilType: 'San Saba clay',
    wetlandOverlapPct: 0.0,
    solarPotentialKwhYr: 49800,
    centroid: { lat: 30.293, lng: -97.784 },
    polygonCoords: [[230, 290], [360, 270], [400, 410], [260, 430]],
    status: 'Compliant',
    setbackViolations: false
  }
];

export const Pipeline32_GisPropertyMapping: React.FC = () => {
  // --- Pipeline Lifecycle State ---
  const [pipelineRunning, setPipelineRunning] = useState<boolean>(false);
  const [pipelineProgress, setPipelineProgress] = useState<number>(100);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('PAR-8921-A');
  const [hoveredParcelId, setHoveredParcelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'spatial' | 'attributes' | 'zoning' | 'risk' | 'geojson'>('spatial');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoningFilter, setZoningFilter] = useState<string>('ALL');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'GeoJSON' | 'Shapefile' | 'KML' | 'DXF'>('GeoJSON');

  // --- GIS Layer States ---
  const [layers, setLayers] = useState<GisLayerConfig[]>([
    { id: 'cadastral', name: 'Cadastral Parcels (APN)', category: 'cadastral', icon: <Building2 className="w-4 h-4" />, visible: true, opacity: 0.85, color: '#38bdf8', count: 6 },
    { id: 'zoning', name: 'Zoning Classifications', category: 'planning', icon: <Layers className="w-4 h-4" />, visible: true, opacity: 0.65, color: '#a855f7', count: 5 },
    { id: 'flood', name: 'FEMA 100-Yr Floodplain', category: 'environmental', icon: <Droplets className="w-4 h-4" />, visible: true, opacity: 0.55, color: '#3b82f6', count: 2 },
    { id: 'contours', name: 'Topographic Contours (5m LiDAR)', category: 'environmental', icon: <Mountain className="w-4 h-4" />, visible: true, opacity: 0.7, color: '#eab308' },
    { id: 'wildfire', name: 'WUI Wildfire Risk Hazard', category: 'environmental', icon: <Flame className="w-4 h-4" />, visible: false, opacity: 0.5, color: '#ef4444' },
    { id: 'wetlands', name: 'USFWS National Wetlands', category: 'environmental', icon: <Trees className="w-4 h-4" />, visible: false, opacity: 0.6, color: '#10b981' },
    { id: 'roads', name: 'Transportation & ROW', category: 'infrastructure', icon: <Radio className="w-4 h-4" />, visible: true, opacity: 0.9, color: '#94a3b8' },
    { id: 'solar', name: 'Solar Insolation Index', category: 'environmental', icon: <SunMedium className="w-4 h-4" />, visible: false, opacity: 0.6, color: '#f97316' },
  ]);

  // --- Map Navigation / Viewport State ---
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapOffset, setMapOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // --- Pipeline Stages ---
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: 1, name: 'Cadastral WFS/WMS Ingestion', description: 'Travis County Open Data Portal ingest', status: 'completed', durationMs: 420, recordsProcessed: 1420, crs: 'EPSG:2277' },
    { id: 2, name: 'CRS Projection Transform', description: 'Reprojecting NAD83 Texas Central to WGS84', status: 'completed', durationMs: 180, recordsProcessed: 1420, crs: 'EPSG:4326' },
    { id: 3, name: 'LiDAR Slope & Elevation Intersect', description: 'DEM elevation raster extraction & slope calc', status: 'completed', durationMs: 890, recordsProcessed: 1420, crs: 'EPSG:4326' },
    { id: 4, name: 'FEMA & Wetland Spatial Overlay', description: 'Intersection of polygons with FIRM panels', status: 'completed', durationMs: 640, recordsProcessed: 1420, crs: 'EPSG:4326' },
    { id: 5, name: 'Zoning & Setback Automated Audit', description: 'Cadastral buffer analysis & code validation', status: 'completed', durationMs: 310, recordsProcessed: 1420, crs: 'EPSG:4326' },
    { id: 6, name: 'Valuation & GeoJSON Matrix Vector', description: 'GeoJSON topological feature serialization', status: 'completed', durationMs: 220, recordsProcessed: 1420, crs: 'EPSG:4326' },
  ]);

  // Filtered Parcels
  const filteredParcels = useMemo(() => {
    return MOCK_PARCELS.filter(p => {
      const matchSearch = p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.apn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchZoning = zoningFilter === 'ALL' || p.zoning === zoningFilter;
      return matchSearch && matchZoning;
    });
  }, [searchQuery, zoningFilter]);

  const selectedParcel = useMemo(() => {
    return MOCK_PARCELS.find(p => p.id === selectedParcelId) || MOCK_PARCELS[0];
  }, [selectedParcelId]);

  // Toggle Layer Visibility
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l));
  }, []);

  // Update Layer Opacity
  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, opacity } : l));
  }, []);

  // Run Pipeline Execution Simulation
  const executePipeline = useCallback(() => {
    setPipelineRunning(true);
    setPipelineProgress(0);

    // Reset stages
    setStages(prev => prev.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'running' : 'idle'
    })));

    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage <= 6) {
        setPipelineProgress(Math.floor((currentStage / 6) * 100));
        setStages(prev => prev.map((s, idx) => {
          if (idx < currentStage - 1) return { ...s, status: 'completed' };
          if (idx === currentStage - 1) return { ...s, status: 'completed' };
          if (idx === currentStage) return { ...s, status: 'running' };
          return s;
        }));
      } else {
        clearInterval(interval);
        setPipelineRunning(false);
        setPipelineProgress(100);
      }
    }, 600);
  }, []);

  // Map Navigation Handlers
  const handleZoomIn = () => setMapZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setMapZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetView = () => {
    setMapZoom(1);
    setMapOffset({ x: 0, y: 0 });
    setMeasurePoints([]);
    setMeasurementMode(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (measurementMode) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || measurementMode) return;
    setMapOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleMapSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!measurementMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - mapOffset.x) / mapZoom;
    const y = (e.clientY - rect.top - mapOffset.y) / mapZoom;
    setMeasurePoints(prev => [...prev, [Math.round(x), Math.round(y)]]);
  };

  // Color by Zoning Code
  const getZoningFill = (zoning: string) => {
    switch (zoning) {
      case 'R-1': return 'rgba(59, 130, 246, 0.4)';
      case 'R-3': return 'rgba(99, 102, 241, 0.45)';
      case 'C-2': return 'rgba(239, 68, 68, 0.45)';
      case 'M-1': return 'rgba(168, 85, 247, 0.45)';
      case 'PUD': return 'rgba(234, 179, 8, 0.45)';
      case 'AG-20': return 'rgba(34, 197, 94, 0.4)';
      default: return 'rgba(148, 163, 184, 0.4)';
    }
  };

  const getZoningStroke = (zoning: string) => {
    switch (zoning) {
      case 'R-1': return '#3b82f6';
      case 'R-3': return '#6366f1';
      case 'C-2': return '#ef4444';
      case 'M-1': return '#a855f7';
      case 'PUD': return '#eab308';
      case 'AG-20': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  // GeoJSON Representation of selected parcel
  const geoJsonData = useMemo(() => {
    return JSON.stringify(
      {
        type: 'FeatureCollection',
        crs: {
          type: 'name',
          properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
        },
        features: filteredParcels.map(p => ({
          type: 'Feature',
          id: p.id,
          geometry: {
            type: 'Polygon',
            coordinates: [
              p.polygonCoords.map(coord => [
                Number((p.centroid.lng + (coord[0] - 250) * 0.0001).toFixed(6)),
                Number((p.centroid.lat + (coord[1] - 250) * 0.0001).toFixed(6))
              ])
            ]
          },
          properties: {
            APN: p.apn,
            ADDRESS: p.address,
            OWNER: p.owner,
            ZONING: p.zoning,
            LOT_SQFT: p.lotSizeSqFt,
            ACRES: p.lotSizeAcres,
            VALUATION_USD: p.assessedValue,
            FLOOD_ZONE: p.floodZone,
            FLOOD_RISK_SCORE: p.floodRiskScore,
            WILDFIRE_RISK: p.wildfireRisk,
            ELEVATION_M: p.elevationMeters,
            SLOPE_PCT: p.slopePercentage,
            SETBACK_STATUS: p.status
          }
        }))
      },
      null,
      2
    );
  }, [filteredParcels]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation / Status Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-lg shadow-lg shadow-cyan-500/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Pipeline #32: GIS Property Mapping & Spatial Intelligence
              </h1>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                CRS EPSG:4326
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cadastral boundaries, LiDAR topography, FEMA flood intersections, and automated zoning compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Execution Progress Bar if running */}
          {pipelineRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-cyan-500/30">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-cyan-300">Executing Spatial Pipeline</span>
                <div className="w-32 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${pipelineProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400">{pipelineProgress}%</span>
            </div>
          )}

          <button
            onClick={executePipeline}
            disabled={pipelineRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-cyan-600/30 transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {pipelineRunning ? 'Processing GIS...' : 'Run Pipeline'}
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Spatial Data
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Layers, Filters & Parcels */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          {/* Layer Management Section */}
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                GIS Spatial Overlays ({layers.filter(l => l.visible).length}/{layers.length})
              </span>
              <button
                onClick={() => setLayers(layers.map(l => ({ ...l, visible: true })))}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Show All
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {layers.map(layer => (
                <div
                  key={layer.id}
                  className={`flex flex-col p-1.5 rounded text-xs transition border ${
                    layer.visible
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-slate-900/40 border-transparent text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {layer.visible ? (
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="flex items-center gap-1.5">
                        <span style={{ color: layer.color }}>{layer.icon}</span>
                        <span className="truncate max-w-[130px] font-medium">{layer.name}</span>
                      </span>
                    </div>

                    {layer.count !== undefined && (
                      <span className="px-1.5 py-0.2 bg-slate-700 text-[10px] rounded font-mono text-slate-300">
                        {layer.count}
                      </span>
                    )}
                  </div>

                  {layer.visible && (
                    <div className="mt-1.5 flex items-center gap-2 px-1">
                      <span className="text-[10px] text-slate-400 w-10">Alpha</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={layer.opacity}
                        onChange={(e) => updateLayerOpacity(layer.id, parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <span className="text-[10px] font-mono text-slate-400 w-6">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search and Zoning Filters */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search APN, Address, Owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" /> Zoning:
              </span>
              <select
                value={zoningFilter}
                onChange={(e) => setZoningFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Zones</option>
                <option value="R-1">R-1 Single Family</option>
                <option value="R-3">R-3 Multi Family</option>
                <option value="C-2">C-2 Commercial</option>
                <option value="PUD">PUD Planned Dev</option>
                <option value="AG-20">AG-20 Agriculture</option>
              </select>
            </div>
          </div>

          {/* Parcel List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
              Active Parcels ({filteredParcels.length})
            </div>
            {filteredParcels.map((parcel) => {
              const isSelected = parcel.id === selectedParcelId;
              return (
                <div
                  key={parcel.id}
                  onClick={() => setSelectedParcelId(parcel.id)}
                  onMouseEnter={() => setHoveredParcelId(parcel.id)}
                  onMouseLeave={() => setHoveredParcelId(null)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">{parcel.apn}</span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: getZoningFill(parcel.zoning),
                            color: getZoningStroke(parcel.zoning),
                            border: `1px solid ${getZoningStroke(parcel.zoning)}`
                          }}
                        >
                          {parcel.zoning}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[190px] mt-0.5">
                        {parcel.address}
                      </p>
                    </div>
                    {parcel.status === 'Violation Detected' && (
                      <span title="Setback Violation"><AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" /></span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800/60">
                    <span>{parcel.lotSizeAcres} ac / {(parcel.lotSizeSqFt / 1000).toFixed(1)}k sf</span>
                    <span className="text-cyan-300 font-medium">
                      ${(parcel.assessedValue / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spatial Pipeline Stages Mini-Summary */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">Processing Pipeline</span>
              <span className="text-cyan-400 font-mono text-[10px]">6/6 Operational</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  title={`${stage.name} (${stage.status})`}
                  className={`h-1.5 rounded-full transition-all ${
                    stage.status === 'completed'
                      ? 'bg-cyan-500'
                      : stage.status === 'running'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Interactive GIS Map Canvas */}
        <div className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
          {/* GIS Floating Toolbar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur p-1.5 rounded-lg border border-slate-800 shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Reset Extents"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-700" />

            <button
              onClick={() => {
                setMeasurementMode(!measurementMode);
                setMeasurePoints([]);
              }}
              className={`p-1.5 rounded transition flex items-center gap-1 text-xs ${
                measurementMode
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Measure Geometry"
            >
              <Ruler className="w-4 h-4" />
              <span>{measurementMode ? 'Measuring' : 'Measure'}</span>
            </button>

            <div className="h-4 w-px bg-slate-700" />

            {/* Coordinate readout */}
            <div className="px-2 text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>
                {selectedParcel.centroid.lat.toFixed(4)}° N, {Math.abs(selectedParcel.centroid.lng).toFixed(4)}° W
              </span>
            </div>
          </div>

          {/* Map Compass & Scale */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2">
            <div className="bg-slate-900/90 backdrop-blur p-2 rounded-full border border-slate-800 shadow-xl text-cyan-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono border border-slate-800 text-slate-400">
              Scale: 1:2,400
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div
            className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden select-none bg-[#090d16]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 600 500"
              preserveAspectRatio="xMidYMid meet"
              onClick={handleMapSvgClick}
              style={{
                transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapZoom})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              <defs>
                {/* Grid pattern */}
                <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  <circle cx="0" cy="0" r="1" fill="#334155" />
                </pattern>

                {/* Flood Hazard Hatch Pattern */}
                <pattern id="floodPattern" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
                </pattern>

                {/* Wetland pattern */}
                <pattern id="wetlandPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#10b981" fillOpacity="0.5" />
                  <circle cx="7" cy="7" r="1.5" fill="#10b981" fillOpacity="0.5" />
                </pattern>
              </defs>

              {/* Base Cartographic Grid */}
              <rect width="1000" height="1000" x="-200" y="-200" fill="url(#gisGrid)" />

              {/* Topographic Contour Lines Layer */}
              {layers.find(l => l.id === 'contours')?.visible && (
                <g
                  stroke="#eab308"
                  strokeWidth="0.75"
                  fill="none"
                  opacity={layers.find(l => l.id === 'contours')?.opacity || 0.7}
                >
                  <path d="M -50 100 Q 150 50 350 120 T 650 90" strokeDasharray="3,3" />
                  <path d="M -50 160 Q 180 120 380 180 T 650 170" />
                  <path d="M -50 230 Q 120 190 320 250 T 650 240" />
                  <path d="M -50 310 Q 200 270 400 330 T 650 310" strokeDasharray="3,3" />
                  <path d="M -50 390 Q 160 340 360 410 T 650 390" />
                  <text x="20" y="155" fill="#ca8a04" fontSize="8" fontFamily="monospace">280m</text>
                  <text x="20" y="225" fill="#ca8a04" fontSize="8" fontFamily="monospace">260m</text>
                  <text x="20" y="305" fill="#ca8a04" fontSize="8" fontFamily="monospace">240m</text>
                </g>
              )}

              {/* FEMA Flood Risk Zone Overlays */}
              {layers.find(l => l.id === 'flood')?.visible && (
                <g opacity={layers.find(l => l.id === 'flood')?.opacity || 0.55}>
                  <path
                    d="M 170 30 Q 320 20 490 120 L 520 280 L 320 160 Z"
                    fill="url(#floodPattern)"
                    stroke="#3b82f6"
                    strokeWidth="1"
                  />
                  <text x="360" y="90" fill="#60a5fa" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                    FEMA 100-YR FLOODWAY (Zone AE)
                  </text>
                </g>
              )}

              {/* Transportation Network & Right-Of-Ways */}
              {layers.find(l => l.id === 'roads')?.visible && (
                <g
                  stroke="#475569"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={layers.find(l => l.id === 'roads')?.opacity || 0.9}
                >
                  {/* Barton Creek Parkway */}
                  <path d="M 0 210 Q 250 190 600 220" stroke="#64748b" strokeWidth="18" fill="none" />
                  <path d="M 0 210 Q 250 190 600 220" stroke="#fbbf24" strokeWidth="1" strokeDasharray="8,6" fill="none" />
                  {/* Skyline Ridge Blvd */}
                  <path d="M 210 0 L 230 500" stroke="#64748b" strokeWidth="14" fill="none" />
                  <path d="M 210 0 L 230 500" stroke="#f1f5f9" strokeWidth="0.8" strokeDasharray="6,4" fill="none" />
                  
                  {/* Road Names */}
                  <text x="240" y="30" fill="#94a3b8" fontSize="8" transform="rotate(85 240 30)">Skyline Ridge Blvd</text>
                  <text x="40" y="202" fill="#94a3b8" fontSize="8">Barton Creek Pkwy</text>
                </g>
              )}

              {/* Cadastral Parcel Boundaries */}
              {layers.find(l => l.id === 'cadastral')?.visible && (
                <g>
                  {MOCK_PARCELS.map((parcel) => {
                    const isSelected = parcel.id === selectedParcelId;
                    const isHovered = parcel.id === hoveredParcelId;
                    const pointsString = parcel.polygonCoords.map(pt => pt.join(',')).join(' ');

                    return (
                      <g key={parcel.id} className="cursor-pointer">
                        {/* Parcel Polygon */}
                        <polygon
                          points={pointsString}
                          fill={getZoningFill(parcel.zoning)}
                          stroke={isSelected ? '#38bdf8' : isHovered ? '#f8fafc' : getZoningStroke(parcel.zoning)}
                          strokeWidth={isSelected ? '3' : isHovered ? '2' : '1.2'}
                          strokeDasharray={parcel.status === 'Violation Detected' ? '4,2' : undefined}
                          opacity={layers.find(l => l.id === 'cadastral')?.opacity || 0.85}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParcelId(parcel.id);
                          }}
                          onMouseEnter={() => setHoveredParcelId(parcel.id)}
                          onMouseLeave={() => setHoveredParcelId(null)}
                        />

                        {/* Centroid APN Tag & Marker */}
                        <circle
                          cx={parcel.polygonCoords.reduce((sum, p) => sum + p[0], 0) / parcel.polygonCoords.length}
                          cy={parcel.polygonCoords.reduce((sum, p) => sum + p[1], 0) / parcel.polygonCoords.length}
                          r={isSelected ? '4' : '2.5'}
                          fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                        />

                        {/* APN text on map */}
                        <text
                          x={parcel.polygonCoords.reduce((sum, p) => sum + p[0], 0) / parcel.polygonCoords.length}
                          y={(parcel.polygonCoords.reduce((sum, p) => sum + p[1], 0) / parcel.polygonCoords.length) - 8}
                          fill={isSelected ? '#38bdf8' : '#f1f5f9'}
                          fontSize="9"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor="middle"
                          className="pointer-events-none drop-shadow"
                        >
                          {parcel.apn}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Active Measurement Polyline */}
              {measurementMode && measurePoints.length > 0 && (
                <g>
                  <polyline
                    points={measurePoints.map(p => p.join(',')).join(' ')}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  {measurePoints.map((pt, idx) => (
                    <circle key={idx} cx={pt[0]} cy={pt[1]} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                  ))}
                </g>
              )}
            </svg>

            {/* Measurement HUD Overlay */}
            {measurementMode && (
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur p-2.5 rounded-lg border border-cyan-500/40 text-xs shadow-lg flex items-center gap-4">
                <div>
                  <span className="text-cyan-400 font-medium">Distance Measurement Active</span>
                  <p className="text-[11px] text-slate-400">Click on canvas to add vertex nodes</p>
                </div>
                <div className="font-mono text-cyan-300 font-semibold">
                  Points: {measurePoints.length}
                </div>
                <button
                  onClick={() => setMeasurePoints([])}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-[11px]"
                >
                  Clear Nodes
                </button>
              </div>
            )}

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur p-2.5 rounded-lg border border-slate-800 text-xs space-y-1.5 shadow-lg">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Zoning Legend
              </span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500/40 border border-blue-500" />
                  <span>R-1 Single Fam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500/40 border border-indigo-500" />
                  <span>R-3 Multi Fam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-red-500/40 border border-red-500" />
                  <span>C-2 Commercial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500" />
                  <span>PUD Planned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-green-500/40 border border-green-500" />
                  <span>AG-20 Conserv</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Property Dossier, GIS Attributes & Scoring */}
        <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          {/* Selected Parcel Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  APN: {selectedParcel.apn}
                </span>
                <h2 className="text-base font-bold text-white mt-1.5 leading-tight">
                  {selectedParcel.address}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedParcel.owner}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  selectedParcel.status === 'Compliant'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : selectedParcel.status === 'Violation Detected'
                    ? 'bg-red-950 text-red-400 border-red-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  {selectedParcel.status}
                </span>
              </div>
            </div>
          </div>

          {/* Dossier Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900">
            <button
              onClick={() => setActiveTab('spatial')}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'spatial'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Spatial
            </button>
            <button
              onClick={() => setActiveTab('attributes')}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'attributes'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Valuation
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'risk'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Hazards
            </button>
            <button
              onClick={() => setActiveTab('geojson')}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'geojson'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              GeoJSON
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeTab === 'spatial' && (
              <div className="space-y-4">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Lot Acreage</span>
                    <p className="text-lg font-bold text-white font-mono mt-0.5">
                      {selectedParcel.lotSizeAcres} <span className="text-xs font-normal text-slate-400">acres</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedParcel.lotSizeSqFt.toLocaleString()} sq ft
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">LiDAR Elevation</span>
                    <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                      {selectedParcel.elevationMeters}m
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Avg Slope: {selectedParcel.slopePercentage}%
                    </span>
                  </div>
                </div>

                {/* Spatial Coordinates Box */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> WGS84 Centroid
                    </span>
                    <span className="font-mono text-cyan-300 text-[11px]">
                      {selectedParcel.centroid.lat.toFixed(6)}, {selectedParcel.centroid.lng.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">State Plane Grid</span>
                    <span className="font-mono text-slate-300 text-[11px]">TX Central 4203</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Boundary Nodes</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {selectedParcel.polygonCoords.length} Polygon Vertices
                    </span>
                  </div>
                </div>

                {/* Topography & Soil Classification */}
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-yellow-500" />
                    Topographic & Geotechnical Analysis
                  </span>
                  <div className="text-xs space-y-1.5 pt-1">
                    <div>
                      <span className="text-[11px] text-slate-400">Soil Map Unit (NRCS SSURGO):</span>
                      <p className="text-slate-200 font-medium text-[11px] mt-0.5">{selectedParcel.soilType}</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Buildable Slope Envelope:</span>
                      <span className={`font-semibold ${selectedParcel.slopePercentage > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {selectedParcel.slopePercentage > 15 ? 'Critical Hillside (>15%)' : 'Standard Build (<15%)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Solar Potential */}
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SunMedium className="w-4 h-4 text-orange-400" />
                    <div>
                      <span className="text-xs font-semibold text-white">Solar Generation Yield</span>
                      <p className="text-[10px] text-slate-400">NREL PVWatts Est.</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-orange-400">
                      {selectedParcel.solarPotentialKwhYr.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400"> kWh/yr</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attributes' && (
              <div className="space-y-4">
                {/* Assessed Value Breakdown */}
                <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-400">Total Assessed Value</span>
                    <span className="text-base font-mono font-bold text-cyan-400">
                      ${selectedParcel.assessedValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-700/80 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Land Valuation:</span>
                      <span className="font-mono text-slate-200">${selectedParcel.landValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Improvement Structure:</span>
                      <span className="font-mono text-slate-200">${selectedParcel.improvementValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Price / SqFt Land:</span>
                      <span className="font-mono text-cyan-300">
                        ${(selectedParcel.landValue / selectedParcel.lotSizeSqFt).toFixed(2)}/sf
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Assessment Tax Year:</span>
                      <span className="font-mono text-slate-200">{selectedParcel.taxYear}</span>
                    </div>
                  </div>
                </div>

                {/* Zoning Specs */}
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Zoning Ordinance</span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{
                        backgroundColor: getZoningFill(selectedParcel.zoning),
                        color: getZoningStroke(selectedParcel.zoning)
                      }}
                    >
                      {selectedParcel.zoning}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{selectedParcel.zoningDescription}</p>

                  <div className="text-[11px] pt-2 border-t border-slate-800/80 space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Front Setback Required:</span>
                      <span className="text-slate-200 font-mono">25 ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Side Setback Required:</span>
                      <span className="text-slate-200 font-mono">10 ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Impervious Cover:</span>
                      <span className="text-slate-200 font-mono">45%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'risk' && (
              <div className="space-y-4">
                {/* Flood Risk */}
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      FEMA Flood Hazard
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      selectedParcel.floodRiskScore > 50 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      Score: {selectedParcel.floodRiskScore}/100
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Designation: <span className="font-semibold text-white">{selectedParcel.floodZone}</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${selectedParcel.floodRiskScore > 50 ? 'bg-red-500' : 'bg-emerald-400'}`}
                      style={{ width: `${selectedParcel.floodRiskScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Wetland Overlay: {selectedParcel.wetlandOverlapPct}% of lot surface
                  </span>
                </div>

                {/* Wildfire Hazard */}
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-red-500" />
                      Wildfire Urban Interface (WUI)
                    </span>
                    <span className={`text-xs font-bold ${
                      selectedParcel.wildfireRisk === 'Very High' || selectedParcel.wildfireRisk === 'High'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                      {selectedParcel.wildfireRisk} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Evaluated against state forest service fuel models, vegetative canopy density, and slope aspect.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'geojson' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">GeoJSON Feature Output</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(geoJsonData)}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-96">
                  {geoJsonData}
                </pre>
              </div>
            )}
          </div>

          {/* Spatial Query Actions Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Generated Automated Cadastral Audit Report for APN ${selectedParcel.apn}`);
              }}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition text-center"
            >
              Generate GIS Report
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white rounded-lg transition"
            >
              Export
            </button>
          </div>
        </aside>
      </div>

      {/* Export Format Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-400" />
                Export Geospatial Layers
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Export mapped parcels, environmental attributes, and zoning vectors into GIS industry formats.
            </p>

            <div className="space-y-2">
              {(['GeoJSON', 'Shapefile', 'KML', 'DXF'] as const).map((fmt) => (
                <label
                  key={fmt}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    exportFormat === fmt
                      ? 'bg-cyan-950/50 border-cyan-500 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                  onClick={() => setExportFormat(fmt)}
                >
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium">{fmt} Format</span>
                  </div>
                  {exportFormat === fmt && <Check className="w-4 h-4 text-cyan-400" />}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([geoJsonData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `parcel_gis_export_${Date.now()}.${exportFormat.toLowerCase()}`;
                  a.click();
                  setShowExportModal(false);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md transition"
              >
                Download Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline32_GisPropertyMapping;