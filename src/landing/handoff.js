// Cross-section handoff channel: the hero's mint ghost card becomes the
// services coverflow's first card. Hero.jsx writes the ghost's live opacity
// here every frame; Carousel.jsx reads it to suppress its own first card
// until the ghost has landed in the slot (opacity is complementary — as the
// ghost fades out, the real card fades in at the exact same spot).
export const heroHandoff = {
  ghostOpacity: 0,
  // Desktop shape choreography shared by the moving hero and card zero.
  cardExpansion: 0,
  // Exactly one layer owns card zero on desktop. The phase is latched at the
  // pinned boundary so fast scroll reversals cannot make the hero ghost and
  // the coverflow card trade places while running on different clocks.
  phase: 'journey',
}
