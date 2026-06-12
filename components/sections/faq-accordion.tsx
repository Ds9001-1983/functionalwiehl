import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/content/faq";

/**
 * Sichtbares FAQ — emittiert bewusst KEIN eigenes Schema.
 * FAQPage-JSON-LD setzen nur /, /probetraining/ und /frauen-ab-50/
 * seitenweise über <JsonLd data={faqJsonLd(...)} />.
 */
export function FaqAccordion({ items, title = "Häufige Fragen" }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="container-site py-14">
      <h2 className="text-2xl sm:text-3xl">{title}</h2>
      <Accordion multiple={false} className="mt-6">
        {items.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="text-left text-base font-bold text-brand">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
