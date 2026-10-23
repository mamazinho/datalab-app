import type { UUID7 } from '../../../types/ids';
import { ToggleSwitch } from '../../../components/UI/Inputs/Toggle';
import type { IPermissionOption } from './permission-options';
import {
  PermissionGroup,
  PermissionGroupLabel,
  PermissionsList,
  PermissionToggleDesc,
  PermissionToggleInfo,
  PermissionToggleName,
  PermissionToggleRow,
} from '../company-members.style';

interface IPermissionTogglesProps {
  groups: Record<string, IPermissionOption[]>;
  grantedIds: Set<UUID7>;
  togglingId: UUID7 | null;
  onToggle: (id: UUID7, isGranted: boolean) => void;
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
