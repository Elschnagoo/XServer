import React from 'react';
import {
  Badge,
  BadgeColor,
  Button,
  Form,
  Grid,
  INames,
  InputOptionType,
  LPulse,
  Table,
  useQData,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';
import { useAppSelector } from '@/store';
import { selectLabel } from '@/store/MovieStore';
import BaseModal from '@/component/BaseModal';

export default function DownloadModal() {
  const context = useGlobalContext();
  const [data, , reload] = useQData(async () => {
    return (await context.getDownloadQ()).data;
  });
  const label = useAppSelector(selectLabel);
  if (!label) {
    return null;
  }
  return (
    <BaseModal title="Download Media">
      <Form
        className="glx-w-full-4"
        submit={{
          buttonText: 'Download element',
          loading: true,
          onSubmit: async ({ form, setError, clear }) => {
            if (!form.url || form.url === '') {
              setError({
                field: [
                  {
                    key: 'url',
                    message: 'URL cannot be empty',
                  },
                ],
              });
            }
            const l = await context.downloadMedia({
              url: form.url,
              label: form.label?.map((e: string) => ({ e_id: e })),
            });
            if (l.success) {
              toast.success('Download queued');
              reload();
              clear();
            } else {
              toast.error('Error adding download');
            }
          },
        }}
        options={[
          [
            {
              key: 'url',
              type: InputOptionType.TEXT,
              label: 'URL',
            },
          ],
          [
            {
              key: 'label',
              type: InputOptionType.TAG_SELECTOR,
              label: 'Add Label',
              items: label.map((l) => ({
                key: l.e_id,
                name: l.label_name,
                icon: l.icon as any,
                other: l.color,
              })),
            },
          ],
        ]}
      />

      {data ? (
        <>
          <Grid flex hCenter fullWidth>
            <Button onClick={() => reload()}>Refresh</Button>
            <Button
              onClick={async () => {
                await context.deleteDownloadMedia();
                reload();
              }}
            >
              Cleanup download queue
            </Button>
          </Grid>
          <Table
            rowData={data}
            columnDefs={[
              {
                field: 'created',
                headerName: 'Date',
              },
              {
                field: 'state',
                headerName: 'State',
              },
              {
                field: 'download_path',
                headerName: 'URL',
              },
            ]}
            extendRowRenderer={(params) => {
              return (
                <Grid flex flexColumn gap={12}>
                  <div>Label List:</div>
                  <Grid flex flexRow className="glx-flex-wrap" gap={8}>
                    {params.data.label?.map((l: string) => {
                      const lx = label?.find((e) => e.e_id === l);
                      if (lx) {
                        return (
                          <Badge
                            icon={
                              (lx.icon as INames | undefined) ||
                              'IOPricetagOutline'
                            }
                            text={lx.label_name}
                            color={lx.color as BadgeColor | undefined}
                          />
                        );
                      }
                      return null;
                    })}
                  </Grid>
                </Grid>
              );
            }}
          />
        </>
      ) : (
        <Grid flex flexR hCenter>
          <LPulse />
        </Grid>
      )}
    </BaseModal>
  );
}
