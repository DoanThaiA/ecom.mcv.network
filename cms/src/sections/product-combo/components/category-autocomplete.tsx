import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getProductCategoriesRequest,
  selectProductCategories,
  selectProductCategoryLoading,
  setProductCategoriesSuccess,
} from 'src/redux/store/productCategorySlice';
import { productCategoryRepository } from 'src/repositories';

// ----------------------------------------------------------------------

const LIMIT = 20;

interface CategoryAutocompleteProps {
  value: string | undefined;
  onChange: (categoryId: string | undefined) => void;
  disabled?: boolean;
}

export function CategoryAutocomplete({
  value,
  onChange,
  disabled = false,
}: CategoryAutocompleteProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectProductCategories);
  const loading = useAppSelector(selectProductCategoryLoading);

  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSearchRef = useRef<string>('');

  // Find selected category from list or fetch it
  const selectedCategory = categories.find((cat) => cat.id === value) || null;

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

  // Handle search with debounce
  const handleSearch = useCallback(
    async (searchTerm: string) => {
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

          // Only update if this is still the current search
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Reset state when dropdown closes
  const handleClose = () => {
    setOpen(false);
    currentSearchRef.current = '';
    setInputValue('');
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={handleClose}
      options={categories}
      getOptionLabel={(option) => option.name}
      value={selectedCategory}
      inputValue={inputValue}
      onChange={(_, newValue) => {
        onChange(newValue?.id);
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
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('category')}
          placeholder={t('selectCategory')}
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
