import './globals.css';
import { AuthProvider } from '../components/AuthProvider';
import Shell from '../components/Shell';
import RequireAuth from '../components/RequireAuth';

export const metadata = {
  title: 'Perfumes Admin',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RequireAuth>
            <Shell>{children}</Shell>
          </RequireAuth>
        </AuthProvider>
      </body>
    </html>
  );
}
