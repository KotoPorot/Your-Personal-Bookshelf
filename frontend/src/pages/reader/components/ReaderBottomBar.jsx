import React from 'react';
import { useReader } from '../context/ReaderContext';

const ReaderBottomBar = () => {
    const { state, actions } = useReader();
    const { isDiverged } = state;
    const { handleReturnToReading, handleConfirmReadingHere } = actions;

    if (!isDiverged) return null;

    return (
        <div className="reader-bottom-bar" style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'center',
            background: 'transparent',
            animation: 'fadeIn 0.2s ease-in-out'
        }}>
            <div className="location-recovery-panel" style={{
                display: 'flex',
                gap: '15px',
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #3b82f6',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
                <button
                    className="sidebar-btn"
                    onClick={handleReturnToReading}
                    style={{ cursor: 'pointer', backgroundColor: '#475569', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px' }}
                >
                    ↩ Вернуться к чтению
                </button>
                <button
                    className="sidebar-btn"
                    onClick={handleConfirmReadingHere}
                    style={{ cursor: 'pointer', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px' }}
                >
                    📌 Читать здесь
                </button>
            </div>
        </div>
    );
};

export default ReaderBottomBar;