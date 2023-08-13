import React, { createRef, useRef, useState } from 'react';
import {
  Badge,
  Form,
  InputOptionType,
  IOClipboard,
  Table,
  uuid,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { BaseRowEvent } from '@grandlinex/react-components/dist/components/table/TableHook';
import { Label } from '@elschnagoo/xserver-con';
import { useAppSelector } from '@/store';
import { selectLabel } from '@/store/MovieStore';
import usePreload from '@/store/preload';
import { useGlobalContext } from '@/context/GlobalContext';
import BaseModal from '@/component/BaseModal';

export default function LabelModal() {
  const { loadLabel } = usePreload();
  const ref = useRef(createRef<HTMLDivElement>());
  const context = useGlobalContext();
  const label = useAppSelector(selectLabel);
  const [fState, setFState] = useState<Record<string, any>>({
    color: 'blue',
    it: { text: '', icon: null },
    label_order: '',
  });
  const [formId, setFormId] = useState(uuid());
  if (!label) {
    return null;
  }
  return (
    <BaseModal divRef={ref.current} title="Label creation">
      <Form
        key={formId}
        className="glx-w-full-4"
        defaultState={fState}
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
        rowAction={[
          (row: BaseRowEvent<Label>) => ({
            name: 'Copy',
            icon: <IOClipboard />,
            onClick: () => {
              setFState({
                color: row.data.color,
                it: {
                  text: row.data.label_name,
                  icon: row.data.icon || null,
                },
                label_order: row.data.label_order,
              });
              setFormId(uuid());
              ref.current.current?.scroll({ top: 0, behavior: 'smooth' });
            },
          }),
        ]}
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
    </BaseModal>
  );
}
