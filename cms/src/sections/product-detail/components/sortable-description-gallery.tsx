import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { selectUploadLoading, uploadMultipleFilesRequest } from 'src/redux/store/fileSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { moveDescriptionImage } from './description-media.utils';
import { SortableDescriptionImageItem } from './sortable-description-image-item';

interface SortableDescriptionGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function SortableDescriptionGallery({
  images,
  onChange,
  disabled = false,
}: SortableDescriptionGalleryProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const globalUploading = useAppSelector(selectUploadLoading);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = images.map((url, index) => `description-media-${index}-${url}`);
  const isDisabled = disabled || globalUploading;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxSize: MAX_IMAGE_SIZE,
    disabled: isDisabled,
    multiple: true,
    onDrop: (files) => {
      if (!files.length) return;
      dispatch(
        uploadMultipleFilesRequest({
          files,
          driver: 'local',
          onSuccess: (uploadedFiles) =>
            onChange([...images, ...uploadedFiles.map((file) => file.path)]),
        })
      );
    },
  });

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(
      moveDescriptionImage(images, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
    );
  };

  return (
    <Box>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {images.map((url, index) => (
              <SortableDescriptionImageItem
                key={ids[index]}
                id={ids[index]}
                url={url}
                index={index}
                disabled={isDisabled}
                onRemove={() => onChange(images.filter((_, i) => i !== index))}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        <input {...getInputProps()} />
        {globalUploading ? (
          <CircularProgress size={24} />
        ) : (
          <CloudUploadIcon sx={{ color: 'text.secondary' }} />
        )}
        <Typography variant="body2" color="text.secondary">
          {isDragActive ? t('dropImageHere') : t('dragDropOrClick')}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {t('imageUploadRequirements')}
        </Typography>
      </Box>
    </Box>
  );
}
