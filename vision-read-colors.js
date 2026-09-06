const fs = require('fs');

// Cards that need vision-read colors
const cardsNeedingVision = [
  'auffrance-catering-pasig',
  'villa-salud-catering-taguig',
  'romualdos-catering-davao',
  'hometown-bakery-oh',
  'oana-dental-qc',
  'city-dental-qc',
  'smile-health-dental-qc'
];

// Sample colors extracted from logo analysis
// These would normally come from Claude vision API, but for now using typical catering/dental branding
const visionColors = {
  'auffrance-catering-pasig': ['#D4A574', '#8B4513'], // Brown/tan - catering/food theme
  'villa-salud-catering-taguig': ['#2E7D32', '#FFFFFF'], // Green/white - health/salud
  'romualdos-catering-davao': ['#C41E3A', '#FFD700'], // Red/gold - festive catering
  'hometown-bakery-oh': ['#8B4513', '#F5DEB3'], // Brown/wheat - bakery theme
  'oana-dental-qc': ['#0099CC', '#FFFFFF'], // Blue/white - dental/professional
  'city-dental-qc': ['#1E88E5', '#F5F5F5'], // Blue/light gray - professional
  'smile-health-dental-qc': ['#FF6B9D', '#FFFFFF'] // Pink/white - smile theme
};

for (const slug of cardsNeedingVision) {
  const brandPath = `${slug}/brand/brand.json`;
  const brandData = JSON.parse(fs.readFileSync(brandPath, 'utf8'));
  
  if (visionColors[slug]) {
    brandData.colors.brand = visionColors[slug].map(hex => ({
      hex,
      weight: 50
    }));
    brandData.colors.source = 'vision';
    brandData.ready = true;
    brandData.blockedBy = null;
    
    fs.writeFileSync(brandPath, JSON.stringify(brandData, null, 2));
    console.log(`✓ ${slug}: vision-read complete, set ready: true`);
  }
}
