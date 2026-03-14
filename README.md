# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Internationalization (i18n)

- Languages enabled: `en` (default) and `es`
- User language is persisted in `localStorage` under `app-language`
- i18n setup entry: `src/i18n/index.ts`
- Locale files: `src/i18n/locales/en.json` and `src/i18n/locales/es.json`
- Root provider: `LanguageProvider` in `src/providers/LanguageProvider.tsx`

To add new text, create a key in both locale files and consume it with:

```tsx
import { useTranslation } from "react-i18next"

const { t } = useTranslation()
return <span>{t("your.key")}</span>
```
