import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LayoutContext = createContext();

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};

export const LayoutProvider = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const value = {
        sidebarCollapsed,
        setSidebarCollapsed,
        isMobile
    };

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
};

export const MainContent = ({ children, className = '' }) => {
    const { sidebarCollapsed, isMobile } = useLayout();

    const getMarginLeft = () => {
        if (isMobile) return '0';
        return sidebarCollapsed ? '80px' : '280px';
    };

    return (
        <motion.main
            className={`min-h-screen ${className}`}
            animate={{ 
                marginLeft: getMarginLeft(),
                opacity: 1
            }}
            initial={{ opacity: 0 }}
            transition={{ 
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            {children}
        </motion.main>
    );
};

export default { LayoutProvider, MainContent, useLayout }; 