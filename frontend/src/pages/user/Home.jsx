import { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import BookCard from '../../components/BookCard';
import FilterBar from '../../components/FilterBar';
import Loader from '../../components/Loader';
import { getAllBooks } from '../../services/api';

export default function Home() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');

    useEffect(() => {
        getAllBooks()
            .then(({ data }) => setBooks(data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let list = [...books];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.category.toLowerCase().includes(q) ||
                b.description.toLowerCase().includes(q)
            );
        }
        switch (sort) {
            case 'az': list.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'za': list.sort((a, b) => b.title.localeCompare(a.title)); break;
            case 'low': list.sort((a, b) => a.price - b.price); break;
            case 'high': list.sort((a, b) => b.price - a.price); break;
            default: break;
        }
        return list;
    }, [books, search, sort]);

    return (
        <>
            <Navbar />

            <div className="page-hero">
                <div className="page-hero-inner">
                    <h1>Discover <span>Knowledge</span></h1>
                    <p>Browse our curated collection of digital books — instantly yours.</p>
                </div>
            </div>

            <div className="page-wrap section">
                <FilterBar search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

                {loading ? (
                    <Loader />
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No books found</h3>
                        <p>{search ? `No results for "${search}"` : 'No books available yet. Check back soon!'}</p>
                        {search && <button className="btn btn-outline" onClick={() => setSearch('')}>Clear search</button>}
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Showing <strong>{filtered.length}</strong> book{filtered.length !== 1 ? 's' : ''}
                        </div>
                        <div className="books-grid">
                            {filtered.map((book, i) => (
                                <BookCard key={book._id} book={book} delay={i * 60} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
