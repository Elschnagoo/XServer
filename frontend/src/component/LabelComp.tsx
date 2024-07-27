import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  BadgeColor,
  Form,
  Grid,
  INames,
  InputOptionType,
  useQData,
  uuid,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { Label } from '@elschnagoo/xserver-con';
import { useGlobalContext } from '@/context/GlobalContext';
import { useAppSelector, useLabelHook } from '@/store';
import { selectLabel } from '@/store/MovieStore';
import LoadingComp from '@/component/LoadingComp';
import { MovieProperties } from '@/lib';

function LabelComplete({
  reload,
  label,
  mc,
}: {
  reload: () => void;
  label: Label[];
} & MovieProperties) {
  const { mov } = mc;
  const context = useGlobalContext();
  const [data, , fetchData] = useQData(async () => {
    console.log('LabelComplete - fetchData');
    return (await context.getLabelSuggestions(mov.e_id)).data || null;
  });
  const filtered = useMemo(
    () => data?.filter((e) => !label.find((y) => y.e_id === e.e_id)) || [],
    [data, label],
  );
  useEffect(() => {
    console.log('LabelComplete - IN');
    return () => console.log('LabelComplete - out');
  }, []);
  return (
    <LoadingComp loading={!data}>
      {filtered.length > 0 && <hr style={{ width: '100%' }} />}
      <Grid flex flexR gap={8} flexWrap>
        {filtered.map((l) => (
          <Grid
            key={`${mov.e_id}_lcomp_${l.e_id}`}
            flex
            flexR
            flexEnd
            className="label-suggestion-button"
          >
            <button
              type="button"
              onClick={() => {
                context
                  .bindLabel({
                    label: l.e_id,
                    mov_lib: mov.e_id,
                  })
                  .then((x) => {
                    if (!x.success) {
                      toast.error(`Fehler`);
                    } else {
                      fetchData();
                    }
                    reload();
                  });
              }}
            >
              <Badge
                icon={(l.icon as INames | undefined) || 'IOPricetagOutline'}
                text={l.label_name}
                color={l.color as BadgeColor | undefined}
              />
            </button>
          </Grid>
        ))}
      </Grid>
    </LoadingComp>
  );
}

export default function LabelComp(
  props: {
    edit: boolean;
    suggest: boolean;
    focus: boolean;
  } & MovieProperties,
) {
  const { edit, focus, suggest, mc } = props;
  const { mov } = mc;
  const [formId, setFormId] = useState(uuid());
  const contex = useGlobalContext();
  const label = useAppSelector(selectLabel)!;
  const [labelKeys, , reload] = useQData(async () => {
    return (await contex.getMoviesLabel(mov.e_id)).data?.map((e) => e.map);
  });

  const movLabel = useLabelHook(labelKeys || []);

  useEffect(() => {
    console.log('LabelComp - IN');
    return () => console.log('LabelComp - out');
  }, []);

  if (movLabel) {
    return (
      <Grid flex flexC vCenter className="label-comp" gap={12}>
        <>
          {edit ? (
            <Form
              key={`${formId}label`}
              className="glx-w-full"
              defaultState={{
                label: movLabel.map((l) => l.e_id),
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
                      switch (change.mode) {
                        case 'DEL':
                          contex.unbindLabel(mov.e_id, change.id).then((x) => {
                            if (!x.success) {
                              toast.error(`Fehler`);
                            }
                            reload();
                          });

                          break;
                        case 'NEW':
                          contex
                            .bindLabel({
                              label: change.id,
                              mov_lib: mov.e_id,
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
            <Grid
              className="glx-w-full-4 glx-p-4 glx-flex-wrap"
              flex
              flexR
              gap={8}
            >
              {movLabel.map((l) => (
                <Badge
                  key={mov.e_id + l.e_id}
                  icon={(l.icon as INames | undefined) || 'IOPricetagOutline'}
                  text={l.label_name}
                  color={l.color as BadgeColor | undefined}
                />
              ))}
            </Grid>
          )}

          {suggest && (
            <LabelComplete
              mc={mc}
              key={`label-complete_${mov.e_id}`}
              reload={() => {
                reload();
                setFormId(uuid());
              }}
              label={movLabel}
            />
          )}
        </>
      </Grid>
    );
  }
  return null;
}
