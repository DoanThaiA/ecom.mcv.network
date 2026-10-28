import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type Row,
  flexRender,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch } from 'src/redux/store/store';
import { uploadFileRequest } from 'src/redux/store/fileSlice';
import { BannerMediaType } from 'src/types/gen/shared/shared/common/enums';
import { showError } from 'src/utils/toast';

// ----------------------------------------------------------------------

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export interface TopicBannerItem {
  id?: string;
  tempId: string; // for dnd-kit key
  mediaType: BannerMediaType;
  media: { mobile?: string; tablet?: string; desktop?: string };
  link?: string;
  order: number;
}

interface TopicBannersTabProps {
  banners: TopicBannerItem[];
  onAddBanners: (banners: TopicBannerItem[]) => void;
  onRemoveBanner: (tempId: string) => void;
  onEditBanner: (banner: TopicBannerItem) => void;
  onReorderBanners: (banners: TopicBannerItem[]) => void;
  loading?: boolean;
}

// ----------------------------------------------------------------------
// Media upload dropzone for a single breakpoint
// ----------------------------------------------------------------------
interface MediaUploadProps {
  label: string;
  value?: string;
  isVideo: boolean;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

function MediaUpload({ label, value, isVideo, onUpload, onRemove }: MediaUploadProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        showError(t('fileTooLarge'));
        return;
      }

      setUploading(true);
      dispatch(
        uploadFileRequest({
          file,
          driver: 'local',
          onSuccess: (uploadedFile) => {
            onUpload(uploadedFile.path);
            setUploading(false);
          },
          onError: () => {
            setUploading(false);
          },
        })
      );
    },
    [dispatch, isVideo, onUpload, t]
  );

  const accept = isVideo
    ? { 'video/*': ['.mp4', '.webm', '.mov'] }
    : { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: uploading,
  });

  if (value) {
    return (
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}>
          {label}
        </Typography>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid #E5E6EB',
          }}
        >
          {isVideo ? (
            <video src={value} style={{ width: '100%', height: 80, objectFit: 'cover' }} />
          ) : (
            <Box
              component="img"
              src={value}
              sx={{ width: '100%', height: 80, objectFit: 'cover' }}
            />
          )}
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}>
        {label}
      </Typography>
      <Box
        {...getRootProps()}
        sx={{
          border: '1px dashed',
          borderColor: isDragActive ? 'primary.main' : '#E5E6EB',
          borderRadius: 1,
          p: 1.5,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'transparent',
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <CircularProgress size={20} />
        ) : (
          <CloudUploadIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
        )}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Banner Dialog (Add / Edit)
// ----------------------------------------------------------------------
interface BannerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (banner: TopicBannerItem) => void;
  editBanner?: TopicBannerItem | null;
}

function BannerDialog({ open, onClose, onSave, editBanner }: BannerDialogProps) {
  const { t } = useTranslation();
  const isEditMode = !!editBanner;

  const [mediaType, setMediaType] = useState<BannerMediaType>(
    editBanner?.mediaType ?? BannerMediaType.BANNER_MEDIA_TYPE_IMAGE
  );
  const [media, setMedia] = useState<{ mobile?: string; tablet?: string; desktop?: string }>(
    editBanner?.media ?? {}
  );
  const [link, setLink] = useState(editBanner?.link ?? '');

  // Sync state when editBanner changes
  useEffect(() => {
    if (open) {
      setMediaType(editBanner?.mediaType ?? BannerMediaType.BANNER_MEDIA_TYPE_IMAGE);
      setMedia(editBanner?.media ?? {});
      setLink(editBanner?.link ?? '');
    }
  }, [open, editBanner]);

  const isVideo = mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;
  const hasMedia = !!(media.mobile || media.tablet || media.desktop);

  const handleSave = () => {
    if (!hasMedia) {
      showError(t('atLeastOneMedia'));
      return;
    }
    onSave({
      id: editBanner?.id,
      tempId: editBanner?.tempId ?? `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      mediaType,
      media,
      link: link || undefined,
      order: editBanner?.order ?? 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? t('update') : t('addBannerItem')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Media Type */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {t('bannerMediaType')}
            </Typography>
            <RadioGroup
              row
              value={mediaType}
              onChange={(e) => {
                setMediaType(Number(e.target.value) as BannerMediaType);
                setMedia({});
              }}
            >
              <FormControlLabel
                value={BannerMediaType.BANNER_MEDIA_TYPE_IMAGE}
                control={<Radio size="small" />}
                label={t('image')}
              />
              <FormControlLabel
                value={BannerMediaType.BANNER_MEDIA_TYPE_VIDEO}
                control={<Radio size="small" />}
                label="Video"
              />
            </RadioGroup>
          </Box>

          {/* Media Uploads */}
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <MediaUpload
                label={t('mobile')}
                value={media.mobile}
                isVideo={isVideo}
                onUpload={(url) => setMedia((prev) => ({ ...prev, mobile: url }))}
                onRemove={() => setMedia((prev) => ({ ...prev, mobile: undefined }))}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <MediaUpload
                label={t('tablet')}
                value={media.tablet}
                isVideo={isVideo}
                onUpload={(url) => setMedia((prev) => ({ ...prev, tablet: url }))}
                onRemove={() => setMedia((prev) => ({ ...prev, tablet: undefined }))}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <MediaUpload
                label={t('desktop')}
                value={media.desktop}
                isVideo={isVideo}
                onUpload={(url) => setMedia((prev) => ({ ...prev, desktop: url }))}
                onRemove={() => setMedia((prev) => ({ ...prev, desktop: undefined }))}
              />
            </Box>
          </Stack>

          {/* Link */}
          <TextField
            fullWidth
            size="small"
            label={t('bannerLink')}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('goBack')}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!hasMedia}>
          {isEditMode ? t('update') : t('addBannerItem')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------
// Sortable Row
// ----------------------------------------------------------------------
function SortableRow({ row, children }: { row: Row<TopicBannerItem>; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.original.tempId,
  });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f5f5f5' : undefined,
      }}
      {...attributes}
    >
      <td style={{ width: 40, textAlign: 'center', cursor: 'grab' }} {...listeners}>
        <DragIndicatorIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
      </td>
      {children}
    </tr>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export function TopicBannersTab({
  banners,
  onAddBanners,
  onRemoveBanner,
  onEditBanner,
  onReorderBanners,
  loading = false,
}: TopicBannersTabProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<TopicBannerItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.tempId === active.id);
      const newIndex = banners.findIndex((b) => b.tempId === over.id);
      const reordered = arrayMove(banners, oldIndex, newIndex).map((b, idx) => ({
        ...b,
        order: idx + 1,
      }));
      onReorderBanners(reordered);
    }
  };

  const handleSaveBanner = (banner: TopicBannerItem) => {
    if (editingBanner) {
      onEditBanner(banner);
    } else {
      onAddBanners([banner]);
    }
    setEditingBanner(null);
  };

  const handleOpenEdit = (banner: TopicBannerItem) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBanner(null);
  };

  const columns = useMemo<ColumnDef<TopicBannerItem>[]>(
    () => [
      {
        accessorKey: 'order',
        header: () => (
          <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 500 }}>
            #
          </Typography>
        ),
        size: 50,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {row.index + 1}
          </Typography>
        ),
      },
      {
        accessorKey: 'media',
        header: 'Media',
        size: 120,
        cell: ({ row }) => {
          const media = row.original.media;
          const previewUrl = media.desktop || media.tablet || media.mobile;
          if (!previewUrl) return null;
          const isVideo = row.original.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;
          if (isVideo) {
            return (
              <Box
                component="video"
                src={previewUrl}
                muted
                sx={{
                  width: 80,
                  height: 45,
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />
            );
          }
          return (
            <Avatar
              variant="rounded"
              src={previewUrl}
              sx={{ width: 80, height: 45, borderRadius: 1 }}
            />
          );
        },
      },
      {
        accessorKey: 'mediaType',
        header: t('bannerMediaType'),
        size: 100,
        cell: ({ row }) => (
          <Chip
            label={
              row.original.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO
                ? 'Video'
                : t('image')
            }
            size="small"
            color={
              row.original.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO
                ? 'secondary'
                : 'default'
            }
          />
        ),
      },
      {
        accessorKey: 'link',
        header: 'Link',
        size: 200,
        cell: ({ row }) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {row.original.link || '-'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row.original)}
              disabled={loading}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onRemoveBanner(row.original.tempId)}
              disabled={loading}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, onRemoveBanner, loading]
  );

  const table = useReactTable({
    data: banners,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.tempId,
  });

  const bannerIds = useMemo(() => banners.map((b) => b.tempId), [banners]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Add Button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingBanner(null);
            setDialogOpen(true);
          }}
          disabled={loading}
          size="small"
          sx={{
            bgcolor: '#0165FC',
            '&:hover': { bgcolor: '#0052CC' },
          }}
        >
          {t('addBannerItem')}
        </Button>
      </Box>

      {/* Table */}
      {banners.length === 0 ? (
        <Card
          sx={{
            p: 4,
            textAlign: 'center',
            boxShadow: 'none',
            border: '1px solid #E5E6EB',
          }}
        >
          <Typography color="text.secondary">{t('noBannersAdded')}</Typography>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={bannerIds} strategy={verticalListSortingStrategy}>
            <Box
              component="table"
              sx={{
                width: '100%',
                borderCollapse: 'collapse',
                '& th, & td': {
                  p: 1,
                  borderBottom: '1px solid #E5E6EB',
                  fontSize: 14,
                },
                '& th': {
                  textAlign: 'left',
                  fontWeight: 500,
                  color: 'text.secondary',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    <th style={{ width: 40 }} />
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} style={{ width: header.getSize() }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <SortableRow key={row.id} row={row}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </SortableRow>
                ))}
              </tbody>
            </Box>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Banner Dialog */}
      <BannerDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveBanner}
        editBanner={editingBanner}
      />
    </Box>
  );
}
