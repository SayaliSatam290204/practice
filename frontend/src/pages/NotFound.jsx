import { Link } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";

const NotFound = () => {
    return (
        <main style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'var(--bg-light)'
        }}>
            <FaLeaf style={{ fontSize: '5rem', color: 'var(--primary)', marginBottom: '1.5rem', opacity: '0.8' }} />
            <h1 style={{ fontSize: '3rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 'normal' }}>
                Oops! Looks like this plant has been uprooted.
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px' }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/" className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                Back to Home
            </Link>
        </main>
    );
};

export default NotFound;
