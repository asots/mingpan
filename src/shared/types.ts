/**
 * Shared types for MCP service
 * Simplified from baziwei/frontend/src/shared/types
 */

import type { BaziResult } from '../services/bazi/types.js';
import type { ZiweiResult } from '../services/ziwei/types.js';

/**
 * Subject data - represents a person for fortune calculation
 */
export interface SubjectData {
  id: string;
  name: string;
  birthDate: string;        // YYYY-MM-DD
  birthTime: string;        // HH:mm
  gender: 'male' | 'female';
  isLunar?: boolean;        // Use lunar calendar
  longitude?: number;       // For true solar time calculation
  birthPlace?: string;      // Location name
  relationship?: string;    // Relationship to owner
  notes?: string;

  // Cached calculation results (optional)
  baziData?: BaziResult;
  ziweiData?: ZiweiResult;
}

/**
 * Fortune query - describes what analysis to perform
 */
export interface FortuneQuery {
  who: {
    mode: 'single' | 'double';
    profiles: SubjectData[];
    relationship?: string;
  };
  when: {
    range: string;          // Date range for analysis
    targetYear?: number;    // Specific year to analyze
    targetMonth?: number;   // Specific month
    targetDay?: number;     // Specific day
  };
  what: {
    aspect: string;         // Fortune aspect to analyze
    includeBazi?: boolean;
    includeZiwei?: boolean;
  };
}

/**
 * Calculation input options
 */
export interface CalculationInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  gender: 'male' | 'female';
  isLunar?: boolean;
  longitude?: number;
}

/**
 * MCP tool input types
 */
export interface BaziToolInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  gender?: 'male' | 'female';
  longitude?: number;
  isLunar?: boolean;
  includeAnalysis?: boolean;
  includeDaYun?: boolean;
  includeLiuNian?: boolean;
  detail?: 'simple' | 'standard' | 'detailed';
}

export interface ZiweiToolInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
  targetYear?: number;
  includeDecades?: boolean;
  includeMutagen?: boolean;
  detail?: 'simple' | 'standard' | 'detailed';
}

export interface ChartToolInput extends BaziToolInput {
  systems?: ('bazi' | 'ziwei')[];
  targetYear?: number;
}
