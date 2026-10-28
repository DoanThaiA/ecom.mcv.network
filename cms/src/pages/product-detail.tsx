import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { selectCurrentProduct } from 'src/redux/store/productSlice';
import { useAppSelector } from 'src/redux/store/store';
import { ProductDetailView } from 'src/sections/product-detail';

// ----------------------------------------------------------------------

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();
  const product = useAppSelector(selectCurrentProduct);

  useEffect(() => {
    setTitle(t('product_detail'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${product?.name || t('product_detail')} - ${CONFIG.appName}`}</title>
        <meta name="description" content={product?.description || 'Product Detail'} />
        <meta name="keywords" content="cchat,cms,product,detail" />
      </Helmet>

      <ProductDetailView />
    </>
  );
}
