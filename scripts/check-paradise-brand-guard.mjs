#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homepagePath = path.join(root, 'index.html');

const expectedHomepageSignals = [
  "North Dakota's #1 Hot Tub Store.",
  'Paradise Spas and Outdoor Living storefront in Minot, ND'
];

const forbiddenHomepagePhrases = [
  'By application · One store per market',
  'one hot tub store per market',
  'one store per market',
  'Apply for Your Market',
  'See how it works',
  'Markets open for 2026',
  'Every red dot is a market',
  'Markets live',
  'market is still open',
  'never two in the same city',
  'Every application is reviewed by hand',
  'market takeover'
];

function fail(message, details) {
  console.error('\nParadise brand guard failed.');
  console.error(message);
  if (details && details.length) {
    details.forEach((detail) => console.error(`- ${detail}`));
  }
  console.error('\nThis site is Paradise Spas customer-facing. Do not deploy Hot Tub Launch / dealer-facing market copy here.\n');
  process.exit(1);
}

if (!fs.existsSync(homepagePath)) {
  fail('Could not find index.html.');
}

const homepage = fs.readFileSync(homepagePath, 'utf8');
const homepageLower = homepage.toLowerCase();

const missingSignals = expectedHomepageSignals.filter((signal) => !homepage.includes(signal));
if (missingSignals.length) {
  fail('Homepage no longer contains the expected Paradise Spas hero signals.', missingSignals);
}

const forbiddenMatches = forbiddenHomepagePhrases.filter((phrase) => homepageLower.includes(phrase.toLowerCase()));
if (forbiddenMatches.length) {
  fail('Homepage contains dealer-facing / Hot Tub Launch copy.', forbiddenMatches);
}

console.log('Paradise brand guard passed.');
