import { Reveal } from "./Reveal";
import kitsBannerAsset from "@/assets/banner-kits-new.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";

export function KitsBanner() {
  const bannerUrl = resolveAssetUrl(kitsBannerAsset);
  return (
    <Reveal as="section" className="bg-background">
      <div id="kits" className="w-full">
        <div className="block md:hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <img
              src={bannerUrl}
              alt="Kits Exclusivos"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="hidden md:block">
          <img
            src={bannerUrl}
            alt="Kits Exclusivos"
            className="h-auto w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </Reveal>
  );
}
