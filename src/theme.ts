import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
    palette: {
        primary: {
            main: '#094290',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: red[800],
        },
    }
});

export default theme;