import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../context/ThemeContext.jsx';

// Validated CVD-safe categorical palette (dataviz skill reference palette,
// adjacent-pairlist ordering - safe for a line chart's series up to 8 of them).
// Subjects are teacher-defined free text now, so colors are assigned by
// POSITION rather than by a hardcoded subject name.
const CATEGORICAL = [
  { light: '#2a78d6', dark: '#3987e5' }, // blue
  { light: '#eb6834', dark: '#d95926' }, // orange
  { light: '#1baf7a', dark: '#199e70' }, // aqua
  { light: '#eda100', dark: '#c98500' }, // yellow
  { light: '#e87ba4', dark: '#d55181' }, // magenta
  { light: '#008300', dark: '#008300' }, // green
  { light: '#6250d6', dark: '#9085e9' }, // violet
  { light: '#e34948', dark: '#e66767' }, // red
];

function seriesColor(index, isDark) {
  const step = CATEGORICAL[index % CATEGORICAL.length];
  return isDark ? step.dark : step.light;
}

/**
 * data: [{ assessment: 'Test 1', 'Pure Maths': 68, 'Statistics': 70 }, ...]
 * subjects: ['Pure Maths', 'Statistics']  (order decides color assignment)
 */
export default function ProgressChart({ data, subjects }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#2c2c2a' : '#e1e0d9';
  const tickColor = isDark ? '#c3c2b7' : '#52514e';

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="assessment"
            tick={{ fill: tickColor, fontSize: 12 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: tickColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e1edf3'}`,
              borderRadius: 8,
              fontSize: 13,
              color: isDark ? '#f1f5f9' : '#1c2733',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, color: tickColor, paddingTop: 8 }}
            iconType="line"
          />
          {subjects.map((subject, i) => {
            const color = seriesColor(i, isDark);
            return (
              <Line
                key={subject}
                type="monotone"
                dataKey={subject}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, stroke: isDark ? '#1a1a19' : '#fcfcfb', fill: color }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
