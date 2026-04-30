export default function StatCard({ title, value, subtitle, color = "mint", icon }) {
  const colorMap = {
    mint: "border-mint/20 bg-mint/5 text-mint",
    coral: "border-coral/20 bg-coral/5 text-coral",
    ink: "border-ink/10 bg-white text-ink",
    gold: "border-gold/30 bg-gold/5 text-gold",
  };

  const textMap = {
    mint: "text-mint",
    coral: "text-coral",
    ink: "text-ink/60",
    gold: "text-gold",
  };

  return (
    <div className={`flex flex-col justify-center rounded-lg border p-5 shadow-sm ${colorMap[color] || colorMap.ink}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-xl">{icon}</span>}
        <p className={`text-sm font-semibold uppercase ${textMap[color] || textMap.ink}`}>
          {title}
        </p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="mt-1 text-xs opacity-70">{subtitle}</p>}
    </div>
  );
}
