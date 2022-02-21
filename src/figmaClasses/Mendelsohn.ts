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
  static GRAY_RGB = {
    r: 0.631372549019608,
    g: 0.631372549019608,
    b: 0.631372549019608,
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

  set state(stateObject) {
    this._state = stateObject;
  }

  get state() {
    return this._state;
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

  get currentSelectionSerialized() {
    return figma.currentPage.selection.map((fNode) => {
      return {
        name: fNode.name,
        id: fNode.id,
        height: fNode.height,
        width: fNode.width,
      };
    });
  }

  get pageHasTests() {
    if (
      this.state === undefined ||
      this.state.pages[figma.currentPage.id] === undefined ||
      this.state.pages[figma.currentPage.id].testGroup === undefined
    ) {
      return false;
    } else {
      return (
        this.state.pages[figma.currentPage.id].testGroup.storedTestIds.length >
        0
      );
    }
  }

  getTestWrapperForNode(node) {
    if (node.getPluginData(TestWrapper.TEST_WRAPPER_KEY) === "true") {
      return this.getTestById(node.id);
    } else if (node.parent !== null) {
      return this.getTestWrapperForNode(node.parent);
    } else {
      return null;
    }
  }

  handleCurrentSelectionChange() {
    // Inspect current selection, if it's a single item and it's part of a TestWrapper, send a message to the ui to show controls for that test wrapper
    this.sendStateToUi(); // Update state, in case something has changed on the canvas
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
    figma.ui.postMessage({
      type: "active-test-wrapper-changed",
      data: testWrapper.serializedData,
    });
  }

  sendCurrentSelectionToUi() {
    figma.ui.postMessage({
      type: "current-selection-changed",
      data: this.currentSelectionSerialized,
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

  async createTestsForNodes(originNodeIds) {
    const originNodes = originNodeIds.map((id) => figma.getNodeById(id));
    Page.findOrCreateTestsGroupFrame(figma.currentPage);
    this.scrapeCurrentPageState(); // Add the new test group to state
    const testGroup = this.state.pages[figma.currentPage.id].testGroup;
    const newTestFrames = await testGroup.createNewTests(
      originNodes.map((node) => node.id)
    );
    figma.viewport.scrollAndZoomIntoView(newTestFrames);
    this.sendStateToUi(); // This will scrape the canvas and update the state, adding the new tests to state
    Mendelsohn.changeUiView("test-list");
  }

  centerViewportOnNodeIds(nodeIds, select) {
    const nodes = nodeIds
      .map((id) => figma.getNodeById(id))
      .filter((node) => node !== null);
    figma.viewport.scrollAndZoomIntoView(nodes);

    if (select) {
      figma.currentPage.selection = nodes;
    }
  }

  async runTests(testIds) {
    for (const testId of testIds) {
      const test = this.getTestById(testId);

      if (test.frame !== null) {
        await test.runTest();
      } else {
        // Shouldn't be able to reach this branch anymore
        figma.notify(`Snapshot not found with id: ${testId}`, { error: true });
      }
    }
    if (testIds.length > 1) {
      // If All tests were run, then update the current state...this is problematic if a single play button is pressed in test list view
      this.sendStateToUi();
    }
  }

  get pageIds() {
    const ids = Object.keys(this.state.pages);
    return ids;
  }

  get serializedState() {
    const serialized = {
      pages: {},
    };

    this.pageIds.forEach((id) => {
      const page = this.state.pages[id];
      serialized.pages[id] = {
        name: page.name,
        testGroupNodeId: page.testGroupNodeId,
      };

      if (page.testGroupNodeId !== undefined) {
        serialized.pages[id].tests = page.testGroup.serializedTests;
      }
    });

    return serialized;
  }

  getTestById(testId) {
    let test = null;

    this.pageIds.forEach((id) => {
      const page = this.state.pages[id];
      if (page.testGroup) {
        const searchResult = page.testGroup.getTestById(testId);
        if (searchResult !== null) {
          test = searchResult;
        }
      }
    });

    return test;
  }

  sendStateToUi() {
    this.scrapeCurrentPageState();

    figma.ui.postMessage({
      type: "state-update",
      data: {
        currentPageId: figma.currentPage.id,
        currentSelection: this.currentSelectionSerialized,
        pageHasTests: this.pageHasTests, // weird that this is a static method
        state: this.serializedState,
      },
    });
  }

  scrapeCurrentPageState() {
    const stateObject = this.state || {
      pages: {},
    };

    // Search current page for test wrappers and add them to state if not already there.
    const currentPageId = figma.currentPage.id;
    stateObject.pages[currentPageId] = {
      name: figma.currentPage.name,
    };

    const testGroupFrame = Page.findTestsGroupFrame(figma.currentPage);
    if (testGroupFrame !== undefined) {
      stateObject.pages[currentPageId].testGroupNodeId = testGroupFrame.id;
      stateObject.pages[currentPageId].testGroup =
        stateObject.pages[currentPageId].testGroup || // May need to do a testGroup.updateState() or something
        new TestGroup(testGroupFrame.id, this);
    }

    this.state = stateObject;
  }

  async initialize() {
    await figma.loadFontAsync(Mendelsohn.DEFAULT_FONT);
    await figma.loadFontAsync(Mendelsohn.BOLD_FONT);

    this.showUi();
    this.sendStateToUi();

    const initialView = this.pageHasTests ? "test-list" : "create-tests";
    Mendelsohn.changeUiView(initialView);

    figma.on("selectionchange", () => {
      this.handleCurrentSelectionChange();
    });

    figma.on("currentpagechange", () => {
      this.sendStateToUi();
      const initialView = this.pageHasTests ? "test-list" : "create-tests";

      Mendelsohn.changeUiView(initialView);
    });
  }
}
