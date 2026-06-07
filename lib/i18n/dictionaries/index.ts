import type { Locale } from "../locales";

import { en, type Dictionary } from "./en";
import { pl } from "./pl";
import { sv } from "./sv";

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { en, sv, pl };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
