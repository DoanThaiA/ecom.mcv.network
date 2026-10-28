import { Box, Card, CircularProgress, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TableImagePreview } from 'src/components/table-image-preview';
import type { GetInventoriesResponse } from 'src/types/product-inventories';

// ----------------------------------------------------------------------

interface InventoryTableHeaderCellProps {
  width: number;
  children: React.ReactNode;
}

function InventoryTableHeaderCell({ width, children }: InventoryTableHeaderCellProps) {
  return (
    <Box
      sx={{
        width,
        px: 2,
        py: 2,
        borderLeft: '1px solid #E5E6EB',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
        {children}
      </Typography>
    </Box>
  );
}

interface InventoryTableCellProps {
  width: number;
  children: React.ReactNode;
  color?: string;
}

function InventoryTableCell({ width, children, color }: InventoryTableCellProps) {
  return (
    <Box
      sx={{
        width,
        px: 2,
        py: 2,
        borderLeft: '1px solid #E5E6EB',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" sx={{ color: color || 'inherit' }}>
        {children}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

interface ProductInventoryTabProps {
  inventory: GetInventoriesResponse | null;
  inventoryLoading: boolean;
}

export function ProductInventoryTab({ inventory, inventoryLoading }: ProductInventoryTabProps) {
  const { t } = useTranslation();
  const [inventorySubTab, setInventorySubTab] = useState(0);

  // Check which fields have data to show dynamically
  const availableFields = useMemo(() => {
    if (!inventory?.data?.length) return {};
    const data = inventory.data;
    return {
      hasBarcode: data.some((item) => item.barcode),
      hasPrices: data.some((item) => item.prices),
      hasDepots: data.some((item) => item.depots && item.depots.length > 0),
      hasTotalShipping: data.some((item) => item.totalShipping !== undefined),
      hasTotalDamaged: data.some((item) => item.totalDamaged !== undefined),
      hasTotalHolding: data.some((item) => item.totalHolding !== undefined),
      hasVariantInventories: data.some(
        (item) => item.variantInventories && item.variantInventories.length > 0
      ),
    };
  }, [inventory]);

  return (
    <>
      {/* Inventory Sub-Tabs */}
      <Box
        sx={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #E5E6EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box
          onClick={() => setInventorySubTab(0)}
          sx={{
            px: 3,
            py: 2,
            cursor: 'pointer',
            borderBottom: inventorySubTab === 0 ? '3px solid #0165FC' : 'none',
            color: inventorySubTab === 0 ? '#0165FC' : '#000000',
            fontWeight: 400,
            fontSize: '16px',
          }}
        >
          {t('current_inventory')}
        </Box>
        <Box
          onClick={() => setInventorySubTab(1)}
          sx={{
            px: 3.25,
            py: 2,
            cursor: 'pointer',
            borderBottom: inventorySubTab === 1 ? '3px solid #0165FC' : 'none',
            color: inventorySubTab === 1 ? '#0165FC' : '#000000',
            fontWeight: 400,
            fontSize: '16px',
          }}
        >
          {t('inventory_history')}
        </Box>
      </Box>

      {/* Inventory Content */}
      {inventorySubTab === 0 && (
        <Box sx={{ mt: 2 }}>
          {/* Loading State */}
          {inventoryLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {/* No Data State */}
          {!inventoryLoading && !inventory?.data?.length && (
            <Card sx={{ p: 3, border: '1px solid #E5E6EB', boxShadow: 'none' }}>
              <Typography variant="body2" color="text.secondary">
                {t('no_data')}
              </Typography>
            </Card>
          )}

          {/* Inventory Table */}
          {!inventoryLoading && inventory?.data && inventory.data.length > 0 && (
            <>
              <Card
                sx={{
                  border: '1px solid #E5E6EB',
                  boxShadow: 'none',
                  overflow: 'auto',
                }}
              >
                {/* Table Header */}
                <Box
                  sx={{
                    display: 'flex',
                    backgroundColor: '#F7F8FA',
                    borderBottom: '1px solid #E5E6EB',
                    minWidth: 'fit-content',
                  }}
                >
                  <InventoryTableHeaderCell width={180}>{t('warehouse')}</InventoryTableHeaderCell>
                  {availableFields.hasBarcode && (
                    <InventoryTableHeaderCell width={140}>{t('barcode')}</InventoryTableHeaderCell>
                  )}
                  <InventoryTableHeaderCell width={120}>{t('stock')}</InventoryTableHeaderCell>
                  {availableFields.hasTotalDamaged && (
                    <InventoryTableHeaderCell width={100}>
                      {t('defective')}
                    </InventoryTableHeaderCell>
                  )}
                  {availableFields.hasTotalShipping && (
                    <InventoryTableHeaderCell width={130}>
                      {t('inTransit')}
                    </InventoryTableHeaderCell>
                  )}
                  {availableFields.hasTotalHolding && (
                    <InventoryTableHeaderCell width={120}>{t('onHold')}</InventoryTableHeaderCell>
                  )}
                  <InventoryTableHeaderCell width={130}>{t('canSell')}</InventoryTableHeaderCell>
                </Box>

                {/* Table Rows - Dynamic Data */}
                {inventory.data.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      backgroundColor: '#FFFFFF',
                      borderBottom: '1px solid #E5E6EB',
                      minWidth: 'fit-content',
                    }}
                  >
                    <InventoryTableCell width={180}>{item.productName || '--'}</InventoryTableCell>
                    {availableFields.hasBarcode && (
                      <InventoryTableCell width={140}>{item.barcode || '--'}</InventoryTableCell>
                    )}
                    <InventoryTableCell width={120}>
                      {item.totalRemain?.toLocaleString('vi-VN') ?? '--'}
                    </InventoryTableCell>
                    {availableFields.hasTotalDamaged && (
                      <InventoryTableCell width={100}>
                        {item.totalDamaged?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                    )}
                    {availableFields.hasTotalShipping && (
                      <InventoryTableCell width={130}>
                        {item.totalShipping?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                    )}
                    {availableFields.hasTotalHolding && (
                      <InventoryTableCell
                        width={120}
                        color={item.totalHolding ? '#0165FC' : undefined}
                      >
                        {item.totalHolding?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                    )}
                    <InventoryTableCell width={130}>
                      {item.totalAvailable?.toLocaleString('vi-VN') ?? '--'}
                    </InventoryTableCell>
                  </Box>
                ))}
              </Card>

              {/* Prices Section - Show only if available */}
              {availableFields.hasPrices && inventory.data[0]?.prices && (
                <Card
                  sx={{
                    mt: 2,
                    border: '1px solid #E5E6EB',
                    boxShadow: 'none',
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('pricing')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {inventory.data[0].prices.retail !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('sellingPrice')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {inventory.data[0].prices.retail.toLocaleString('vi-VN')} đ
                        </Typography>
                      </Box>
                    )}
                    {inventory.data[0].prices.wholesale !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('wholesalePrice')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {inventory.data[0].prices.wholesale.toLocaleString('vi-VN')} đ
                        </Typography>
                      </Box>
                    )}
                    {inventory.data[0].prices.import !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('costPrice')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {inventory.data[0].prices.import.toLocaleString('vi-VN')} đ
                        </Typography>
                      </Box>
                    )}
                    {inventory.data[0].prices.avgCost !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('avgCostPrice')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {inventory.data[0].prices.avgCost.toLocaleString('vi-VN')} đ
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              )}

              {/* Variant Inventories Section - Show only if available */}
              {availableFields.hasVariantInventories && inventory.data[0]?.variantInventories && (
                <Card
                  sx={{
                    mt: 2,
                    border: '1px solid #E5E6EB',
                    boxShadow: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 2, borderBottom: '1px solid #E5E6EB' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {t('childProduct')} ({inventory.data[0].variantInventories.length})
                    </Typography>
                  </Box>
                  {/* Variant Table Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      backgroundColor: '#F7F8FA',
                      borderBottom: '1px solid #E5E6EB',
                      minWidth: 'fit-content',
                    }}
                  >
                    <InventoryTableHeaderCell width={80}>{t('image')}</InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={200}>
                      {t('productName')}
                    </InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={140}>{t('barcode')}</InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>{t('stock')}</InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>
                      {t('defective')}
                    </InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>
                      {t('inTransit')}
                    </InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>{t('onHold')}</InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>{t('canSell')}</InventoryTableHeaderCell>
                  </Box>
                  {/* Variant Table Rows */}
                  {inventory.data[0].variantInventories.map((variant, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E6EB',
                        minWidth: 'fit-content',
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          px: 2,
                          py: 1,
                          borderLeft: '1px solid #E5E6EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TableImagePreview
                          src={variant.image?.avatar || ''}
                          alt={variant.productName || ''}
                          width={48}
                          height={64}
                        />
                      </Box>
                      <InventoryTableCell width={200}>
                        {variant.productName || '--'}
                      </InventoryTableCell>
                      <InventoryTableCell width={140}>{variant.barcode || '--'}</InventoryTableCell>
                      <InventoryTableCell width={100}>
                        {variant.totalRemain?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                      <InventoryTableCell width={100}>
                        {variant.totalDamaged?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                      <InventoryTableCell width={100}>
                        {variant.totalShipping?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                      <InventoryTableCell
                        width={100}
                        color={variant.totalHolding ? '#0165FC' : undefined}
                      >
                        {variant.totalHolding?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                      <InventoryTableCell width={100}>
                        {variant.totalAvailable?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                    </Box>
                  ))}
                </Card>
              )}

              {/* Depots Section - Show only if available */}
              {availableFields.hasDepots && inventory.data[0]?.depots && (
                <Card
                  sx={{
                    mt: 2,
                    border: '1px solid #E5E6EB',
                    boxShadow: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 2, borderBottom: '1px solid #E5E6EB' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {t('warehouse')} ({inventory.data[0].depots.length})
                    </Typography>
                  </Box>
                  {/* Depot Table Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      backgroundColor: '#F7F8FA',
                      borderBottom: '1px solid #E5E6EB',
                    }}
                  >
                    <InventoryTableHeaderCell width={150}>
                      {t('warehouse')}
                    </InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>{t('stock')}</InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>{t('canSell')}</InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>
                      {t('defective')}
                    </InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>
                      {t('inTransit')}
                    </InventoryTableHeaderCell>
                    <InventoryTableHeaderCell width={100}>{t('onHold')}</InventoryTableHeaderCell>
                  </Box>
                  {/* Depot Table Rows */}
                  {inventory.data[0].depots.map((depot, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E6EB',
                      }}
                    >
                      <InventoryTableCell width={150}>{depot.depotId || '--'}</InventoryTableCell>
                      <InventoryTableCell width={100}>
                        {depot.remain?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                      <InventoryTableCell width={100}>
                        {depot.available?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                      <InventoryTableCell width={100}>
                        {depot.damaged?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                      <InventoryTableCell width={100}>
                        {depot.shipping?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                      <InventoryTableCell width={100} color={depot.holding ? '#0165FC' : undefined}>
                        {depot.holding?.toLocaleString('vi-VN') ?? '--'}
                      </InventoryTableCell>
                    </Box>
                  ))}
                </Card>
              )}
            </>
          )}

          {/* Note Section - Only show notes for available fields */}
          <Box sx={{ mt: 2, p: 3, backgroundColor: '#FFFFFF' }}>
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
              <strong>{t('note')}:</strong>
              <br />
              {availableFields.hasTotalShipping && (
                <>
                  {t('inventory_note_in_transit')}
                  <br />
                </>
              )}
              {availableFields.hasTotalHolding && (
                <>
                  {t('inventory_note_on_hold')}
                  <br />
                </>
              )}
              {t('inventory_note_can_sell')}
            </Typography>
          </Box>
        </Box>
      )}

      {inventorySubTab === 1 && (
        <Box sx={{ mt: 2 }}>
          <Card
            sx={{
              p: 3,
              border: '1px solid #E5E6EB',
              boxShadow: 'none',
            }}
          >
            <Typography>{t('inventory_history')}</Typography>
          </Card>
        </Box>
      )}
    </>
  );
}
