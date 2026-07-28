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

  const selectedCat = categories.find((c) => c.id === value);
  const selectedParentId = selectedCat?.parentId ?? null;
  const selectedChildren = selectedParentId != null
    ? subcategories.filter((c) => c.parentId === selectedParentId).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
          Category <span className="text-dnews-red">*</span>
        </label>
        <select
          value={selectedParentId ?? ""}
          onChange={(e) => {
            const parentId = e.target.value ? Number(e.target.value) : null;
            if (parentId == null) {
              onChange(0);
            } else {
              onChange(parentId);
            }
          }}
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
        >
          <option value="">
            {loading ? "Loading..." : "Select category"}
          </option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
          Subcategory
        </label>
        <select
          value={selectedParentId != null && selectedCat?.parentId != null ? value : ""}
          onChange={(e) => {
            const subId = e.target.value ? Number(e.target.value) : 0;
            if (subId) {
              onChange(subId);
            } else if (selectedParentId != null) {
              onChange(selectedParentId);
            }
          }}
          disabled={selectedParentId == null || selectedChildren.length === 0}
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {selectedParentId == null
              ? "Select a category first"
              : selectedChildren.length === 0
                ? "No subcategories available"
                : "No subcategory"}
          </option>
          {selectedChildren.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
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
