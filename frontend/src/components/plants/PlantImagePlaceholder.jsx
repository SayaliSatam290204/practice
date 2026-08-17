import React from 'react';
import { FaLeaf } from 'react-icons/fa';

const PlantImagePlaceholder = ({ className = '' }) => {
    return (
        <div 
            className={`plant-placeholder ${className}`}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--primary-light) 0%, #e8f0e8 100%)',
                color: 'var(--primary)',
                aspectRatio: '1 / 1', // standard fallback aspect ratio
            }}
        >
            <FaLeaf style={{ fontSize: '3rem', opacity: 0.6 }} />
        </div>
    );
};

export default PlantImagePlaceholder;
