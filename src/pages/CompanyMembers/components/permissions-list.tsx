import styles from '../company-members.module.css';
import { useCallback, useRef } from 'react';
import type { UUID7 } from '../../../types/ids';
import type { IPermissionOption } from './permission-options';

interface PermissionsSelectorProps {
  groups: Record<string, IPermissionOption[]>;
  selected: Set<UUID7>;
  onChange: (selected: Set<UUID7>) => void;
}

interface PermissionGroupItemProps {
  label: string;
  options: IPermissionOption[];
  selected: Set<UUID7>;
  onToggle: (id: UUID7) => void;
  onToggleGroup: (options: IPermissionOption[]) => void;
}

const PermissionGroupItem = ({ label, options, selected, onToggle, onToggleGroup }: PermissionGroupItemProps) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const allSelected = options.every((option) => selected.has(option.id));
  const someSelected = options.some((option) => selected.has(option.id));

  const handleGroupCheckbox = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleGroup(options);
    if (!allSelected && detailsRef.current) detailsRef.current.open = false;
  }, [allSelected, onToggleGroup, options]);

  if (checkboxRef.current) {
    checkboxRef.current.indeterminate = someSelected && !allSelected;
  }

  return (
    <div className={styles.permissionGroup}>
      <details className={styles.permissionGroupDetails} ref={detailsRef}>
        <summary className={styles.permissionGroupSummary}>
          {label}
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={allSelected}
            onClick={handleGroupCheckbox}
            onChange={() => {}}
          />
        </summary>
        {options.map((option) => (
          <label className={styles.permissionToggleRow} key={option.id} htmlFor={`perm-${option.id}`}>
            <div className={styles.permissionToggleInfo}>
              <span className={styles.permissionToggleName}>{option.name}</span>
              {option.description && (
                <span className={styles.permissionToggleDesc}>{option.description}</span>
              )}
            </div>
            <input
              id={`perm-${option.id}`}
              type="checkbox"
              checked={selected.has(option.id)}
              onChange={() => onToggle(option.id)}
            />
          </label>
        ))}
      </details>
    </div>
  );
};

export const PermissionsSelector = ({ groups, selected, onChange }: PermissionsSelectorProps) => {
  const togglePermission = useCallback((id: UUID7) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }, [selected, onChange]);

  const toggleGroup = useCallback((options: IPermissionOption[]) => {
    const next = new Set(selected);
    const allSelected = options.every((option) => next.has(option.id));
    options.forEach((option) => (allSelected ? next.delete(option.id) : next.add(option.id)));
    onChange(next);
  }, [selected, onChange]);

  return (
    <div className={styles.permissionsList}>
      {Object.entries(groups).map(([label, options]) => (
        <PermissionGroupItem
          key={label}
          label={label}
          options={options}
          selected={selected}
          onToggle={togglePermission}
          onToggleGroup={toggleGroup}
        />
      ))}
    </div>
  );
};
