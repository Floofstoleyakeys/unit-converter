import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, Container, CssBaseline,
  FormControl, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select,
  Stack, TextField, ThemeProvider, Typography, createTheme,
} from '@mui/material';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import OpacityRoundedIcon from '@mui/icons-material/OpacityRounded';
import DeviceThermostatRoundedIcon from '@mui/icons-material/DeviceThermostatRounded';

const fallbackUnits = {
  length: { meter: { label: 'Meters', symbol: 'm' }, foot: { label: 'Feet', symbol: 'ft' }, kilometer: { label: 'Kilometers', symbol: 'km' }, mile: { label: 'Miles', symbol: 'mi' }, inch: { label: 'Inches', symbol: 'in' } },
  volume: { litre: { label: 'Litres', symbol: 'L' }, gallon: { label: 'US Gallons', symbol: 'gal' }, millilitre: { label: 'Millilitres', symbol: 'mL' }, cup: { label: 'US Cups', symbol: 'cup' } },
  temperature: { celsius: { label: 'Celsius', symbol: '°C' }, fahrenheit: { label: 'Fahrenheit', symbol: '°F' }, kelvin: { label: 'Kelvin', symbol: 'K' } },
};

const categoryInfo = {
  length: { title: 'Length', icon: <StraightenRoundedIcon />, defaults: ['foot', 'meter'] },
  volume: { title: 'Volume', icon: <OpacityRoundedIcon />, defaults: ['litre', 'gallon'] },
  temperature: { title: 'Temperature', icon: <DeviceThermostatRoundedIcon />, defaults: ['celsius', 'fahrenheit'] },
};

const theme = createTheme({
  palette: { primary: { main: '#2457d6' }, background: { default: '#f5f7fc' } },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', h3: { fontWeight: 800 } },
  shape: { borderRadius: 16 },
});

function App() {
  const [units, setUnits] = useState(fallbackUnits);
  const [category, setCategory] = useState('length');
  const [from, setFrom] = useState('foot');
  const [to, setTo] = useState('meter');
  const [value, setValue] = useState('1');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch('http://localhost:3001/api/units').then(r => r.ok ? r.json() : Promise.reject()).then(setUnits).catch(() => {}); }, []);
  const available = useMemo(() => units[category] || {}, [units, category]);
  const format = number => new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(number);

  async function convert() {
    setError(''); setLoading(true);
    if (category === 'temperature' && from === 'kelvin' && Number(value) < 0) {
      setError('Temperature cannot be lower than absolute zero (0 K).');
      setResult(null); setLoading(false); return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/convert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category, from, to, value }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err) { setError(err.message || 'The conversion service is unavailable.'); setResult(null); }
    finally { setLoading(false); }
  }

  function changeCategory(next) {
    const defaults = categoryInfo[next].defaults;
    setCategory(next); setFrom(defaults[0]); setTo(defaults[1]); setResult(null); setError('');
  }
  function swap() { setFrom(to); setTo(from); setResult(null); }

  return <ThemeProvider theme={theme}><CssBaseline />
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 8 }, background: 'radial-gradient(circle at 50% -10%, #dfe9ff, transparent 38%), #f5f7fc' }}>
      <Container maxWidth="md">
        <Stack alignItems="center" spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', width: 52, height: 52, borderRadius: 3, display: 'grid', placeItems: 'center' }}><SwapHorizRoundedIcon fontSize="large" /></Box>
          <Typography variant="h3">Convertly</Typography>
          <Typography color="text.secondary">Fast, precise unit conversions for everyday measurements.</Typography>
        </Stack>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, border: '1px solid #e4e8f2' }}>
          <Typography variant="overline" color="primary.main" fontWeight={800}>SELECT A CATEGORY</Typography>
          <Grid container spacing={1.5} sx={{ mt: .25, mb: 4 }}>
            {Object.entries(categoryInfo).map(([key, info]) => <Grid size={{ xs: 12, sm: 4 }} key={key}><Card onClick={() => changeCategory(key)} variant="outlined" sx={{ cursor: 'pointer', borderColor: category === key ? 'primary.main' : '#e1e5ed', bgcolor: category === key ? '#edf2ff' : 'white', transition: '.2s', '&:hover': { borderColor: 'primary.main' } }}><CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}><Stack direction="row" spacing={1.25} alignItems="center" color={category === key ? 'primary.main' : 'text.secondary'}>{info.icon}<Typography fontWeight={700}>{info.title}</Typography></Stack></CardContent></Card></Grid>)}
          </Grid>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}><TextField fullWidth label="Amount" type="number" inputProps={{ min: category === 'temperature' && from === 'kelvin' ? 0 : undefined }} value={value} onChange={e => { setValue(e.target.value); setResult(null); }} InputProps={{ endAdornment: <InputAdornment position="end">{available[from]?.symbol}</InputAdornment> }} /></Grid>
            <Grid size={{ xs: 12, md: 5 }}><FormControl fullWidth><InputLabel>From</InputLabel><Select value={from} label="From" onChange={e => { setFrom(e.target.value); setResult(null); }}>{Object.entries(available).map(([key, unit]) => <MenuItem value={key} key={key}>{unit.label} ({unit.symbol})</MenuItem>)}</Select></FormControl></Grid>
            <Grid size={{ xs: 12, md: 2 }}><Button fullWidth variant="outlined" onClick={swap} sx={{ height: 56 }} aria-label="Swap units"><SwapHorizRoundedIcon /></Button></Grid>
            <Grid size={{ xs: 12, md: 5 }}><FormControl fullWidth><InputLabel>To</InputLabel><Select value={to} label="To" onChange={e => { setTo(e.target.value); setResult(null); }}>{Object.entries(available).map(([key, unit]) => <MenuItem value={key} key={key}>{unit.label} ({unit.symbol})</MenuItem>)}</Select></FormControl></Grid>
            <Grid size={{ xs: 12, md: 7 }}><Button fullWidth size="large" variant="contained" onClick={convert} disabled={loading} sx={{ height: 56, fontWeight: 800 }}>{loading ? 'Converting…' : 'Convert'}</Button></Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          {result !== null && <Box sx={{ mt: 3, p: 3, textAlign: 'center', bgcolor: '#edf2ff', borderRadius: 3 }}><Typography color="text.secondary">RESULT</Typography><Typography variant="h3" color="primary.main" sx={{ my: .5 }}>{format(result)} {available[to]?.symbol}</Typography><Typography variant="body2" color="text.secondary">{value} {available[from]?.symbol} = {format(result)} {available[to]?.symbol}</Typography></Box>}
        </Paper>
        <Stack direction="row" justifyContent="center" flexWrap="wrap" spacing={1} sx={{ mt: 3 }}>{['Length: feet ↔ meters', 'Volume: litres ↔ gallons', 'Temperature: °C ↔ °F'].map(text => <Chip key={text} label={text} variant="outlined" />)}</Stack>
      </Container>
    </Box>
  </ThemeProvider>;
}

export default App;
