import { useEffect, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Iconify } from 'src/components/iconify';
import { InputCommon } from 'src/components/input';
import { loginRequest, selectIsLoading } from 'src/redux/store/authSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';

// ----------------------------------------------------------------------

export function SignInView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const isLoading = useAppSelector(selectIsLoading);

  /**
   * Email validation
   */
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form on change
   */
  useEffect(() => {
    if (touched.email) {
      if (!email.trim()) {
        setEmailError(t('emailRequired'));
      } else if (!validateEmail(email)) {
        setEmailError(t('emailInvalid'));
      } else {
        setEmailError('');
      }
    }

    if (touched.password) {
      if (!password.trim()) {
        setPasswordError(t('passwordRequired'));
      } else {
        setPasswordError('');
      }
    }
  }, [email, password, touched, t]);

  /**
   * Handle sign in
   */
  const handleSignIn = async (event: any) => {
    event.preventDefault();

    // Validate all fields
    const emailIsValid = validateEmail(email);
    const passwordIsValid = password.trim().length > 0;

    setTouched({ email: true, password: true });

    if (!email.trim()) {
      setEmailError(t('emailRequired'));
      toast.error(t('emailRequired'));
      return;
    }

    if (!emailIsValid) {
      setEmailError(t('emailInvalid'));
      toast.error(t('emailInvalid'));
      return;
    }

    if (!passwordIsValid) {
      setPasswordError(t('passwordRequired'));
      toast.error(t('passwordRequired'));
      return;
    }

    // Dispatch login action
    dispatch(
      loginRequest({
        credentials: {
          email,
          password,
        },
        onSuccess: () => {
          router.replace('/');
        },
      })
    );
  };

  /**
   * Navigate to Forgot Password page
   */
  const handleForgotPasswordClick = () => {
    router.push('/forgot-password');
  };

  const renderForm = (
    <Box component="form" onSubmit={handleSignIn} display="flex" flexDirection="column" gap={3}>
      <InputCommon
        fullWidth
        name="email"
        label={t('email')}
        InputLabelProps={{ shrink: true }}
        value={email}
        error={Boolean(emailError)}
        helperText={emailError}
        onChange={(event) => {
          setEmail(event.target.value);
          if (!touched.email) {
            setTouched((prev) => ({ ...prev, email: true }));
          }
        }}
        onBlur={() => {
          setTouched((prev) => ({ ...prev, email: true }));
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '56px',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: (theme) => theme.palette.border.main,
            },
          },
        }}
      />

      <InputCommon
        fullWidth
        name="password"
        label={t('password')}
        InputLabelProps={{ shrink: true }}
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        error={Boolean(passwordError)}
        helperText={passwordError}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          if (!touched.password) {
            setTouched((prev) => ({ ...prev, password: true }));
          }
        }}
        onBlur={() => {
          setTouched((prev) => ({ ...prev, password: true }));
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '56px',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: (theme) => theme.palette.border.main,
            },
          },
        }}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              sx={{
                color: '#CBCCD4',
                '&.Mui-checked': {
                  color: '#0165FC',
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: '16px', fontWeight: 400, lineHeight: '20px' }}>
              {t('rememberMe')}
            </Typography>
          }
        />
        <Link
          component="button"
          type="button"
          onClick={handleForgotPasswordClick}
          sx={{
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '22px',
            color: '#235AFF',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {t('forgotPassword')}
        </Link>
      </Box>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        onClick={handleSignIn}
        loading={isLoading}
        disabled={isLoading}
        sx={{
          height: '60px',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 400,
          lineHeight: '24px',
          letterSpacing: '0.0075em',
          textTransform: 'none',
          backgroundColor: '#0165FC',
          '&:hover': {
            backgroundColor: '#0052CC',
          },
          '&.Mui-disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
      >
        {isLoading ? t('signingIn') : t('signin')}
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          maxWidth: '617px',
          margin: '0 auto',
          padding: '56px 40px',
          backgroundColor: (theme) => theme.palette.background.paper,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        <Box display="flex" justifyContent="flex-start" sx={{ mb: 0 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{ height: '50px', width: 'auto', maxWidth: '201px' }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: '40px',
            fontWeight: 400,
            lineHeight: 1.3,
            color: (theme) => theme.palette.text.primary,
            textAlign: 'left',
          }}
        >
          {t('signin')}
        </Typography>

        {renderForm}
      </Box>
    </>
  );
}
