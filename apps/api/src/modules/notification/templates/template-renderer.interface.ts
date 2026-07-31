import type { RenderedTemplate, TemplateRenderInput } from "./notification-template.interface";

/** The template-rendering abstraction `service/notification.service.ts`
 * depends on — never a concrete template engine directly, so swapping
 * the rendering strategy (or a test double) never touches service
 * code. */
export interface TemplateRenderer {
  render(input: TemplateRenderInput): Promise<RenderedTemplate>;
}
