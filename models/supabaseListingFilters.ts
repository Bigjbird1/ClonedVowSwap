import { WeddingCategory, ItemCondition } from './supabaseListing';

export interface FilterParams {
  search?: string;
  categories?: WeddingCategory[];
  conditions?: ItemCondition[];
  priceMin?: number;
  priceMax?: number;
  styles?: string[];
  colors?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterState {
  search: string;
  categories: WeddingCategory[];
  conditions: ItemCondition[];
  priceRange: PriceRange;
  styles: string[];
  colors: string[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export const defaultFilterState: FilterState = {
  search: '',
  categories: [],
  conditions: [],
  priceRange: { min: 0, max: 10000 },
  styles: [],
  colors: [],
  sortBy: 'createdAt',
  sortDirection: 'desc'
};

export function filterParamsToState(params: FilterParams): FilterState {
  return {
    search: params.search || '',
    categories: params.categories || [],
    conditions: params.conditions || [],
    priceRange: {
      min: params.priceMin || 0,
      max: params.priceMax || 10000
    },
    styles: params.styles || [],
    colors: params.colors || [],
    sortBy: params.sortBy || 'createdAt',
    sortDirection: params.sortDirection || 'desc'
  };
}

export function filterStateToParams(state: FilterState): FilterParams {
  return {
    search: state.search || undefined,
    categories: state.categories.length > 0 ? state.categories : undefined,
    conditions: state.conditions.length > 0 ? state.conditions : undefined,
    priceMin: state.priceRange.min > 0 ? state.priceRange.min : undefined,
    priceMax: state.priceRange.max < 10000 ? state.priceRange.max : undefined,
    styles: state.styles.length > 0 ? state.styles : undefined,
    colors: state.colors.length > 0 ? state.colors : undefined,
    sortBy: state.sortBy !== 'createdAt' ? state.sortBy : undefined,
    sortDirection: state.sortDirection !== 'desc' ? state.sortDirection : undefined
  };
}
