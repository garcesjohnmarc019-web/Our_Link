import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SOSListener from '@/components/SOSListener'; // I-import ang SOSListener

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SOSListener /> {/* Ilagay ito rito sa loob ng provider */}
      {children}
    </QueryClientProvider>
  );
}