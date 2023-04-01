import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, Link } from '@mui/material';
import Image from 'next/image';

export interface IAboutUsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutUsDialog({open, onClose}: IAboutUsDialogProps) {

  return (

    <Dialog maxWidth="sm"
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Sobre Nós
      </DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Image src="/logo.png" alt="eQuantic Tech" width={300} height={260} />
        </Box>
        <DialogContentText id="alert-dialog-description">
          Esta ferramenta foi desenvolvida por <Link href="https://equantic.tech" target='_blank'>eQuantic Tech</Link>.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>

  );
}