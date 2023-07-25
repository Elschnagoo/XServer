import React, { useState } from 'react';
import { MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import {
  copyToClipboard,
  Form,
  Grid,
  IconButton,
  InputOptionType,
  IOClipboard,
  IOClose,
  IOPencil,
  IOSave,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';

export default function TitleComp(props: {
  mov: MovieLib;
  update: (mov: MovieLib) => void;
}) {
  const { mov, update } = props;
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(mov.movie_name);
  const context = useGlobalContext();

  if (!edit) {
    return (
      <Grid flex flexR vCenter className="glx-w-full" flexSpaceB>
        <h4>{mov.movie_name}</h4>
        <Grid flex flexR style={{ width: '78px' }}>
          <IconButton
            toolTip={{
              text: mov.e_id,
              position: 'bottom',
            }}
            className="glx-ml-8"
            onClick={() => {
              copyToClipboard(mov.e_id);
              toast.success(`ID copied to clipboard`);
            }}
          >
            <IOClipboard />
          </IconButton>
          <IconButton
            toolTip={{
              text: 'Edit title',
              position: 'left',
            }}
            onClick={() => {
              setName(mov.movie_name);
              setEdit(true);
            }}
          >
            <IOPencil />
          </IconButton>
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid flex flexR vCenter className="glx-w-full name-edit" flexSpaceB>
      <Form
        className="glx-flex-grow-1"
        compact
        defaultState={{
          name,
        }}
        options={[
          [
            {
              key: 'name',
              type: InputOptionType.TEXT,
            },
          ],
        ]}
        onChange={({ form }) => {
          setName(form.name);
        }}
      />
      <IconButton
        toolTip={{
          text: 'Save',
          position: 'left',
        }}
        onClick={() => {
          context
            .updateMovie(mov.e_id, { movie_name: name })
            .then((x) => {
              if (x.success && x.data) {
                update(x.data);
                toast.success(`Title updated`);
              } else {
                toast.error(`Error updating title`);
              }
              setEdit(false);
            })
            .catch((x) => {
              toast.error(`Error updating title`);
              setEdit(false);
            });
        }}
      >
        <IOSave />
      </IconButton>
      <IconButton
        toolTip={{
          text: 'Cancel',
          position: 'left',
        }}
        onClick={() => setEdit(false)}
      >
        <IOClose />
      </IconButton>
    </Grid>
  );
  return null;
}
