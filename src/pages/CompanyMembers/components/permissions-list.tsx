import { useCallback, useRef } from 'react';
import type { IRoutePermission } from '../../../services/datalab-api/usersResource';
import { groupPermissionsByTag } from '../permissions-helpers';
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

interface PermissionsListProps {
  permissions: IRoutePermission[];
  selected: Set<number>;
  onChange: (selected: Set<number>) => void;
}

interface PermissionGroupItemProps {
  tag: string;
  perms: IRoutePermission[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleGroup: (perms: IRoutePermission[]) => void;
}

const PermissionGroupItem = ({ tag, perms, selected, onToggle, onToggleGroup }: PermissionGroupItemProps) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const allSelected = perms.every((p) => selected.has(p.id));
  const someSelected = perms.some((p) => selected.has(p.id));

  const handleGroupCheckbox = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleGroup(perms);
    if (!allSelected && detailsRef.current) detailsRef.current.open = false;
  }, [allSelected, onToggleGroup, perms]);

  if (checkboxRef.current) {
    checkboxRef.current.indeterminate = someSelected && !allSelected;
  }

  return (
    <PermissionGroup>
      <PermissionGroupDetails ref={detailsRef}>
        <PermissionGroupSummary>
          {tag}
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={allSelected}
            onClick={handleGroupCheckbox}
            onChange={() => {}}
          />
        </PermissionGroupSummary>
        {perms.map((p) => (
          <PermissionToggleRow key={p.id} htmlFor={`perm-${p.id}`}>
            <PermissionToggleInfo>
              <PermissionToggleName>{p.name}</PermissionToggleName>
              {p.description && (
                <PermissionToggleDesc>{p.description}</PermissionToggleDesc>
              )}
            </PermissionToggleInfo>
            <input
              id={`perm-${p.id}`}
              type="checkbox"
              checked={selected.has(p.id)}
              onChange={() => onToggle(p.id)}
            />
          </PermissionToggleRow>
        ))}
      </PermissionGroupDetails>
    </PermissionGroup>
  );
};

export const PermissionsSelector = ({ permissions, selected, onChange }: PermissionsListProps) => {
  const grouped = groupPermissionsByTag(permissions);

  const togglePermission = useCallback((id: number) => {
    onChange(((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    })(selected));
  }, [selected, onChange]);

  const toggleGroup = useCallback((perms: IRoutePermission[]) => {
    onChange(((prev) => {
      const next = new Set(prev);
      const allSelected = perms.every((p) => next.has(p.id));
      perms.forEach((p) => (allSelected ? next.delete(p.id) : next.add(p.id)));
      return next;
    })(selected));
  }, [selected, onChange]);

  return (
    <PermissionsList>
      {Object.entries(grouped).map(([tag, perms]) => (
        <PermissionGroupItem
          key={tag}
          tag={tag}
          perms={perms}
          selected={selected}
          onToggle={togglePermission}
          onToggleGroup={toggleGroup}
        />
      ))}
    </PermissionsList>
  );
};
