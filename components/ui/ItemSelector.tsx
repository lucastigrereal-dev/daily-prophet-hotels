'use client';

export interface Item {
  id: string;
  conteudo: string;
  tipo?: string;
  categoria?: string;
}

export interface ItemSelectorProps {
  items: Item[];
  selectedId?: string;
  selectedIds?: string[];
  onSelect: (item: Item) => void;
  multiSelect?: boolean;
  groupBy?: 'tipo' | 'categoria';
  maxVisible?: number;
}

export function ItemSelector({
  items,
  selectedId,
  selectedIds,
  onSelect,
  multiSelect = false,
  groupBy,
  maxVisible,
}: ItemSelectorProps) {
  const visibleItems = maxVisible ? items.slice(0, maxVisible) : items;
  const selectedSet = new Set(selectedIds ?? (selectedId ? [selectedId] : []));

  const groups = new Map<string, Item[]>();
  if (groupBy) {
    for (const item of visibleItems) {
      const value = item[groupBy];
      const key = value && value.trim().length > 0 ? value : `Sem ${groupBy}`;
      const current = groups.get(key) ?? [];
      current.push(item);
      groups.set(key, current);
    }
  } else {
    groups.set('Itens', visibleItems);
  }

  const hiddenCount = maxVisible && items.length > maxVisible ? items.length - maxVisible : 0;

  return (
    <div className="space-y-3">
      {Array.from(groups.entries()).map(([label, groupItems]) => (
        <div key={label} className="space-y-2">
          {groupBy && <div className="text-xs font-semibold text-gray-400 uppercase">{label}</div>}
          <div className="space-y-1">
            {groupItems.map((item) => {
              const checked = selectedSet.has(item.id);
              return (
                <label key={item.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type={multiSelect ? 'checkbox' : 'radio'}
                    name={multiSelect ? undefined : 'item-selector'}
                    checked={checked}
                    onChange={() => onSelect(item)}
                    className="mt-1 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className={checked ? 'text-blue-300' : 'text-gray-100'}>{item.conteudo}</div>
                    {(item.tipo || item.categoria) && (
                      <div className="text-xs text-gray-400">
                        {item.tipo && <span>{item.tipo}</span>}
                        {item.tipo && item.categoria && <span> • </span>}
                        {item.categoria && <span>{item.categoria}</span>}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {hiddenCount > 0 && <div className="text-xs text-gray-500">+{hiddenCount} itens ocultos</div>}
    </div>
  );
}
