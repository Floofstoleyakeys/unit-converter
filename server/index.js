const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const units = {
  length: {
    meter: { label: 'Meters', symbol: 'm', toBase: 1 },
    foot: { label: 'Feet', symbol: 'ft', toBase: 0.3048 },
    kilometer: { label: 'Kilometers', symbol: 'km', toBase: 1000 },
    mile: { label: 'Miles', symbol: 'mi', toBase: 1609.344 },
    inch: { label: 'Inches', symbol: 'in', toBase: 0.0254 },
  },
  volume: {
    litre: { label: 'Litres', symbol: 'L', toBase: 1 },
    gallon: { label: 'US Gallons', symbol: 'gal', toBase: 3.785411784 },
    millilitre: { label: 'Millilitres', symbol: 'mL', toBase: 0.001 },
    cup: { label: 'US Cups', symbol: 'cup', toBase: 0.2365882365 },
  },
  temperature: {
    celsius: { label: 'Celsius', symbol: '°C' },
    fahrenheit: { label: 'Fahrenheit', symbol: '°F' },
    kelvin: { label: 'Kelvin', symbol: 'K' },
  },
};

function convertTemperature(value, from, to) {
  const celsius = from === 'celsius' ? value : from === 'fahrenheit' ? (value - 32) * 5 / 9 : value - 273.15;
  return to === 'celsius' ? celsius : to === 'fahrenheit' ? celsius * 9 / 5 + 32 : celsius + 273.15;
}

app.get('/api/units', (_req, res) => res.json(units));

app.post('/api/convert', (req, res) => {
  const { category, from, to, value } = req.body;
  const numericValue = Number(value);
  if (!units[category] || !units[category][from] || !units[category][to] || !Number.isFinite(numericValue)) {
    return res.status(400).json({ error: 'Please provide a valid category, units, and numeric value.' });
  }
  const result = category === 'temperature'
    ? convertTemperature(numericValue, from, to)
    : numericValue * units[category][from].toBase / units[category][to].toBase;
  // Absolute zero is 0 K. A negative Kelvin value is not physically valid,
  // including when it is reached by converting from another temperature scale.
  if (category === 'temperature' && (from === 'kelvin' && numericValue < 0 || to === 'kelvin' && result < 0)) {
    return res.status(400).json({ error: 'Temperature cannot be lower than absolute zero (0 K).' });
  }
  res.json({ result, from: units[category][from], to: units[category][to] });
});

app.listen(PORT, () => console.log(`Conversion API listening at http://localhost:${PORT}`));
