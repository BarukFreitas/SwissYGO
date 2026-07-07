"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { App } from '@capacitor/app';

export default function CapacitorAppListener() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Usamos uma ref para armazenar o pathname atual.
  // Assim evitamos remover e recriar o listener do botão voltar
  // toda vez que a rota muda, o que pode causar o fechamento do app 
  // se o botão for pressionado durante uma transição.
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Escuta o botão de voltar do Android via Capacitor apenas UMA vez
    const backButtonListener = App.addListener('backButton', ({ canGoBack }: any) => {
      // Se estiver na página inicial, fecha o App
      if (pathnameRef.current === '/') {
        App.exitApp();
      } else {
        // Caso contrário, volta a página na navegação normal do Next.js
        router.back();
      }
    });

    return () => {
      if (backButtonListener && typeof backButtonListener.then === 'function') {
        backButtonListener.then((handle: any) => handle.remove());
      }
    };
  }, [router]);

  return null;
}
