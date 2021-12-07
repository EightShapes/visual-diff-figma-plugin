import { Page } from "./Page";
import { TestGroup } from "./TestGroup";

export class Mendelsohn {
  static DEFAULT_UI_HEIGHT = 500;
  static DEFAULT_UI_WIDTH = 240;
  static ALL_TESTS_FRAME_KEY = "all-tests-frame";
  static SCREENSHOT_FIDELITY = 1;
  static EIGHTSHAPES_ORANGE_RGB = {
    r: 0.909803921568627,
    g: 0.32156862745098,
    b: 0,
  };
  static LAYOUT_GUTTER = 60;

  static async convertFrameToImage(frame) {
    return await frame.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: Mendelsohn.SCREENSHOT_FIDELITY },
    });
  }

  sendCurrentSelectionToUi() {
    const serializedSelection = figma.currentPage.selection.map((fNode) => {
      return { name: fNode.name, id: fNode.id };
    });
    figma.ui.postMessage({
      type: "current-selection-changed",
      data: serializedSelection,
    });
  }

  sendTestGroupUpdate(testGroups) {
    const serializedTestGroupFrames = JSON.stringify(
      testGroups.map((testGroup) => {
        return {
          id: testGroup.id,
          pageName: testGroup.pageName,
          testNames: testGroup.tests.map((test) => test.name),
        };
      })
    );
    console.log(serializedTestGroupFrames);
    figma.ui.postMessage({
      type: "test-group-frames-update",
      data: serializedTestGroupFrames,
    });
  }

  currentTestGroups() {
    let testGroups = [];
    figma.root.children.forEach((pageNode) => {
      const testGroup = Page.findTestsGroupFrame(pageNode);
      if (testGroup !== null) {
        testGroups.push(new TestGroup(testGroup.id));
      }
    });
    return testGroups;
  }

  showUi() {
    figma.showUI(__html__, {
      visible: true,
      height: Mendelsohn.DEFAULT_UI_HEIGHT,
      width: Mendelsohn.DEFAULT_UI_WIDTH,
    });
  }

  createTestsFromCurrentSelection() {
    const originNodes = figma.currentPage.selection;
    const testGroupFrame = Page.findOrCreateTestsGroupFrame(figma.currentPage);
    const testGroup = new TestGroup(testGroupFrame.id);
    testGroup.createNewTests(originNodes.map((node) => node.id));
  }

  initialize() {
    this.showUi();
    this.sendCurrentSelectionToUi();
    this.sendTestGroupUpdate(this.currentTestGroups());
    figma.on("selectionchange", this.sendCurrentSelectionToUi);
  }
}
