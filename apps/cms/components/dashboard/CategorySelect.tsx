import type { Category } from "@dnews/types";

interface CategorySelectProps {
  categories: Category[];
  loading?: boolean;
  value: number | "";
  onChange: (value: number) => void;
  required?: boolean;
}

export default function CategorySelect({ categories, loading, value, onChange, required }: CategorySelectProps) {
  const parents = categories.filter((c) => c.parentId == null).sort((a, b) => a.name.localeCompare(b.name));
  const subcategories = categories.filter((c) => c.parentId != null);

  const selectedCategory = categories.find((c) => c.id === value) ?? null;
  const hasSelection = selectedCategory != null;
  const selectedParentId = selectedCategory?.parentId ?? selectedCategory?.id ?? null;
  const selectedSubcategoryId = selectedCategory && selectedCategory.parentId != null ? selectedCategory.id : "";

  const selectedChildren = selectedParentId != null
    ? subcategories.filter((c) => c.parentId === selectedParentId).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
          Category {required && <span className="text-dnews-red">*</span>}
        </label>
        <select
          value={selectedParentId ?? ""}
          onChange={(e) => {
            const nextParentId = e.target.value ? Number(e.target.value) : null;
            if (nextParentId == null) return;
            onChange(nextParentId);
          }}
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
        >
          <option value="">
            {loading ? "Loading..." : "Select category"}
          </option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
          Subcategory
        </label>
        <select
          value={selectedSubcategoryId}
          onChange={(e) => {
            const nextValue = e.target.value ? Number(e.target.value) : null;
            if (nextValue != null) {
              onChange(nextValue);
              return;
            }

            if (selectedParentId != null) {
              onChange(selectedParentId);
            }
          }}
          disabled={!selectedParentId || selectedChildren.length === 0}
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {!selectedParentId
              ? "Select a category first"
              : selectedChildren.length === 0
                ? "No subcategories available"
                : "No subcategory"}
          </option>
          {selectedChildren.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
        {selectedParentId != null && selectedChildren.length > 0 && (
          <p className="mt-1 text-[11px] text-dnews-muted">
            Select a subcategory or leave as &quot;No subcategory&quot; to use the parent category only.
          </p>
        )}
      </div>
    </div>
  );
}
