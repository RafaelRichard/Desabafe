import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import Image from 'next/image';

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Desabafe - Sua Plataforma de Saúde Mental Online",
  description: "Encontre psicólogos, psiquiatras e outros profissionais de saúde mental para cuidar do seu bem-estar emocional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${geist.variable} font-sans antialiased bg-background text-foreground`}>
        <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 shadow-md">
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/img/testee.png"
                  alt="Desabafe"
                  width={40}
                  height={40}
                  className="w-auto h-10"
                />
                <span className="text-xl font-semibold text-gray-900">DesabafeOnline</span>
              </Link>

              {/* Menu de navegação (desktop) */}
              <div className="hidden md:flex items-center space-x-8">
                {[
                  ['Psiquiatria', '/psiquiatria'],
                  ['Psicologia', '/psicologia'],
                  ['Sobre Nós', '/Sobre'],
                ].map(([title, url]) => (
                  <Link
                    key={url}
                    href={url}
                    className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm font-medium"
                  >
                    {title}
                  </Link>
                ))}
                <Link
                  href="/area-do-usuario"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
                >
                  Área do Usuário
                </Link>
              </div>

              {/* Menu Hamburguer (mobile) */}
              <div className="md:hidden">
                <input type="checkbox" id="menu-toggle" className="hidden peer" />
                <label htmlFor="menu-toggle" className="text-gray-600 hover:text-purple-600 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>

                </label>
                <div className="peer-checked:block hidden absolute top-16 right-0 w-full bg-white border-t border-gray-100 shadow-md p-4">
                  <div className="space-y-4">
                    {[
                      ['Psiquiatria', '/psiquiatria'],
                      ['Psicologia', '/psicologia'],
                      ['Sobre Nós', '/Sobre'],
                    ].map(([title, url]) => (
                      <Link
                        key={url}
                        href={url}
                        className="block text-gray-600 hover:text-purple-600 text-sm font-medium"
                      >
                        {title}
                      </Link>
                    ))}
                    <Link
                      href="/area-do-usuario"
                      className="block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                    >
                      Área do Usuário
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>

        <main className="min-h-screen pt-16">{children}</main>

        {/* Rodapé */}
        <footer className="bg-gray-900 text-white py-12 mt-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Sobre Nós</h3>
                <p className="text-gray-400 text-sm">
                  Sua plataforma de apoio emocional e saúde mental online.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Serviços</h3>
                <ul className="space-y-2">
                  <li><Link href="/psiquiatria" className="text-gray-400 hover:text-white text-sm">Psiquiatria</Link></li>
                  <li><Link href="/psicologia" className="text-gray-400 hover:text-white text-sm">Psicologia</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Suporte</h3>
                <ul className="space-y-2">
                  <li><Link href="/faq" className="text-gray-400 hover:text-white text-sm">FAQ</Link></li>
                  <li><Link href="/contato" className="text-gray-400 hover:text-white text-sm">Contato</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contato</h3>
                <ul className="space-y-2">
                  <li className="text-gray-400 text-sm">rafaelrichardalmeida@gmail.com</li>
                  <li className="text-gray-400 text-sm">(18) 99694-9369</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} Desabafe. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
