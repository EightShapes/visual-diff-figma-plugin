import { Mendelsohn } from "./Mendelsohn";

export class Page {
  static findTestsGroupFrame(pageNode) {
    return pageNode.findOne((fNode) =>
      fNode.getPluginData(Mendelsohn.ALL_TESTS_FRAME_KEY)
    );
  }

  static copyChildren(children) {
    // Incomplete, only copies id, x, and y properties for child nodes
    return children.map((object) => {
      return { id: object.id, y: object.y, x: object.x };
    });
  }

  static getNextAvailableCoordinates(pageNode) {
    const childNodes = Page.copyChildren(pageNode.children); // Make a copy since sort() runs in place
    const childNodesSortedByY = childNodes.sort((a, b) => b.y - a.y);
    const lowestChild = figma.getNodeById(childNodesSortedByY[0].id);
    const childNodesSortedByX = childNodes.sort((a, b) => a.x - b.x);
    const leftmostChild = figma.getNodeById(childNodesSortedByX[0].id);

    let x, y;

    x = leftmostChild.x;
    y = lowestChild.y + lowestChild.height + Mendelsohn.LAYOUT_GUTTER;

    return { x, y };
  }

  static createTestsGroupFrame(pageNode) {
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
    testsGroupFrame.paddingLeft = Mendelsohn.LAYOUT_GUTTER;
    testsGroupFrame.paddingRight = Mendelsohn.LAYOUT_GUTTER;
    testsGroupFrame.paddingTop = Mendelsohn.LAYOUT_GUTTER;
    testsGroupFrame.paddingBottom = Mendelsohn.LAYOUT_GUTTER;
    testsGroupFrame.fills = [];
    testsGroupFrame.strokes = [
      {
        type: "SOLID",
        color: Mendelsohn.EIGHTSHAPES_ORANGE_RGB,
      },
    ];
    testsGroupFrame.dashPattern = [10, 10];
    const nextAvailableCoordinates = this.getNextAvailableCoordinates(pageNode);
    testsGroupFrame.x = nextAvailableCoordinates.x;
    testsGroupFrame.y = nextAvailableCoordinates.y;

    return testsGroupFrame;
  }

  static findOrCreateTestsGroupFrame(pageNode) {
    let testsGroupFrame = Page.findTestsGroupFrame(pageNode);
    if (testsGroupFrame === null) {
      testsGroupFrame = this.createTestsGroupFrame(pageNode);
    }

    return testsGroupFrame;
  }
}
