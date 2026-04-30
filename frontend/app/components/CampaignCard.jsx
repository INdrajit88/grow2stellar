import Link from "next/link";

export default function CampaignCard({ campaign, role, actionButton }) {
  // role is typically 'admin', 'organizer', or 'ambassador'
  
  return (
    <article className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-ink">{campaign.title}</h3>
          <p className="mt-1 text-sm text-ink/70 line-clamp-2">{campaign.description}</p>
        </div>
        <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">
          {campaign.status || "Active"}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 border-y border-ink/5 py-3">
        <div>
          <p className="text-xs uppercase text-ink/50">Reward</p>
          <p className="font-semibold text-ink">{campaign.rewardAsset}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-ink/50">Remaining Budget</p>
          <p className="font-semibold text-ink">{campaign.remainingBudget}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actionButton ? (
          actionButton
        ) : (
          <Link
            href={`/${role}/campaigns/${campaign.id}`}
            className="flex-1 rounded-md bg-ink py-2 text-center text-sm font-semibold text-white transition hover:bg-mint"
          >
            View Details
          </Link>
        )}
      </div>
    </article>
  );
}
