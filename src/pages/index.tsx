"use client"
import CurrencyFormat from '@/components/CurrencyFormat';
import {
  Alert,
  AppBar,
  Box, Button, Card, Checkbox, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, MenuItem, Select,
  SelectChangeEvent, Stack, SwipeableDrawer, Tab, Tabs, TextField, Toolbar, Tooltip, Typography
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';
import React, { ReactNode } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { getEchelon, getIrsDeductionAmount, getScale } from '@/funcs/irs';
import { formatCurrency, generateRandomIntegerInRange } from '@/funcs';
import { getAllowanceGroup, getAllowanceItem, getAllowances, getDefaultQuantityByUnit, getUnitDescription } from '@/funcs/allowance';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import { useStateCallback } from '../hooks';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addAllowanceItem, removeAllowanceItemByIndex, updateAllowanceItemByIndex } from '@/store/allowance/slice';
import { AllowanceItemState } from '@/store/allowance/types';
import { event } from '@/funcs/gtag';
import AboutUsDialog from '@/components/AboutUsDialog';

interface StateCustomAllowance {
  customAllowanceName: string;
  customAllowanceValue: number | null;
  customAllowanceQuantity?: number | null;
  customAllowanceUnit: "h" | "d" | "m";
  customAllowanceDefaultValue: boolean;
}

interface State extends StateCustomAllowance {
  baseSalary: number;
  dependents: number;
  handicapped: boolean;
  allowanceId: number;
  statusId: number;
  hasRnh: boolean;
  hasVacationTwelfths: boolean;
  hasChristmasTwelfths: boolean;
  vacationTwelfthsPercent: 50 | 100;
  christmasTwelfthsPercent: 50 | 100;
  profit: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box pt={2}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (children)}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const getEmptyCustomAllowance = (): StateCustomAllowance => {
  return {
    customAllowanceName: '',
    customAllowanceValue: 0,
    customAllowanceUnit: 'm',
    customAllowanceDefaultValue: true
  };
}

const baseAllowances = getAllowances();
const totalDays = 22;
const ss = 0.11;
const corpSs = 0.1275;
const status = [
  { id: 1, name: "Não casado", married: false, holders: 1 },
  { id: 2, name: "Casado único titular", married: true, holders: 1 },
  { id: 3, name: "Casado dois titulares", married: true, holders: 2 },
];

export default function HomePage() {
  const allowances = useSelector((state: RootState) => state.allowance.allowances);
  const dispatch = useDispatch();

  const emptyCustomAllowance = getEmptyCustomAllowance();
  const [values, setValues] = useStateCallback<State>({
    ...emptyCustomAllowance,
    baseSalary: 1000,
    dependents: 0,
    handicapped: false,
    allowanceId: 0,
    statusId: 0,
    hasRnh: false,
    hasVacationTwelfths: false,
    hasChristmasTwelfths: false,
    vacationTwelfthsPercent: 100,
    christmasTwelfthsPercent: 100,
    profit: 25
  });
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState(0);
  const [drawer, setDrawer] = React.useState(false);
  const [aboutDialog, setAboutDialog] = React.useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const setValue = (prop: keyof State, value: any, callback?: (value: any) => void) => {
    setValues({
      ...values,
      [prop]: value
    }, state => callback?.call(null, state[prop]));
  }

  const handleChange = (prop: keyof State, label?: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue(prop, value);
    event({ action: 'change', category: prop, label: label || value, value: 0 });
  };

  const handleNumberChange = (prop: keyof State, label: string, parse: (value: string) => number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parse(e.target.value);
    if (value < 0) value = 0;
    setValue(prop, value);
    event({ action: 'change', category: prop, label, value });
  };

  const handleAllowanceItemChange = (index: number, prop: keyof AllowanceItemState, parse: (value: string) => number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parse(event.target.value);
    dispatch(updateAllowanceItemByIndex({ index, prop, value }))
  };

  const handleAllowanceItemDelete = (index: number) => (event: React.MouseEvent) => {
    dispatch(removeAllowanceItemByIndex(index))
  }

  const handleSelectChange = (prop: keyof State, getLabel: (value: string | number) => string, isNumber: boolean) => (e: SelectChangeEvent<number>) => {
    const value = e.target.value.toString();
    const parsedValue = isNumber ? parseInt(value) : value;
    setValue(prop, parsedValue);
    event({ action: 'select', category: prop, label: getLabel(parsedValue), value: isNumber ? parsedValue as number : 0 });
  }

  const handleAllowanceAddClick = (event: React.MouseEvent) => {

    dispatch(addAllowanceItem({
      allowanceId: values.allowanceId,
      customItem: {
        name: values.customAllowanceName,
        quantity: values.customAllowanceQuantity,
        value: values.customAllowanceValue,
        unit: values.customAllowanceUnit,
        withdrawable: true
      }
    }));

    setValues({
      ...values,
      allowanceId: 0,
      customAllowanceName: '',
      customAllowanceUnit: 'm',
      customAllowanceQuantity: null,
      customAllowanceValue: 0,
      customAllowanceDefaultValue: true
    });
    setOpen(false);
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  const handleCheckChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [prop]: event.target.checked,
    });
  };

  const handleAllowanceIdChange = (event: SelectChangeEvent<number>) => {
    const value = parseInt(event.target.value.toString());
    const newValue = {
      ...values,
      allowanceId: value,
      ...emptyCustomAllowance
    };

    if (value <= 0) {
      setValues(newValue);
      return;
    }

    const allowanceGroup = getAllowanceGroup(value);
    const allowanceItem = getAllowanceItem(value);

    if (!allowanceItem) {
      setValues(newValue);
      return;
    }

    setValues({
      ...newValue,
      customAllowanceName: allowanceGroup.name + ' - ' + allowanceItem.name,
      customAllowanceUnit: allowanceGroup.unit,
      customAllowanceQuantity: getDefaultQuantityByUnit(allowanceGroup.unit),
      customAllowanceValue: allowanceItem.value ?? 0,
      customAllowanceDefaultValue: allowanceItem.value != null
    });

  }

  const toggleDrawer =
    (open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event &&
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }

        setDrawer(open);
      };

  const getTotalGross = (includeAllowances: boolean = false) => {
    let salary = baseSalary;
    if (values.hasVacationTwelfths)
      salary += (baseSalary * (values.vacationTwelfthsPercent / 100)) / 12;
    if (values.hasChristmasTwelfths)
      salary += (baseSalary * (values.christmasTwelfthsPercent / 100)) / 12;
    return salary + (includeAllowances ? getTotalAllowance() : 0);
  }

  const getTotalNetWithoutAllowances = () => {
    const salary = getTotalGross();
    return salary - getTotalDiscounts(salary);
  }

  const getTotalNet = (onlyWithdrawable: boolean = false) => {
    return getTotalNetWithoutAllowances() + getTotalAllowance(onlyWithdrawable);
  }

  const getTotalAllowance = (onlyWithdrawable: boolean = false) => {
    return allowances
      .filter(o => onlyWithdrawable ? o.withdrawable : o.value > 0)
      .map(o => o.value * (isNaN(o.quantity) ? 0 : o.quantity)).reduce((a, b) => a + b, 0);
  }

  const getTotalDiscounts = (salary?: number) => {
    salary ??= getTotalGross();
    return (salary * ss) + (salary * (irs ?? 0));
  }

  const getTotalCompany = () => {
    return (baseSalary * 14) + (allowanceSum * 12) + ((baseSalary * corpSs) * 14) + ((baseSalary * 0.01) * 14) + 110
  }

  const getTotalCompanyPerMonth = () => {
    return baseSalary + allowanceSum + (baseSalary * corpSs) + (baseSalary * .01) + 110;
  }

  const baseSalary = isNaN(values.baseSalary) ? 0 : values.baseSalary;
  const currStatus = status.find(stt => stt.id === values.statusId);
  const echelon = currStatus ? getEchelon(currStatus.married, currStatus.holders, values.dependents) : null;
  const scale = echelon ? getScale(echelon, baseSalary) : null;
  const allowanceSum = getTotalAllowance();
  const irsValue = getIrsDeductionAmount(baseSalary, values.dependents, scale);
  let irs = irsValue ? irsValue / baseSalary : null;
  if (irs && values.hasRnh && irs > .2) irs = .2;

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="md">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Calculadora de Salário
            </Typography>
            <Button color="inherit" onClick={toggleDrawer(true)} endIcon={<SettingsIcon />}>Opções</Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />

      <SwipeableDrawer
        anchor={'right'}
        open={drawer}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
          onKeyDown={toggleDrawer(false)}>

          <Stack direction={"row"} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ m: 0, flexGrow: 1 }}>Opções</Typography>
            <IconButton aria-label="delete" size="small" onClick={toggleDrawer(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <FormGroup>
            <FormControlLabel
              value="true"
              control={<Checkbox checked={values.hasVacationTwelfths} onChange={handleCheckChange("hasVacationTwelfths")} color="primary" inputProps={{ 'aria-label': 'controlled' }} />}
              label={(
                <Typography variant="caption" sx={{ position: 'relative', width: '100%' }}>
                  Duodécimos Férias
                  <Tooltip title="Recebe 100% do subsídio de férias em duodécimos" arrow sx={{ position: 'absolute', right: -16, top: -4 }}>
                    <IconButton aria-label="delete" size="small">
                      <HelpIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Typography>)}
              labelPlacement="end"
            />
            <FormControlLabel
              value="true"
              control={<Checkbox checked={values.hasChristmasTwelfths} onChange={handleCheckChange("hasChristmasTwelfths")} color="primary" inputProps={{ 'aria-label': 'controlled' }} />}
              label={(
                <Typography variant="caption" sx={{ position: 'relative', width: '100%' }}>
                  Duodécimos Natal <Tooltip title="Recebe 100% do subsídio de natal em duodécimos" arrow sx={{ position: 'absolute', right: -16, top: -4 }}>
                    <IconButton aria-label="delete" size="small">
                      <HelpIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Typography>)}
              labelPlacement="end"
            />
            <FormControlLabel
              value="true"
              control={<Checkbox checked={values.handicapped} onChange={handleCheckChange("handicapped")} color="primary" inputProps={{ 'aria-label': 'controlled' }} />}
              label={(
                <Typography variant="caption" sx={{ position: 'relative', width: '100%' }}>
                  Deficiente <Tooltip title="Portador de Deficiência Física" arrow sx={{ position: 'absolute', right: -16, top: -4 }}>
                    <IconButton aria-label="delete" size="small">
                      <HelpIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Typography>)}
              labelPlacement="end"
            />
            <FormControlLabel
              value="true"
              control={<Checkbox checked={values.hasRnh} onChange={handleCheckChange("hasRnh")} color="primary" inputProps={{ 'aria-label': 'controlled' }} />}
              label={(
                <Typography variant="caption" sx={{ position: 'relative', width: '100%' }}>
                  RNH <Tooltip title="Residente Não Habitual: desconto máximo de até 20% no IRS" arrow sx={{ position: 'absolute', right: -16, top: -4 }}>
                    <IconButton aria-label="delete" size="small">
                      <HelpIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Typography>)}
              labelPlacement="end"
            />
          </FormGroup>

          <Divider />
          <List>

            <ListItem disablePadding>
              <ListItemButton onClick={() => setAboutDialog(true)}>
                <ListItemIcon>
                  <FeedbackIcon />
                </ListItemIcon>
                <ListItemText primary={"Sobre Nós"} />
              </ListItemButton>
            </ListItem>

          </List>
        </Box>
      </SwipeableDrawer>
      <Container maxWidth="md" sx={{ pt: 3 }}>
        <Alert severity="warning">Atenção! O cálculo do IRS está a basear-se na nova <Link href="https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/tabela_ret_doclib/Documents/Tabelas_RF_Continente_2_Semestre_2023_Portal.xlsx" target="_blank">Tabela de Julho de 2023</Link>.</Alert>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="tipos de contratos">
            <Tab label="Contrato" {...a11yProps(0)} />
            <Tab label="Empresa" {...a11yProps(1)} />
            <Tab label="Fatura" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tab} index={0}>
          <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>Contrato com/sem Termo</Typography>
          <Card sx={{ p: 1, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <TextField
                  label="Salário Base"
                  value={baseSalary}
                  onChange={handleNumberChange("baseSalary", "Salário Base", parseFloat)}
                  name="baseSalary"
                  id="baseSalary"
                  InputProps={{
                    inputComponent: CurrencyFormat as any,
                  }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <Select displayEmpty
                    value={values.statusId}
                    defaultValue={values.statusId}
                    id="statusId"
                    onChange={handleSelectChange("statusId", id => status.find(stt => stt.id === id)?.name || '', true)}>
                    <MenuItem disabled value={0}>
                      <em>Selecione estado civil...</em>
                    </MenuItem>
                    {status.map(stt => (
                      <MenuItem key={stt.id} value={stt.id}>{stt.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={4} sm={2}>
                <TextField
                  label="Dependentes"
                  value={values.dependents}
                  onChange={handleNumberChange("dependents", "Dependentes", parseInt)}
                  name="dependents"
                  id="dependents"
                  variant="outlined"
                  type="number"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Card>

          <Stack direction={"row"} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>Ajudas de Custo</Typography>
            <Button
              type="button"
              variant='contained'
              color='primary'
              size='small'
              sx={{ mb: 2 }}
              onClick={handleClickOpen}
              disabled={allowances.reduce((a, b) => a + b.id, 0) === baseAllowances.map(o => o.items).reduce((a, b) => a.concat(b)).reduce((a, b) => a + b.id, 0)}>
              <AddIcon />{" "}Ajuda de Custo
            </Button>
          </Stack>
          <Card sx={{ p: 1, mb: 2 }}>
            {allowances.map((o, i) => {
              let quantity = isNaN(o.quantity) || o.quantity < 0 ? 0 : o.quantity;
              if (quantity.toString().length > 3)
                quantity = parseInt(quantity.toString().substring(0, 3));
              let value = isNaN(o.value) || o.value < 0 ? 0 : o.value;
              if (Math.round(value).toString().length > 9)
                value = parseFloat(Math.round(value).toString().substring(0, 9));

              return (
                <React.Fragment key={o.id}>

                  <Grid container spacing={2}>
                    <Grid xs={12}>
                      <Stack direction={"row"} alignItems="flex-start">
                        <Typography variant="caption" sx={{ display: 'flex', flexGrow: 1 }}>{o.name}</Typography>
                        <IconButton size='small' color="error"
                          aria-label="delete"
                          onClick={handleAllowanceItemDelete(i)}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>

                    </Grid>
                    <Grid xs={5} sm={7}>
                      <TextField
                        label={"Valor"}
                        value={value}
                        onChange={handleAllowanceItemChange(i, 'value', parseFloat)}
                        name={`allowances[${i}].value`}
                        id={`allowances_${i}_value`}
                        InputProps={{
                          inputComponent: CurrencyFormat as any,
                        }}
                        variant="outlined"
                        fullWidth

                      />
                    </Grid>
                    <Grid xs={4} sm={2}>
                      {o.unit !== 'm' && (
                        <TextField
                          label={getUnitDescription(o.unit)}
                          value={quantity}
                          onChange={handleAllowanceItemChange(i, 'quantity', parseInt)}
                          name={`allowances[${i}].quantity`}
                          id={`allowances_${i}_quantity`}
                          variant="outlined"
                          type="number"
                          fullWidth
                        />
                      )}

                    </Grid>
                    <Grid xs={3} sm={3} display="flex" alignItems="center" justifyContent="end">

                      <Typography variant="body2">{formatCurrency(value * quantity)}</Typography>

                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </React.Fragment>
              );
            })}
            <Grid container spacing={2}>
              <Grid xs={9}>
                <Typography variant="subtitle2">Total de Ajudas de Custo</Typography>
              </Grid>
              <Grid xs={3} textAlign="right">
                <Typography variant="body2">{formatCurrency(getTotalAllowance())}</Typography>
              </Grid>
            </Grid>
          </Card>

          {values.hasVacationTwelfths && (
            <Card sx={{ p: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={5} display="flex" alignItems="center">
                  <Typography variant='body2'>Duodécimos de Férias</Typography>
                </Grid>
                <Grid xs={3} display="flex" alignItems="center">
                  <FormControl variant="outlined" fullWidth>
                    <Select displayEmpty
                      value={values.vacationTwelfthsPercent}
                      defaultValue={values.vacationTwelfthsPercent}
                      id="vacationTwelfthsPercent"
                      onChange={handleSelectChange("vacationTwelfthsPercent", (value) => `${value}%`, true)}>
                      <MenuItem value={50}>50%</MenuItem>
                      <MenuItem value={100}>100%</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={2} display="flex" alignItems="center">
                  <Typography variant='body2'>{(values.vacationTwelfthsPercent / 12).toFixed(2)}%</Typography>
                </Grid>
                <Grid xs={2} display="flex" alignItems="center" justifyContent="flex-end">
                  <Typography variant='body2'>{formatCurrency((baseSalary * (values.vacationTwelfthsPercent / 100)) / 12)}</Typography>
                </Grid>
              </Grid>
            </Card>
          )}
          {values.hasChristmasTwelfths && (
            <Card sx={{ p: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={5} display="flex" alignItems="center">
                  <Typography variant='body2'>Duodécimos de Natal</Typography>
                </Grid>
                <Grid xs={3} display="flex" alignItems="center">
                  <FormControl variant="outlined" fullWidth>
                    <Select displayEmpty
                      value={values.christmasTwelfthsPercent}
                      defaultValue={values.christmasTwelfthsPercent}
                      id="christmasTwelfthsPercent"
                      onChange={handleSelectChange("christmasTwelfthsPercent", (value) => `${value}%`, true)}>
                      <MenuItem value={50}>50%</MenuItem>
                      <MenuItem value={100}>100%</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={2} display="flex" alignItems="center">
                  <Typography variant='body2'>{(values.christmasTwelfthsPercent / 12).toFixed(2)}%</Typography>
                </Grid>
                <Grid xs={2} display="flex" alignItems="center" justifyContent="flex-end">
                  <Typography variant='body2'>{formatCurrency((baseSalary * (values.christmasTwelfthsPercent / 100)) / 12)}</Typography>
                </Grid>
              </Grid>
            </Card>
          )}

          <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>Descontos</Typography>
          <Card sx={{ p: 1, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={5}>
                <Typography variant='subtitle2' sx={{ py: 1 }}>Segurança Social</Typography>
              </Grid>
              <Grid xs={3}>
                <Typography variant='body2' sx={{ py: 1 }}>{(ss * 100).toFixed(2)}%</Typography>
              </Grid>
              <Grid xs={4} textAlign="right">
                <Typography variant='body2' sx={{ py: 1 }}>{formatCurrency(baseSalary * ss)}</Typography>
              </Grid>
            </Grid>


            {echelon && scale && irs && irs > 0 && (
              <>
                <Divider sx={{ mb: 1 }} />
                <Grid container spacing={2}>
                  <Grid xs={8}>
                    <Typography variant='subtitle2' component="div">Imposto de Renda</Typography>
                    {values.hasRnh ? (
                      <Typography variant='caption' component="div">Residente não habitual</Typography>
                    ) : (
                      <>
                        <Typography variant='caption' component="div">{echelon.title}</Typography>
                        <Typography variant='caption' component="div">{echelon.description}</Typography>
                      </>
                    )}

                    <Typography variant='body2' component="div">Taxa efetiva: {(irs * 100).toFixed(2)}%</Typography>
                  </Grid>
                  <Grid xs={4} display="flex" alignItems="center" justifyContent="end">
                    <Typography variant='body2'>{formatCurrency(baseSalary * irs)}</Typography>
                  </Grid>
                </Grid>
              </>
            )}

            <Divider sx={{ mb: 1 }} />
            <Grid container spacing={2}>
              <Grid xs={8}>
                <Typography variant='subtitle2' component="div">Total de Descontos</Typography>
              </Grid>
              <Grid xs={4} display="flex" alignItems="center" justifyContent="end">
                <Typography variant='body2'>{formatCurrency(getTotalDiscounts())}</Typography>
              </Grid>
            </Grid>
          </Card>
          <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>Totais</Typography>

          <Card sx={{ p: 1, mb: 2, border: '1px solid #07851C', backgroundColor: '#E7FFEA' }}>
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Typography variant='subtitle1'>Total Bruto</Typography>
              </Grid>
              <Grid xs={6} display="flex" alignItems="center" justifyContent="end">
                <Typography variant='subtitle1'>{formatCurrency(getTotalGross(true))}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Typography variant='subtitle1'>Total Líquido (sem ajudas de custo)</Typography>
              </Grid>
              <Grid xs={6} display="flex" alignItems="center" justifyContent="end">
                <Typography variant='subtitle1'>{formatCurrency(getTotalNetWithoutAllowances())}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Typography variant='subtitle1'>Total Líquido à Receber</Typography>
              </Grid>
              <Grid xs={6} display="flex" alignItems="center" justifyContent="end">
                <Typography variant='subtitle1'>{formatCurrency(getTotalNet(true))}</Typography>
              </Grid>
            </Grid>
          </Card>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>Despesas da Empresa</Typography>

          <Card sx={{ p: 1, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Typography variant="subtitle2" sx={{ p: 1 }}></Typography>
              </Grid>
              <Grid xs={2}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>Meses</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>Valor Mensal</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>Valor Anual</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Typography variant="body2" sx={{ p: 1 }}>Total de Abonos Tributáveis</Typography>
              </Grid>
              <Grid xs={2}>
                <Typography variant="body2" sx={{ p: 1 }}>14 x</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(baseSalary)}</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(baseSalary * 14)}</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Typography variant="body2" sx={{ p: 1 }}>Total de Abonos Não Tributáveis</Typography>
              </Grid>
              <Grid xs={2}>
                <Typography variant="body2" sx={{ p: 1 }}>12 x</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(allowanceSum)}</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(allowanceSum * 12)}</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Typography variant="body2" sx={{ p: 1 }}>Segurança Social</Typography>
              </Grid>
              <Grid xs={2}>
                <Typography variant="body2" sx={{ p: 1 }}>14 x {corpSs * 100}%</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(baseSalary * corpSs)}</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency((baseSalary * corpSs) * 14)}</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Typography variant="body2" sx={{ p: 1 }}>Fundo de Compensação</Typography>
              </Grid>
              <Grid xs={2}>
                <Typography variant="body2" sx={{ p: 1 }}>14 x 1%</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(baseSalary * 0.01)}</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency((baseSalary * 0.01) * 14)}</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Typography variant="body2" sx={{ p: 1 }}>Seguro Anual</Typography>
              </Grid>
              <Grid xs={2}>

              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>

              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(110)}</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>Total Anual</Typography>
              </Grid>
              <Grid xs={2}>

              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>{formatCurrency(getTotalCompanyPerMonth())}</Typography>
              </Grid>
              <Grid xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>{formatCurrency(getTotalCompany())}</Typography>
              </Grid>
            </Grid>
          </Card>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>Consultoria</Typography>
          <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>Valor equivalente para fatura</Typography>
          <Card sx={{ p: 1, mb: 2 }}>



            <Grid container spacing={0}>
              <Grid xs={6}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>Valor Mês</Typography>
              </Grid>
              <Grid xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(getTotalCompany() / 11)}</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>Valor Dia</Typography>
              </Grid>
              <Grid xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(getTotalCompany() / 11 / totalDays)}</Typography>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid xs={8} display="flex" alignItems="center">
                <Typography variant="subtitle2" sx={{ p: 1 }}>Aplicar Lucro</Typography>
              </Grid>
              <Grid xs={4} sx={{ textAlign: 'right' }}>
                <TextField
                  label="Lucro"
                  value={values.profit}
                  onChange={handleNumberChange("profit", "Lucro", parseInt)}
                  name="profit"
                  id="profit"
                  variant="outlined"
                  type="number"
                  fullWidth
                  InputProps={{
                    endAdornment: (<InputAdornment position="end">%</InputAdornment>)
                  }}
                />
              </Grid>

            </Grid>

            <Grid container spacing={0}>
              <Grid xs={6}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>Valor Mês</Typography>
              </Grid>
              <Grid xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency((getTotalCompany() / 11) + ((getTotalCompany() / 11) * (values.profit / 100)))}</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Typography variant="subtitle2" sx={{ p: 1 }}>Valor Dia</Typography>
              </Grid>
              <Grid xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ p: 1 }}>{formatCurrency(((getTotalCompany() / 11) + ((getTotalCompany() / 11) * (values.profit / 100))) / totalDays)}</Typography>
              </Grid>
            </Grid>
          </Card>
        </TabPanel>

        <Dialog disableEscapeKeyDown open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Ajuda de Custo</DialogTitle>
          <DialogContent>
            <Box component="form">
              <FormControl variant="outlined" fullWidth>
                <Select displayEmpty
                  value={values.allowanceId}
                  defaultValue={values.allowanceId}
                  id="allowanceId"
                  onChange={handleAllowanceIdChange}>
                  <MenuItem disabled value={0}>
                    <em>Selecione a ajuda de custo...</em>
                  </MenuItem>
                  {baseAllowances.map(a =>

                    [
                      (<ListSubheader key={a.name}>{a.name}</ListSubheader>),
                      a.items.map(item => (
                        <MenuItem key={item.id} value={item.id} disabled={allowances.findIndex(o => o.id === item.id) >= 0}>{item.name}</MenuItem>
                      ))
                    ] as ReactNode
                  )}
                  <ListSubheader key={"outros"}>Outros</ListSubheader>
                  <MenuItem value={-1}>Ajuda de custo customizado</MenuItem>
                </Select>
              </FormControl>

              {values.allowanceId > 0 && !values.customAllowanceDefaultValue && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid xs={5}>
                    <TextField
                      label="Valor"
                      value={values.customAllowanceValue}
                      onChange={handleNumberChange("customAllowanceValue", values.customAllowanceName, parseFloat)}
                      name="customAllowanceValue"
                      id="customAllowanceValue"
                      InputProps={{
                        inputComponent: CurrencyFormat as any,
                      }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={4} display="flex" alignItems="center">
                    Por mês
                  </Grid>
                </Grid>
              )}
              {values.allowanceId === -1 && (
                <>
                  <TextField sx={{ mt: 2 }}
                    label="Descrição"
                    value={values.customAllowanceName}
                    onChange={handleChange("customAllowanceName")}
                    name="customAllowanceName"
                    id="customAllowanceName"
                    variant="outlined"
                    fullWidth
                  />
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid xs={5}>
                      <TextField
                        label="Valor"
                        value={values.customAllowanceValue}
                        onChange={handleNumberChange("customAllowanceValue", (values.customAllowanceName || 'Ajuda de Custo Customizado') + ' - Valor', parseFloat)}
                        name="customAllowanceValue"
                        id="customAllowanceValue"
                        InputProps={{
                          inputComponent: CurrencyFormat as any,
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    {values.customAllowanceUnit !== 'm' && (
                      <Grid xs={4}>
                        <TextField
                          label="Quantidade"
                          value={values.customAllowanceQuantity || getDefaultQuantityByUnit(values.customAllowanceUnit)}
                          onChange={handleNumberChange("customAllowanceQuantity", (values.customAllowanceName || 'Ajuda de Custo Customizado') + ' - Quantidade', parseInt)}
                          name="customAllowanceQuantity"
                          id="customAllowanceQuantity"
                          variant="outlined"
                          type="number"
                          fullWidth
                        />
                      </Grid>
                    )}

                    <Grid xs={values.customAllowanceUnit !== 'm' ? 3 : 7}>
                      <FormControl variant="outlined" fullWidth>
                        <Select displayEmpty
                          value={values.customAllowanceUnit as any}
                          defaultValue={values.customAllowanceUnit as any}
                          id="customAllowanceUnit"
                          onChange={handleSelectChange("customAllowanceUnit", (value) => (values.customAllowanceName || 'Ajuda de Custo Customizado') + getUnitDescription(value.toString() as any), false)}>
                          <MenuItem disabled value={''}>
                            <em>Unidade...</em>
                          </MenuItem>
                          <MenuItem value={"h"}>Horas</MenuItem>
                          <MenuItem value={"d"}>Dias</MenuItem>
                          <MenuItem value={"m"}>Por Mês</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </>
              )}

            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button disabled={values.allowanceId === 0} onClick={handleAllowanceAddClick}>Ok</Button>
          </DialogActions>
        </Dialog>
      </Container >

      <AboutUsDialog open={aboutDialog} onClose={() => setAboutDialog(false)} />
    </>
  )
}
