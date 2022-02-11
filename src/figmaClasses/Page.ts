import { Mendelsohn } from "./Mendelsohn";

export class Page {
  static findTestsGroupFrame(pageNode) {
    const frameNodes = pageNode.children.filter(
      (fNode) => fNode.type === "FRAME"
    );

    return frameNodes.find((fNode) => {
      return fNode.getPluginData(Mendelsohn.ALL_TESTS_FRAME_KEY);
    });
  }

  static copyChildren(children) {
    // Incomplete, only copies id, x, and y properties for child nodes
    return children.map((object) => {
      return {
        id: object.id,
        y: object.y,
        x: object.x,
        name: object.name,
        height: object.height,
      };
    });
  }

  static getNextAvailableCoordinates(pageNode) {
    const xSortedNodes = Page.copyChildren(pageNode.children); // Make a copy since sort() runs in place
    xSortedNodes.sort((a, b) => a.x - b.x);
    const leftmostChild = figma.getNodeById(xSortedNodes[0].id);

    const ySortedNodes = Page.copyChildren(pageNode.children); // Make a copy since sort() runs in place
    ySortedNodes.sort((a, b) => b.y + b.height - (a.y + a.height));
    const lowestChild = figma.getNodeById(ySortedNodes[0].id);

    let x, y;

    x = leftmostChild.x;
    y = lowestChild.y + lowestChild.height + Mendelsohn.LAYOUT_GUTTER;

    return { x, y };
  }

  static createTestsGroupFrame(pageNode) {
    const nextAvailableCoordinates = this.getNextAvailableCoordinates(pageNode); // run this before appending the test wrapper, otherwise its coordinates of 0,0 may take precedence
    const testsGroupFrame = figma.createFrame();
    if (pageNode !== figma.currentPage) {
      pageNode.appendChild(pageNode);
    }

    testsGroupFrame.name = "All Tests";
    testsGroupFrame.setPluginData(Mendelsohn.ALL_TESTS_FRAME_KEY, "true");
    testsGroupFrame.layoutMode = "HORIZONTAL";
    testsGroupFrame.primaryAxisSizingMode = "AUTO";
    testsGroupFrame.counterAxisSizingMode = "AUTO";
    testsGroupFrame.itemSpacing = Mendelsohn.LAYOUT_GUTTER;
    testsGroupFrame.paddingLeft = 0;
    testsGroupFrame.paddingRight = 0;
    testsGroupFrame.paddingTop = 0;
    testsGroupFrame.paddingBottom = 0;
    testsGroupFrame.fills = [];
    testsGroupFrame.x = nextAvailableCoordinates.x;
    testsGroupFrame.y = nextAvailableCoordinates.y;

    return testsGroupFrame;
  }

  static findOrCreateTestsGroupFrame(pageNode) {
    let testsGroupFrame = Page.findTestsGroupFrame(pageNode);
    if (testsGroupFrame === undefined) {
      testsGroupFrame = this.createTestsGroupFrame(pageNode);
    }

    return testsGroupFrame;
  }
}
