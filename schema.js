const schema = {
  pages: {
    "<page-id>": {
      name: "Components",
      testGroupNodeId: "<node-id>",
      tests: {
        "<node-id>": {
          id: "<node-id>",
          name: "Origin Node Name",
          status: "pass|fail|not-run",
          updatedAt: "<timestamp>",
          displayMode: "overlay|side",
          displayProportion: "0-1",
        },
      },
    },
    "<page-id>": {
      name: "Demo Area",
      testWrapperNodeId: "<node-id>",
      activeTestId: "<test-id>",
      tests: {
        // ...see above
      },
    },
  },
};

const pluginState = {
  activePageId: "<page-id>", // triggered by figma canvas
  activeTestId: "<test-id>", // triggered by figma canvas or plugin UI
  currentSelection: "[<node-ids>]", // triggered by figma canvas
};

// Mendelsohn.initialize()
// No Schema: Iterate over all pages, find test wrappers, find tests, build schema & save it
// Schema exists: ^ Same, just update everything

// Pattern for all actions:
// 1. Plugin triggers something
// 2. Schema gets updated
// 3. Figma canvas gets refreshed after schema update
// 4. Plugin UI gets refreshed after schema update

// ACTION: Create snapshots from selection
// 1. Create snapshots from selection
// 2. find/create testWrapperNodeId, findCreate testNodeIds
// 3. Iterate over active page and find/create testwrapper w/tests
// 4. Iterate over active page and display/create test list items

// ACTION: Run test
// 1. Play button sends testId to canvas to run test
// 2. Canvas/PlugIn collect baseline, test & diff images and compare, schema updated (side effects, canvas updated with screenshots...add to schema?)
// 3. Figma canvas gets refreshed w/status updates for test
// 4. Plugin UI is updated with test results

// ACTION: Update baseline
// 1. Update button triggered
// 2. Schema updated, test data reset to initial values (side effect, canvas updated with new baseline image)
// 3. Figma canvas gets refreshed w/status updates for test
// 4. Plugin UI is updated with latest data
