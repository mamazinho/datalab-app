import { useCallback, useRef } from 'react';
import type { UUID } from '../../../types/ids';
import type { IPermissionOption } from './permission-options';
import {
  PermissionGroup,
  PermissionGroupDetails,
  PermissionGroupSummary,
  PermissionsList,
  PermissionToggleDesc,
  PermissionToggleInfo,
  PermissionToggleName,
  PermissionToggleRow,
} from '../company-members.style';

interface PermissionsSelectorProps {
  /** Grupos já rotulados (tag da rota, provider da permissão de agente...) */
  groups: Record<string, IPermissionOption[]>;
  selected: Set<UUID>;
  onChange: (selected: Set<UUID>) => void;
}

interface PermissionGroupItemProps {
  label: string;
  options: IPermissionOption[];
  selected: Set<UUID>;
  onToggle: (id: UUID) => void;
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
    <PermissionGroup>
      <PermissionGroupDetails ref={detailsRef}>
        <PermissionGroupSummary>
          {label}
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={allSelected}
            onClick={handleGroupCheckbox}
            onChange={() => {}}
          />
        </PermissionGroupSummary>
        {options.map((option) => (
          <PermissionToggleRow key={option.id} htmlFor={`perm-${option.id}`}>
            <PermissionToggleInfo>
              <PermissionToggleName>{option.name}</PermissionToggleName>
              {option.description && (
                <PermissionToggleDesc>{option.description}</PermissionToggleDesc>
              )}
            </PermissionToggleInfo>
            <input
              id={`perm-${option.id}`}
              type="checkbox"
              checked={selected.has(option.id)}
              onChange={() => onToggle(option.id)}
            />
          </PermissionToggleRow>
        ))}
      </PermissionGroupDetails>
    </PermissionGroup>
  );
};

export const PermissionsSelector = ({ groups, selected, onChange }: PermissionsSelectorProps) => {
  const togglePermission = useCallback((id: UUID) => {
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
    <PermissionsList>
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
    </PermissionsList>
  );
};
