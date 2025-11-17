import React from "react";
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Você tem certeza?",
  onCancel,
  onConfirm
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>

      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>

        <Button variant="contained" onClick={onConfirm}>
          Aceitar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
