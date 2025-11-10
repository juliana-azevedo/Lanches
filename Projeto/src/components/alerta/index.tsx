import { Alert, Stack } from "@mui/material";

export interface alertProps {
  id: number;
  text: string;
}

export default function Alerta({ id, text }: { id?: number; text?: string }) {
  return (
    <div className="absolute bottom-6 right-6 z-20">
      <Stack sx={{ width: "100%" }} spacing={2}>
        {id === 0 ? (
          <Alert variant="filled" severity="success">
            {text}
          </Alert>
        ) : id === 1 ? (
          <Alert variant="filled" severity="error">
            {text}
          </Alert>
        ) : id === 2 ? (
          <Alert variant="filled" severity="warning">
            {text}
          </Alert>
        ) : null}
      </Stack>
    </div>
  );
}
