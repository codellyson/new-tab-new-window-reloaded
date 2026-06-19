// Standalone page opened by the "Test" button to demonstrate the new-window
// behavior; provides a close button.
import { byId, localizeDocument } from "./i18n";

localizeDocument();

byId("closeBtn")?.addEventListener("click", () => window.close());
