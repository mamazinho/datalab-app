import styled from 'styled-components';

export const IntegrationsPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const IntegrationsPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const IntegrationsPageTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

export const IntegrationsPageSubtitle = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const IntegrationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
  gap: 1rem;
`;

export const IntegrationCardBox = styled.article<{ $connected: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.1rem 1.2rem;
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme, $connected }) => ($connected ? theme.colors.primary : theme.colors.border)};
`;

export const IntegrationCardHead = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const IntegrationName = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const IntegrationProviderTag = styled.span`
  display: block;
  margin-top: 0.15rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const IntegrationDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StatusBadge = styled.span<{ $tone: 'success' | 'warning' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'success' ? theme.colors.success : $tone === 'warning' ? theme.colors.error : theme.colors.border};
  color: ${({ theme, $tone }) =>
    $tone === 'success' ? theme.colors.success : $tone === 'warning' ? theme.colors.error : theme.colors.textSecondary};
`;

export const IntegrationMeta = styled.dl`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
`;

export const IntegrationMetaRow = styled.div`
  display: flex;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  dt { font-weight: 600; }
  dd { margin: 0; }
`;

// Aviso discreto: um "!" no canto do cabeçalho. Quem quiser o detalhe passa o
// mouse (ou foca pelo teclado) — não é informação que precise disputar espaço
// com o conteúdo do card.
export const IntegrationAlertTooltip = styled.span`
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 5;
  width: max(16rem, 100%);
  padding: 0.6rem 0.7rem;
  border-radius: 0.6rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 12px 22px ${({ theme }) => theme.colors.shadow};
  font-size: 0.76rem;
  font-weight: 400;
  text-align: left;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0;
  visibility: hidden;
  transform: translateY(-0.2rem);
  transition: opacity 0.16s ease, transform 0.16s ease, visibility 0.16s;
`;

export const IntegrationAlertIcon = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.15rem;
  padding: 0;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  cursor: help;
  transition: color 0.18s ease, border-color 0.18s ease;
`;

export const IntegrationAlert = styled.span`
  position: relative;
  display: inline-flex;

  &:hover ${IntegrationAlertIcon},
  ${IntegrationAlertIcon}:focus-visible {
    color: ${({ theme }) => theme.colors.error};
    border-color: ${({ theme }) => theme.colors.error};
  }

  &:hover ${IntegrationAlertTooltip},
  ${IntegrationAlertIcon}:focus-visible + ${IntegrationAlertTooltip} {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const IntegrationAlertList = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const IntegrationCardStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
`;

// Escopos que a API diz estarem faltando — mostrar quais evita a mensagem
// genérica de "faltam permissões", que o usuário não tem como conferir.
export const ScopeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.4rem;
`;

export const ScopeChip = styled.code`
  font-family: monospace;
  font-size: 0.68rem;
  padding: 0.1rem 0.35rem;
  border-radius: 0.3rem;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Resumo do que a empresa já pode operar: conta e, abaixo, o que está dentro dela.
export const AssetSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

export const AssetSummaryTitle = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AssetSummaryGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

export const AssetSummaryAccount = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const AssetSummaryItems = styled.ul`
  list-style: none;
  margin: 0.1rem 0 0;
  padding: 0 0 0 0.7rem;
  border-left: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

export const AssetSummaryItem = styled.li`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const IntegrationActions = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 0.25rem;
`;

export const IntegrationButton = styled.button`
  padding: 0.45rem 0.9rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: background-color 0.18s ease;
  white-space: nowrap;

  &:hover { background: ${({ theme }) => theme.colors.inputBackground}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const IntegrationPrimaryButton = styled(IntegrationButton)`
  border-color: transparent;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};

  &:hover { background: ${({ theme }) => theme.colors.primary}; opacity: 0.88; }
`;

export const IntegrationDangerButton = styled(IntegrationButton)`
  border-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};

  &:hover { background: ${({ theme }) => theme.colors.error}; color: #fff; }
`;

export const IntegrationsEmpty = styled.p`
  margin: 0;
  padding: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ── Seleção de ativos ─────────────────────────────────────────────────────────

export const AssetsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const AssetsFieldset = styled.fieldset`
  border: 0;
  padding: 0;
  margin: 0;
  display: contents;
  &:disabled { opacity: 0.6; pointer-events: none; }
`;

export const AssetsIntro = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AssetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-height: 24rem;
  overflow-y: auto;
`;

// Cada conta é um cartão fechado: o que está dentro dele pertence a ela.
export const AssetGroup = styled.section<{ $selected: boolean }>`
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.border)};
  border-radius: 0.75rem;
  overflow: hidden;
  transition: border-color 0.18s ease;
`;

// A conta é a entidade forte — cabeçalho com peso, sem seta de expandir.
export const AssetGroupHeader = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  cursor: pointer;
  background: ${({ theme, $selected }) => ($selected ? theme.colors.surfaceAlt : 'transparent')};
  transition: background-color 0.18s ease;

  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
`;

export const AssetGroupHeading = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  min-width: 0;
  flex: 1;
`;

// Corpo recuado e com fundo próprio: as properties leem como conteúdo da conta,
// não como itens de mesmo nível.
export const AssetGroupBody = styled.div`
  padding: 0.35rem 0.85rem 0.6rem;
  background: ${({ theme }) => theme.colors.inputBackground};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const AssetGroupBodyCaption = styled.p`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0.15rem 0 0.25rem 1.9rem;
  font-size: 0.74rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// O filete à esquerda amarra visualmente as properties à conta acima.
export const AssetGroupItems = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1.9rem;
  padding-left: 0.85rem;
  border-left: 2px solid ${({ theme }) => theme.colors.border};
`;

export const AssetGroupEmpty = styled.p`
  margin: 0;
  padding: 0.35rem 0;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AssetGroupName = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AssetGroupToggle = styled.button`
  border: 0;
  background: none;
  padding: 0;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:hover { text-decoration: underline; }
`;

export const AssetRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.2rem;
  cursor: pointer;
  border-radius: 0.4rem;
  transition: background-color 0.15s ease;

  &:hover { background: ${({ theme }) => theme.colors.inputBackground}; }
`;

export const AssetInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`;

export const AssetName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const AssetDetails = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AssetTypeTag = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 0.3rem;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

export const AssetExternalId = styled.code`
  font-family: monospace;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AssetsFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const AssetsSummary = styled.span`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AssetsError = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const AssetsSubmit = styled.button`
  padding: 0.7rem 1.4rem;
  border-radius: 0.65rem;
  border: 0;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font-size: 0.9rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: opacity 0.18s ease;

  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const AssetsFallback = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
