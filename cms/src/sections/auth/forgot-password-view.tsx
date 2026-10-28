import { useState, useEffect } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { useTranslation } from 'react-i18next';
import { InputCommon } from 'src/components/input';
import { forgotPasswordRequest, selectIsLoading } from 'src/redux/store/authSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { toast } from 'react-toastify';

// ----------------------------------------------------------------------

export function ForgotPasswordView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    if (touched) {
      if (!email.trim()) {
        setEmailError(t('emailRequired'));
      } else if (!validateEmail(email)) {
        setEmailError(t('emailInvalid'));
      } else {
        setEmailError('');
      }
    }
  }, [email, touched, t]);

  /**
   * Handle send reset link
   */
  const handleSendResetLink = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate email
    const emailIsValid = validateEmail(email);
    setTouched(true);

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

    // Dispatch forgot password action
    dispatch(
      forgotPasswordRequest({
        credentials: { email },
        onSuccess: () => {
          setIsSubmitted(true);
        },
      })
    );
  };

  /**
   * Handle back to sign in
   */
  const handleBackToSignIn = () => {
    router.push('/sign-in');
  };

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSendResetLink}
      display="flex"
      flexDirection="column"
      gap={3}
    >
      <Box>
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '24px',
            color: '#000000',
            mb: 1,
          }}
        >
          {t('email')}
        </Typography>
        <InputCommon
          fullWidth
          name="email"
          placeholder={t('enterYourEmail')}
          value={email}
          error={Boolean(emailError)}
          helperText={emailError}
          onChange={(event) => {
            setEmail(event.target.value);
            if (!touched) {
              setTouched(true);
            }
          }}
          onBlur={() => {
            setTouched(true);
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '56px',
              borderRadius: '5px',
              '& fieldset': {
                borderColor: '#CBCCD4',
              },
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        onClick={handleSendResetLink}
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
        {t('sendResetLink')}
      </LoadingButton>
    </Box>
  );

  const renderSuccessMessage = (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography
        sx={{
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          color: '#353739',
          textAlign: 'center',
        }}
      >
        {t('resetLinkSentMessage')}
      </Typography>

      <LoadingButton
        fullWidth
        size="large"
        color="primary"
        variant="contained"
        onClick={handleBackToSignIn}
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
        }}
      >
        {t('backToSignIn')}
      </LoadingButton>
    </Box>
  );

  return (
    <Box
      sx={{
        maxWidth: '617px',
        margin: '0 auto',
        padding: '56px 40px',
        backgroundColor: (theme) => theme.palette.background.paper,
        border: '1px solid #F0F0F0',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      <Box display="flex" justifyContent="flex-start">
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
          color: '#000000',
          textAlign: 'left',
        }}
      >
        {t('forgotPasswordTitle')}
      </Typography>

      {isSubmitted ? renderSuccessMessage : renderForm}

      {!isSubmitted && (
        <Box display="flex" justifyContent="center">
          <Link
            component="button"
            type="button"
            onClick={handleBackToSignIn}
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
            {t('backToSignIn')}
          </Link>
        </Box>
      )}
    </Box>
  );
}
