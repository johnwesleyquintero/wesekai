// @ts-expect-error - colorthief types can be tricky with ESM/CJS interop
import ColorThief from 'colorthief/dist/color-thief.mjs';

const colorThief = new ColorThief();

export async function getAverageColor(imageUrl: string): Promise<string | undefined> {
  try {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    if (img.complete) {
      return colorThief.getColor(img).join(',');
    } else {
      return new Promise(resolve => {
        img.addEventListener('load', () => {
          resolve(colorThief.getColor(img).join(','));
        });
        img.addEventListener('error', () => {
          console.error('Failed to load image for color extraction:', imageUrl);
          resolve(undefined);
        });
      });
    }
  } catch (error) {
    console.error('Error extracting color from image:', imageUrl, error);
    return undefined;
  }
}
