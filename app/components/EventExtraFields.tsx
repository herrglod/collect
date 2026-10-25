'use client';

export type EventExtraValues = {
  archiveNo: string;
  timeText: string;
  showPublic: boolean;
  showCollectors: boolean;
  soldOut: boolean;
  catalogUrl: string;
};

export const emptyExtras: EventExtraValues = {
  archiveNo: '',
  timeText: '',
  showPublic: false,
  showCollectors: true,
  soldOut: false,
  catalogUrl: '',
};

export function extrasPayload(v: EventExtraValues) {
  return {
    archive_no: v.archiveNo.trim() || null,
    time_text: v.timeText.trim() || null,
    show_public: v.showPublic,
    show_collectors: v.showCollectors,
    sold_out: v.soldOut,
    catalog_url: v.catalogUrl.trim() || null,
  };
}

const checkRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontWeight: 400,
  fontSize: 13,
  marginBottom: 8,
  textTransform: 'none',
  letterSpacing: 0,
} as const;
const box = { width: 'auto', flex: 'none', margin: 0 } as const;

export default function EventExtraFields({
  value,
  onChange,
}: {
  value: EventExtraValues;
  onChange: (v: EventExtraValues) => void;
}) {
  const set = (patch: Partial<EventExtraValues>) => onChange({ ...value, ...patch });
  return (
    <>
      <div className="field">
        <label>Archive number (e.g. H2601)</label>
        <input
          value={value.archiveNo}
          onChange={(e) => set({ archiveNo: e.target.value.toUpperCase() })}
          placeholder="H2601"
          maxLength={12}
        />
      </div>
      <div className="field">
        <label>Time (optional)</label>
        <input
          value={value.timeText}
          onChange={(e) => set({ timeText: e.target.value })}
          placeholder="e.g. 18:00 – 21:00"
        />
      </div>
      <div className="field">
        <label>Catalogue PDF URL (optional)</label>
        <input
          value={value.catalogUrl}
          onChange={(e) => set({ catalogUrl: e.target.value })}
          placeholder="https://…/catalogue.pdf"
        />
      </div>
      <div className="field">
        <label>Visibility</label>
        <label style={checkRow}>
          <input type="checkbox" style={box} checked={value.showCollectors} onChange={(e) => set({ showCollectors: e.target.checked })} />
          Show to collectors (collect.glod.art)
        </label>
        <label style={checkRow}>
          <input type="checkbox" style={box} checked={value.showPublic} onChange={(e) => set({ showPublic: e.target.checked })} />
          Show publicly on glod.art (needs archive number)
        </label>
        <label style={checkRow}>
          <input type="checkbox" style={box} checked={value.soldOut} onChange={(e) => set({ soldOut: e.target.checked })} />
          Event sold out (registration closed)
        </label>
      </div>
    </>
  );
}
