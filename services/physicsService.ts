import { PlatformState, PhysicsState, MonitoredService } from '../types';

const INITIAL_STATE: PhysicsState = {
    totalKineticEnergy: 0,
    instabilityForce: 0,
    riskScore: 0,
    simulationPrompt: "Initializing physics simulation core..."
};

/**
 * Runs a physics-based simulation on platform SRE metrics.
 * This is inspired by the concept of treating metric changes as physical dynamics.
 * - Latency change is treated as 'velocity'.
 * - Kinetic energy is calculated from this velocity (0.5 * m * v^2).
 * - Error rate change is treated as an 'instability force'.
 * - A risk score is derived from these values.
 * @param currentState The current, live platform state.
 * @param previousState The platform state from the previous tick.
 * @returns A PhysicsState object with the simulation results.
 */
export function runSREPhysicsSimulation(
    currentState: PlatformState | null,
    previousState: PlatformState | null
): PhysicsState {
    if (!currentState || !previousState) {
        return INITIAL_STATE;
    }

    let totalKineticEnergy = 0;
    let instabilityForce = 0;
    const details: string[] = [];

    currentState.services.forEach((currentService: MonitoredService) => {
        const prevService = previousState.services.find(s => s.name === currentService.name);
        if (!prevService) return;

        // Velocity based on latency change.
        const latencyVelocity = currentService.latency - prevService.latency;
        // Kinetic Energy: 0.5 * m * v^2. Assume mass m=1 for simplicity.
        const kineticEnergy = 0.5 * (latencyVelocity ** 2);
        totalKineticEnergy += kineticEnergy;

        // Force based on error rate change (proxy for destabilizing acceleration).
        const errorForce = currentService.errorRate - prevService.errorRate;
        // We only care about increasing force/instability.
        if (errorForce > 0) {
            instabilityForce += errorForce;
        }

        // Highlight services with significant dynamic changes.
        if (Math.abs(latencyVelocity) > 25 || errorForce > 0.5) {
             details.push(`${currentService.name} shows high velocity (latency change: ${latencyVelocity.toFixed(0)}ms) and/or force (error rate increase: ${errorForce.toFixed(2)}%)`);
        }
    });

    // Normalize and combine for a risk score between 0 and 1.
    // These divisors are magic numbers tuned for this simulation's scale.
    const energyComponent = totalKineticEnergy / 5000;
    const forceComponent = instabilityForce / 5;
    const riskScore = Math.min(1, Math.max(0, energyComponent + forceComponent));

    const simulationPrompt = details.length > 0
        ? `High-risk dynamics detected: ${details.join('. ')}.`
        : "System dynamics are stable; no significant energy or force variations detected.";

    return {
        totalKineticEnergy,
        instabilityForce,
        riskScore,
        simulationPrompt
    };
}