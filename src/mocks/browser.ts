import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { resetDb } from './db';
import { SCENARIOS, getScenario, setScenario } from './scenarios';
import type { Scenario } from './scenarios';

export const worker = setupWorker(...handlers);

declare global {
  interface Window {
    kurioMocks?: {
      scenarios: readonly Scenario[];
      getScenario: () => Scenario;
      setScenario: (scenario: Scenario) => void;
      reset: () => void;
    };
  }
}

export async function startMocks() {
  const params = new URLSearchParams(window.location.search);

  if (params.get('resetMocks') === '1') resetDb();

  const scenario = params.get('scenario');
  if (scenario && (SCENARIOS as readonly string[]).includes(scenario)) {
    setScenario(scenario as Scenario);
  }

  // Atalhos para o console do navegador: kurioMocks.setScenario('slow'), kurioMocks.reset()
  window.kurioMocks = {
    scenarios: SCENARIOS,
    getScenario,
    setScenario,
    reset: () => {
      resetDb();
      window.location.reload();
    },
  };

  await worker.start({ onUnhandledRequest: 'bypass' });
}
