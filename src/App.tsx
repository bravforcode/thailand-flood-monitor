import React, { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Scatter, Treemap, Sankey, FunnelChart, Funnel, LabelList
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, useMap, Polyline, Polygon, Marker } from 'react-leaflet';
import * as tf from '@tensorflow/tfjs';
import * as THREE from 'three';
import 'leaflet/dist/leaflet.css';

// Comprehensive TypeScript Interfaces
interface SensorData {
  id: string;
  name: string;
  location: string;
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'warning' | 'critical' | 'maintenance';
  lastUpdate: Date;
  coordinates: [number, number];
  type: 'water' | 'rainfall' | 'temperature' | 'humidity' | 'pressure' | 'wind' | 'flow' | 'quality' | 'seismic';
  battery: number;
  signalStrength: number;
  accuracy: number;
  historicalData: number[];
  predictions: number[];
  anomalyDetected: boolean;
  maintenanceRequired: boolean;
  calibrationDate: Date;
  manufacturer: string;
  model: string;
  installationDate: Date;
  nextMaintenanceDate: Date;
  dataTransmissionRate: number;
  errorRate: number;
  blockchain: {
    hash: string;
    verified: boolean;
    timestamp: number;
    block: number;
    signature: string;
  };
}

interface CitizenData {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: [number, number];
  status: 'safe' | 'evacuating' | 'needs_help' | 'missing';
  familyMembers: number;
  specialNeeds: string[];
  evacuationPlan: boolean;
  registeredShelter?: string;
  lastCheckIn: Date;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relation: string;
  }>;
}

interface MedicalFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'field_hospital' | 'pharmacy';
  location: [number, number];
  capacity: number;
  currentPatients: number;
  emergencyRoom: boolean;
  availableBeds: number;
  bloodBank: boolean;
  specialists: string[];
  ambulances: number;
  helicopterPad: boolean;
  powerBackup: boolean;
  waterSupply: 'normal' | 'limited' | 'critical';
  medicines: {
    antibiotics: number;
    painkillers: number;
    ivFluids: number;
    vaccines: number;
  };
  staff: {
    doctors: number;
    nurses: number;
    paramedics: number;
    support: number;
  };
}

interface SupplyChain {
  id: string;
  type: 'food' | 'water' | 'medicine' | 'clothing' | 'equipment' | 'fuel';
  quantity: number;
  unit: string;
  source: string;
  destination: string;
  currentLocation: [number, number];
  status: 'in_transit' | 'delivered' | 'pending' | 'delayed';
  transportMode: 'truck' | 'boat' | 'helicopter' | 'train';
  estimatedArrival: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
  temperature?: number;
  humidity?: number;
  handler: string;
  trackingNumber: string;
}

interface VolunteerData {
  id: string;
  name: string;
  skills: string[];
  availability: 'available' | 'busy' | 'offline';
  location: [number, number];
  assignedTask?: string;
  hoursWorked: number;
  rating: number;
  certifications: string[];
  languages: string[];
  transportation: boolean;
  emergencyContact: string;
}

interface SocialMediaPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'line' | 'tiktok';
  author: string;
  content: string;
  location?: [number, number];
  timestamp: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  sentiment: 'positive' | 'negative' | 'neutral' | 'urgent';
  verified: boolean;
  mediaUrls: string[];
  hashtags: string[];
  aiAnalysis: {
    credibility: number;
    urgency: number;
    locationAccuracy: number;
    informationType: string;
  };
}

interface FinancialData {
  totalBudget: number;
  spent: number;
  donations: number;
  governmentFunding: number;
  internationalAid: number;
  expenses: {
    rescue: number;
    medical: number;
    supplies: number;
    infrastructure: number;
    personnel: number;
  };
  donors: Array<{
    name: string;
    amount: number;
    date: Date;
    type: 'individual' | 'corporate' | 'government' | 'international';
  }>;
  transactions: Array<{
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: Date;
    approved: boolean;
    approvedBy?: string;
  }>;
}

interface InfrastructureData {
  roads: Array<{
    id: string;
    name: string;
    status: 'clear' | 'flooded' | 'damaged' | 'blocked';
    trafficFlow: number;
    alternateRoutes: string[];
  }>;
  bridges: Array<{
    id: string;
    name: string;
    structuralIntegrity: number;
    weightLimit: number;
    status: 'safe' | 'warning' | 'closed';
  }>;
  powerGrid: {
    substations: number;
    operational: number;
    backupPower: boolean;
    estimatedRestoration?: Date;
  };
  telecommunications: {
    towers: number;
    operational: number;
    coverage: number;
    dataCapacity: number;
  };
  waterSystem: {
    treatment_plants: number;
    operational: number;
    quality: 'safe' | 'boil_advisory' | 'contaminated';
    supply_hours: number;
  };
}

// Enhanced State Management
type AppState = {
  sensors: SensorData[];
  citizens: CitizenData[];
  medical: MedicalFacility[];
  supplyChain: SupplyChain[];
  volunteers: VolunteerData[];
  socialMedia: SocialMediaPost[];
  financial: FinancialData;
  infrastructure: InfrastructureData;
  currentView: string;
  alerts: any[];
  language: 'th' | 'en' | 'zh' | 'my' | 'km' | 'lo';
  theme: 'dark' | 'light' | 'auto' | 'high-contrast';
  emergencyLevel: 0 | 1 | 2 | 3 | 4 | 5;
  aiModels: {
    prediction: any;
    imageAnalysis: any;
    nlp: any;
  };
  simulationMode: boolean;
  notifications: any[];
  user: any;
  settings: any;
};

const appReducer = (state: AppState, action: any): AppState => {
  switch (action.type) {
    case 'UPDATE_SENSORS':
      return { ...state, sensors: action.payload };
    case 'UPDATE_CITIZENS':
      return { ...state, citizens: action.payload };
    case 'SET_EMERGENCY_LEVEL':
      return { ...state, emergencyLevel: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts].slice(0, 100) };
    default:
      return state;
  }
};

// Advanced 3D Flood Simulation Component
const FloodSimulation3D: React.FC<{ waterLevel: number }> = ({ waterLevel }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001122);
    scene.fog = new THREE.FogExp2(0x001122, 0.002);
    
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 30, 50);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // City Generation
    const cityGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const cityMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1a1a2e,
      wireframe: false
    });
    
    const city = new THREE.Mesh(cityGeometry, cityMaterial);
    city.rotation.x = -Math.PI / 2;
    city.receiveShadow = true;
    scene.add(city);
    
    // Buildings
    const buildings: THREE.Mesh[] = [];
    for (let i = 0; i < 50; i++) {
      const buildingGeometry = new THREE.BoxGeometry(
        2 + Math.random() * 4,
        5 + Math.random() * 20,
        2 + Math.random() * 4
      );
      const buildingMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.6, 0.1, 0.3 + Math.random() * 0.3)
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(
        (Math.random() - 0.5) * 80,
        building.geometry.parameters.height / 2,
        (Math.random() - 0.5) * 80
      );
      building.castShadow = true;
      building.receiveShadow = true;
      buildings.push(building);
      scene.add(building);
    }
    
    // Water
    const waterGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: 0x006994,
      transparent: true,
      opacity: 0.7,
      shininess: 100,
      emissive: 0x001122,
      emissiveIntensity: 0.2
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = waterLevel;
    scene.add(water);
    
    // Particles for rain
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = Math.random() * 100;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00aaff,
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Animation
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame++;
      
      // Rotate camera
      const time = frame * 0.001;
      camera.position.x = Math.cos(time) * 80;
      camera.position.z = Math.sin(time) * 80;
      camera.lookAt(0, 0, 0);
      
      // Animate water
      water.position.y = waterLevel + Math.sin(frame * 0.02) * 0.5;
      
      // Animate rain
      const positions = particles.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= 0.5;
        if (positions[i] < 0) {
          positions[i] = 100;
        }
      }
      particles.attributes.position.needsUpdate = true;
      
      // Flood buildings
      buildings.forEach(building => {
        if (building.position.y < water.position.y) {
          building.material = new THREE.MeshPhongMaterial({
            color: 0x660000,
            emissive: 0xff0000,
            emissiveIntensity: 0.1
          });
        }
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [waterLevel]);
  
  return <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: '15px' }} />;
};

// Social Media Monitoring Dashboard
const SocialMediaDashboard: React.FC<{ posts: SocialMediaPost[] }> = ({ posts }) => {
  const [filter, setFilter] = useState<string>('all');
  const [sentiment, setSentiment] = useState<any>({
    positive: 0,
    negative: 0,
    neutral: 0,
    urgent: 0
  });
  
  useEffect(() => {
    const counts = posts.reduce((acc, post) => {
      acc[post.sentiment]++;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0, urgent: 0 });
    setSentiment(counts);
  }, [posts]);
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a0033 0%, #330066 100%)',
      borderRadius: '25px',
      padding: '30px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(147, 51, 234, 0.3)',
      boxShadow: '0 20px 60px rgba(147, 51, 234, 0.2)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      
      <h3 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '25px',
        background: 'linear-gradient(135deg, #9333ea, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        📱 Social Media Intelligence
        <span style={{
          padding: '4px 12px',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#fff',
          fontWeight: 'normal'
        }}>
          LIVE STREAM
        </span>
      </h3>
      
      {/* Sentiment Analysis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '25px'
      }}>
        {Object.entries(sentiment).map(([key, value]) => (
          <div key={key} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: key === 'urgent' ? '#ef4444' : 
                     key === 'negative' ? '#f59e0b' :
                     key === 'positive' ? '#10b981' : '#6b7280'
            }}>
              {value as React.ReactNode}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              marginTop: '5px'
            }}>
              {key}
            </div>
          </div>
        ))}
      </div>
      
      {/* Live Feed */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '15px',
        padding: '20px'
      }}>
        {posts.slice(0, 10).map(post => (
          <div key={post.id} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '12px',
            borderLeft: `3px solid ${
              post.sentiment === 'urgent' ? '#ef4444' :
              post.sentiment === 'negative' ? '#f59e0b' :
              post.sentiment === 'positive' ? '#10b981' : '#6b7280'
            }`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>
                  {post.platform === 'twitter' ? '🐦' :
                   post.platform === 'facebook' ? '📘' :
                   post.platform === 'instagram' ? '📷' :
                   post.platform === 'line' ? '💚' : '🎵'}
                </span>
                <strong>{post.author}</strong>
                {post.verified && (
                  <span style={{
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    color: '#fff'
                  }}>
                    ✓ VERIFIED
                  </span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {new Date(post.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p style={{ margin: '10px 0', color: '#e5e7eb' }}>{post.content}</p>
            <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#9ca3af' }}>
              <span>❤️ {post.engagement.likes}</span>
              <span>🔄 {post.engagement.shares}</span>
              <span>💬 {post.engagement.comments}</span>
              <span>🎯 {(post.aiAnalysis.credibility * 100).toFixed(0)}% credible</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Citizen Portal Component
const CitizenPortal: React.FC<{ citizens: CitizenData[] }> = ({ citizens }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredCitizens = citizens.filter(citizen => {
    const matchesSearch = citizen.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || citizen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const statusColors = {
    safe: '#10b981',
    evacuating: '#f59e0b',
    needs_help: '#ef4444',
    missing: '#dc2626'
  };
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
      borderRadius: '25px',
      padding: '30px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h3 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '25px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        👥 Citizen Safety Portal
        <span style={{
          background: '#10b981',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px'
        }}>
          {citizens.length} REGISTERED
        </span>
      </h3>
      
      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search citizens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            fontSize: '14px'
          }}
        >
          <option value="all">All Status</option>
          <option value="safe">Safe</option>
          <option value="evacuating">Evacuating</option>
          <option value="needs_help">Needs Help</option>
          <option value="missing">Missing</option>
        </select>
      </div>
      
      {/* Status Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {Object.entries(statusColors).map(([status, color]) => {
          const count = citizens.filter(c => c.status === status).length;
          return (
            <div key={status} style={{
              background: `${color}22`,
              borderRadius: '12px',
              padding: '15px',
              border: `1px solid ${color}44`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>
                {count}
              </div>
              <div style={{ fontSize: '12px', color: '#fff', textTransform: 'uppercase' }}>
                {status.replace('_', ' ')}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Citizens List */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '15px',
        padding: '20px'
      }}>
        {filteredCitizens.map(citizen => (
          <div key={citizen.id} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: `3px solid ${statusColors[citizen.status]}`
          }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{citizen.name}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                📞 {citizen.phone} | 👨‍👩‍👧‍👦 {citizen.familyMembers} members
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px' }}>
                Last check-in: {new Date(citizen.lastCheckIn).toLocaleString()}
              </div>
            </div>
            <div style={{
              padding: '6px 12px',
              background: `${statusColors[citizen.status]}22`,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: statusColors[citizen.status],
              textTransform: 'uppercase'
            }}>
              {citizen.status.replace('_', ' ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Financial Management Dashboard
const FinancialDashboard: React.FC<{ financial: FinancialData }> = ({ financial }) => {
  const totalAvailable = financial.totalBudget + financial.donations + 
                         financial.governmentFunding + financial.internationalAid - financial.spent;
  
  const expenseData = Object.entries(financial.expenses).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    percentage: ((value / financial.spent) * 100).toFixed(1)
  }));
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      borderRadius: '25px',
      padding: '30px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h3 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '25px',
        color: '#fff'
      }}>
        💰 Financial Management System
      </h3>
      
      {/* Financial Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            ฿{(totalAvailable / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
            AVAILABLE FUNDS
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            ฿{(financial.spent / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
            TOTAL SPENT
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
            ฿{(financial.donations / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
            DONATIONS
          </div>
        </div>
      </div>
      
      {/* Expense Breakdown */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '15px',
        padding: '20px'
      }}>
        <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Expense Breakdown</h4>
        {expenseData.map((expense, i) => (
          <div key={i} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '14px' }}>{expense.name}</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                ฿{(expense.value / 1000000).toFixed(2)}M ({expense.percentage}%)
              </span>
            </div>
            <div style={{
              height: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${expense.percentage}%`,
                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Donations */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Recent Donations</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {financial.donors.slice(0, 5).map((donor, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{donor.name}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {new Date(donor.date).toLocaleDateString()}
                </div>
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#10b981'
              }}>
                ฿{(donor.amount / 1000).toFixed(0)}K
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Medical Emergency System
const MedicalSystem: React.FC<{ facilities: MedicalFacility[] }> = ({ facilities }) => {
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalPatients = facilities.reduce((sum, f) => sum + f.currentPatients, 0);
  const totalAmbulances = facilities.reduce((sum, f) => sum + f.ambulances, 0);
  const criticalFacilities = facilities.filter(f => f.waterSupply === 'critical').length;
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
      borderRadius: '25px',
      padding: '30px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h3 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '25px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        🏥 Medical Emergency Command
        {criticalFacilities > 0 && (
          <span style={{
            background: '#ef4444',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            {criticalFacilities} CRITICAL
          </span>
        )}
      </h3>
      
      {/* Medical Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {facilities.length}
          </div>
          <div style={{ fontSize: '11px', color: '#fca5a5' }}>FACILITIES</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {totalPatients}/{totalCapacity}
          </div>
          <div style={{ fontSize: '11px', color: '#fca5a5' }}>OCCUPANCY</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {totalAmbulances}
          </div>
          <div style={{ fontSize: '11px', color: '#fca5a5' }}>AMBULANCES</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {facilities.filter(f => f.helicopterPad).length}
          </div>
          <div style={{ fontSize: '11px', color: '#fca5a5' }}>HELIPADS</div>
        </div>
      </div>
      
      {/* Facility Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {facilities.map(facility => (
          <div key={facility.id} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '15px',
            border: `1px solid ${
              facility.waterSupply === 'critical' ? '#ef4444' :
              facility.waterSupply === 'limited' ? '#f59e0b' : '#10b981'
            }44`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{facility.name}</div>
                <div style={{ fontSize: '11px', color: '#fca5a5' }}>
                  {facility.type.toUpperCase()}
                </div>
              </div>
              <div style={{
                padding: '4px 8px',
                background: facility.waterSupply === 'critical' ? '#ef444444' :
                          facility.waterSupply === 'limited' ? '#f59e0b44' : '#10b98144',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 'bold',
                color: facility.waterSupply === 'critical' ? '#ef4444' :
                       facility.waterSupply === 'limited' ? '#f59e0b' : '#10b981'
              }}>
                {facility.waterSupply.toUpperCase()}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', fontSize: '11px' }}>
              <div>
                <div style={{ color: '#9ca3af' }}>Beds</div>
                <div style={{ fontWeight: 'bold' }}>{facility.availableBeds}/{facility.capacity}</div>
              </div>
              <div>
                <div style={{ color: '#9ca3af' }}>Staff</div>
                <div style={{ fontWeight: 'bold' }}>
                  {facility.staff.doctors + facility.staff.nurses}
                </div>
              </div>
              <div>
                <div style={{ color: '#9ca3af' }}>Status</div>
                <div style={{ fontWeight: 'bold', color: facility.currentPatients >= facility.capacity * 0.9 ? '#ef4444' : '#10b981' }}>
                  {((facility.currentPatients / facility.capacity) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            {/* Medicine Levels */}
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '5px' }}>Medicine Supplies</div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {Object.entries(facility.medicines).map(([med, qty]) => (
                  <div key={med} style={{
                    flex: 1,
                    height: '4px',
                    background: qty > 500 ? '#10b981' : qty > 100 ? '#f59e0b' : '#ef4444',
                    borderRadius: '2px'
                  }} title={`${med}: ${qty}`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Application Component
export default function UltraComprehensiveFloodMonitor() {
  // Initialize comprehensive state
  const initialState: AppState = {
    sensors: [],
    citizens: [],
    medical: [],
    supplyChain: [],
    volunteers: [],
    socialMedia: [],
    financial: {
      totalBudget: 100000000,
      spent: 35000000,
      donations: 15000000,
      governmentFunding: 80000000,
      internationalAid: 20000000,
      expenses: {
        rescue: 10000000,
        medical: 8000000,
        supplies: 12000000,
        infrastructure: 3000000,
        personnel: 2000000
      },
      donors: [],
      transactions: []
    },
    infrastructure: {
      roads: [],
      bridges: [],
      powerGrid: {
        substations: 50,
        operational: 42,
        backupPower: true
      },
      telecommunications: {
        towers: 200,
        operational: 185,
        coverage: 92,
        dataCapacity: 85
      },
      waterSystem: {
        treatment_plants: 12,
        operational: 8,
        quality: 'boil_advisory',
        supply_hours: 18
      }
    },
    currentView: 'dashboard',
    alerts: [],
    language: 'en',
    theme: 'dark',
    emergencyLevel: 0,
    aiModels: {
      prediction: null,
      imageAnalysis: null,
      nlp: null
    },
    simulationMode: false,
    notifications: [],
    user: null,
    settings: {}
  };
  
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [waterLevel, setWaterLevel] = useState(4.5);
  const [activePanel, setActivePanel] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Initialize all systems
  useEffect(() => {
    // Generate comprehensive mock data
    const mockSensors: SensorData[] = Array.from({ length: 100 }, (_, i) => ({
      id: `SENSOR_${i}`,
      name: `Station ${i + 1}`,
      location: ['Bangkok', 'Ayutthaya', 'Pathum Thani', 'Nonthaburi', 'Samut Prakan'][i % 5],
      value: Math.random() * 5,
      unit: 'm',
      status: Math.random() > 0.95 ? 'critical' : Math.random() > 0.85 ? 'warning' : 'online',
      lastUpdate: new Date(),
      coordinates: [13 + Math.random() * 7, 98 + Math.random() * 7] as [number, number],
      type: ['water', 'rainfall', 'temperature', 'humidity', 'pressure'][Math.floor(Math.random() * 5)] as any,
      battery: 60 + Math.random() * 40,
      signalStrength: -30 - Math.random() * 50,
      accuracy: 90 + Math.random() * 10,
      historicalData: Array.from({ length: 48 }, () => Math.random() * 5),
      predictions: Array.from({ length: 24 }, () => Math.random() * 5),
      anomalyDetected: Math.random() > 0.9,
      maintenanceRequired: Math.random() > 0.95,
      calibrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      manufacturer: ['Siemens', 'Honeywell', 'ABB', 'Schneider'][Math.floor(Math.random() * 4)],
      model: `MODEL-${Math.floor(Math.random() * 1000)}`,
      installationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      nextMaintenanceDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      dataTransmissionRate: 95 + Math.random() * 5,
      errorRate: Math.random() * 5,
      blockchain: {
        hash: '0x' + Math.random().toString(16).substr(2, 32),
        verified: true,
        timestamp: Date.now(),
        block: Math.floor(Math.random() * 100000),
        signature: '0x' + Math.random().toString(16).substr(2, 64)
      }
    }));
    
    const mockCitizens: CitizenData[] = Array.from({ length: 500 }, (_, i) => ({
      id: `CITIZEN_${i}`,
      name: `Citizen ${i + 1}`,
      phone: `+66${Math.floor(Math.random() * 900000000 + 100000000)}`,
      email: `citizen${i}@example.com`,
      location: [13 + Math.random() * 2, 100 + Math.random() * 2] as [number, number],
      status: ['safe', 'evacuating', 'needs_help', 'missing'][Math.floor(Math.random() * 4)] as any,
      familyMembers: 1 + Math.floor(Math.random() * 6),
      specialNeeds: Math.random() > 0.8 ? ['medical', 'elderly', 'disabled'] : [],
      evacuationPlan: Math.random() > 0.3,
      registeredShelter: Math.random() > 0.5 ? `SHELTER_${Math.floor(Math.random() * 20)}` : undefined,
      lastCheckIn: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      emergencyContacts: [
        {
          name: `Contact ${i}`,
          phone: `+66${Math.floor(Math.random() * 900000000 + 100000000)}`,
          relation: ['spouse', 'parent', 'sibling', 'friend'][Math.floor(Math.random() * 4)]
        }
      ]
    }));
    
    const mockMedical: MedicalFacility[] = Array.from({ length: 30 }, (_, i) => ({
      id: `MED_${i}`,
      name: `Medical Facility ${i + 1}`,
      type: ['hospital', 'clinic', 'field_hospital', 'pharmacy'][Math.floor(Math.random() * 4)] as any,
      location: [13 + Math.random() * 2, 100 + Math.random() * 2] as [number, number],
      capacity: 50 + Math.floor(Math.random() * 450),
      currentPatients: Math.floor(Math.random() * 400),
      emergencyRoom: Math.random() > 0.3,
      availableBeds: Math.floor(Math.random() * 100),
      bloodBank: Math.random() > 0.5,
      specialists: ['surgeon', 'pediatrician', 'cardiologist', 'emergency'],
      ambulances: Math.floor(Math.random() * 10),
      helicopterPad: Math.random() > 0.7,
      powerBackup: Math.random() > 0.2,
      waterSupply: ['normal', 'limited', 'critical'][Math.floor(Math.random() * 3)] as any,
      medicines: {
        antibiotics: Math.floor(Math.random() * 1000),
        painkillers: Math.floor(Math.random() * 2000),
        ivFluids: Math.floor(Math.random() * 500),
        vaccines: Math.floor(Math.random() * 300)
      },
      staff: {
        doctors: 5 + Math.floor(Math.random() * 45),
        nurses: 10 + Math.floor(Math.random() * 90),
        paramedics: 5 + Math.floor(Math.random() * 25),
        support: 10 + Math.floor(Math.random() * 40)
      }
    }));
    
    const mockSocialMedia: SocialMediaPost[] = Array.from({ length: 100 }, (_, i) => ({
      id: `POST_${i}`,
      platform: ['twitter', 'facebook', 'instagram', 'line', 'tiktok'][Math.floor(Math.random() * 5)] as any,
      author: `User${Math.floor(Math.random() * 1000)}`,
      content: [
        'Water level rising rapidly in my area!',
        'Safe at evacuation center, thank you rescue team',
        'Need immediate help, trapped on roof',
        'Donating supplies at distribution center',
        'Roads flooded, avoid highway 3'
      ][Math.floor(Math.random() * 5)],
      location: Math.random() > 0.5 ? [13 + Math.random() * 2, 100 + Math.random() * 2] as [number, number] : undefined,
      timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
      engagement: {
        likes: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 200)
      },
      sentiment: ['positive', 'negative', 'neutral', 'urgent'][Math.floor(Math.random() * 4)] as any,
      verified: Math.random() > 0.7,
      mediaUrls: [],
      hashtags: ['#ThailandFlood', '#FloodRelief', '#EmergencyHelp'],
      aiAnalysis: {
        credibility: Math.random(),
        urgency: Math.random(),
        locationAccuracy: Math.random(),
        informationType: ['warning', 'help_request', 'update', 'resource'][Math.floor(Math.random() * 4)]
      }
    }));
    
    // Update financial donors
    const mockDonors = Array.from({ length: 20 }, (_, i) => ({
      name: `Donor ${i + 1}`,
      amount: 10000 + Math.floor(Math.random() * 990000),
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      type: ['individual', 'corporate', 'government', 'international'][Math.floor(Math.random() * 4)] as any
    }));
    
    dispatch({ type: 'UPDATE_SENSORS', payload: mockSensors });
    dispatch({ type: 'UPDATE_CITIZENS', payload: mockCitizens });
    
    // Set other state (would need proper state management in production)
    initialState.medical = mockMedical;
    initialState.socialMedia = mockSocialMedia;
    initialState.financial.donors = mockDonors;
    
    // Update time
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      setWaterLevel(prev => prev + (Math.random() - 0.5) * 0.1);
      
      // Add random alert
      if (Math.random() > 0.9) {
        dispatch({
          type: 'ADD_ALERT',
          payload: {
            id: Date.now(),
            type: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)],
            message: 'System alert: Sensor anomaly detected',
            timestamp: new Date()
          }
        });
      }
    }, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(updateInterval);
    };
  }, []);
  
  const emergencyColors = [
    '#10b981', // Level 0: Normal (Green)
    '#3b82f6', // Level 1: Advisory (Blue)
    '#f59e0b', // Level 2: Watch (Yellow)
    '#fb923c', // Level 3: Warning (Orange)
    '#ef4444', // Level 4: Severe (Red)
    '#991b1b'  // Level 5: Catastrophic (Dark Red)
  ];
  
  return (
    <div style={{
      minHeight: '100vh',
      background: state.emergencyLevel > 3
        ? `linear-gradient(135deg, #450a0a 0%, #991b1b 50%, #dc2626 100%)`
        : `linear-gradient(135deg, #030712 0%, #111827 25%, #1e293b 50%, #334155 75%, #1e293b 100%)`,
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 1s ease'
    }}>
      {/* Advanced Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {/* Matrix Rain Effect */}
        {animations && [...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${i * 3.33}%`,
              top: '-100px',
              width: '2px',
              height: '100px',
              background: 'linear-gradient(to bottom, transparent, #00ff00, transparent)',
              animation: `matrixRain ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3
            }}
          />
        ))}
        
        {/* Hexagon Grid Pattern */}
        <svg style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.03
        }}>
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <polygon points="25,2 45,13 45,30 25,41 5,30 5,13" fill="none" stroke="#00d4ff" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
        
        {/* Floating Orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              background: `radial-gradient(circle, ${
                ['rgba(0, 212, 255, 0.15)', 'rgba(123, 47, 247, 0.15)', 
                 'rgba(255, 0, 255, 0.15)', 'rgba(0, 255, 136, 0.15)'][i % 4]
              } 0%, transparent 70%)`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatOrb ${15 + i * 3}s ease-in-out infinite`,
              filter: 'blur(60px)',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
      
      {/* Emergency Level Indicator Bar */}
      {state.emergencyLevel > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: `linear-gradient(90deg, ${emergencyColors[state.emergencyLevel]}, ${emergencyColors[Math.min(state.emergencyLevel + 1, 5)]})`,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          boxShadow: `0 2px 20px ${emergencyColors[state.emergencyLevel]}66`,
          animation: state.emergencyLevel > 3 ? 'emergencyFlash 1s ease-in-out infinite' : 'none'
        }}>
          🚨 EMERGENCY LEVEL {state.emergencyLevel} - {
            ['NORMAL', 'ADVISORY', 'WATCH', 'WARNING', 'SEVERE', 'CATASTROPHIC'][state.emergencyLevel]
          } 🚨
        </div>
      )}
      
      {/* Ultra Advanced Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${emergencyColors[state.emergencyLevel]}44`,
        padding: '20px 30px',
        position: 'sticky',
        top: state.emergencyLevel > 0 ? '40px' : '0',
        zIndex: 1000,
        boxShadow: `0 4px 30px rgba(0, 0, 0, 0.5), 0 0 40px ${emergencyColors[state.emergencyLevel]}22`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1920px',
          margin: '0 auto'
        }}>
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: `linear-gradient(135deg, ${emergencyColors[state.emergencyLevel]}, ${emergencyColors[Math.min(state.emergencyLevel + 1, 5)]})`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: `0 0 30px ${emergencyColors[state.emergencyLevel]}66`,
              animation: 'pulse 2s ease-in-out infinite',
              position: 'relative'
            }}>
              💧
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '20px',
                height: '20px',
                background: state.emergencyLevel > 3 ? '#ef4444' : '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                animation: 'pulse 1s ease-in-out infinite'
              }}>
                {state.emergencyLevel}
              </div>
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '900',
                background: `linear-gradient(135deg, ${emergencyColors[state.emergencyLevel]}, #fff)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}>
                FloodGuard Ultra Max
              </h1>
              <div style={{
                fontSize: '11px',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginTop: '4px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    animation: 'pulse 2s ease-in-out infinite'
                  }} />
                  Enterprise v10.0
                </span>
                <span>|</span>
                <span>{currentTime.toLocaleString()}</span>
                <span>|</span>
                <span>Sensors: {state.sensors.filter(s => s.status === 'online').length}/{state.sensors.length}</span>
                <span>|</span>
                <span>Citizens: {state.citizens.length}</span>
              </div>
            </div>
          </div>
          
          {/* Control Center */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Emergency Level Control */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '4px',
              gap: '4px'
            }}>
              {[0, 1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => dispatch({ type: 'SET_EMERGENCY_LEVEL', payload: level })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: state.emergencyLevel === level
                      ? emergencyColors[level]
                      : 'transparent',
                    color: state.emergencyLevel === level ? '#fff' : '#64748b',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  L{level}
                </button>
              ))}
            </div>
            
            {/* Quick Actions */}
            <button style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)'
            }}>
              📢 BROADCAST ALERT
            </button>
            
            <button style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
            }}>
              📞 EMERGENCY CALL
            </button>
            
            {/* User Menu */}
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
            }}>
              A
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Navigation Tabs */}
      <nav style={{
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '0 30px',
        position: 'sticky',
        top: state.emergencyLevel > 0 ? '120px' : '80px',
        zIndex: 999,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          gap: '5px',
          maxWidth: '1920px',
          margin: '0 auto',
          padding: '10px 0'
        }}>
          {[
            { id: 'overview', icon: '🎯', label: 'Command Center' },
            { id: 'monitoring', icon: '📡', label: 'Monitoring' },
            { id: '3d', icon: '🌊', label: '3D Simulation' },
            { id: 'social', icon: '📱', label: 'Social Media' },
            { id: 'citizens', icon: '👥', label: 'Citizens' },
            { id: 'medical', icon: '🏥', label: 'Medical' },
            { id: 'financial', icon: '💰', label: 'Financial' },
            { id: 'supply', icon: '📦', label: 'Supply Chain' },
            { id: 'infrastructure', icon: '🏗️', label: 'Infrastructure' },
            { id: 'volunteers', icon: '🤝', label: 'Volunteers' },
            { id: 'international', icon: '🌍', label: 'International' },
            { id: 'reports', icon: '📊', label: 'Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: activePanel === tab.id
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'transparent',
                color: activePanel === tab.id ? '#3b82f6' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activePanel === tab.id ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                borderBottom: activePanel === tab.id
                  ? '2px solid #3b82f6'
                  : '2px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
      
      {/* Main Content Area */}
      <main style={{
        padding: '30px',
        maxWidth: '1920px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        {activePanel === '3d' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '25px',
            padding: '30px',
            marginBottom: '30px',
            height: '600px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              zIndex: 10,
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '10px 20px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              🌊 3D Flood Simulation - Water Level: {waterLevel.toFixed(2)}m
            </h3>
            <FloodSimulation3D waterLevel={waterLevel} />
          </div>
        )}
        
        {activePanel === 'social' && (
          <SocialMediaDashboard posts={initialState.socialMedia} />
        )}
        
        {activePanel === 'citizens' && (
          <CitizenPortal citizens={state.citizens} />
        )}
        
        {activePanel === 'medical' && (
          <MedicalSystem facilities={initialState.medical} />
        )}
        
        {activePanel === 'financial' && (
          <FinancialDashboard financial={initialState.financial} />
        )}
        
        {activePanel === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <SocialMediaDashboard posts={initialState.socialMedia} />
            <CitizenPortal citizens={state.citizens} />
            <FinancialDashboard financial={initialState.financial} />
            <MedicalSystem facilities={initialState.medical} />
          </div>
        )}
      </main>
      
      {/* Global Animations */}
      <style>{`
        @keyframes matrixRain {
          to { transform: translateY(100vh); }
        }
        
        @keyframes floatOrb {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes emergencyFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #60a5fa, #a78bfa);
        }
      `}</style>
    </div>
  );
}