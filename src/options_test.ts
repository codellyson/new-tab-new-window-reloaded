import { byId, localizeDocument } from "./i18n";

localizeDocument();

byId("closeBtn")?.addEventListener("click", () => window.close());
