import React, { useState } from 'react';
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
import LoadingComp from '@/component/LoadingComp';

export default function DownloadModal() {
  const context = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    url: string;
    meta: string;
    label: string[];
  }>({
    url: '',
    meta: '',
    label: [],
  });
  const [error, setError] = useState<any>(undefined);
  const [data, , reload] = useQData(async () => {
    return (await context.getDownloadQ()).data;
  });
  const label = useAppSelector(selectLabel);

  const download = async () => {
    if (!form.url || form.url === '') {
      setError({
        field: [
          {
            key: 'url',
            message: 'URL cannot be empty',
          },
        ],
      });
      return;
    }
    setLoading(true);
    const l = await context.downloadMedia({
      url: form.url,
      label: form.label?.map((e: string) => ({ e_id: e })),
    });
    if (l.success) {
      toast.success('Download queued');
      reload();
      setForm({ url: '', meta: '', label: [] });
    } else {
      toast.error('Error adding download');
    }
    setLoading(false);
  };
  const getLabel = async () => {
    if (!form.url || form.url === '') {
      setError({
        field: [
          {
            key: 'url',
            message: 'URL cannot be empty',
          },
        ],
      });
      return;
    }
    setLoading(true);
    const l = await context.downloadLabelSuggestions({
      url: form.url,
    });
    if (l.success) {
      toast.success('Label added');
      setForm({
        url: form.url,
        meta: l.data?.search.map((a) => a.text).join('\n') || '',
        label: l.data?.label.map((e) => e.e_id) || [],
      });
    } else {
      toast.error('Error get label');
    }
    setLoading(false);
  };

  if (!label) {
    return null;
  }
  return (
    <>
      <LoadingComp loading={loading}>
        <Form
          className="glx-w-full-4"
          defaultState={form}
          defaultError={error}
          onChange={(e) => {
            setError(undefined);
            setForm(e.form);
            console.log(e.form);
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
            [
              {
                key: 'meta',
                type: InputOptionType.TEXT_FIELD,
                label: 'Meta (View Only)',
                disabled: true,
                restriction: {
                  rows: 10,
                },
              },
            ],
          ]}
        />
        <Grid flex flexRow hCenter>
          <Button onClick={getLabel}>Get Label</Button>
          <Button onClick={download}>Download element</Button>
        </Grid>
      </LoadingComp>

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
    </>
  );
}
