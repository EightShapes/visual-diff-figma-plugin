import { MendelsohnConstants } from "./MendelsohnConstants";

const LanguageConstants = {
  BASELINE_TOO_LARGE_STATUS_LABEL: `⚠️ The snapshot target is too large to be captured. Please ensure the width of the target is less than ${MendelsohnConstants.MAX_IMAGE_DIMENSION}px and the height of the target is less than ${MendelsohnConstants.MAX_IMAGE_DIMENSION}px, then try saving a new baseline snapshot.`,
  TEST_TOO_LARGE_STATUS_LABEL: `⚠️ The snapshot target is too large to be captured. Please ensure the width of the target is less than ${MendelsohnConstants.MAX_IMAGE_DIMENSION}px and the height of the target is less than ${MendelsohnConstants.MAX_IMAGE_DIMENSION}px, then try running the test again.`,
  EMPTY_STATUS_LABEL: "No comparison run",
  PASS_STATUS_LABEL: "No difference",
  FAIL_STATUS_LABEL: `Difference detected`,
  NO_COMPARISON_RUN_STATUS_LABEL: `- No comparison run`,
  TEST_NOT_RUN_LABEL: "No results, test not yet run.",
  TEST_IN_PROGRESS: "Please wait while the test suite runs.",
  BASELINE_LABEL: "Baseline",
  LATEST_TEST_IMAGE_LABEL: "Latest",
  NEW_SNAPSHOT_INSTRUCTIONS: `Select frames to add new snapshots to the lower left of the current page.`,
};

export { LanguageConstants };
