import { Card } from './Card';
import { Badge } from './Badge';

export function SettingsPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Fraunces',serif] text-[32px] font-[500] text-[#171b1f] mb-1">Website Settings</h1>
        <p className="text-[14px] text-[#67706c]">Configure portal-wide preferences and security.</p>
      </div>
      <Card padding="lg" className="text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-rounded text-[56px] text-[#67706c]">construction</span>
          <h3 className="font-['Fraunces',serif] text-[20px] font-[500] text-[#171b1f]">Coming Soon</h3>
          <p className="text-[14px] text-[#67706c] max-w-sm">
            Settings for CMS, SEO metadata, portal security protocols, and branding customisation will be available in the next release.
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="plum">MVP Phase</Badge>
            <Badge variant="sky">Q3 2026</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
