export type LandingImageVariant = "default" | "trois-rivieres" | "quebec" | "rimouski" | "levis"

export const LANDING_IMAGES: Record<
  LandingImageVariant,
  {
    heroBackground: string
    howItWorksImage: string
  }
> = {
  "default": {
    heroBackground: "/images/trois-rivieres-hero.jpg",
    howItWorksImage: "/images/trois-rivieres-area.jpg",
  },

  "trois-rivieres": {
    heroBackground: "/images/trois-rivieres-hero.jpg",
    howItWorksImage: "/images/trois-rivieres-area.jpg",
  },

  "quebec": {
    heroBackground: "/images/quebec-hero.jpg",
    howItWorksImage: "/images/quebec-area.jpg",
  },
  "levis": {
    heroBackground: "/images/levis-hero.jpg",
    howItWorksImage: "/images/quebec-area.jpg",
  },
  "rimouski": {
    heroBackground: "/images/rimouski-hero.jpg",
    howItWorksImage: "/images/quebec-area.jpg",
  },
}
