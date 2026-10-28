import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from 'src/redux/store/store';

// GuestGuard.tsx
export default function GuestGuard() {
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    console.log('Guest guard', token);
  }, [token]);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
