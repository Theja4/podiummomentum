// Cross-section handoff channel: the hero's mint ghost card becomes the
// services coverflow's first card. Hero.jsx writes the ghost's live opacity
// here every frame; Carousel.jsx reads it to suppress its own first card
// until the ghost has landed in the slot (opacity is complementary — as the
// ghost fades out, the real card fades in at the exact same spot).
export const heroHandoff = {
  ghostOpacity: 0,
  // Desktop-only shape choreography: the hero card starts in its familiar
  // portrait silhouette, then opens into the carousel's cinematic wide
  // canvas while both ghost and real card still share one measured slot.
  cardExpansion: 0,
}
