import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'src/utils/axios';

interface AffiliateOption {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  affiliateCode?: string;
}

interface AffiliateSearchProps {
  value: string;
  onSelect: (affiliate: AffiliateOption) => void;
  disabled?: boolean;
}

const PAGE_SIZE = 20;

export function AffiliateSearch({ value, onSelect, disabled }: AffiliateSearchProps) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<AffiliateOption[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AffiliateOption | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef(inputValue);
  searchRef.current = inputValue;

  const fetchAffiliates = useCallback(async (search: string, pageNum: number) => {
    const isFirstPage = pageNum === 1;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: Record<string, string> = {
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      };
      if (search) {
        params.filters = JSON.stringify({ search });
      }
      const response = await axiosInstance.get('/affiliates', { params });
      const data: Record<string, unknown>[] = response.data?.data ?? [];
      const next: boolean = response.data?.hasNextPage ?? false;

      const mapped: AffiliateOption[] = data.map((item) => ({
        id: (item.id ?? item._id) as string,
        name: (item.name ?? item.firstName ?? '') as string,
        email: (item.email ?? '') as string,
        phone: (item.phone ?? '') as string,
        affiliateCode: (item.affiliateCode ?? '') as string,
      }));

      setOptions((prev) => (isFirstPage ? mapped : [...prev, ...mapped]));
      setHasNextPage(next);
      setPage(pageNum);
    } catch {
      if (isFirstPage) setOptions([]);
    } finally {
      if (isFirstPage) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  // Load initial list on mount and debounced search on input change
  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchAffiliates(inputValue, 1);
      },
      inputValue ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [inputValue, fetchAffiliates]);

  // Infinite scroll: observe sentinel element rendered after last option
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore && !loading) {
          fetchAffiliates(searchRef.current, page + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, loading, page, fetchAffiliates]);

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      inputValue={inputValue}
      onInputChange={(_e, newInputValue, reason) => {
        if (reason !== 'reset') setInputValue(newInputValue);
      }}
      onChange={(_e, newValue) => {
        setSelectedOption(newValue);
        if (newValue) onSelect(newValue);
      }}
      getOptionLabel={(option) =>
        `${option.name}${option.affiliateCode ? ` (${option.affiliateCode})` : ''}${option.email ? ` - ${option.email}` : ''}`
      }
      isOptionEqualToValue={(option, val) => option.id === val.id}
      loading={loading}
      disabled={disabled}
      filterOptions={(x) => x}
      renderOption={(props, option, { index }) => (
        <>
          <li {...props} key={option.id}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {option.name}
                {option.affiliateCode && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    ({option.affiliateCode})
                  </Typography>
                )}
              </Typography>
              {option.email && (
                <Typography variant="caption" color="text.secondary">
                  {option.email}
                </Typography>
              )}
            </Box>
          </li>
          {index === options.length - 1 && (
            <li key="sentinel" style={{ padding: 0, listStyle: 'none' }}>
              <div ref={sentinelRef} style={{ height: 1 }} />
              {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                  <CircularProgress size={16} />
                </Box>
              )}
            </li>
          )}
        </>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('selectAffiliate')}
          placeholder={t('searchAffiliate')}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={loading ? t('loading') : t('noSearchResults')}
    />
  );
}
