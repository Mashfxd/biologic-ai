import './globals.css';

export const metadata = {
  title: 'BioLogic AI - Producción Animal',
  description: 'Sistema de gestión con IA para la optimización de producción de animales menores.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* ¡Agregamos dark:bg-slate-900 y dark:text-slate-50 al body principal! */}
      <body className="font-sans antialiased text-slate-900 bg-slate-50 dark:bg-slate-900 dark:text-slate-50 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}