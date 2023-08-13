import React from 'react';
import {
  Button,
  Form,
  Grid,
  IconButton,
  InputOptionType,
  IOCheckmark,
  IOClose,
  IORocketOutline,
  LPulse,
  Table,
  useQData,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';
import BaseModal from '@/component/BaseModal';

export default function LibModal() {
  const context = useGlobalContext();
  const [data, , reload] = useQData(async () => {
    return (await context.getLibPath()).data;
  });

  return (
    <BaseModal title="Library Path">
      <Form
        className="glx-w-full-4"
        submit={{
          buttonText: 'Add folder',
          loading: true,
          onSubmit: async ({ form, setError, clear }) => {
            if (!form.url || form.url === '') {
              setError({
                field: [
                  {
                    key: 'url',
                    message: 'Bitte gib eine URL ein',
                  },
                ],
              });
            }
            const l = await context.addLibPath({
              path: form.url,
              download: form.check || false,
            });
            if (l.success) {
              toast.success('New folder added');
              reload();
              clear();
            } else {
              toast.error('Error adding folder');
            }
          },
        }}
        options={[
          [
            {
              key: 'url',
              type: InputOptionType.TEXT,
              label: 'Folder Path',
            },
            {
              key: 'check',
              type: InputOptionType.CHECKBOX,
              label: 'Mark as Download Folder',
            },
          ],
        ]}
      />

      {data ? (
        <>
          <Grid flex hCenter fullWidth>
            <Button onClick={() => reload()}>Refresh list</Button>
            <Button
              onClick={() => {
                toast.dark(
                  <Grid flex flexC gap={12}>
                    <span>Add new Scan</span>
                    <Grid flex flexR gap={12} hCenter>
                      <IconButton
                        onClick={() => {
                          context.addScanJob().then((r) => {
                            if (r.success) {
                              toast.success('New Scan Job created ');
                            } else {
                              toast.error(
                                `Scan Job creation failed: ${r.code}`,
                              );
                            }
                          });
                        }}
                      >
                        <IOCheckmark />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          toast.dismiss();
                        }}
                      >
                        <IOClose />
                      </IconButton>
                    </Grid>
                  </Grid>,
                  {
                    autoClose: false,
                    icon: <IORocketOutline />,
                  },
                );
              }}
            >
              Scan Library
            </Button>
          </Grid>
          <Table
            rowData={data}
            columnDefs={[
              {
                field: 'lib',
                headerName: 'Lib',
              },
              {
                field: 'lib_path',
                headerName: 'Lib path',
              },
              {
                field: 'download',
                headerName: 'Download folder',
              },
            ]}
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
