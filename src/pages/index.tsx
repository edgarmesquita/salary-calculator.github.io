"use client"
import CurrencyFormat from '@/components/CurrencyFormat';
import {
  Box, Button, Card, Checkbox, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, ListSubheader, MenuItem, Select,
  SelectChangeEvent, Switch, TextField, Tooltip, Typography
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';
import React, { ReactNode } from 'react';
import MainContainer from '@/components/MainContainer'
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
import { getEchelon, getIrsDeductionAmount, getScale } from '@/funcs/irs';
import { formatCurrency } from '@/funcs';
import { getAllowanceGroup, getAllowanceItem, getAllowances, getUnitDescription } from '@/funcs/allowance';

interface StateAllowanceItem {
  id: number; quantity: number, value: number
}
interface State {
  baseSalary: number;
  dependents: number;
  handicapped: boolean;
  allowanceId: number;
  allowances: StateAllowanceItem[];
  statusId: number;
  hasRnh: boolean;
  hasVacationTwelfths: boolean;
  hasChristmasTwelfths: boolean;
  vacationTwelfthsPercent: 50 | 100;
  christmasTwelfthsPercent: 50 | 100;
  profit: number;
}

const allowances = getAllowances();
const totalDays = 22;
const ss = 0.11;
const corpSs = 0.1275;
const status = [
  { id: 1, name: "Não casado", married: false, holders: 1 },
  { id: 2, name: "Casado único titular", married: true, holders: 1 },
  { id: 3, name: "Casado dois titulares", married: true, holders: 2 },
];

export default function HomePage() {
  const foodAllowanceItem = getAllowanceItem(2);
  const [values, setValues] = React.useState<State>({
    baseSalary: 1000,
    dependents: 0,
    handicapped: false,
    allowanceId: 0,
    allowances: foodAllowanceItem ? [
      { id: foodAllowanceItem.id, quantity: totalDays, value: foodAllowanceItem.value }
    ] : [],
    statusId: 0,
    hasRnh: false,
    hasVacationTwelfths: false,
    hasChristmasTwelfths: false,
    vacationTwelfthsPercent: 100,
    christmasTwelfthsPercent: 100,
    profit: 25
  });
  const [open, setOpen] = React.useState(false);

  const setValue = (prop: keyof State, value: any) => {
    setValues({
      ...values,
      [prop]: value
    });
  }
  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(prop, event.target.value);
  };

  const handleNumberChange = (prop: keyof State, parse: (value: string) => number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parse(event.target.value);
    if (value < 0) value = 0;
    setValue(prop, value);
  };

  const handleAllowanceItemChange = (index: number, prop: keyof StateAllowanceItem, parse: (value: string) => number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const allowances = [...values.allowances];
    let value = parse(event.target.value);
    if (value < 0) value = 0;
    allowances[index][prop] = value;
    setValue("allowances", allowances);
  };

  const handleAllowanceItemDelete = (index: number) => (event: React.MouseEvent) => {
    const allowances = [...values.allowances];
    allowances.splice(index, 1);
    setValue("allowances", allowances);
  }

  const handleSelectChange = (prop: keyof State) => (event: SelectChangeEvent<number>) => {
    setValue(prop, parseInt(event.target.value.toString()));
  }

  const handleAllowanceAddClick = (event: React.MouseEvent) => {
    if (!values.allowanceId) return;
    const allowanceItem = getAllowanceItem(values.allowanceId);
    if (!allowanceItem) return;
    const allowance = { id: allowanceItem.id, quantity: totalDays, value: allowanceItem.value };
    setValues({
      ...values,
      allowanceId: 0,
      allowances: [...values.allowances, allowance],
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

  const getTotalNet = () => {
    let salary = baseSalary;
    if (values.hasVacationTwelfths)
      salary += (baseSalary * (values.vacationTwelfthsPercent / 100)) / 12;
    if (values.hasChristmasTwelfths)
      salary += (baseSalary * (values.christmasTwelfthsPercent / 100)) / 12;
    console.log(salary)
    return salary - (salary * ss) - (salary * (irs ?? 0)) + allowanceSum;
  }

  const getTotalAllowance = () => {
    return values.allowances.map(o => o.value * (isNaN(o.quantity) ? 0 : o.quantity)).reduce((a, b) => a + b, 0);
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
    <MainContainer>
      <Container maxWidth="md" sx={{ pt: 3 }}>

        <Typography variant="h4" sx={{ mb: 3 }}>Calculadora de Salário</Typography>

        <Dialog disableEscapeKeyDown open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Ajuda de Custo</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <FormControl variant="outlined" fullWidth>
                <Select displayEmpty
                  value={values.allowanceId}
                  defaultValue={values.allowanceId}
                  id="allowanceId"
                  onChange={handleSelectChange("allowanceId")}>
                  <MenuItem disabled value={0}>
                    <em>Selecione a ajuda de custo...</em>
                  </MenuItem>
                  {allowances.map(a =>

                    [(<ListSubheader key={a.name}>{a.name}</ListSubheader>),
                    a.items.map(item => (
                      <MenuItem key={item.id} value={item.id} disabled={values.allowances.findIndex(o => o.id === item.id) >= 0}>{item.name}</MenuItem>
                    ))] as ReactNode

                  )}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button disabled={values.allowanceId === 0} onClick={handleAllowanceAddClick}>Ok</Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={2}>
          <Grid xs={12} sm={9}>
            <Card sx={{ p: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <TextField
                    label="Salário Base"
                    value={baseSalary}
                    onChange={handleNumberChange("baseSalary", parseFloat)}
                    name="baseSalary"
                    id="baseSalary"
                    InputProps={{
                      inputComponent: CurrencyFormat as any,
                    }}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid xs={6}>
                  <FormControl variant="outlined" fullWidth>
                    <Select displayEmpty
                      value={values.statusId}
                      defaultValue={values.statusId}
                      id="statusId"
                      onChange={handleSelectChange("statusId")}>
                      <MenuItem disabled value={0}>
                        <em>Selecione estado civil...</em>
                      </MenuItem>
                      {status.map(stt => (
                        <MenuItem key={stt.id} value={stt.id}>{stt.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={2}>
                  <TextField
                    label="Dependentes"
                    value={values.dependents}
                    onChange={handleNumberChange("dependents", parseInt)}
                    name="dependents"
                    id="dependents"
                    variant="outlined"
                    type="number"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Card>



            {values.allowances.map((o, i) => {
              const allowanceGroup = getAllowanceGroup(o.id);
              const allowanceItem = getAllowanceItem(o.id);
              let quantity = isNaN(o.quantity) || o.quantity < 0 ? 0 : o.quantity;
              if (quantity.toString().length > 3)
                quantity = parseInt(quantity.toString().substring(0, 3));
              let value = isNaN(o.value) || o.value < 0 ? 0 : o.value;
              if (Math.round(value).toString().length > 9)
                value = parseFloat(Math.round(value).toString().substring(0, 9));
              return (
                <Card key={o.id} sx={{ p: 1, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={7}>
                      <TextField
                        label={allowanceGroup?.name + ' - ' + allowanceItem?.name}
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
                      <TextField
                        label={getUnitDescription(allowanceGroup?.unit)}
                        value={quantity}
                        onChange={handleAllowanceItemChange(i, 'quantity', parseInt)}
                        name={`allowances[${i}].quantity`}
                        id={`allowances_${i}_quantity`}
                        variant="outlined"
                        type="number"
                        fullWidth
                      />
                    </Grid>
                    <Grid xs={8} sm={3} textAlign="right" sx={{ pt: 2, position: 'relative' }}>

                      <IconButton size='small'
                        aria-label="delete"
                        onClick={handleAllowanceItemDelete(i)}
                        sx={{ mt: 1, position: 'absolute', right: -8, top: -15 }}>
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>

                      <Typography variant='caption'>Montante Mensal</Typography>
                      <Typography>{formatCurrency(value * quantity)}</Typography>

                    </Grid>
                  </Grid>
                </Card>
              );
            })}
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
                        onChange={handleSelectChange("vacationTwelfthsPercent")}>
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
                        onChange={handleSelectChange("christmasTwelfthsPercent")}>
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
                  <Typography variant='body2'>Segurança Social</Typography>
                </Grid>
                <Grid xs={3}>
                  <Typography variant='body2'>{(ss * 100).toFixed(2)}%</Typography>
                </Grid>
                <Grid xs={4} textAlign="right">
                  <Typography variant='body2'>{formatCurrency(baseSalary * ss)}</Typography>
                </Grid>
              </Grid>
            </Card>

            {echelon && scale && irs && (
              <Card sx={{ p: 1, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid xs={8}>
                    <Typography variant='body2' component="div">Imposto de Renda</Typography>
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
                  <Grid xs={4} textAlign="right">
                    <Typography variant='body2'>{formatCurrency(baseSalary * irs)}</Typography>
                  </Grid>
                </Grid>
              </Card>
            )}

            <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>Totais</Typography>

            <Card sx={{ p: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Typography variant='h5'>Total líquido à receber</Typography>
                </Grid>
                <Grid xs={6} textAlign="right">
                  <Typography variant='h5'>{formatCurrency(getTotalNet())}</Typography>
                </Grid>
              </Grid>
            </Card>

            <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>Despesas da Empresa</Typography>

            <Card sx={{ p: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <Typography variant="subtitle2"></Typography>
                </Grid>
                <Grid xs={2}>
                  <Typography variant="subtitle2">Meses</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">Valor Mensal</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">Valor Anual</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <Typography variant="body2">Total de Abonos Tributáveis</Typography>
                </Grid>
                <Grid xs={2}>
                  <Typography variant="body2">14 x</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(baseSalary)}</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(baseSalary * 14)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <Typography variant="body2">Total de Abonos Não Tributáveis</Typography>
                </Grid>
                <Grid xs={2}>
                  <Typography variant="body2">12 x</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(allowanceSum)}</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(allowanceSum * 12)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <Typography variant="body2">Segurança Social</Typography>
                </Grid>
                <Grid xs={2}>
                  <Typography variant="body2">14 x {corpSs * 100}%</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(baseSalary * corpSs)}</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency((baseSalary * corpSs) * 14)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <Typography variant="body2">Fundo de Compensação</Typography>
                </Grid>
                <Grid xs={2}>
                  <Typography variant="body2">14 x 1%</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(baseSalary * 0.01)}</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency((baseSalary * 0.01) * 14)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <Typography variant="body2">Seguro Anual</Typography>
                </Grid>
                <Grid xs={2}>

                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>

                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(110)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <Typography variant="subtitle2">Total Anual</Typography>
                </Grid>
                <Grid xs={2}>

                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">{formatCurrency(getTotalCompanyPerMonth())}</Typography>
                </Grid>
                <Grid xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">{formatCurrency(getTotalCompany())}</Typography>
                </Grid>
              </Grid>
            </Card>

          </Grid>
          <Grid xs={12} sm={3}>
            <Card sx={{ p: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, ml: 1 }}>Opções</Typography>
              <Button fullWidth
                type="button"
                variant='contained'
                color='primary'
                size='small'
                sx={{ mb: 2 }}
                onClick={handleClickOpen}
                disabled={values.allowances.reduce((a, b) => a + b.id, 0) === allowances.map(o => o.items).reduce((a, b) => a.concat(b)).reduce((a, b) => a + b.id, 0)}>
                <AddIcon />{" "}Ajuda de Custo
              </Button>
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
            </Card>

            <Card sx={{ p: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Consultoria</Typography>

              <Typography variant="caption">Valor equivalente para fatura</Typography>
              <Grid container spacing={0}>
                <Grid xs={6}>
                  <Typography variant="body2">Valor Mês</Typography>
                </Grid>
                <Grid xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(getTotalCompany() / 11)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Typography variant="body2">Valor Dia</Typography>
                </Grid>
                <Grid xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(getTotalCompany() / 11 / totalDays)}</Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid xs={5}>
                  <Typography variant="body2">Aplicar Lucro</Typography>
                </Grid>
                <Grid xs={7} sx={{ textAlign: 'right' }}>
                  <TextField
                    label="Lucro"
                    value={values.profit}
                    onChange={handleNumberChange("profit", parseInt)}
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
                  <Typography variant="body2">Valor Mês</Typography>
                </Grid>
                <Grid xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency((getTotalCompany() / 11) + ((getTotalCompany() / 11) * (values.profit / 100)))}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Typography variant="body2">Valor Dia</Typography>
                </Grid>
                <Grid xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(((getTotalCompany() / 11) + ((getTotalCompany() / 11) * (values.profit / 100))) / totalDays)}</Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Container >
    </MainContainer>

  )
}
