import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, IconButton, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

interface SortableDescriptionImageItemProps {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
  disabled?: boolean;
}

export function SortableDescriptionImageItem({
  id,
  url,
  index,
  onRemove,
  disabled = false,
}: SortableDescriptionImageItemProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{ position: 'relative', width: 150, opacity: isDragging ? 0.5 : 1 }}
    >
      <Box
        component="img"
        src={url}
        alt={`${t('image')} ${index + 1}`}
        sx={{ display: 'block', width: '100%', borderRadius: 1 }}
      />
      <IconButton
        size="small"
        disabled={disabled}
        {...attributes}
        {...listeners}
        sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'white' }}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        disabled={disabled}
        aria-label={t('delete')}
        onClick={onRemove}
        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white' }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
        {index + 1}
      </Typography>
    </Box>
  );
}
