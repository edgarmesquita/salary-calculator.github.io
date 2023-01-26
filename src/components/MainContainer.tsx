"use client"

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { ReactNode } from 'react';

export const theme = createTheme({
  palette: {
    primary: {
      main: "#fcba03",
    },
  },
});

interface IMainContainerProps {
  children: ReactNode
}
export default function MainContainer({children}: IMainContainerProps) {
  return (
    <ThemeProvider theme={theme}>
      <main>
        <CssBaseline />
        {children}
      </main>
    </ThemeProvider>
  )
}
