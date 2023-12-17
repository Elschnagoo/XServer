import React, { useMemo, useState } from 'react';
import {
  Badge,
  ContentSwitcher,
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
import LabelAliasComp, { formOptions } from '@/component/LabelAliasComp';

export default function LabelModal({
  divRef,
}: {
  divRef?: React.RefObject<HTMLDivElement>;
}) {
  const { loadLabel } = usePreload();
  const context = useGlobalContext();
  const label = useAppSelector(selectLabel);
  const [mode, setMode] = useState<number>(0);
  const [filter, setFilter] = useState<string>('');
  const [fState, setFState] = useState<Record<string, any>>({
    color: 'blue',
    it: { text: '', icon: null },
    label_order: '',
  });
  const [formId, setFormId] = useState(uuid());
  const labelFilter = useMemo<Label[]>(
    () =>
      label?.filter((c) => {
        if (filter === '') {
          return true;
        }
        return c.label_name.toLowerCase().includes(filter.toLowerCase());
      }) || [],
    [label, filter],
  );
  function changeMode(newMode: number) {
    setMode(newMode);
    setFilter('');
  }
  if (!label) {
    return null;
  }
  return (
    <>
      <hr style={{ width: '100%' }} />
      <ContentSwitcher
        selectedIndex={mode}
        onChange={(el) => changeMode(el.index)}
        parentState={[mode, setMode]}
        items={[
          {
            key: 'create',
            name: 'Create',
          },
          {
            key: 'filter',
            name: 'Filter',
          },
          {
            key: 'test',
            name: 'Input Test',
          },
        ]}
      />
      {mode === 0 && (
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
          options={formOptions}
        />
      )}
      {mode === 1 && (
        <Form
          key={`${formId}filter`}
          className="glx-w-full-4"
          onChange={(form) => {
            setFilter(form.form.filter || '');
          }}
          options={[
            [
              {
                key: 'filter',
                label: 'Filter',
                type: InputOptionType.TEXT,
              },
            ],
          ]}
        />
      )}
      {mode === 2 && (
        <Form
          key={`${formId}test`}
          className="glx-w-full-4"
          onChange={(form) => {
            setFilter(form.form.filter || '');
          }}
          options={[
            [
              {
                key: 'text',
                label: 'Test Text',
                type: InputOptionType.TEXT_FIELD,
              },
            ],
            [
              {
                key: 'label',
                label: 'Label',
                type: InputOptionType.TAG_SELECTOR,
                disabled: true,
                items: label.map((l) => ({
                  key: l.e_id,
                  name: l.label_name,
                  icon: l.icon as any,
                  other: l.color,
                })),
              },
            ],
          ]}
          submit={{
            onSubmit: async ({ form, setError, update }) => {
              if (!form.text || form.text === '') {
                setError({
                  field: [
                    {
                      key: 'text',
                      message: 'Text must be set',
                    },
                  ],
                });
                return;
              }
              const data = await context.lookupLabels({
                text: form.text,
              });
              update({
                ...form,
                label: data.data?.map((x) => x.e_id) || [],
              });
            },
            loading: true,
            buttonText: 'Test Input',
          }}
        />
      )}
      <Table
        rowData={labelFilter}
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
              changeMode(0);
              divRef?.current?.scroll({ top: 0, behavior: 'smooth' });
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
        extendRowRenderer={(params) => <LabelAliasComp label={params.data} />}
      />
    </>
  );
}
LabelModal.defaultProps = {
  divRef: undefined,
};
