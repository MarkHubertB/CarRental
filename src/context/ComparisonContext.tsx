"use client";

import React, { createContext, useContext, useState } from 'react';
import type { Car } from '@/types';

interface ComparisonContextType {
  selectedCars: Car[];
  toggleCarComparison: (car: Car) => void;
  clearComparison: () => void;
  isComparisonOpen: boolean;
  setComparisonOpen: (open: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const toggleCarComparison = (car: Car) => {
    setSelectedCars(prev => {
      const exists = prev.find(c => c.id === car.id);
      if (exists) {
        return prev.filter(c => c.id !== car.id);
      }
      if (prev.length >= 3) {
        // Limit to 3 cars for a clean comparison
        return [...prev.slice(1), car];
      }
      return [...prev, car];
    });
  };

  const clearComparison = () => setSelectedCars([]);

  return (
    <ComparisonContext.Provider value={{ selectedCars, toggleCarComparison, clearComparison, isComparisonOpen, setComparisonOpen: setIsComparisonOpen }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
