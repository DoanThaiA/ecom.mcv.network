import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { createNewsRequest, selectCreateNewsLoading } from 'src/redux/store/newsSlice';
import type { CreateNewsRequest } from 'src/types/news';
import { NewsForm } from './news-form';

// ----------------------------------------------------------------------

export function NewsCreateView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectCreateNewsLoading);

  const handleSubmit = (data: CreateNewsRequest) => {
    dispatch(
      createNewsRequest({
        data,
        onSuccess: () => {
          navigate('/article');
        },
      })
    );
  };

  const handleCancel = () => {
    navigate('/article');
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NewsForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
    </Box>
  );
}
