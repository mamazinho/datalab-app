import type { UUID } from '../../../types/ids';
import type { IPermissionOption } from './permission-options';
import {
  PermissionGroup,
  PermissionGroupLabel,
  PermissionsList,
  PermissionToggleDesc,
  PermissionToggleInfo,
  PermissionToggleName,
  PermissionToggleRow,
  ToggleSwitch,
} from '../company-members.style';

interface IPermissionTogglesProps {
  groups: Record<string, IPermissionOption[]>;
  grantedIds: Set<UUID>;
  togglingId: UUID | null;
  onToggle: (id: UUID, isGranted: boolean) => void;
}

// Lista de switches de concessão — serve tanto às permissões de rota quanto às
// de provider; quem sabe o que fazer com o toggle é o dono da seção.
export const PermissionToggles = ({ groups, grantedIds, togglingId, onToggle }: IPermissionTogglesProps) => (
  <PermissionsList>
    {Object.entries(groups).map(([label, options]) => (
      <PermissionGroup key={label}>
        <PermissionGroupLabel>{label}</PermissionGroupLabel>
        {options.map((option) => {
          const isGranted = grantedIds.has(option.id);

          return (
            <PermissionToggleRow key={option.id}>
              <PermissionToggleInfo>
                <PermissionToggleName>{option.name}</PermissionToggleName>
                {option.description && (
                  <PermissionToggleDesc>{option.description}</PermissionToggleDesc>
                )}
              </PermissionToggleInfo>
              <ToggleSwitch
                checked={isGranted}
                disabled={togglingId === option.id}
                onChange={() => onToggle(option.id, isGranted)}
              />
            </PermissionToggleRow>
          );
        })}
      </PermissionGroup>
    ))}
  </PermissionsList>
);
