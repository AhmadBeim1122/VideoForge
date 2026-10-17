import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline execution and PWA installability in Chrome
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
