// State management for the application
const state = {
    hearScore: 0,
    isStemi: null,
    initialTroponin: null,
    secondTroponin: null,
};

// DOM Elements
const steps = {
    stemi: document.getElementById('step-stemi'),
    hear: document.getElementById('step-hear'),
    troponin: document.getElementById('step-troponin'),
    result: document.getElementById('step-result'),
};

const troponinInstruction = document.getElementById('troponin-instruction');
const secondTroponinContainer = document.getElementById('second-troponin-container');

/**
 * Hides all steps and shows the specified one.
 * @param {string} stepKey - The key of the step to show (e.g., 'stemi', 'hear').
 */
function showStep(stepKey) {
    Object.values(steps).forEach(step => step.classList.add('hidden'));
    if (steps[stepKey]) {
        steps[stepKey].classList.remove('hidden');
    }
}

/**
 * Handles the initial STEMI decision.
 * @param {boolean} hasStemi - True if the patient has a STEMI.
 */
function handleStemi(hasStemi) {
    state.isStemi = hasStemi;
    if (hasStemi) {
        displayResult({
            title: 'Activate STEMI Pathway',
            details: 'Immediate cardiology consultation and transfer to cath lab as per local protocol. This is a critical emergency.',
            color: 'red'
        });
    } else {
        showStep('hear');
    }
}

/**
 * Calculates the HEAR score from the form inputs.
 */
function calculateHearScore() {
    const history = parseInt(document.getElementById('hear-history').value);
    const ecg = parseInt(document.getElementById('hear-ecg').value);
    const age = parseInt(document.getElementById('hear-age').value);
    const risk = parseInt(document.getElementById('hear-risk').value);
    state.hearScore = history + ecg + age + risk;

    // Move to the troponin step
    setupTroponinStep();
    showStep('troponin');
}

/**
 * Configures the troponin input step based on the HEAR score.
 */
function setupTroponinStep() {
    if (state.hearScore <= 3) {
        // Low risk group
        troponinInstruction.textContent = `HEAR Score is ${state.hearScore} (Low Risk). Enter initial troponin. A second troponin is only needed if the initial is elevated.`;
        secondTroponinContainer.classList.add('hidden'); // Initially hide second troponin
    } else {
        // Moderate/High risk group
        troponinInstruction.textContent = `HEAR Score is ${state.hearScore} (Moderate/High Risk). A 2-hour troponin is required.`;
        secondTroponinContainer.classList.remove('hidden');
    }
}

/**
 * Evaluates troponin values to determine final recommendation.
 */
function evaluateTroponins() {
    const initialTropInput = document.getElementById('initial-troponin');
    const secondTropInput = document.getElementById('second-troponin');

    state.initialTroponin = parseFloat(initialTropInput.value);
    
    if (isNaN(state.initialTroponin)) {
        alert('Please enter a valid initial troponin value.');
        return;
    }

    // --- Logic for Low HEAR Score (≤ 3) ---
    if (state.hearScore <= 3) {
        if (state.initialTroponin < 6) {
            displayResult({
                title: 'Low Risk - Consider Discharge',
                details: `With a HEAR score of ${state.hearScore} and an initial troponin < 6 ng/L, the risk of a Major Adverse Cardiac Event (MACE) is very low.`,
                recommendation: 'Consider discharge with primary care follow-up. Provide return precautions.',
                color: 'green'
            });
            return;
        } else {
            // Initial troponin is elevated, need a second one
            secondTroponinContainer.classList.remove('hidden');
            state.secondTroponin = parseFloat(secondTropInput.value);

            if (isNaN(state.secondTroponin)) {
               alert('Initial troponin is elevated (≥ 6 ng/L). Please enter the 2-hour troponin value to proceed.');
               return;
            }
            
            const delta = state.secondTroponin - state.initialTroponin;
            if (state.secondTroponin >= 6 && delta < 3) {
                 displayResult({
                    title: 'Low Risk - Consider Discharge',
                    details: `HEAR score ${state.hearScore}. While troponins are detectable, the 2-hour delta of ${delta.toFixed(1)} ng/L is not significantly changed.`,
                    recommendation: 'Low likelihood of ACS. Consider discharge with close follow-up.',
                    color: 'green'
                });
            } else {
                 displayResult({
                    title: 'Consider ACS Pathway / Observation',
                    details: `HEAR score ${state.hearScore}. The troponin is elevated and the 2-hour delta is ${delta.toFixed(1)} ng/L (≥ 3).`,
                    recommendation: 'This patient requires further evaluation. Consider admission/observation and cardiology consultation.',
                    color: 'yellow'
                });
            }
        }
    }
    // --- Logic for Moderate/High HEAR Score (> 3) ---
    else {
        state.secondTroponin = parseFloat(secondTropInput.value);
        if (isNaN(state.secondTroponin)) {
            alert('Please enter the 2-hour troponin value.');
            return;
        }
        
        const delta = state.secondTroponin - state.initialTroponin;

        if (state.secondTroponin < 10 && delta < 4) {
            displayResult({
                title: 'Lower Risk - Consider Non-Cardiac / Discharge',
                details: `HEAR score ${state.hearScore}. The 2-hour troponin is < 10 ng/L and the delta is ${delta.toFixed(1)} ng/L (< 4).`,
                recommendation: 'Risk of MACE is reduced. Consider alternative, non-cardiac causes of chest pain. Discharge may be appropriate based on clinical context.',
                color: 'green'
            });
        } else {
             displayResult({
                title: 'High Risk - Admit for ACS Pathway',
                details: `HEAR score ${state.hearScore}. The 2-hour troponin is ${state.secondTroponin.toFixed(1)} ng/L or the delta is ${delta.toFixed(1)} ng/L.`,
                recommendation: 'This patient is high risk for ACS. Admit for further management and cardiology consultation.',
                color: 'red'
            });
        }
    }
}

/**
 * Displays the final result card.
 * @param {object} result - The result object.
 * @param {string} result.title - The title of the result.
 * @param {string} result.details - Detailed explanation.
 * @param {string} [result.recommendation] - The clinical recommendation.
 * @param {string} result.color - The color theme ('red', 'yellow', 'green').
 */
function displayResult(result) {
    const colorClasses = {
        red: {
            bg: 'bg-red-100',
            border: 'border-red-500',
            title: 'text-red-800',
            details: 'text-red-700'
        },
        yellow: {
            bg: 'bg-yellow-100',
            border: 'border-yellow-500',
            title: 'text-yellow-800',
            details: 'text-yellow-700'
        },
        green: {
            bg: 'bg-green-100',
            border: 'border-green-500',
            title: 'text-green-800',
            details: 'text-green-700'
        }
    };
    const theme = colorClasses[result.color] || colorClasses.green;

    steps.result.innerHTML = `
        <div class="result-card p-6 rounded-xl shadow-md ${theme.bg} border-l-4 ${theme.border}">
            <h2 class="text-2xl font-bold ${theme.title}">${result.title}</h2>
            <p class="mt-4 text-md ${theme.details}">${result.details}</p>
            ${result.recommendation ? `<div class="mt-4 p-4 bg-white/60 rounded-lg">
                <h3 class="font-semibold text-lg ${theme.title}">Recommendation</h3>
                <p class="mt-1 ${theme.details}">${result.recommendation}</p>
            </div>` : ''}
            <button onclick="resetApp()" class="btn mt-6 w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-blue-700">Start Over</button>
        </div>
    `;
    showStep('result');
}

/**
 * Resets the application to its initial state.
 */
function resetApp() {
    state.hearScore = 0;
    state.isStemi = null;
    state.initialTroponin = null;
    state.secondTroponin = null;

    document.getElementById('hear-form').reset();
    document.getElementById('initial-troponin').value = '';
    document.getElementById('second-troponin').value = '';

    showStep('stemi');
}

// Initialize the app
window.onload = () => {
    showStep('stemi');
};
