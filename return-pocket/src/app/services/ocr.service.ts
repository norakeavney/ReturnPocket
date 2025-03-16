import { Injectable } from '@angular/core';
//import { TesseractWorker } from 'tesseract.js';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  constructor() { }

  processImage(imagePath: string): Promise<string> {
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject('Could not create canvas 2d context');
        return;
      }

      img.src = imagePath;
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert to greyscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg < 128 ? 0 : 255;
          data[i + 1] = avg <128 ? 0 : 255;
          data[i + 2] = avg < 128 ? 0 : 255;
        }

          ctx?.putImageData(imageData, 0, 0);

          const processedImage = canvas.toDataURL('image/png');
          resolve(processedImage);
      };

      img.onerror = (error) => {
        reject(error);
      };
    });

  }

  runOCR(processedImage: any) {

  }
}
