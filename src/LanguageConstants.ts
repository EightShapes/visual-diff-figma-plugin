import { MendelsohnConstants } from "./MendelsohnConstants";

const LanguageConstants = {
  BASELINE_TOO_LARGE_STATUS_LABEL: `⚠️ The snapshot target is too large to be captured. Please ensure the width of the target is less than ${MendelsohnConstants.MAX_IMAGE_DIMENSION}px and the height of the target is less than ${MendelsohnConstants.MAX_IMAGE_DIMENSION}px, then try saving a new baseline snapshot.`,
  EMPTY_STATUS_LABEL: "No comparison run",
  PASS_STATUS_LABEL: "No difference detected",
  FAIL_STATUS_LABEL: "⚠️ Difference detected",
};

export { LanguageConstants };