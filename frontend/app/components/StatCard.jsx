const STYLES = {
  mint:  { card: "border-mint/15 bg-white",  label: "text-mint",  value: "text-ink" },
  coral: { card: "border-coral/15 bg-white", label: "text-coral", value: "text-ink" },
  gold:  { card: "border-gold/20 bg-white",  label: "text-gold",  value: "text-ink" },
  ink:   { card: "border-ink/10 bg-white",   label: "text-ink/50",value: "text-ink" },
};

export default function StatCard({ title, value, subtitle, color = "mint", icon }) {
  const s = STYLES[color] || STYLES.ink;

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${s.card}`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-bold uppercase tracking-wider ${s.label}`}>
          {title}
        </p>
        {icon && (
          <span className={`text-lg ${s.label} opacity-60`}>{icon}</span>
        )}
      </div>
      <p className={`text-3xl font-bold ${s.value}`}>{value}</p>
      {subtitle && (
        <p className="mt-1.5 text-xs text-ink/40">{subtitle}</p>
      )}
    </div>
  );
}
