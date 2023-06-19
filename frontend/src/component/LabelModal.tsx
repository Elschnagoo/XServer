import React from 'react';
import {
  Badge,
  Form,
  Grid,
  IconButton,
  InputOptionType,
  IOClose,
  Table,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store';
import { selectLabel } from '@/store/MovieStore';
import usePreload from '@/store/preload';
import { useGlobalContext } from '@/context/GlobalContext';

export default function LabelModal(props: { close: () => void }) {
  const { close } = props;
  const { loadLabel } = usePreload();
  const context = useGlobalContext();
  const label = useAppSelector(selectLabel);
  if (!label) {
    return null;
  }
  return (
    <Grid flex className="s-modal" center>
      <Grid className="form-wrapper" flex flexC gap={12}>
        <Grid flex flexR gap={4} flexSpaceB>
          <h1>Label creation</h1>
          <IconButton onClick={close}>
            <IOClose />
          </IconButton>
        </Grid>
        <Form
          className="glx-w-full-4"
          defaultState={{
            color: 'blue',
            it: { text: '', icon: null },
            label_order: '',
          }}
          submit={{
            buttonText: 'Create',
            onSubmit: async (form, setError, clear) => {
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
              const l = await context.postLabel(param);
              if (l.success) {
                toast.success('Label successfully created');
                loadLabel();
              } else {
                toast.error('Error while creating label');
              }
            },
          }}
          options={[
            [
              {
                key: 'it',
                type: InputOptionType.ICON_TEXT,
                label: 'Icon und Name',
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
          ]}
        />
        <Table
          rowData={label}
          columnDefs={[
            {
              field: 'label_name',
              headerName: 'Name',
            },
            {
              field: 'icon',
              headerName: 'Icon',
            },
            {
              field: 'color',
              headerName: 'Color',
            },
            {
              field: 'label_order',
              headerName: 'Order',
            },
            {
              field: 'preview',
              headerName: 'Preview',
              cellRenderer: (params) => (
                <Badge
                  key={params.data.e_id}
                  text={params.data.label_name}
                  color={params.data.color as any}
                  icon={(params.data.icon as any) || undefined}
                />
              ),
            },
          ]}
        />
      </Grid>
    </Grid>
  );
}
