import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { AuthProvider } from './features/auth/AuthProvider';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { GuestOnly, RequireAuth } from './features/auth/guards';
import { InventoryPage } from './features/inventory/InventoryPage';
import { PurchasesPage } from './features/purchases/PurchasesPage';
import { createQueryClient } from './lib/queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="bottom-center"
          closeButton
          duration={5000}
          theme="system"
          // Keep toasts above the mobile tab bar.
          mobileOffset={{ bottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<InventoryPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
