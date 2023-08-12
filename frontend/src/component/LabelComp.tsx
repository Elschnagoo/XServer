import React from 'react';
import { Label } from '@elschnagoo/xserver-con/dist/ApiTypes';
import {
  Badge,
  BadgeColor,
  Form,
  Grid,
  INames,
  InputOptionType,
  useQData,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';

export default function LabelComp(props: {
  id: string;
  label: Label[];
  edit: boolean;
  focus: boolean;
}) {
  const { id, label, edit, focus } = props;
  const contex = useGlobalContext();

  const [movLabel, , reload] = useQData(async () => {
    return (await contex.getMoviesLabel(id)).data?.sort(
      (a, b) => a.label.label_order - b.label.label_order,
    );
  });
  if (movLabel) {
    return (
      <Grid flex flexR vCenter className="label-comp">
        {edit ? (
          <Form
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
                    other: l.color,
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
        )}
      </Grid>
    );
  }
  return null;
}
