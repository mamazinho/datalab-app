import { useQuery } from '@tanstack/react-query';
import { meQuery } from '../queries';
import { useAuthContext } from '../contexts/auth';

/**
 * Dados do usuário logado como query compartilhada: todos os consumidores
 * leem o mesmo cache, e qualquer mutação que altere o usuário (convites,
 * empresa, perfil) só precisa invalidar meQuery.queryKey.
 *
 * Erros de sessão (401) são tratados centralmente no interceptor axios
 * (encerra a sessão → logout → /login); aqui só declaramos a leitura.
 */
export const useMe = () => {
  const { accessToken } = useAuthContext();

  return useQuery({
    ...meQuery,
    enabled: !!accessToken,
  });
};

// true enquanto há token mas o primeiro carregamento do usuário não terminou —
// segura os guards de rota para não piscar redirects
export const useIsAuthLoading = (): boolean => {
  const { accessToken } = useAuthContext();
  const { isLoading } = useMe();

  return !!accessToken && isLoading;
};
