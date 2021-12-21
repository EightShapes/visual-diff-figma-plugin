import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
const pixelmatch = require("pixelmatch"); // esbuild lets this work, even though it's cjs

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
    console.log(image);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    return imageData;
  };

  getImageDiff = async (imageData) => {
    console.log("GID", this);
    const canvas = this.shadowRoot.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const { baseline, test } = imageData;

    // If test is wider/taller than baseline, pad out baseline with white pixels
    // If baseline is wider/taller than test, pad out test with white pixels
    const largestWidth = Math.max(baseline.width, test.width);
    const largestHeight = Math.max(baseline.height, test.height);

    const baselineImageCanvas = await this._decode(
      canvas,
      ctx,
      baseline.image,
      largestWidth,
      largestHeight
    );
    const img1 = ctx.getImageData(0, 0, largestWidth, largestHeight);

    const testImageCanvas = await this._decode(
      canvas,
      ctx,
      test.image,
      largestWidth,
      largestHeight
    );
    const img2 = ctx.getImageData(0, 0, largestWidth, largestHeight);

    const diff = ctx.createImageData(largestWidth, largestHeight);

    console.log(`DIFF DIMENSIONS: ${largestWidth} x ${largestHeight}`);

    const pixelDiffCount = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      largestWidth,
      largestHeight,
      {
        threshold: 0.1,
        diffColor: [255, 66, 179],
        aaColor: [255, 66, 179],
        alpha: 0.3,
      }
    );

    ctx.putImageData(diff, 0, 0);

    const encodedImageDiff = await this._encode(canvas, ctx, diff);

    console.log("diff", diff);

    return {
      pixelDiffCount,
      encodedImageDiff,
      baselineNodeId: baseline.nodeId,
      testNodeId: test.nodeId,
    };
  };
}
