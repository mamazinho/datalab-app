// Paths compartilhados entre rotas, layouts e header — evita string solta e a
// inversão de camada de components/UI importar de pages/.

export const MANAGEMENT_BASE_PATH = '/gerenciamento';
export const MEMBERS_PATH = `${MANAGEMENT_BASE_PATH}/membros`;
export const COMPANY_PATH = `${MANAGEMENT_BASE_PATH}/empresa`;
export const INTEGRATIONS_PATH = `${MANAGEMENT_BASE_PATH}/integracoes`;

// Ditado pelo backend (CLIENT_URL/integrations/callback): é para onde o provider
// devolve o consentimento de uma integração.
export const INTEGRATION_CALLBACK_PATH = '/integrations/callback';
