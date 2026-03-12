# UI Components & Styling

<description>
This reference guides the AI on creating or modifying React components, matching the visual language and structure of the Ecommaps Starter template.
</description>

<context>
- **Framework:** Next.js 15+ App Router.
- **Styling:** Tailwind CSS (`v4` or `v3` depending on configuration) with standard variables in `src/app/globals.css`.
- **Components Base:** `shadcn/ui` based inside `src/components/ui`.
- **Icons:** `lucide-react` is strictly used for icons.
- **Orientation:** The primary target audience is MENA (Middle East & North Africa), meaning all UI should be built with strictly `dir="rtl"` in mind. 
</context>

<instructions>
1. **RTL Logical Properties:** Never use `ml-4`, `mr-4`, `pl-4`, `pr-4`, `left-*` or `right-*`. Always use `ms-` (margin-start), `me-` (margin-end), `ps-`, `pe-`, `text-start`, `text-end`. This is critical for Arabic layouts to work correctly.
2. **Use shadcn/ui:** When adding interactive elements, use existing components in `src/components/ui` (e.g. `<Button>`, `<Input>`).
3. **Headless State:** Separate logic (Server Actions) from display (Client Components). Keep components as "dumb" as possible.
</instructions>

<examples>
<example>
### Correct RTL Button with Icon (Shadcn + Lucide)
```tsx
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function AddToCartButton() {
  return (
    <Button className="w-full">
      <ShoppingCart className="w-4 h-4 me-2" />
      <span>أضف للسلة</span>
    </Button>
  );
}
```
*(Notice the `w-4 h-4 me-2` -> margin-end, pushing the text away correctly in RTL).*
</example>
</examples>

<execution-rules>
- Maintain high-quality Arabic placeholder text.
- Do not introduce new CSS libraries (like Emotion or Styled Components). Stick purely to Tailwind.
</execution-rules>
