export class AllTestsFrame {
  static EIGHTSHAPES_ORANGE_RGB = {r: 0.909803921568627, g: 0.32156862745098, b: 0};
  static ALL_TESTS_FRAME_KEY = 'all-tests-frame';
  static LAYOUT_GUTTER = 60;


  constructor(pageName) {
    return this.findOrCreateAllTestsFrame(pageName);
  }

  copyChildren(children) {
    // Incomplete, only copies id, x, and y properties for child nodes
    return children.map(object => {return {id: object.id, y: object.y, x: object.x}});
  }

  getNextAvailableCoordinates(pageNode) {
    const childNodes = this.copyChildren(pageNode.children); // Make a copy since sort() runs in place
    const childNodesSortedByY = childNodes.sort((a, b) => b.y - a.y);
    const lowestChild = figma.getNodeById(childNodesSortedByY[0].id);
    const childNodesSortedByX = childNodes.sort((a, b) => a.x - b.x);
    const leftmostChild = figma.getNodeById(childNodesSortedByX[0].id);

    const x = leftmostChild.x;
    const y = lowestChild.y + lowestChild.height + AllTestsFrame.LAYOUT_GUTTER;

    return {x, y}
  }

  createAllTestsFrame(pageNode) {
    const allTestsFrame = figma.createFrame();
    if (pageNode !== figma.currentPage) {
      pageNode.appendChild(pageNode);
    }

    allTestsFrame.name = "All Tests";
    allTestsFrame.setPluginData(AllTestsFrame.ALL_TESTS_FRAME_KEY, 'true');
    allTestsFrame.layoutMode = "HORIZONTAL";
    allTestsFrame.primaryAxisSizingMode = "AUTO";
    allTestsFrame.counterAxisSizingMode = "AUTO";
    allTestsFrame.itemSpacing = AllTestsFrame.LAYOUT_GUTTER;
    allTestsFrame.paddingLeft = AllTestsFrame.LAYOUT_GUTTER;
    allTestsFrame.paddingRight = AllTestsFrame.LAYOUT_GUTTER;
    allTestsFrame.paddingTop = AllTestsFrame.LAYOUT_GUTTER;
    allTestsFrame.paddingBottom = AllTestsFrame.LAYOUT_GUTTER;
    allTestsFrame.fills = [];
    allTestsFrame.strokes = [{
      type: "SOLID",
      color: AllTestsFrame.EIGHTSHAPES_ORANGE_RGB
    }];
    allTestsFrame.dashPattern = [10, 10];
    allTestsFrame.resize(1000,400);
    const nextAvailableCoordinates = this.getNextAvailableCoordinates(pageNode);
    allTestsFrame.x = nextAvailableCoordinates.x;
    allTestsFrame.y = nextAvailableCoordinates.y;

    return allTestsFrame;
  }

  findOrCreateAllTestsFrame(pageNode) {
    let allTestsFrame = pageNode.findOne(fNode => fNode.getPluginData(AllTestsFrame.ALL_TESTS_FRAME_KEY));
    if (allTestsFrame === null) {
      allTestsFrame = this.createAllTestsFrame(pageNode);
    }

    return allTestsFrame;
  }
}