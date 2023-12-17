import React, { useState } from 'react';
import { Label, LabelAlias } from '@elschnagoo/xserver-con';
import {
  ContentSwitcher,
  Form,
  Grid,
  InputOptionType,
  IOTrashBin,
  Table,
  useQData,
  uuid,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { BaseRowEvent } from '@grandlinex/react-components/dist/components/table/TableHook';
import usePreload from '@/store/preload';
import { useGlobalContext } from '@/context/GlobalContext';

export const formOptions = [
  [
    {
      key: 'it',
      type: InputOptionType.ICON_TEXT,
      label: 'Icon and name',
    },
  ],
  [
    {
      key: 'label_order',
      type: InputOptionType.NUMBER,
      label: 'Label Order',
      restriction: {
        min: 0,
        max: 20,
      },
    },
  ],
  [
    {
      key: 'color',
      type: InputOptionType.DROPDOWN,
      label: 'Color',
      items: [
        {
          key: 'blue',
          name: 'Blue',
        },
        {
          key: 'orange',
          name: 'Orange',
        },
        {
          key: 'green',
          name: 'Green',
        },
        {
          key: 'red',
          name: 'Red',
        },
        {
          key: 'black',
          name: 'Black',
        },
        {
          key: 'yellow',
          name: 'Yellow',
        },
      ],
    },
  ],
];
export default function LabelAliasComp({ label }: { label: Label }) {
  const [formId] = useState(uuid());
  const [fState, setFState] = useState<string>('edit');
  const { loadLabel } = usePreload();
  const context = useGlobalContext();
  const [alias, , reload] = useQData(async () => {
    return (await context.getLabelAlias(label.e_id)).data;
  });

  return (
    <Grid>
      <ContentSwitcher
        onChange={(el) => setFState(el.key)}
        items={[
          {
            key: 'edit',
            name: 'Edit',
          },
          {
            key: 'alias',
            name: 'Label Alias',
          },
        ]}
      />
      {fState === 'edit' ? (
        <Form
          key={formId}
          className="glx-w-full-4"
          defaultState={{
            color: label.color,
            label_order: label.label_order,
            it: {
              text: label.label_name,
              icon: label.icon || null,
            },
          }}
          submit={{
            buttonText: 'Create',
            onSubmit: async ({ form, setError }) => {
              const label_name = form.it?.text;
              if (!label_name || label_name === '') {
                setError({
                  field: [
                    {
                      key: 'it',
                      message: 'Label name must be set',
                    },
                  ],
                });
                return;
              }
              const icon = form.it?.icon || undefined;
              const color = form.color || undefined;
              const label_order = Number.isInteger(form.label_order)
                ? form.label_order
                : undefined;
              const param = {
                label_name,
                icon,
                color,
                label_order,
              };
              const l = await context.updateLabel(label.e_id, param);
              if (l.success) {
                toast.success('Label successfully updated');
                loadLabel();
              } else {
                toast.error('Error while updating label');
              }
            },
          }}
          options={formOptions}
        />
      ) : (
        <>
          <Form
            key={`${formId}_alias`}
            className="glx-w-full-4"
            submit={{
              buttonText: 'Create',
              onSubmit: async ({ form, setError, clear }) => {
                if (!form.alias || form.alias === '') {
                  setError({
                    field: [
                      {
                        key: 'alias',
                        message: 'Alias must be set',
                      },
                    ],
                  });
                  return;
                }
                const suc = await context.postAlias({
                  label: label.e_id,
                  alias: form.alias,
                });
                if (suc.success) {
                  toast.success('Alias successfully created');
                  reload();
                  clear();
                } else {
                  toast.error('Error while creating alias');
                }
              },
            }}
            options={[
              [
                {
                  key: 'alias',
                  type: InputOptionType.TEXT,
                  label: 'Alias',
                },
              ],
            ]}
          />
          <Table
            rowData={alias || []}
            columnDefs={[
              {
                field: 'e_id',
                dataType: 'string',
                headerName: 'ID',
              },
              {
                field: 'alias',
                dataType: 'string',
                headerName: 'Alias',
              },
            ]}
            rowAction={[
              (row: BaseRowEvent<LabelAlias>) => ({
                name: 'Delete',
                icon: <IOTrashBin />,
                onClick: async () => {
                  await context.deleteAlias(row.data.e_id);
                  reload();
                },
              }),
            ]}
          />
        </>
      )}
    </Grid>
  );
}
