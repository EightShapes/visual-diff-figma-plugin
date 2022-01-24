import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { MendelsohnConstants } from "../MendelsohnConstants";
const pixelmatch = require("pixelmatch"); // esbuild lets this work, even though it's cjs
const diffColorKeys = Object.keys(MendelsohnConstants.DIFF_COLOR_RGB);
const diffColorRgb = diffColorKeys.map(
  (colorChannel) => MendelsohnConstants.DIFF_COLOR_RGB[colorChannel] * 255
);
const pixelmatchOptions = {
  threshold: 0.1,
  diffColor: diffColorRgb,
  aaColor: diffColorRgb,
  alpha: 0.3,
  diffMask: true, // determines if the output should be a transparent mask with diff pixels in color or include a desaturated image with diff pixels in color
};

@customElement("image-processor")
class ImageProcessor extends LitElement {
  render() {
    return html` <canvas style="display: none;"></canvas>`;
  }

  // Encoding an image is also done by sticking pixels in an
  // HTML canvas and by asking the canvas to serialize it into
  // an actual PNG file via canvas.toBlob().
  private _encode = async (canvas, ctx, imageData) => {
    ctx.putImageData(imageData, 0, 0);
    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = () => reject(new Error("Could not read from blob"));
        reader.readAsArrayBuffer(blob);
      });
    });
  };

  // Decoding an image can be done by sticking it in an HTML
  // canvas, as we can read individual pixels off the canvas.
  private _decode = async (canvas, ctx, bytes, width, height) => {
    const url = URL.createObjectURL(new Blob([bytes]));
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject();
      img.src = url;
    });
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    return imageData;
  };

  getImageDiff = async (imageData, diffColor = diffColorRgb) => {
    const canvas = this.shadowRoot.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const { baseline, test } = imageData;

    // If test is wider/taller than baseline, pad out baseline with white pixels
    // If baseline is wider/taller than test, pad out test with black pixels - the black/white comparison will help highlight the size difference
    const largestWidth = Math.max(baseline.width, test.width);
    const largestHeight = Math.max(baseline.height, test.height);

    await this._decode(
      canvas,
      ctx,
      baseline.image,
      largestWidth,
      largestHeight
    ); // Creates side effects on ctx from which img1 is extracted
    const img1 = ctx.getImageData(0, 0, largestWidth, largestHeight);

    await this._decode(canvas, ctx, test.image, largestWidth, largestHeight); // Creates side effects on ctx from which img2 is extracted
    const img2 = ctx.getImageData(0, 0, largestWidth, largestHeight);

    const diff = ctx.createImageData(largestWidth, largestHeight);

    pixelmatchOptions.aaColor = diffColor;
    pixelmatchOptions.diffColor = diffColor;

    const pixelDiffCount = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      largestWidth,
      largestHeight,
      pixelmatchOptions
    );

    ctx.putImageData(diff, 0, 0);

    const encodedImageDiff = await this._encode(canvas, ctx, diff);

    return { encodedImageDiff, pixelDiffCount };
  };

  getImageDiffData = async (imageData, diffColor = diffColorRgb) => {
    const { baseline, test } = imageData;
    const { encodedImageDiff, pixelDiffCount } = await this.getImageDiff(
      imageData,
      diffColor
    );

    const { encodedImageDiff: encodedImageDiffAlt1 } = await this.getImageDiff(
      imageData,
      [0, 255, 0]
    );
    const { encodedImageDiff: encodedImageDiffAlt2 } = await this.getImageDiff(
      imageData,
      [0, 0, 255]
    );

    return {
      pixelDiffCount,
      encodedImageDiff,
      encodedImageDiffAlt1,
      encodedImageDiffAlt2,
      baselineNodeId: baseline.nodeId,
      testNodeId: test.nodeId,
    };
  };
}
