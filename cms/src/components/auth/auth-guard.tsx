// AuthGuard.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAppSelector, useAppDispatch } from 'src/redux/store/store';
import { setCredentials, logout } from 'src/redux/store/authSlice';
import { authRepository } from 'src/repositories';
import storageService from 'src/services/storageService';
import { setAuthTokenAxios, clearAuthTokenAxios } from 'src/utils/axios';

export function AuthGuard() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Không có refresh token → skip, để redirect về login
      if (!storageService.hasRefreshToken()) {
        setIsInitialized(true);
        return;
      }

      // Check xem có cần refresh không (> 12h)
      if (!storageService.needsProactiveRefresh()) {
        setIsInitialized(true);
        return;
      }

      // Cần refresh
      try {
        console.log('AuthGuard: Refreshing token on app load...');
        const response = await authRepository.refreshToken();

        // Update storage
        storageService.setAuthData({
          accessToken: response.token,
          refreshToken: response.refreshToken,
          tokenExpires: response.tokenExpires,
        });
        storageService.setLastRefreshTime();

        // Update axios header
        setAuthTokenAxios(response.token);

        // Update Redux state
        dispatch(
          setCredentials({
            token: response.token,
            refreshToken: response.refreshToken,
            tokenExpires: response.tokenExpires,
          })
        );

        console.log('AuthGuard: Token refreshed successfully');
      } catch (error) {
        console.error('AuthGuard: Token refresh failed', error);
        // Refresh fail → clear auth và redirect về login
        storageService.clearAuth();
        clearAuthTokenAxios();
        dispatch(logout());
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []); // Chỉ chạy 1 lần khi mount

  // Loading state
  if (!isInitialized) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Check token sau khi init
  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
