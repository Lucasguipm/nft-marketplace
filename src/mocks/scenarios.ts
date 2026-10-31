// Cenários de rede configuráveis e reproduzíveis.
// Troque pela URL (?scenario=slow), pelo console (kurioMocks.setScenario('slow')) ou pelo localStorage.
export const SCENARIOS = [
  'default', // respostas rápidas e normais
  'slow', // 2,5 s de latência em tudo
  'jitter', // latência variável (200 ms a 2,7 s): respostas podem chegar fora de ordem
  'empty', // a listagem volta vazia
  'server-error', // a listagem responde 500
  'offline', // falha de conexão em todas as chamadas
  'session-expired', // toda rota autenticada responde 401
  'favorites-fail', // favoritar/desfavoritar responde 500 (exercita o rollback)
  'wallet-rejected', // a carteira recusa a conexão
  'payment-declined', // o pedido termina recusado
  'order-timeout', // o pedido é criado, mas a resposta demora mais que o timeout do cliente
] as const;

export type Scenario = (typeof SCENARIOS)[number];

const KEY = 'kurio-mock-scenario';

export function getScenario(): Scenario {
  try {
    const value = localStorage.getItem(KEY) ?? '';
    return (SCENARIOS as readonly string[]).includes(value) ? (value as Scenario) : 'default';
  } catch {
    return 'default';
  }
}

export function setScenario(scenario: Scenario) {
  try {
    localStorage.setItem(KEY, scenario);
  } catch {
    // sem localStorage (modo privado, por exemplo): o cenário volta ao padrão
  }
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function latencyFor(scenario: Scenario): number {
  switch (scenario) {
    case 'slow':
      return 2500;
    case 'jitter':
      return 200 + Math.random() * 2500;
    default:
      return 250;
  }
}
