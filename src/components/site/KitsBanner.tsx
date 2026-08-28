import { Reveal } from "./Reveal";
import kitsBannerAsset from "@/assets/banner-kits-new.png.asset.json";

export function KitsBanner() {
  return (
    <Reveal as="section" className="bg-background">
      <div id="kits" className="w-full">
        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <img
              src={kitsBannerAsset.url}
              alt="Kits Exclusivos"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Desktop/Tablet View */}
        <div className="hidden md:block">
          <img
            src={kitsBannerAsset.url}
            alt="Kits Exclusivos"
            className="h-auto w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </Reveal>
  );
}
