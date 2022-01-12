import { MendelsohnConstants } from "./MendelsohnConstants";

const LanguageConstants = {
  BASELINE_TOO_LARGE_STATUS_LABEL: `Snapshot error`,
  BASELINE_TOO_LARGE_STATUS_ERROR_MESSAGE: `<strong>Snapshot origin is to large to capture.</strong> Snapshot height and width must not exceed ${MendelsohnConstants.MAX_IMAGE_DIMENSION}px.`,
  TEST_TOO_LARGE_STATUS_LABEL: `Snapshot error`,
  TEST_TOO_LARGE_STATUS_ERROR_MESSAGE: `<strong>The latest origin is to large to capture.</strong> Snapshot height and width must not exceed ${MendelsohnConstants.MAX_IMAGE_DIMENSION}px.`,
  EMPTY_STATUS_LABEL: "No comparison run",
  PASS_STATUS_LABEL: "No difference",
  FAIL_STATUS_LABEL: `Difference detected`,
  NO_COMPARISON_RUN_STATUS_LABEL: `- No comparison run`,
  TEST_NOT_RUN_LABEL: "No results, test not yet run.",
  TEST_IN_PROGRESS: "Please wait while the test suite runs.",
  BASELINE_LABEL: "Baseline",
  LATEST_TEST_IMAGE_LABEL: "Latest",
  NEW_SNAPSHOT_INSTRUCTIONS: `Select frames to add new snapshots to the lower left of the current page.`,
  GO_TO_ORIGINAL_ARTWORK_LABEL: "Go to original artwork",
};

export { LanguageConstants };
