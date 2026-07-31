import { NotImplementedError } from "../../../errors";

import type { TemplateRenderInput, RenderedTemplate } from "./notification-template.interface";
import type { TemplateRenderer } from "./template-renderer.interface";

/**
 * `TemplateRenderer` implementation — currently a skeleton. `render`
 * throws `NotImplementedError` rather than looking up a stored
 * `NotificationTemplate` and substituting `variables` into it; no
 * template-engine package (Handlebars, Mustache, or otherwise) is
 * installed or imported here. Actual template storage/lookup and
 * placeholder substitution are out of scope for this foundation.
 */
export class DefaultTemplateRenderer implements TemplateRenderer {
  async render(input: TemplateRenderInput): Promise<RenderedTemplate> {
    throw new NotImplementedError(
      `DefaultTemplateRenderer.render is not implemented yet (templateKey: ${input.templateKey})`,
    );
  }
}
