import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FaqItem } from "@/content/faq";

/**
 * Sichtbares FAQ — emittiert bewusst KEIN eigenes Schema.
 * FAQPage-JSON-LD setzen nur /, /probetraining/ und /frauen-ab-50/
 * seitenweise über <JsonLd data={faqJsonLd(...)} />.
 */
export function FaqAccordion({
  items,
  title = "Häufige Fragen",
  index,
}: {
  items: FaqItem[];
  title?: string;
  index?: string;
}) {
  return (
    <section className="container-site py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <SectionHeading index={index} eyebrow="FAQ" title={title} />
        <Reveal>
          <Accordion multiple={false} className="border-t border-border">
            {items.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-b border-border">
                <AccordionTrigger className="py-5 text-left text-base font-bold text-brand">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
