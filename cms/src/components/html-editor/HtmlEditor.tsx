import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Portal,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Facebook,
  Fullscreen,
  FullscreenExit,
  Image as ImageIcon,
  YouTube,
  Videocam,
} from '@mui/icons-material';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import YoutubeExtension from '@tiptap/extension-youtube';
import { Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { mergeAttributes, Node } from '@tiptap/core';
import {
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonEditLink,
  MenuButtonHighlightColor,
  MenuButtonHorizontalRule,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonRemoveFormatting,
  MenuButtonStrikethrough,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  MenuSelectTextAlign,
  RichTextEditorProvider,
  RichTextField,
} from 'mui-tiptap';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

// Helper function to decode HTML entities
const decodeHtmlEntities = (html: string): string => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = html;
  return textArea.value;
};

// Helper function to extract Vimeo video ID from URL
const getVimeoVideoId = (url: string): string | null => {
  // Patterns:
  // https://vimeo.com/347119375
  // https://player.vimeo.com/video/347119375
  // https://vimeo.com/channels/staffpicks/347119375
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /vimeo\.com\/channels\/[\w-]+\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const getFacebookVideoUrlFromEmbed = (url: string): string => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === 'www.facebook.com' && parsedUrl.pathname === '/plugins/video.php') {
      return parsedUrl.searchParams.get('href') || url;
    }
  } catch {
    return url;
  }

  return url;
};

const getFacebookShowTextFromEmbed = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === 'www.facebook.com' && parsedUrl.pathname === '/plugins/video.php') {
      return parsedUrl.searchParams.get('show_text') === 'true';
    }
  } catch {
    return false;
  }

  return false;
};

const getFacebookEmbedUrl = (url: string, showText: boolean): string => {
  const sourceUrl = getFacebookVideoUrlFromEmbed(url);
  const params = new URLSearchParams({
    href: sourceUrl,
    show_text: showText ? 'true' : 'false',
    width: '640',
  });

  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
};

// Custom Vimeo Extension for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    vimeo: {
      setVimeoVideo: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
    facebookVideo: {
      setFacebookVideo: (options: {
        src: string;
        width?: number;
        height?: number;
        showText?: boolean;
      }) => ReturnType;
    };
  }
}

const VimeoExtension = Node.create({
  name: 'vimeo',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 640,
      },
      height: {
        default: 360,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-vimeo-video]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const videoId = getVimeoVideoId(HTMLAttributes.src || '');
    const embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : HTMLAttributes.src;

    return [
      'div',
      { 'data-vimeo-video': '' },
      [
        'iframe',
        mergeAttributes(
          {
            src: embedUrl,
            width: HTMLAttributes.width,
            height: HTMLAttributes.height,
            frameborder: '0',
            allow: 'autoplay; fullscreen; picture-in-picture',
            allowfullscreen: 'true',
          },
          {}
        ),
      ],
    ];
  },

  addCommands() {
    return {
      setVimeoVideo:
        (options: { src: string; width?: number; height?: number }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

const FacebookVideoExtension = Node.create({
  name: 'facebookVideo',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 360,
      },
      height: {
        default: 640,
      },
      showText: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-facebook-video]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const iframe = element.querySelector('iframe');
          const src = iframe?.getAttribute('src') || '';

          return {
            src: getFacebookVideoUrlFromEmbed(src),
            width: 360,
            height: 640,
            showText: getFacebookShowTextFromEmbed(src),
          };
        },
      },
      {
        tag: 'iframe[src*="facebook.com/plugins/video.php"]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const src = element.getAttribute('src') || '';

          return {
            src: getFacebookVideoUrlFromEmbed(src),
            width: 360,
            height: 640,
            showText: getFacebookShowTextFromEmbed(src),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = getFacebookEmbedUrl(
      HTMLAttributes.src || '',
      Boolean(HTMLAttributes.showText)
    );

    return [
      'div',
      {
        'data-facebook-video': '',
        style:
          'display:block;width:360px;max-width:100%;height:640px;max-height:80vh;overflow:hidden;margin:8px 0;clear:both;',
      },
      [
        'iframe',
        mergeAttributes({
          src,
          width: '360',
          height: '640',
          scrolling: 'no',
          frameborder: '0',
          allow: 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share',
          allowfullscreen: 'true',
          style:
            'display:block;width:100%;height:100%;border:0;overflow:hidden;position:static;',
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setFacebookVideo:
        (options: {
          src: string;
          width?: number;
          height?: number;
          showText?: boolean;
        }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              width: 360,
              height: 640,
              showText: options.showText ?? false,
            },
          });
        },
    };
  },
});

const EXTENSIONS = [
  StarterKit,
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
          parseHTML: (element) => {
            const width = element.getAttribute('width');
            return width ? parseInt(width, 10) : null;
          },
          renderHTML: (attributes) => {
            if (!attributes.width) return {};
            return { width: attributes.width };
          },
        },
        height: {
          default: null,
          parseHTML: (element) => {
            const height = element.getAttribute('height');
            return height ? parseInt(height, 10) : null;
          },
          renderHTML: (attributes) => {
            if (!attributes.height) return {};
            return { height: attributes.height };
          },
        },
      };
    },
  }).configure({
    HTMLAttributes: {
      class: 'editor-image',
    },
  }),
  YoutubeExtension.configure({
    width: 640,
    height: 360,
    nocookie: true,
  }),
  VimeoExtension,
  FacebookVideoExtension,
];

// ----------------------------------------------------------------------
// Custom Menu Buttons for Image and YouTube
// ----------------------------------------------------------------------

interface MenuButtonImageProps {
  editor: Editor | null;
}

function MenuButtonImage({ editor }: MenuButtonImageProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const handleOpen = useCallback(() => {
    setOpen(true);
    setUrl('');
    setWidth('');
    setHeight('');
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setUrl('');
    setWidth('');
    setHeight('');
  }, []);

  const handleInsert = useCallback(() => {
    if (url && editor) {
      // Parse width/height - extract numeric value if present
      const parseSize = (value: string): number | undefined => {
        if (!value) return undefined;
        const num = parseInt(value, 10);
        return isNaN(num) ? undefined : num;
      };

      const imageAttrs: { src: string; width?: number; height?: number } = { src: url };
      const parsedWidth = parseSize(width);
      const parsedHeight = parseSize(height);

      if (parsedWidth) {
        imageAttrs.width = parsedWidth;
      }
      if (parsedHeight) {
        imageAttrs.height = parsedHeight;
      }

      editor.chain().focus().setImage(imageAttrs).run();
    }
    handleClose();
  }, [url, width, height, editor, handleClose]);

  return (
    <>
      <Tooltip title={t('insertImage')}>
        <IconButton
          size="small"
          onClick={handleOpen}
          disabled={!editor}
          sx={{
            borderRadius: 1,
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <ImageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('insertImage')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('imageUrlLabel')}
            type="url"
            fullWidth
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              margin="dense"
              label={t('imageWidth')}
              type="text"
              variant="outlined"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="300 or 50%"
              helperText={t('imageWidthHelper')}
              sx={{ flex: 1 }}
            />
            <TextField
              margin="dense"
              label={t('imageHeight')}
              type="text"
              variant="outlined"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="200 or auto"
              helperText={t('imageHeightHelper')}
              sx={{ flex: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button onClick={handleInsert} variant="contained" disabled={!url}>
            {t('insert')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

interface MenuButtonYoutubeProps {
  editor: Editor | null;
}

function MenuButtonYoutube({ editor }: MenuButtonYoutubeProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  const handleOpen = useCallback(() => {
    setOpen(true);
    setUrl('');
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setUrl('');
  }, []);

  const handleInsert = useCallback(() => {
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
    handleClose();
  }, [url, editor, handleClose]);

  return (
    <>
      <Tooltip title={t('insertYoutubeVideo')}>
        <IconButton
          size="small"
          onClick={handleOpen}
          disabled={!editor}
          sx={{
            borderRadius: 1,
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <YouTube fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('insertYoutubeVideo')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('youtubeUrl')}
            type="url"
            fullWidth
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            helperText={t('youtubeUrlHelper')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button onClick={handleInsert} variant="contained" disabled={!url}>
            {t('insert')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

interface MenuButtonVimeoProps {
  editor: Editor | null;
}

function MenuButtonVimeo({ editor }: MenuButtonVimeoProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  const handleOpen = useCallback(() => {
    setOpen(true);
    setUrl('');
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setUrl('');
  }, []);

  const handleInsert = useCallback(() => {
    if (url && editor) {
      editor.chain().focus().setVimeoVideo({ src: url }).run();
    }
    handleClose();
  }, [url, editor, handleClose]);

  return (
    <>
      <Tooltip title={t('insertVimeoVideo')}>
        <IconButton
          size="small"
          onClick={handleOpen}
          disabled={!editor}
          sx={{
            borderRadius: 1,
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <Videocam fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('insertVimeoVideo')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('vimeoUrl')}
            type="url"
            fullWidth
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://vimeo.com/347119375"
            helperText={t('vimeoUrlHelper')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button onClick={handleInsert} variant="contained" disabled={!url}>
            {t('insert')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

interface MenuButtonFacebookVideoProps {
  editor: Editor | null;
}

function MenuButtonFacebookVideo({ editor }: MenuButtonFacebookVideoProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [showText, setShowText] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setUrl('');
    setShowText(false);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setUrl('');
    setShowText(false);
  }, []);

  const handleInsert = useCallback(() => {
    if (url && editor) {
      editor.chain().focus().setFacebookVideo({ src: url, showText }).run();
    }
    handleClose();
  }, [url, showText, editor, handleClose]);

  return (
    <>
      <Tooltip title={t('insertFacebookVideo')}>
        <IconButton
          size="small"
          onClick={handleOpen}
          disabled={!editor}
          sx={{
            borderRadius: 1,
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <Facebook fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('insertFacebookVideo')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('facebookUrl')}
            type="url"
            fullWidth
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.facebook.com/watch/?v=123456789"
            helperText={t('facebookUrlHelper')}
          />
          <FormControlLabel
            control={
              <Switch checked={showText} onChange={(event) => setShowText(event.target.checked)} />
            }
            label={t('showText')}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button onClick={handleInsert} variant="contained" disabled={!url}>
            {t('insert')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

interface HtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

export function HtmlEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  minHeight = 250,
}: HtmlEditorProps) {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'html' | 'preview'>('edit');

  // Decode HTML entities for display in HTML tab
  const decodedHtml = useMemo(() => decodeHtmlEntities(value), [value]);

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  // Sync content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const editorHeight = minHeight;

  const editorContent = (
    <Box
      sx={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        backgroundColor: isFullscreen ? 'background.paper' : 'transparent',
        padding: isFullscreen ? 3 : 0,
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '100vh' : 'auto',
        overflow: isFullscreen ? 'hidden' : 'visible',
      }}
    >
      {/* Header with Tabs and Fullscreen */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: '1px 1px 0 1px',
          borderStyle: 'solid',
          borderColor: (theme) =>
            theme.palette.mode === 'light'
              ? 'rgba(145, 158, 171, 0.32)'
              : 'rgba(145, 158, 171, 0.32)',
          borderRadius: '8px 8px 0 0',
          backgroundColor: (theme) => theme.palette.grey[100],
          pr: 1,
          flexShrink: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            minHeight: 36,
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTab-root': {
              minHeight: 36,
              minWidth: 'auto',
              py: 0.5,
              px: 1.5,
              mx: 0.5,
              my: 0.5,
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 1,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'text.primary',
                backgroundColor: 'background.paper',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              },
            },
          }}
        >
          <Tab value="edit" label={t('edit')} />
          <Tab value="html" label={t('html')} />
          <Tab value="preview" label={t('preview')} />
        </Tabs>
        <Tooltip title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}>
          <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Edit Mode */}
      {activeTab === 'edit' && (
        <Box
          sx={{
            flex: isFullscreen ? 1 : 'none',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            '& .MuiTiptap-RichTextField-root': {
              flex: isFullscreen ? 1 : 'none',
              minHeight: isFullscreen ? 0 : editorHeight,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(145, 158, 171, 0.32)'
                  : 'rgba(145, 158, 171, 0.32)',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'text.primary',
              },
              '&:focus-within': {
                borderColor: 'text.primary',
              },
            },
            '& .MuiTiptap-RichTextField-content': {
              flex: isFullscreen ? 1 : 'none',
              minHeight: isFullscreen ? 0 : minHeight - 56,
              padding: 2,
              overflow: 'auto',
              '& .ProseMirror': {
                minHeight: isFullscreen ? '100%' : minHeight - 80,
                outline: 'none',
                '&:focus': {
                  outline: 'none',
                },
              },
            },
            '& .MuiTiptap-MenuBar-root': {
              borderBottom: '1px solid',
              borderBottomColor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(145, 158, 171, 0.32)'
                  : 'rgba(145, 158, 171, 0.32)',
              backgroundColor: (theme) => theme.palette.grey[50],
              padding: '4px 8px',
              flexWrap: 'wrap',
              gap: 0.5,
              flexShrink: 0,
            },
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        >
          <RichTextEditorProvider editor={editor}>
            <RichTextField
              controls={
                <MenuControlsContainer>
                  {/* Undo/Redo */}
                  <MenuButtonUndo />
                  <MenuButtonRedo />
                  <MenuDivider />

                  {/* Headings */}
                  <MenuSelectHeading />
                  <MenuDivider />

                  {/* Text formatting */}
                  <MenuButtonBold />
                  <MenuButtonItalic />
                  <MenuButtonUnderline />
                  <MenuButtonStrikethrough />
                  <MenuButtonHighlightColor />
                  <MenuDivider />

                  {/* Lists */}
                  <MenuButtonBulletedList />
                  <MenuButtonOrderedList />
                  <MenuDivider />

                  {/* Alignment */}
                  <MenuSelectTextAlign />
                  <MenuDivider />

                  {/* Links & Code */}
                  <MenuButtonEditLink />
                  <MenuButtonBlockquote />
                  <MenuButtonCode />
                  <MenuButtonCodeBlock />
                  <MenuButtonHorizontalRule />
                  <MenuDivider />

                  {/* Media */}
                  <MenuButtonImage editor={editor} />
                  <MenuButtonYoutube editor={editor} />
                  <MenuButtonVimeo editor={editor} />
                  <MenuButtonFacebookVideo editor={editor} />
                  <MenuDivider />

                  {/* Clear formatting */}
                  <MenuButtonRemoveFormatting />
                </MenuControlsContainer>
              }
            />
          </RichTextEditorProvider>
        </Box>
      )}

      {/* HTML Source Mode */}
      {activeTab === 'html' && (
        <Box
          sx={{
            flex: isFullscreen ? 1 : 'none',
            minHeight: isFullscreen ? 0 : editorHeight,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            component="textarea"
            value={decodedHtml}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              onChange(e.target.value);
            }}
            disabled={disabled}
            placeholder={placeholder || '<p>Enter HTML here...</p>'}
            sx={{
              flex: isFullscreen ? 1 : 'none',
              minHeight: isFullscreen ? 0 : editorHeight,
              width: '100%',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(145, 158, 171, 0.32)'
                  : 'rgba(145, 158, 171, 0.32)',
              borderRadius: '0 0 8px 8px',
              p: 2,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              backgroundColor: 'background.paper',
              color: 'text.primary',
              transition: 'border-color 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'text.primary',
              },
              '&:focus': {
                borderColor: 'text.primary',
              },
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            }}
          />
        </Box>
      )}

      {/* Preview Mode */}
      {activeTab === 'preview' && (
        <Box
          sx={{
            flex: isFullscreen ? 1 : 'none',
            minHeight: isFullscreen ? 0 : editorHeight,
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(145, 158, 171, 0.32)'
                : 'rgba(145, 158, 171, 0.32)',
            borderRadius: '0 0 8px 8px',
            p: 2,
            overflow: 'auto',
            backgroundColor: 'background.paper',
            '& p': { my: 1 },
            '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
            '& ul, & ol': { pl: 3, my: 1 },
            '& blockquote': {
              borderLeft: '3px solid',
              borderLeftColor: 'divider',
              pl: 2,
              ml: 0,
              my: 1,
              color: 'text.secondary',
            },
            '& code': {
              backgroundColor: 'grey.100',
              px: 0.5,
              borderRadius: 0.5,
              fontFamily: 'monospace',
            },
            '& pre': {
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              '& code': {
                backgroundColor: 'transparent',
                p: 0,
              },
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
            '& hr': {
              border: 'none',
              borderTop: '1px solid',
              borderTopColor: 'divider',
              my: 2,
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              my: 1,
            },
            '& iframe': {
              maxWidth: '100%',
              borderRadius: 1,
              my: 1,
            },
          }}
          dangerouslySetInnerHTML={{ __html: decodedHtml }}
        />
      )}
    </Box>
  );

  // Use Portal for fullscreen to escape parent container constraints
  if (isFullscreen) {
    return <Portal>{editorContent}</Portal>;
  }

  return editorContent;
}
