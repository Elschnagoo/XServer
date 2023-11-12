import React, { useState } from 'react';
import {
  Form,
  InputOptionType,
  IOClipboard,
  Table,
  uuid,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { BaseRowEvent } from '@grandlinex/react-components/dist/components/table/TableHook';
import { RatingElement } from '@elschnagoo/xserver-con';
import { FormConf } from '@grandlinex/react-components/dist/components/form/FormTypes';
import { useAppSelector } from '@/store';
import { selectRating } from '@/store/MovieStore';
import usePreload from '@/store/preload';
import { useGlobalContext } from '@/context/GlobalContext';

const formOptions: FormConf = [
  [
    {
      key: 'it',
      type: InputOptionType.ICON_TEXT,
      label: 'Icon and name',
    },
  ],
  [
    {
      key: 'rating_order',
      type: InputOptionType.NUMBER,
      label: 'Rating order',
    },
  ],
  [
    {
      key: 'rating_value',
      type: InputOptionType.NUMBER,
      label: 'Rating value',
      restriction: {
        min: 0,
      },
    },
  ],
  [
    {
      key: 'rating_type',
      type: InputOptionType.DROPDOWN,
      label: 'Rating Type',
      items: [
        {
          key: 'BOOL',
          name: 'Checkbox',
        },
        {
          key: 'STAR',
          name: 'Stars',
        },
      ],
    },
  ],
];
export default function RatingModal({
  divRef,
}: {
  divRef?: React.RefObject<HTMLDivElement>;
}) {
  const { loadRating } = usePreload();
  const context = useGlobalContext();
  const rating = useAppSelector(selectRating);
  const [fState, setFState] = useState<Record<string, any>>({
    it: { text: '', icon: null },
    rating_order: '',
    rating_value: '',
    rating_type: 'BOOL',
  });
  const [formId, setFormId] = useState(uuid());
  if (!rating) {
    return null;
  }
  return (
    <>
      <Form
        key={formId}
        className="glx-w-full-4"
        defaultState={fState}
        submit={{
          buttonText: 'Create',
          onSubmit: async ({ form, setError }) => {
            const rating_label = form.it?.text;
            if (!rating_label || rating_label === '') {
              setError({
                field: [
                  {
                    key: 'it',
                    message: 'Rating name must be set',
                  },
                ],
              });
              return;
            }
            const icon = form.it?.icon || undefined;
            const rating_order = Number.isInteger(form.rating_order)
              ? form.rating_order
              : undefined;
            const rating_value = Number.isInteger(form.rating_value)
              ? form.rating_value
              : undefined;
            const param = {
              rating_label,
              icon,
              rating_order,
              rating_value,
              rating_type: form.rating_type,
            };
            const l = await context.postRating(param);
            if (l.success) {
              toast.success('Rating successfully created');
              loadRating();
            } else {
              toast.error('Error while creating rating');
            }
          },
        }}
        options={formOptions}
      />
      <Table
        rowData={rating}
        rowAction={[
          (row: BaseRowEvent<RatingElement>) => ({
            name: 'Copy',
            icon: <IOClipboard />,
            onClick: () => {
              setFState({
                it: {
                  text: row.data.rating_label,
                  icon: row.data.icon || null,
                },
                rating_order: row.data.rating_order,
                rating_value: row.data.rating_value,
                rating_type: row.data.rating_type,
              });
              setFormId(uuid());
              divRef?.current?.scroll({ top: 0, behavior: 'smooth' });
            },
          }),
        ]}
        columnDefs={[
          {
            field: 'rating_label',
            headerName: 'Name',
          },
          {
            field: 'icon',
            headerName: 'Icon',
          },
          {
            field: 'rating_order',
            headerName: 'Rating order',
          },
          {
            field: 'rating_value',
            headerName: 'Rating Value',
          },
          {
            field: 'rating_type',
            headerName: 'Type',
          },
        ]}
        extendRowRenderer={(params) => (
          <Form
            key={formId}
            className="glx-w-full-4"
            defaultState={{
              it: { text: params.data.rating_label, icon: params.data.icon },
              rating_order: params.data.rating_order,
              rating_value: params.data.rating_value,
              rating_type: params.data.rating_type,
            }}
            submit={{
              buttonText: 'Create',
              onSubmit: async ({ form, setError }) => {
                const rating_label = form.it?.text;
                if (!rating_label || rating_label === '') {
                  setError({
                    field: [
                      {
                        key: 'it',
                        message: 'Rating name must be set',
                      },
                    ],
                  });
                  return;
                }
                const icon = form.it?.icon || undefined;
                const rating_order = Number.isInteger(form.rating_order)
                  ? form.rating_order
                  : undefined;
                const rating_value = Number.isInteger(form.rating_value)
                  ? form.rating_value
                  : undefined;
                const param = {
                  rating_label,
                  icon,
                  rating_order,
                  rating_value,
                  rating_type: form.rating_type,
                };
                const l = await context.updateRating(params.data.e_id, param);
                if (l.success) {
                  toast.success('Rating successfully updated');
                  loadRating();
                } else {
                  toast.error('Error while updating rating');
                }
              },
            }}
            options={formOptions}
          />
        )}
      />
    </>
  );
}
RatingModal.defaultProps = {
  divRef: undefined,
};
