import type { Category } from "@dnews/types";

interface CategorySelectProps {
  categories: Category[];
  loading?: boolean;
  value: number | "";
  onChange: (value: number) => void;
  required?: boolean;
}

function buildTree(categories: Category[]): { parents: Category[]; childrenByParent: Record<number, Category[]> } {
  const parents: Category[] = [];
  const childrenByParent: Record<number, Category[]> = {};

  for (const cat of categories) {
    if (cat.parentId == null) {
      parents.push(cat);
    } else {
      if (!childrenByParent[cat.parentId]) childrenByParent[cat.parentId] = [];
      childrenByParent[cat.parentId].push(cat);
    }
  }

  parents.sort((a, b) => a.name.localeCompare(b.name));
  for (const key of Object.keys(childrenByParent)) {
    childrenByParent[Number(key)].sort((a, b) => a.name.localeCompare(b.name));
  }

  return { parents, childrenByParent };
}

export default function CategorySelect({ categories, loading, value, onChange, required }: CategorySelectProps) {
  const { parents, childrenByParent } = buildTree(categories);

  const selectedCat = categories.find((c) => c.id === value);
  const selectedParentId = selectedCat?.parentId ?? null;

  const currentChildren = selectedParentId != null ? (childrenByParent[selectedParentId] ?? []) : [];

  const hasSubcategories = parents.some((p) => (childrenByParent[p.id]?.length ?? 0) > 0);

  if (!hasSubcategories) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
        required={required}
        className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
      >
        <option value="">
          {loading
            ? "Loading categories..."
            : categories.length === 0
              ? "No categories available"
              : "Select category"}
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
          Parent Category
        </label>
        <select
          value={selectedParentId ?? ""}
          onChange={(e) => {
            const parentId = e.target.value ? Number(e.target.value) : null;
            if (parentId == null) {
              onChange(0);
            } else {
              const children = childrenByParent[parentId] ?? [];
              if (children.length > 0) {
                onChange(children[0].id);
              } else {
                onChange(parentId);
              }
            }
          }}
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
        >
          <option value="">
            {loading ? "Loading..." : "Select parent category"}
          </option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedParentId != null && currentChildren.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
            Subcategory <span className="text-dnews-red">*</span>
          </label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
            required={required}
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
          >
            <option value="">Select subcategory</option>
            {currentChildren.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedParentId == null && (
        <p className="text-xs text-dnews-muted">Choose a parent category to see subcategories.</p>
      )}
    </div>
  );
}
