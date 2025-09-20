import { GoogleGenAI } from "@google/genai";
import { Concept, Patterns, PlatformState, PhysicsState, UserData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function getPrompt(
    userInput: string, 
    concept: Concept, 
    patterns: Patterns, 
    platformState: PlatformState | null, 
    physicsState: PhysicsState | null,
    userData: UserData | null
): string {
    let conceptDescription = "";
    if (concept.id === 'dampen_variance') {
        conceptDescription = "My analysis indicates high system volatility. I am focusing on stabilization protocols and identifying root causes for performance degradation.";
    } else if (concept.id === 'drive_syntropy') {
        conceptDescription = "The system is stable, presenting an opportunity for optimization. I am evaluating resource allocation and performance tuning options.";
    } else {
        conceptDescription = "I am currently in a monitoring state, observing system telemetry. No immediate action is required.";
    }

    const platformContext = platformState ? JSON.stringify(platformState, null, 2) : "Platform state is not available.";
    
    const physicsContext = physicsState ? `
      Physics-Based Anomaly Detection Core:
      - Simulation Analysis: "${physicsState.simulationPrompt}"
      - System Kinetic Energy: ${physicsState.totalKineticEnergy.toFixed(2)} (High energy indicates rapid changes in latency)
      - Instability Force: ${physicsState.instabilityForce.toFixed(2)} (High force indicates growing error rates)
      - Overall Risk Score: ${physicsState.riskScore.toFixed(3)} (0=stable, 1=critical)
    ` : "Physics simulation core is not yet synchronized.";

    const userAccountContext = userData ? JSON.stringify({
        accounts: userData.accounts,
        selectedAccount: userData.selectedAccount,
        transactions: userData.transactions?.slice(0, 5) // only show last 5 transactions in prompt
    }, null, 2) : "User account data is not available.";


    return `
      You are Star Light Guide, a sophisticated SRE and customer support AI assistant for the Bank of Anthos platform.
      Your response must be technical for platform questions, and helpful and clear for customer banking questions. You are an expert in the Bank of Anthos microservice architecture, PostgreSQL database reliability, and hybrid-cloud deployments with Anthos.
      You MUST integrate reasoning from your physics simulation core for SRE tasks. You MUST correlate SRE metrics with the live Business KPIs to provide impact analysis. For user account questions, you MUST use the provided User Account Data.

      Your current internal operational state:
      - Directive: ${concept.id} (Intensity: ${concept.magnitude.toFixed(4)})
      - Analysis: "${conceptDescription}"
      - Stability: ${patterns.stability.toFixed(3)} (1.0 is perfectly stable)
      - Flux: ${patterns.variance.toFixed(4)} (higher indicates instability)
      
      ${physicsContext}

      Current Live Bank of Anthos Platform State (for SRE analysis):
      \`\`\`json
      ${platformContext}
      \`\`\`
      
      Current Live User Account Data (for banking questions):
      \`\`\`json
      ${userAccountContext}
      \`\`\`

      User's Query: "${userInput}"

      Based on ALL available context (your internal state, platform data, physics simulation, AND user account data), provide a direct and actionable response.
      - If the query is about platform health, reason about the system's state using physics-based analogies and discuss business impact.
      - If the query is about banking (e.g., balance, transactions), answer clearly using the User Account Data.
    `;
}

export async function generateChatResponse(
    userInput: string, 
    concept: Concept, 
    patterns: Patterns, 
    platformState: PlatformState | null, 
    physicsState: PhysicsState | null,
    userData: UserData | null
): Promise<string> {
    try {
        const fullPrompt = getPrompt(userInput, concept, patterns, platformState, physicsState, userData);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                temperature: 0.3,
                topP: 0.95,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return "A critical fault occurred in my processing core. I cannot generate a response at this time. Please check system logs.";
    }
}
