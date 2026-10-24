import styles from '../company-members.module.css';
import type { UUID7 } from '../../../types/ids';
import { ToggleSwitch } from '../../../components/UI/Inputs/Toggle';
import type { IPermissionOption } from './permission-options';

interface IPermissionTogglesProps {
  groups: Record<string, IPermissionOption[]>;
  grantedIds: Set<UUID7>;
  togglingId: UUID7 | null;
  onToggle: (id: UUID7, isGranted: boolean) => void;
}

// Lista de switches de concessão — serve tanto às permissões de rota quanto às
// de provider; quem sabe o que fazer com o toggle é o dono da seção.
export const PermissionToggles = ({ groups, grantedIds, togglingId, onToggle }: IPermissionTogglesProps) => (
  <div className={styles.permissionsList}>
    {Object.entries(groups).map(([label, options]) => (
      <div className={styles.permissionGroup} key={label}>
        <p className={styles.permissionGroupLabel}>{label}</p>
        {options.map((option) => {
          const isGranted = grantedIds.has(option.id);

          return (
            <label className={styles.permissionToggleRow} key={option.id}>
              <div className={styles.permissionToggleInfo}>
                <span className={styles.permissionToggleName}>{option.name}</span>
                {option.description && (
                  <span className={styles.permissionToggleDesc}>{option.description}</span>
                )}
              </div>
              <ToggleSwitch
                checked={isGranted}
                disabled={togglingId === option.id}
                onChange={() => onToggle(option.id, isGranted)}
              />
            </label>
          );
        })}
      </div>
    ))}
  </div>
);
