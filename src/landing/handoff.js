// Cross-section handoff channel: the hero's lime ghost card becomes the
// services coverflow's first card. Hero.jsx writes the ghost's live opacity
// here every frame; Carousel.jsx reads it to suppress its own first card
// until the ghost has landed in the slot (opacity is complementary — as the
// ghost fades out, the real card fades in at the exact same spot).
export const heroHandoff = {
  ghostOpacity: 0,
}
