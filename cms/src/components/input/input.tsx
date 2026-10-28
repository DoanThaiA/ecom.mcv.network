import type { TextFieldProps } from '@mui/material';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Input = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& label.Mui-focused': {
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },

  '& label.MuiInputLabel-shrink': {
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderWidth: '1px',
    },

    '&.Mui-focused fieldset': {
      borderColor: theme.palette.text.primary,
      borderWidth: '1px',
    },
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: theme.palette.text.primary,
    WebkitTextFillColor: theme.palette.text.primary,
  },
}));

export const InputCommon = (other: TextFieldProps) => <Input {...other} />;
