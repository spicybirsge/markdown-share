'use client';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes'

export function Provider({ children }) {
    return <Theme  radius="large" scaling="95%">{children}</Theme>
}