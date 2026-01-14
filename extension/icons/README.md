# Extension Icons

This folder should contain the following icon files for the Chrome extension:

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## Creating Icons

You can create these icons using any image editor. The icon should represent CSS theming, such as:
- A paint palette
- Color swatches
- CSS symbol with colors
- A theme/color wheel

## Quick Creation

You can use online tools like:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/
- Or any image editor (Photoshop, GIMP, Figma, etc.)

## Temporary Workaround

For testing purposes, you can create simple colored squares:

```bash
# Using ImageMagick (if available)
convert -size 16x16 xc:#3b82f6 icon16.png
convert -size 48x48 xc:#3b82f6 icon48.png
convert -size 128x128 xc:#3b82f6 icon128.png
```
