import { Mendelsohn } from "./Mendelsohn";

export class Page {
  static findTestsGroupFrame(pageNode) {
    return pageNode.findOne((fNode) =>
      fNode.getPluginData(Mendelsohn.TEST_GROUP_KEY)
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
    testsGroupFrame.setPluginData(Mendelsohn.TEST_GROUP_KEY, "true");
    testsGroupFrame.layoutMode = "HORIZONTAL";
    testsGroupFrame.primaryAxisSizingMode = "AUTO";
    testsGroupFrame.counterAxisSizingMode = "AUTO";
    testsGroupFrame.itemSpacing = Mendelsohn.LAYOUT_GUTTER;
    testsGroupFrame.paddingLeft = 0;
    testsGroupFrame.paddingRight = 0;
    testsGroupFrame.paddingTop = 0;
    testsGroupFrame.paddingBottom = 0;
    testsGroupFrame.fills = [];
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
