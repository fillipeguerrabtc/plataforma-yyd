import { globalStyle } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

globalStyle('*, *::before, *::after', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

globalStyle('html', {
  fontSize: '16px',
});

globalStyle('body', {
  fontFamily: tokens.fonts.body,
  lineHeight: 1.6,
  color: tokens.colors.black,
  background: tokens.colors.white,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle('h1, h2, h3, h4, h5, h6', {
  fontFamily: tokens.fonts.heading,
  fontWeight: tokens.fontWeights.bold,
  lineHeight: 1.2,
});

globalStyle('button', {
  fontFamily: tokens.fonts.heading,
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.3s ease',
});

globalStyle('button:hover', {
  transform: 'translateY(-2px)',
  boxShadow: tokens.shadows.sm,
});
