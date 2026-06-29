import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { Joyride as JoyRide, Step, STATUS, TourData } from 'react-joyride';
import { useAuth } from '@/contexts/auth-context';

interface TourContextType {
  run: boolean;
  tourKey: number;
  startTour: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = 'oboy-tour-completed';

const dashboardSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to OBOY YANKEE ENTERPRISE! Let\'s take a quick tour of your POS system.',
    skipBeacon: true,
    placement: 'center',
  },
  {
    target: '[data-tour="sidebar"]',
    content: 'This is your navigation sidebar. Use it to move between Dashboard, POS, Inventory, Reports, and more.',
    placement: 'right',
  },
  {
    target: '[data-tour="quick-search"]',
    content: 'Quick Search — press ⌘K (or Ctrl+K) to quickly find anything in the system.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="start-selling"]',
    content: 'Click "Start Selling" to jump straight to the POS terminal and make a sale.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="quick-actions"]',
    content: 'Quick Actions give you one-click access to New Sale, Add Product, View Receipts, and Reports.',
    placement: 'top',
  },
  {
    target: '[data-tour="kpi-cards"]',
    content: 'These KPI cards show your today\'s sales, profit, stock levels, and outstanding credit at a glance.',
    placement: 'top',
  },
  {
    target: '[data-tour="sales-chart"]',
    content: 'Your sales chart visualizes revenue trends over the past week to help you spot patterns.',
    placement: 'top',
  },
  {
    target: '[data-tour="low-stock"]',
    content: 'Low stock warnings appear here when products drop below their reorder level.',
    placement: 'top',
  },
  {
    target: '[data-tour="user-menu"]',
    content: 'Click your avatar to change password, access settings, or sign out.',
    placement: 'left',
  },
  {
    target: 'body',
    content: 'That\'s it! You can restart this tour anytime from Settings. Happy selling!',
    skipBeacon: true,
    placement: 'center',
  },
];

const posSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to the POS Terminal! This is where you make sales.',
    skipBeacon: true,
    placement: 'center',
  },
  {
    target: '[data-tour="pos-search"]',
    content: 'Search for products by name, SKU, or barcode. You can also use a hardware barcode scanner.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="pos-scan"]',
    content: 'Click here to open the barcode scanner camera for scanning product barcodes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="pos-products"]',
    content: 'Browse and click any product to add it to the cart.',
    placement: 'right',
  },
  {
    target: '[data-tour="pos-cart"]',
    content: 'Your cart shows selected items. Adjust quantities or remove items here.',
    placement: 'left',
  },
  {
    target: '[data-tour="pos-checkout"]',
    content: 'Choose a payment method (Cash, Mobile Money, Card, or Credit) and click Checkout to complete the sale.',
    placement: 'top',
  },
  {
    target: '[data-tour="pos-offline"]',
    content: 'This indicator shows your online/offline status. Sales work even offline — they sync automatically when connection returns.',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: 'You\'re ready to start selling! Sales are saved instantly and sync to the server automatically.',
    skipBeacon: true,
    placement: 'center',
  },
];

function getStepsForRoute(pathname: string): Step[] {
  if (pathname.includes('/pos')) return posSteps;
  if (pathname.includes('/dashboard') || pathname === '/') return dashboardSteps;
  return dashboardSteps;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [steps, setSteps] = useState<Step[]>(dashboardSteps);
  const { authInitialized, isAuthenticated } = useAuth();
  const autoStartAttempted = useRef(false);

  const startTour = useCallback(() => {
    const pathname = window.location.pathname;
    setSteps(getStepsForRoute(pathname));
    setTourKey(prev => prev + 1);
    setRun(true);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    autoStartAttempted.current = false;
    startTour();
  }, [startTour]);

  useEffect(() => {
    if (autoStartAttempted.current) return;
    if (!authInitialized || !isAuthenticated) return;

    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (completed) {
      autoStartAttempted.current = true;
      return;
    }

    const pathname = window.location.pathname;
    const isValidTourPage = pathname.includes('/dashboard') || pathname.includes('/pos') || pathname === '/';
    if (!isValidTourPage) return;

    autoStartAttempted.current = true;
    const timer = setTimeout(() => {
      startTour();
    }, 2000);
    return () => clearTimeout(timer);
  }, [authInitialized, isAuthenticated, startTour]);

  const handleEvent = (data: TourData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }
  };

  return (
    <TourContext.Provider value={{ run, tourKey, startTour, resetTour }}>
      <JoyRide
        key={tourKey}
        steps={steps}
        run={run}
        onEvent={handleEvent}
        continuous
        showProgress
        scrollToFirstStep
        options={{
          primaryColor: '#10b981',
          backgroundColor: '#0f172a',
          textColor: '#f8fafc',
          arrowColor: '#0f172a',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 9999,
          buttons: ['back', 'close', 'primary', 'skip'],
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
        styles={{
          tooltip: {
            borderRadius: '16px',
            padding: '20px',
          },
          tooltipTitle: {
            fontSize: '15px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
          tooltipContent: {
            fontSize: '13px',
            fontWeight: 500,
            lineHeight: 1.5,
          },
          buttonPrimary: {
            backgroundColor: '#10b981',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '10px 20px',
          },
          buttonBack: {
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: 800,
          },
          buttonSkip: {
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: 700,
          },
          beacon: {
            backgroundColor: '#10b981',
          },
        }}
      />
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
