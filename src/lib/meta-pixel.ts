export const META_PIXEL_ID = "1337417334622081";

export const PRODUCT_PARAMS = {
  content_name: "Playbook Objeção Zero",
  content_category: "Educação / Vendas",
  content_ids: ["playbook-objecao-zero"],
  content_type: "product",
  value: 97,
  currency: "BRL",
} as const;

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "InitiateCheckout"
  | "AddToCart"
  | "AddPaymentInfo"
  | "Contact"
  | "Subscribe"
  | "CompleteRegistration"
  | "StartTrial"
  | "SubmitApplication"
  | "AddToWishlist"
  | "CustomizeProduct"
  | "Schedule"
  | "Search"
  | "FindLocation"
  | "Donate"
  | "Purchase";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(event: MetaStandardEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, { ...PRODUCT_PARAMS, ...params });
}

export function trackMetaCustomEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", event, { ...PRODUCT_PARAMS, ...params });
}

export function trackHeroInterest() {
  trackMetaEvent("Lead", { source: "hero-cta" });
  trackMetaEvent("StartTrial", { source: "hero-cta" });
}

export function trackCheckout(source: string) {
  trackMetaEvent("InitiateCheckout", { source });
  trackMetaEvent("AddToCart", { source });
}

export function trackOfferCheckout() {
  trackCheckout("oferta-principal");
  trackMetaEvent("AddPaymentInfo", { source: "oferta-principal" });
}

export function trackReceiveCheckout() {
  trackCheckout("secao-conteudo");
}

export function trackFaqCheckout() {
  trackCheckout("faq");
  trackMetaEvent("SubmitApplication", { source: "faq" });
}

export function trackExitCheckout() {
  trackCheckout("popup-exit-intent");
  trackMetaEvent("CompleteRegistration", { source: "popup-exit-intent" });
}

export function trackWhatsAppContact() {
  trackMetaEvent("Contact", { source: "whatsapp-flutuante" });
  trackMetaEvent("Schedule", { source: "whatsapp-flutuante" });
}

export function trackExitPopupShown() {
  trackMetaEvent("Subscribe", { source: "popup-exit-intent" });
  trackMetaEvent("AddToWishlist", { source: "popup-exit-intent" });
}

export function trackFaqSearch(question: string) {
  trackMetaEvent("Search", { search_string: question, source: "faq" });
  trackMetaEvent("Lead", { source: "faq-pergunta", content_name: question });
}

export function trackPageViewContent() {
  trackMetaEvent("ViewContent", { source: "pagina-inicial" });
}

export const SECTION_PIXEL_EVENTS: {
  selector: string;
  event: MetaStandardEvent;
  params?: Record<string, unknown>;
}[] = [
  { selector: "#receber", event: "CustomizeProduct", params: { source: "secao-conteudo" } },
  { selector: "#depoimentos", event: "Subscribe", params: { source: "depoimentos" } },
  { selector: "#sobre", event: "FindLocation", params: { source: "secao-sobre" } },
  { selector: "#oferta", event: "Lead", params: { source: "scroll-oferta" } },
  { selector: "#garantia", event: "Donate", params: { source: "secao-garantia" } },
];
