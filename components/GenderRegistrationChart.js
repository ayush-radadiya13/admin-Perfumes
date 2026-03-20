'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

/** Black–gold luxury palette (Male = charcoal, Female = gold) */
const MALE = '#1a1a1a';
const FEMALE = '#c9a227';

export default function GenderRegistrationChart({ male = 0, female = 0, withoutGender = 0 }) {
  const [active, setActive] = useState(null);

  const data = useMemo(() => {
    const rows = [
      { name: 'Male', value: male, color: MALE },
      { name: 'Female', value: female, color: FEMALE },
    ];
    return rows.filter((d) => d.value > 0);
  }, [male, female]);

  const withGender = male + female;
  const centerLabel = active?.name ?? 'Registered';
  const centerValue = active != null ? active.value : withGender;

  if (withGender === 0) {
    return (
      <div>
        <h3 className="text-base font-semibold text-admin-text">Gender</h3>
        <p className="mt-6 text-sm text-admin-muted">
          No registration gender data yet. Customers who choose Male or Female on sign-up appear here.
          {withoutGender > 0 && (
            <span className="mt-2 block">
              {withoutGender} account{withoutGender !== 1 ? 's' : ''} registered without gender.
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-admin-text">Gender</h3>
      <div className="relative mx-auto mt-2 h-[220px] w-full max-w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="genderMaleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="100%" stopColor="#0a0a0a" />
              </linearGradient>
              <linearGradient id="genderFemaleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f5e6c8" />
                <stop offset="45%" stopColor="#d4a373" />
                <stop offset="100%" stopColor="#7c5a14" />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              dataKey="value"
              stroke="#fafafa"
              strokeWidth={2}
              onMouseEnter={(_, i) => setActive(data[i])}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.name === 'Male' ? 'url(#genderMaleGrad)' : 'url(#genderFemaleGrad)'}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-1">
          <div className="text-center">
            <p className="text-sm font-normal text-admin-muted">{centerLabel}</p>
            <p className="text-2xl font-medium tabular-nums text-admin-text">{centerValue}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-full border-2 bg-white"
            style={{ borderColor: MALE }}
            aria-hidden
          />
          <span className="text-admin-text">Male</span>
          <span className="font-semibold tabular-nums text-admin-text">{male}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-full border-2 bg-white"
            style={{ borderColor: FEMALE }}
            aria-hidden
          />
          <span className="text-admin-text">Female</span>
          <span className="font-semibold tabular-nums text-admin-text">{female}</span>
        </div>
      </div>
      {withoutGender > 0 && (
        <p className="mt-3 text-center text-xs text-admin-muted">
          {withoutGender} other account{withoutGender !== 1 ? 's' : ''} with no gender on file
        </p>
      )}
    </div>
  );
}
