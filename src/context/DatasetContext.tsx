import React, { createContext, useContext, useState } from 'react';

// Define the available datasets
export type DatasetId = 'TechTuk' | 'Novotel' | 'PVRINOX';

export interface Dataset {
    id: DatasetId;
    name: string;
    description: string;
    icon: string; // Storing icon name or emoji for simplicity
}

export const DATASETS: Dataset[] = [
    {
        id: 'TechTuk',
        name: 'TechTuk',
        description: 'Technology Inventory Analytics',
        icon: '💻'
    },
    {
        id: 'Novotel',
        name: 'Novotel',
        description: 'Restaurant Operations & Sales Analytics',
        icon: '🏨'
    },
    {
        id: 'PVRINOX',
        name: 'PVRINOX',
        description: 'Cinema Operations, Movies & Snacks Analytics',
        icon: '🎬'
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
