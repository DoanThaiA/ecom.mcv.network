import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getProductCategoriesRequest,
  selectProductCategories,
  selectProductCategoryLoading,
  setProductCategoriesSuccess,
} from 'src/redux/store/productCategorySlice';
import { productCategoryRepository } from 'src/repositories';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';

// ----------------------------------------------------------------------

const LIMIT = 20;

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function CategoryMultiSelect({
  value,
  onChange,
  disabled = false,
}: CategoryMultiSelectProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectProductCategories);
  const loading = useAppSelector(selectProductCategoryLoading);

  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCache, setSelectedCache] = useState<ProductCategory[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSearchRef = useRef<string>('');

  // Build chip list: enrich selected ids with names from list or cache;
  // fall back to placeholder if not loaded yet (won't break Autocomplete).
  const selectedCategories = useMemo<ProductCategory[]>(() => {
    return value.map((id) => {
      const fromList = categories.find((c) => c.id === id);
      if (fromList) return fromList;
      const fromCache = selectedCache.find((c) => c.id === id);
      if (fromCache) return fromCache;
      return { id, name: id } as ProductCategory;
    });
  }, [value, categories, selectedCache]);

  // Keep cache of categories we've ever seen so chips don't lose name on search
  useEffect(() => {
    if (categories.length === 0) return;
    setSelectedCache((prev) => {
      const map = new Map(prev.map((c) => [c.id, c]));
      categories.forEach((c) => map.set(c.id, c));
      return Array.from(map.values());
    });
  }, [categories]);

  // Load initial categories when dropdown opens
  useEffect(() => {
    if (open && categories.length === 0 && !loading) {
      dispatch(
        getProductCategoriesRequest({
          page: 1,
          limit: LIMIT,
        })
      );
    }
  }, [open, categories.length, loading, dispatch]);

  // Debounced search
  const handleSearch = useCallback(
    (searchTerm: string) => {
      currentSearchRef.current = searchTerm;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const productCategories = await productCategoryRepository.getProductCategories({
            page: 1,
            limit: LIMIT,
            filters: searchTerm ? { search: searchTerm } : undefined,
          });

          if (currentSearchRef.current === searchTerm) {
            dispatch(
              setProductCategoriesSuccess({
                productCategories,
              })
            );
          }
        } catch (error) {
          console.error('Error searching categories:', error);
        } finally {
          if (currentSearchRef.current === searchTerm) {
            setSearchLoading(false);
          }
        }
      }, 300);
    },
    [dispatch]
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    currentSearchRef.current = '';
    setInputValue('');
  };

  return (
    <Autocomplete
      multiple
      open={open}
      onOpen={() => setOpen(true)}
      onClose={handleClose}
      options={categories}
      getOptionLabel={(option) => option.name}
      value={selectedCategories}
      inputValue={inputValue}
      onChange={(_, newValue) => {
        // Merge any newly selected items into the cache so chips keep names
        setSelectedCache((prev) => {
          const map = new Map(prev.map((c) => [c.id, c]));
          newValue.forEach((c) => map.set(c.id, c));
          return Array.from(map.values());
        });
        onChange(newValue.map((c) => c.id));
      }}
      onInputChange={(_, newInputValue, reason) => {
        setInputValue(newInputValue);
        if (reason === 'input') {
          handleSearch(newInputValue);
        }
      }}
      loading={loading || searchLoading}
      disabled={disabled}
      filterOptions={(x) => x}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      noOptionsText={t('noProductsFound')}
      loadingText={`${t('loading')}...`}
      ListboxProps={{
        sx: {
          maxHeight: 300,
        },
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip {...getTagProps({ index })} key={option.id} label={option.name} size="small" />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={value.length === 0 ? t('selectCategory') : ''}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {(loading || searchLoading) && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.name}
        </li>
      )}
    />
  );
}
