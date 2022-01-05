import { Page } from "./Page";
import { TestGroup } from "./TestGroup";
import { TestWrapper } from "./TestWrapper";

export class Mendelsohn {
  static DEFAULT_UI_HEIGHT = 360;
  static DEFAULT_UI_WIDTH = 240;
  static ALL_TESTS_FRAME_KEY = "all-tests-frame";
  static SCREENSHOT_FIDELITY = 1;
  static DEFAULT_FONT = { family: "Roboto", style: "Regular" };
  static BOLD_FONT = { family: "Roboto", style: "Bold" };
  static EIGHTSHAPES_ORANGE_RGB = {
    r: 0.909803921568627,
    g: 0.32156862745098,
    b: 0,
  };
  static BLACK_RGB = {
    r: 0,
    g: 0,
    b: 0,
  };
  static WHITE_RGB = {
    r: 1,
    g: 1,
    b: 1,
  };
  static LIGHT_GRAY_RGB = {
    r: 0.898039215686275,
    g: 0.898039215686275,
    b: 0.898039215686275,
  };
  static ERROR_RGB = {
    r: 0.949019607843137,
    g: 0.282352941176471,
    b: 0.133333333333333,
  };
  static LAYOUT_GUTTER = 24;

  static async convertFrameToImage(frame) {
    return await frame.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: Mendelsohn.SCREENSHOT_FIDELITY },
    });
  }

  static DATE_FORMAT_OPTIONS = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  static changeUiView(view) {
    figma.ui.postMessage({
      type: "change-view",
      data: view,
    });
  }

  static get timestamp() {
    const now = new Date();
    return now.toLocaleTimeString(undefined, Mendelsohn.DATE_FORMAT_OPTIONS);
  }

  static get currentSelectionSerialized() {
    return figma.currentPage.selection.map((fNode) => {
      return { name: fNode.name, id: fNode.id };
    });
  }

  static get currentTestGroups() {
    let testGroups = [];
    figma.root.children.forEach((pageNode) => {
      const testGroupFrame = Page.findTestsGroupFrame(pageNode);
      if (testGroupFrame !== null) {
        const testGroup = new TestGroup(testGroupFrame.id);
        testGroups.push(testGroup.serializedData);
      }
    });
    return testGroups;
  }

  static get pageHasTests() {
    return Page.findTestsGroupFrame(figma.currentPage) !== null;
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
    const testWrapperObject = new TestWrapper(testWrapper.id);
    figma.ui.postMessage({
      type: "active-test-wrapper-changed",
      data: testWrapperObject.serializedData,
    });
  }

  sendCurrentSelectionToUi() {
    figma.ui.postMessage({
      type: "current-selection-changed",
      data: Mendelsohn.currentSelectionSerialized,
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

  showUi() {
    figma.showUI(__html__, {
      visible: true,
      height: Mendelsohn.DEFAULT_UI_HEIGHT,
      width: Mendelsohn.DEFAULT_UI_WIDTH,
    });
  }

  async createTestsFromCurrentSelection() {
    const originNodes = figma.currentPage.selection;
    const testGroupFrame = Page.findOrCreateTestsGroupFrame(figma.currentPage);
    const testGroup = new TestGroup(testGroupFrame.id);
    const newTestFrames = await testGroup.createNewTests(
      originNodes.map((node) => node.id)
    );
    figma.viewport.scrollAndZoomIntoView(newTestFrames);
    Mendelsohn.postCurrentState();
    Mendelsohn.changeUiView("test-list");
  }

  centerViewportOnNodeIds(nodeIds) {
    const nodes = nodeIds
      .map((id) => figma.getNodeById(id))
      .filter((node) => node !== null);
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  async runTests(testIds) {
    for (const testId of testIds) {
      const test = new TestWrapper(testId);
      if (test.frame !== null) {
        await test.runTest();
      } else {
        figma.notify(`Test not found with id: ${testId}`, { error: true });
        // TODO: Update the UI since the canvas changed and the test can't be found.
      }
    }
    if (testIds.length > 1) {
      // If All tests were run, then update the current state...this is problematic if a single play button is pressed in test list view
      Mendelsohn.postCurrentState();
    }
  }

  static postCurrentState() {
    // Might be problematic that this is a class method and not an instance method
    const currentState = {
      currentSelection: Mendelsohn.currentSelectionSerialized,
      currentPageId: figma.currentPage.id,
      testGroups: Mendelsohn.currentTestGroups, // TODO: This is expensive to serialize, limit to current page test group
      pageHasTests: Mendelsohn.pageHasTests,
    };

    figma.ui.postMessage({
      type: "state-update",
      data: currentState,
    });
  }

  async initialize() {
    await figma.loadFontAsync(Mendelsohn.DEFAULT_FONT);
    await figma.loadFontAsync(Mendelsohn.BOLD_FONT);
    this.showUi();
    Mendelsohn.postCurrentState();
    const initialView = Mendelsohn.pageHasTests ? "test-list" : "create-tests";

    Mendelsohn.changeUiView(initialView);

    figma.on("selectionchange", () => {
      this.handleCurrentSelectionChange();
    });

    figma.on("currentpagechange", () => {
      Mendelsohn.postCurrentState();
    });
  }
}
