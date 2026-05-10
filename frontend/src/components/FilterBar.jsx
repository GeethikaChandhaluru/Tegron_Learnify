export default function FilterBar({ search, setSearch, sort, setSort }) {
  return (
    <div className="filter-bar">
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search books, authors, categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="">Sort By</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
        <option value="low">Price: Low → High</option>
        <option value="high">Price: High → Low</option>
      </select>
    </div>
  );
}
