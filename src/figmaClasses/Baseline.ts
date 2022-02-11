import { TestWrapper } from "./TestWrapper";
import { Mendelsohn } from "./Mendelsohn";
import { MendelsohnConstants } from "../MendelsohnConstants";
import { LanguageConstants } from "../LanguageConstants";

export class Baseline {
  static FRAME_NAME_SUFFIX = "";

  static createNewFrameForNode = (fNode) => {
    const newFrame = figma.createFrame();
    newFrame.resize(Math.ceil(fNode.width), Math.ceil(fNode.height));
    newFrame.name = fNode.name;
    return newFrame;
  };

  static createNewBaselineFrame(originNode) {
    const baselineFrameWrapper = figma.createFrame();
    baselineFrameWrapper.layoutMode = "VERTICAL";
    baselineFrameWrapper.itemSpacing = TestWrapper.LABEL_SPACING;
    baselineFrameWrapper.counterAxisSizingMode = "AUTO";
    baselineFrameWrapper.fills = [];
    baselineFrameWrapper.setPluginData(
      TestWrapper.BASELINE_FRAME_WRAPPER_KEY,
      "true"
    );

    const label = figma.createText();
    label.layoutAlign = "STRETCH";
    label.fontName = Mendelsohn.DEFAULT_FONT;
    label.fontSize = TestWrapper.LABEL_FONT_SIZE;
    label.characters = `${LanguageConstants.BASELINE_LABEL}`;
    baselineFrameWrapper.appendChild(label);

    const baselineFrame = this.createNewFrameForNode(originNode);

    if (
      originNode.height > MendelsohnConstants.MAX_IMAGE_DIMENSION ||
      originNode.width > MendelsohnConstants.MAX_IMAGE_DIMENSION
    ) {
      baselineFrame.resize(
        MendelsohnConstants.DEFAULT_EMPTY_FRAME_SIZE,
        MendelsohnConstants.DEFAULT_EMPTY_FRAME_SIZE
      );
    }
    baselineFrame.setPluginData(TestWrapper.BASELINE_FRAME_KEY, "true");
    baselineFrame.locked = true;
    baselineFrame.name = `${originNode.name}${Baseline.FRAME_NAME_SUFFIX}`;
    baselineFrame.strokes = [
      {
        type: "SOLID",
        color: Mendelsohn.GRAY_RGB,
      },
    ];

    baselineFrameWrapper.appendChild(baselineFrame);
    return baselineFrameWrapper;
  }

  constructor(baselineFrameId, testWrapper) {
    this.frame = figma.getNodeById(baselineFrameId);
    this.testWrapper = testWrapper;
  }

  get testWrapperNode() {
    return this.frame.parent.parent.parent;
  }

  get originNode() {
    const originNodeId = this.testWrapperNode.getPluginData(
      TestWrapper.ORIGIN_NODE_ID_KEY
    );
    return figma.getNodeById(originNodeId);
  }

  async update() {
    const screenshotBytes = await Mendelsohn.convertFrameToImage(
      this.originNode
    );
    try {
      const screenshotImageHash = figma.createImage(screenshotBytes).hash;
      this.frame.fills = [
        { type: "IMAGE", imageHash: screenshotImageHash, scaleMode: "FILL" },
      ];
      this.frame.resize(
        Math.ceil(this.originNode.width),
        Math.ceil(this.originNode.height)
      );
    } catch (error) {
      this.testWrapper.showImageTooLargeError("baseline");
    }
  }
}
