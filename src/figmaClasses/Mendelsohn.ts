import { Page } from "./Page";
import { TestGroup } from "./TestGroup";
import { TestWrapper } from "./TestWrapper";

export class Mendelsohn {
  static DEFAULT_UI_HEIGHT = 500;
  static DEFAULT_UI_WIDTH = 240;
  static ALL_TESTS_FRAME_KEY = "all-tests-frame";
  static SCREENSHOT_FIDELITY = 1;
  static DEFAULT_FONT = { family: "Inter", style: "Regular" };
  static EIGHTSHAPES_ORANGE_RGB = {
    r: 0.909803921568627,
    g: 0.32156862745098,
    b: 0,
  };
  static LIGHT_GRAY_RGB = {
    r: 0.898039215686275,
    g: 0.898039215686275,
    b: 0.898039215686275,
  };
  static LAYOUT_GUTTER = 60;

  static async convertFrameToImage(frame) {
    return await frame.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: Mendelsohn.SCREENSHOT_FIDELITY },
    });
  }

  getTestWrapperForNode(node) {
    if (node.getPluginData(TestWrapper.TEST_WRAPPER_KEY) === "true") {
      return node;
    } else if (node.parent !== null) {
      return this.getTestWrapperForNode(node.parent);
    } else {
      return null;
    }
  }

  handleCurrentSelectionChange() {
    // Inspect current selection, if it's a single item and it's part of a TestWrapper, send a message to the ui to show controls for that test wrapper
    if (
      figma.currentPage.selection.length === 1 &&
      this.getTestWrapperForNode(figma.currentPage.selection[0]) !== null
    ) {
      const testWrapper = this.getTestWrapperForNode(
        figma.currentPage.selection[0]
      );
      this.sendActiveTestWrapperChange(testWrapper);
    } else {
      // Otherwise, send the current selection to the UI so new tests can be created
      this.sendCurrentSelectionToUi();
    }
  }

  sendActiveTestWrapperChange(testWrapper) {
    // Serialize the test wrapper
    // Post the message to the UI
    console.log("YOU CLICKED A TEST SOMETHING");
    const serializedTestWrapper = { name: testWrapper.name }; // TODO: add other stored data like pass/fail status, etc.
    figma.ui.postMessage({
      type: "active-test-wrapper-changed",
      data: serializedTestWrapper,
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

  async initialize() {
    await figma.loadFontAsync(Mendelsohn.DEFAULT_FONT);
    this.showUi();
    this.sendCurrentSelectionToUi();
    this.sendTestGroupUpdate(this.currentTestGroups());
    figma.on("selectionchange", () => {
      this.handleCurrentSelectionChange();
    });
  }
}
