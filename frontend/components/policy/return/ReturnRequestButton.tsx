'use client';

import { useState } from 'react';
import { Button, Flex } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { ReturnRequestDialog } from './ReturnRequestDialog';

/**
 * Button that triggers the return request dialog
 */
export function ReturnRequestButton() {
    const t = useTranslations('returnPolicy');
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Flex justify="center" className="py-6 lg:py-8">
                <Button
                    size="4"
                    className="cursor-pointer text-white font-semibold px-8 py-3"
                    style={{
                        background:
                            'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
                    }}
                    onClick={() => setDialogOpen(true)}
                >
                    {t('requestButton')}
                </Button>
            </Flex>
            <ReturnRequestDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    );
}
