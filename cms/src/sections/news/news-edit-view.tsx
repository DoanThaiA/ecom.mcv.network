import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getNewsByIdRequest,
  updateNewsRequest,
  selectCurrentNews,
  selectCurrentNewsLoading,
  selectUpdateNewsLoading,
  clearCurrentNews,
} from 'src/redux/store/newsSlice';
import type { CreateNewsRequest, UpdateNewsRequest } from 'src/types/news';
import { NewsForm } from './news-form';

// ----------------------------------------------------------------------

export function NewsEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const currentNews = useAppSelector(selectCurrentNews);
  const fetchLoading = useAppSelector(selectCurrentNewsLoading);
  const updateLoading = useAppSelector(selectUpdateNewsLoading);

  // Fetch news data on mount
  useEffect(() => {
    if (id) {
      dispatch(getNewsByIdRequest({ id }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentNews());
    };
  }, [dispatch, id]);

  const handleSubmit = (data: CreateNewsRequest | UpdateNewsRequest) => {
    if (id) {
      dispatch(
        updateNewsRequest({
          id,
          data: { ...data, id } as UpdateNewsRequest,
          onSuccess: () => {
            navigate('/article');
          },
        })
      );
    }
  };

  const handleCancel = () => {
    navigate('/article');
  };

  // Show loading state while fetching
  if (fetchLoading || !currentNews) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Transform News to form data format
  const formData = {
    title: currentNews.title,
    titleLocalization: currentNews.titleLocalization ?? undefined,
    content: currentNews.content,
    contentLocalization: currentNews.contentLocalization ?? undefined,
    thumbnail: currentNews.thumbnail,
    status: currentNews.status,
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NewsForm
        mode="edit"
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updateLoading}
      />
    </Box>
  );
}
