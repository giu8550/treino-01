import { NextResponse } from 'next/server';

// --- INTERFACES ---
interface ResearchProject {
    id: number | string;
    title: string;
    participants: { grads: number; masters: number; phds: number };
    progress: number;
    status: string;
    details: {
        agents: string[];
        commercial: number;
        research: number;
        social: number;
        profitability: number;
        rank: string;
    };
    isReal?: boolean;
}

let protocolLedger: ResearchProject[] = [];

// --- DADOS DE VOLUME (SEED) ---
const SEED_TITLES = [
    "In situ Biosynthesis of Bacterial Cellulose/Graphene Oxide Composites via Komagataeibacter Fermentation",
    "Mycelium-Based Memristor Arrays: Low-Cost Neuromorphic Computing on Fungal Substrates",
    "Engineered PETase (FAST-PETase-Class) for Rapid Depolymerization of Post-Consumer PET Under Mild Conditions",
    "Bacillus Spore–Enabled Self-Healing Concrete via Microbially Induced Calcium Carbonate Precipitation (MICP)",
    "Artificial Photosynthesis for Flue-Gas CO₂ Capture and In-Situ Conversion to Fuels/Chemicals",
    "Plant Electrophysiology Interfaces: Biohybrid Plant–Machine Communication for Environmental Sensing",
    "Bioleaching Rare Earth Elements from E-Waste Using Fungi-Driven Urban Biomining",
    "High-Resolution Electronic Skin (E-Skin) Sensor Arrays for Tactile Feedback in Advanced Prosthetics",
    "Genetic Algorithms + Protein Language Models for Multi-Objective Enzyme/Protein Optimization",
    "Synthetic DNA Archival Data Storage with Error Correction and Random-Access Retrieval",
    "Bioluminescent Bio-Modules for Urban Accent Lighting: Pilot-Scale Alternatives to Conventional Fixtures",
    "Chitin/Chitosan-Based Membranes and Sponges for Microplastic Removal in Wastewater Streams",
];

const FIXED_METRICS = [
    { commercial: 45, research: 65, social: 30, profitability: 45 },
    { commercial: 20, research: 80, social: 25, profitability: 15 },
    { commercial: 75, research: 75, social: 80, profitability: 60 },
    { commercial: 70, research: 55, social: 60, profitability: 65 },
    { commercial: 35, research: 85, social: 85, profitability: 40 },
    { commercial: 25, research: 70, social: 40, profitability: 30 },
    { commercial: 65, research: 60, social: 70, profitability: 75 },
    { commercial: 45, research: 75, social: 75, profitability: 55 },
    { commercial: 80, research: 85, social: 70, profitability: 75 },
    { commercial: 25, research: 80, social: 30, profitability: 25 },
    { commercial: 30, research: 50, social: 35, profitability: 30 },
    { commercial: 55, research: 45, social: 75, profitability: 50 },
];

const AGENT_NODE_NAMES = [
    "Neuro-Scribe", "Quantum-Oracle", "Helix-Weaver", "Chronos-Watch", "Logic-Gatekeeper", 
    "Synapse-Architect", "Data-Wraith", "Isotope-X", "Cipher-Daemon", "Echo-Mind", 
    "Prism-Analyzer", "Void-Walker", "Nano-Stitcher", "Aether-Link", "Vector-7"
];

const calculateRank = (score: number) => {
    if (score >= 75) return "SS"; 
    if (score >= 65) return "S";
    if (score >= 50) return "A";
    if (score >= 35) return "B";
    return "C";
};

const loadSeedData = (): ResearchProject[] => {
    return Array.from({ length: 35 }).map((_, i) => {
        const titleIndex = i % SEED_TITLES.length;
        let progress;
        if (i === 0) progress = 75;
        else if (i === 1) progress = 69;
        else if (i === 2) progress = 65;
        else progress = Math.floor(Math.random() * 46) + 5; 

        const stats = FIXED_METRICS[titleIndex];
        const avgScore = (stats.commercial + stats.research + stats.social + stats.profitability) / 4;
        const rank = calculateRank(avgScore);

        const projectAgents = [...AGENT_NODE_NAMES].sort(() => 0.5 - Math.random()).slice(0, 3);

        return {
            id: i + 1000,
            title: SEED_TITLES[titleIndex] + (i > 11 ? ` [Phase ${Math.floor(i/5)}]` : ""),
            participants: { 
                grads: Math.floor(Math.random() * 4) + 1, 
                masters: (i < 15) ? 1 : 0, 
                phds: (i < 3) ? 1 : 0 
            },
            progress: progress,
            status: progress > 50 ? "building" : "in_progress",
            details: { 
                agents: projectAgents, 
                commercial: stats.commercial, 
                research: stats.research, 
                social: stats.social, 
                profitability: stats.profitability, 
                rank: rank 
            },
            isReal: false
        };
    });
};

export async function GET(request: Request) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase() || "";

    const fullLedger = [...protocolLedger, ...loadSeedData()];

    const filtered = fullLedger.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.status.toLowerCase().includes(query)
    );

    return NextResponse.json(filtered);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Simulação de upload e criação de registro
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (!body.title) {
            return NextResponse.json({ error: "Protocol title required" }, { status: 400 });
        }

        const newEntry: ResearchProject = {
            id: Date.now().toString(),
            title: body.title,
            participants: body.participants || { grads: 1, masters: 0, phds: 0 },
            progress: 0, 
            status: "pending_analysis", // STATUS ESPECIAL PARA O CARD "APAGADINHO"
            details: {
                agents: [], // Sem agentes ainda
                commercial: 0,
                research: 0,
                social: 0,
                profitability: 0,
                rank: "?" // Rank indefinido
            },
            isReal: true
        };

        protocolLedger.unshift(newEntry);

        return NextResponse.json({ success: true, data: newEntry });

    } catch (error) {
        return NextResponse.json({ error: "System Error" }, { status: 500 });
    }
}