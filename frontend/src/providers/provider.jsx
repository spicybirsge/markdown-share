'use client';
import { useState, useEffect } from "react";
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes'

export default function Provider({ children }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
      }, []);
    
      if (!mounted) {
        return null;
      }
    return <Theme  radius="large" scaling="95%">{children}</Theme>
}