// Shared data for the falling service cards + their popups.
// Order is the sequence they appear in the falling stream.
export const CARD_ORDER = ['websites', 'basic', 'hyper']

export const CARDS = {
  websites: {
    label: 'Websites',
    color: '#7C4DFF',
    rgb: '124, 77, 255',
    title: 'WEBSITES',
    headline: 'Websites that turn visitors into customers.',
    text: 'A clean and modern website builds trust fast and helps people stay longer, connect with your brand, and buy easier.',
    bullets: ['Builds trust fast', 'Longer visits', 'Stronger connection', 'Easier to buy'],
  },
  basic: {
    label: 'motion',
    color: '#FF5A5F',
    rgb: '255, 90, 95',
    title: 'BASIC MOTION',
    headline: 'Motion that makes your brand feel alive.',
    text: 'A simple animated website or product video can turn 500 views into 1000+ because people stay longer and pay more attention.',
    bullets: ['More attention', 'Better brand feel', 'Higher engagement', 'More sales'],
  },
  hyper: {
    label: 'Hyper motion',
    color: '#2979FF',
    rgb: '41, 121, 255',
    title: 'HYPER MOTION',
    headline: 'Fast visuals that instantly grab attention.',
    text: 'Hyper motion content can push 500 views to 5K+ with high-energy animations that make your brand feel premium and exciting.',
    bullets: ['Instant attention', 'Premium brand feel', 'High-energy visuals', 'Bigger reach'],
  },
}
