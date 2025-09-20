import { Patterns, Concept, CoreFieldState, CognitiveSystemState } from '../types';

// --- NumPy-like helper functions ---
const np = {
    mean: (arr: number[]): number => arr.length > 0 ? arr.reduce((a, b) => a + b) / arr.length : 0,
    variance: (arr: number[]): number => {
        if (arr.length < 2) return 0;
        const m = np.mean(arr);
        return arr.reduce((acc, val) => acc + (val - m) ** 2, 0) / arr.length;
    },
    std: (arr: number[]): number => Math.sqrt(np.variance(arr)),
    sum: (arr: number[]): number => arr.reduce((a, b) => a + b, 0),
    copy: (arr: number[]): number[] => [...arr],
    gradient: (arr: number[], dx: number = 1.0): number[] => {
        const grad = new Array(arr.length).fill(0);
        for (let i = 0; i < arr.length; i++) {
            const prev = arr[(i - 1 + arr.length) % arr.length];
            const next = arr[(i + 1) % arr.length];
            grad[i] = (next - prev) / (2 * dx);
        }
        return grad;
    },
    dft: (arr: number[]): { re: number, im: number }[] => {
        const N = arr.length;
        const coeffs = [];
        for (let k = 0; k < N; k++) {
            let re = 0;
            let im = 0;
            for (let n = 0; n < N; n++) {
                const angle = (2 * Math.PI * k * n) / N;
                re += arr[n] * Math.cos(angle);
                im -= arr[n] * Math.sin(angle);
            }
            coeffs.push({ re, im });
        }
        return coeffs;
    },
    abs: (arr: number[]): number[] => arr.map(Math.abs),
    argmax: (arr: number[]): number => arr.reduce((maxIndex, val, index, array) => val > array[maxIndex] ? index : maxIndex, 0),
};

class CoreFieldDynamics {
    dimensions: number;
    dt: number;
    dx: number;
    primary_field: number[];
    gradient_field: number[];
    pattern_field: number[];
    alpha: number;
    beta: number;
    gamma: number;
    global_feedback_strength: number;
    control_gain: number;
    variance_threshold: number;

    constructor(dimensions = 50, dt = 0.1, dx = 1.0) {
        this.dimensions = dimensions;
        this.dt = dt;
        this.dx = dx;

        this.primary_field = Array.from({ length: dimensions }, () => Math.random() - 0.5);
        this.gradient_field = new Array(dimensions).fill(0);
        this.pattern_field = new Array(dimensions).fill(0);

        this.alpha = 0.1;
        this.beta = 0.1;
        this.gamma = 0.5;
        this.global_feedback_strength = 0.01;

        this.control_gain = 0.5;
        this.variance_threshold = 0.08;
    }

    update_primary_field(external_input: number[]) {
        for (let i = 0; i < this.dimensions; i++) {
            this.primary_field[i] += external_input[i] * this.dt;
        }

        const phi = this.primary_field;
        const phi_new = np.copy(phi);
        const spatial_average = np.mean(phi);
        const global_feedback = this.global_feedback_strength * spatial_average;

        for (let i = 0; i < this.dimensions; i++) {
            const phi_prev = phi[(i - 1 + this.dimensions) % this.dimensions];
            const phi_curr = phi[i];
            const phi_next = phi[(i + 1) % this.dimensions];

            const laplacian = (phi_prev - 2 * phi_curr + phi_next) / (this.dx ** 2);
            const dphi_dt = (this.gamma * laplacian + this.alpha * phi_curr -
                this.beta * (phi_curr ** 3) + global_feedback);

            phi_new[i] = phi_curr + dphi_dt * this.dt;
        }

        this.primary_field = phi_new;

        const current_variance = np.variance(this.primary_field);
        if (current_variance > this.variance_threshold) {
            this.apply_chaos_reduction();
        }
    }

    apply_chaos_reduction() {
        const control_target_state = 0.0;
        const control_signal = this.primary_field.map(val => -this.control_gain * (val - control_target_state));
        for (let i = 0; i < this.dimensions; i++) {
            this.primary_field[i] += control_signal[i] * this.dt;
        }
    }

    evolve_auxiliary_fields() {
        this.gradient_field = np.gradient(this.primary_field, this.dx);

        const learning_rate = 0.05;
        this.pattern_field = this.pattern_field.map((val, i) =>
            (1 - learning_rate) * val + learning_rate * this.primary_field[i]
        );
    }

    get_patterns(): Patterns {
        const variance = np.variance(this.primary_field);
        const mean_val = np.mean(this.primary_field);
        const stability = 1.0 / (1.0 + 10 * variance);

        const dft_coeffs = np.dft(this.primary_field).slice(1, this.dimensions / 2);
        const magnitudes = dft_coeffs.map(c => Math.sqrt(c.re ** 2 + c.im ** 2));
        const dominant_freq_idx = np.argmax(magnitudes) + 1;

        return {
            variance,
            mean_value: mean_val,
            stability,
            dominant_freq_idx
        };
    }
}

class CognitiveSystem {
    dimensions: number;
    creativity_field: number[];
    logic_field: number[];
    deduction_field: number[];

    constructor(dimensions = 50) {
        this.dimensions = dimensions;
        this.creativity_field = new Array(dimensions).fill(0);
        this.logic_field = new Array(dimensions).fill(0);
        this.deduction_field = new Array(dimensions).fill(0);
    }

    generate_creative_concepts(patterns: Patterns, primary_field: number[]) {
        this.creativity_field.fill(0);

        if (patterns.variance > 0.05) {
            const action = primary_field.map(val => (np.mean(primary_field) - val) * 0.5);
            this.creativity_field = this.creativity_field.map((v, i) => v + action[i]);
        }

        if (patterns.stability > 0.6) {
            const freq_idx = patterns.dominant_freq_idx;
            if (freq_idx > 0) {
                const y = Array.from({ length: this.dimensions }, (_, i) =>
                    Math.sin(2 * Math.PI * freq_idx * i / this.dimensions)
                );
                this.creativity_field = this.creativity_field.map((v, i) => v + y[i] * 0.5 * patterns.stability);
            }
        }

        const syntropyAction = primary_field.map(val => (0.0 - val) * 0.2);
        this.creativity_field = this.creativity_field.map((v, i) => v + syntropyAction[i]);
    }

    apply_logical_constraints(patterns: Patterns) {
        this.logic_field.fill(0.1);

        const utility_dampen = 1.0 - patterns.stability;
        this.logic_field = this.logic_field.map(v => v + utility_dampen);

        const utility_enhance = patterns.stability;
        this.logic_field = this.logic_field.map(v => v + utility_enhance);

        const sum = np.sum(this.logic_field);
        if (sum > 0) {
            this.logic_field = this.logic_field.map(v => v / sum);
        }
    }

    deductive_synthesis(num_iterations = 5): Concept {
        this.deduction_field = this.creativity_field.map((v, i) => v * this.logic_field[i]);

        for (let iter = 0; iter < num_iterations; iter++) {
            const laplacian = np.gradient(np.gradient(this.deduction_field));
            this.deduction_field = this.deduction_field.map((v, i) => v + 0.1 * laplacian[i]);
        }

        if (this.deduction_field.every(v => v === 0)) {
            return { id: "no_action", magnitude: 0 };
        }

        const max_abs_val = Math.max(...np.abs(this.deduction_field));
        if (max_abs_val < 1e-4) {
            return { id: "no_action", magnitude: 0 };
        }

        const mean_deduction = np.mean(this.deduction_field);

        const concept_id = np.std(this.deduction_field) > Math.abs(mean_deduction) ? "dampen_variance" : "drive_syntropy";

        return { id: concept_id, magnitude: np.mean(np.abs(this.deduction_field)) };
    }
}

export class StarLightSystem {
    core_dynamics: CoreFieldDynamics;
    cognitive_system: CognitiveSystem;
    time: number;
    last_patterns: Patterns;
    last_selected_concept: Concept;

    constructor(dimensions = 50, dt = 0.1, dx = 1.0) {
        this.core_dynamics = new CoreFieldDynamics(dimensions, dt, dx);
        this.cognitive_system = new CognitiveSystem(dimensions);
        this.time = 0.0;
        this.last_patterns = this.core_dynamics.get_patterns();
        this.last_selected_concept = { id: "init", magnitude: 0 };
    }

    run_cognitive_cycle(external_data: number[]) {
        this.core_dynamics.update_primary_field(external_data);
        this.core_dynamics.evolve_auxiliary_fields();

        const patterns = this.core_dynamics.get_patterns();
        this.last_patterns = patterns;

        this.cognitive_system.generate_creative_concepts(patterns, this.core_dynamics.primary_field);
        this.cognitive_system.apply_logical_constraints(patterns);
        const selected_concept = this.cognitive_system.deductive_synthesis();
        this.last_selected_concept = selected_concept;

        this.apply_conceptual_feedback(selected_concept);

        this.time += this.core_dynamics.dt;
    }

    apply_conceptual_feedback(concept: Concept) {
        if (concept.id === "dampen_variance") {
            this.core_dynamics.beta = Math.min(0.3, this.core_dynamics.beta + 0.01 * concept.magnitude);
            this.core_dynamics.control_gain = Math.min(1.0, this.core_dynamics.control_gain + 0.02 * concept.magnitude);
        } else if (concept.id === "drive_syntropy") {
            this.core_dynamics.alpha = Math.min(0.2, this.core_dynamics.alpha + 0.01 * concept.magnitude);
        }
    }

    getCoreState(): CoreFieldState {
        return {
            primary_field: np.copy(this.core_dynamics.primary_field),
            alpha: this.core_dynamics.alpha,
            beta: this.core_dynamics.beta,
            gamma: this.core_dynamics.gamma,
            control_gain: this.core_dynamics.control_gain,
            variance_threshold: this.core_dynamics.variance_threshold,
            time: this.time
        };
    }
    
    getCognitiveState(): CognitiveSystemState {
        return {
            creativity_field: np.copy(this.cognitive_system.creativity_field),
            logic_field: np.copy(this.cognitive_system.logic_field),
            deduction_field: np.copy(this.cognitive_system.deduction_field),
            patterns: this.last_patterns,
            selected_concept: this.last_selected_concept
        };
    }

    getLastCycleInfo(): { patterns: Patterns; selected_concept: Concept } {
        return {
            patterns: this.last_patterns,
            selected_concept: this.last_selected_concept
        };
    }
}