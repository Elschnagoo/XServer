import React, { useMemo, useState } from 'react';
import {
  Badge,
  BadgeColor,
  Form,
  Grid,
  IconButton,
  INames,
  InputOptionType,
  useQData,
  uuid,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { Label } from '@elschnagoo/xserver-con';
import { useGlobalContext } from '@/context/GlobalContext';
import { useAppSelector } from '@/store';
import { selectLabel } from '@/store/MovieStore';
import LoadingComp from '@/component/LoadingComp';

function LabelComplete({
  id,
  title,
  reload,
  label,
}: {
  id: string;
  title: string;
  reload: () => void;
  label: Label[];
}) {
  const context = useGlobalContext();
  const [data] = useQData(async () => {
    return (
      await context.lookupLabels({
        text: title,
      })
    ).data;
  });
  const filtered = useMemo(
    () => data?.filter((e) => !label.find((y) => y.e_id === e.e_id)) || [],
    [data, label],
  );

  return (
    <LoadingComp loading={!data}>
      {filtered.length > 0 && <hr style={{ width: '100%' }} />}
      <Grid flex flexC gap={12}>
        {filtered.map((l) => (
          <Grid flex flexR flexEnd>
            <Badge
              icon={(l.icon as INames | undefined) || 'IOPricetagOutline'}
              text={l.label_name}
              color={l.color as BadgeColor | undefined}
            />
            <IconButton
              onClick={() => {
                context
                  .bindLabel({
                    label: l.e_id,
                    mov_lib: id,
                  })
                  .then((x) => {
                    if (!x.success) {
                      toast.error(`Fehler`);
                    }
                    reload();
                  });
              }}
              icon="IOCheckmark"
            />
          </Grid>
        ))}
      </Grid>
    </LoadingComp>
  );
}

export default function LabelComp(props: {
  id: string;
  title: string;
  edit: boolean;
  suggest: boolean;
  focus: boolean;
}) {
  const [formId, setFormId] = useState(uuid());
  const { id, edit, focus, title, suggest } = props;
  const contex = useGlobalContext();
  const label = useAppSelector(selectLabel)!;
  const [movLabel, , reload] = useQData(async () => {
    return (await contex.getMoviesLabel(id)).data?.sort(
      (a, b) => a.label.label_order - b.label.label_order,
    );
  });
  if (movLabel) {
    return (
      <Grid flex flexC vCenter className="label-comp" gap={12}>
        {edit ? (
          <Form
            key={`${formId}label`}
            className="glx-w-full"
            defaultState={{
              label: movLabel.map((l) => l.label.e_id),
            }}
            options={[
              [
                {
                  key: 'label',
                  type: InputOptionType.TAG_SELECTOR,
                  items: label.map((l) => ({
                    key: l.e_id,
                    name: l.label_name,
                    icon: l.icon as any,
                    meta: l.color,
                  })),
                  autoFocus: focus,
                  onChange: async (e, change) => {
                    let sel: string | null = null;
                    switch (change.mode) {
                      case 'DEL':
                        sel =
                          movLabel.find((x) => x.label.e_id === change.id)
                            ?.map || null;
                        if (sel) {
                          contex.unbindLabel(sel).then((x) => {
                            if (!x.success) {
                              toast.error(`Fehler`);
                            }
                            reload();
                          });
                        } else {
                          toast.error(`Fehler`);
                        }
                        break;
                      case 'NEW':
                        contex
                          .bindLabel({
                            label: change.id,
                            mov_lib: id,
                          })
                          .then((x) => {
                            if (!x.success) {
                              toast.error(`Fehler`);
                            }
                            reload();
                          });
                        break;
                      default:
                        break;
                    }
                  },
                },
              ],
            ]}
          />
        ) : (
          <>
            <Grid
              className="glx-w-full-4 glx-p-4 glx-flex-wrap"
              flex
              flexR
              gap={8}
            >
              {movLabel.map((l) => (
                <Badge
                  icon={
                    (l.label.icon as INames | undefined) || 'IOPricetagOutline'
                  }
                  text={l.label.label_name}
                  color={l.label.color as BadgeColor | undefined}
                />
              ))}
            </Grid>
            {suggest && (
              <LabelComplete
                id={id}
                title={title}
                reload={() => {
                  reload();
                  setFormId(uuid());
                }}
                label={movLabel.map((l) => l.label)}
              />
            )}
          </>
        )}
      </Grid>
    );
  }
  return null;
}
