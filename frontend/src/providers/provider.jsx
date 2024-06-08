'use client';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes'

export function Provider({ children }) {
    return <Theme accentColor="crimson" grayColor="sand" radius="large" scaling="95%">{children}</Theme>
}