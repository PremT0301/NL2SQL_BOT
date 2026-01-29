import React, { createContext, useContext, useState } from 'react';

// Define the available datasets
export type DatasetId = 'TechTuk' | 'Novotel' | 'PVRINOX';

export interface Dataset {
    id: DatasetId;
    name: string;
    description: string;
    icon: string;
    themeColor: string;
    pageTitle: string;
    sampleQueries: string[];
}

export const DATASETS: Dataset[] = [
    {
        id: 'TechTuk',
        name: 'TechTuk',
        description: 'Technology Inventory Analytics',
        icon: '💻',
        themeColor: '#1976d2', // Blue
        pageTitle: 'InventoryAI – TechTuk',
        sampleQueries: [
            "Show laptop stock",
            "List low stock items",
            "What is the average product price?",
            "Show total inventory quantity"
        ]
    },
    {
        id: 'Novotel',
        name: 'Novotel',
        description: 'Restaurant Operations & Sales Analytics',
        icon: '🏨',
        themeColor: '#ed6c02', // Orange
        pageTitle: 'Novotel Restaurant Analytics',
        sampleQueries: [
            "What is the most selling dish?",
            "Show available desserts",
            "Total orders today",
            "List staff working evening shift"
        ]
    },
    {
        id: 'PVRINOX',
        name: 'PVRINOX',
        description: 'Cinema Operations, Movies & Snacks Analytics',
        icon: '🎬',
        themeColor: '#9c27b0', // Purple
        pageTitle: 'PVRINOX Cinema Insights',
        sampleQueries: [
            "What is the highest watched movie?",
            "Show movies playing today",
            "List low stock snacks",
            "How many tickets sold this week?"
        ]
    }
];

interface DatasetContextType {
    selectedDataset: Dataset | null;
    selectDataset: (datasetId: DatasetId) => void;
    clearDataset: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(() => {
        const saved = localStorage.getItem('selectedDatasetId');
        if (saved) {
            return DATASETS.find(d => d.id === saved) || null;
        }
        return null;
    });

    const selectDataset = (datasetId: DatasetId) => {
        const dataset = DATASETS.find(d => d.id === datasetId);
        if (dataset) {
            setSelectedDataset(dataset);
            localStorage.setItem('selectedDatasetId', dataset.id);
        }
    };

    const clearDataset = () => {
        setSelectedDataset(null);
        localStorage.removeItem('selectedDatasetId');
    };

    return (
        <DatasetContext.Provider value={{ selectedDataset, selectDataset, clearDataset }}>
            {children}
        </DatasetContext.Provider>
    );
};

export const useDataset = () => {
    const context = useContext(DatasetContext);
    if (context === undefined) {
        throw new Error('useDataset must be used within a DatasetProvider');
    }
    return context;
};
