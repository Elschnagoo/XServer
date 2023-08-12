import React from 'react';
import {
  Button,
  Form,
  Grid,
  IconButton,
  InputOptionType,
  IOClose,
  LPulse,
  Table,
  useQData,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';

export default function DownloadModal(props: { close: () => void }) {
  const { close } = props;
  const context = useGlobalContext();
  const [data, , reload] = useQData(async () => {
    return (await context.getDownloadQ()).data;
  });

  return (
    <Grid flex className="s-modal" center>
      <Grid className="form-wrapper" flex flexC gap={12}>
        <Grid flex flexR gap={4} flexSpaceB>
          <h1>Medien herunterladen</h1>
          <IconButton onClick={close}>
            <IOClose />
          </IconButton>
        </Grid>
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
            />
          </>
        ) : (
          <Grid flex flexR hCenter>
            <LPulse />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}
