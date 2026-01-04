import { Link, Head } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { dashboard, login, register } from '@/routes';

export default function Welcome({ auth }: SharedData) {
    return (
        <>
            <Head title="Bem-vindo ao Finance System" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50 min-h-screen flex flex-col selection:bg-[#FF2D20] selection:text-white">
                <div className="relative min-h-screen flex flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-6 lg:py-10 lg:grid-cols-3">
                            <div className="flex justify-center sm:justify-start lg:justify-center lg:col-start-2">
                                {/* Logo or Brand Name */}
                                <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-[#FF2D20]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <span>Business Finance</span>
                                </div>
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-center sm:justify-end lg:col-start-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Registrar
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-10 lg:mt-16 flex flex-col items-center justify-center text-center">
                            <div className="relative z-10">
                                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    Domine suas <span className="text-[#FF2D20]">Finanças</span>
                                </h1>
                                <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                    Uma plataforma completa para gerenciar suas receitas, despesas e alcançar seus objetivos financeiros com clareza e precisão.
                                </p>
                                <div className="mt-10 flex items-center justify-center gap-x-6">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="rounded-full bg-[#FF2D20] px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#e0281c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF2D20] transition-all duration-300 hover:scale-105"
                                    >
                                        Começar Agora
                                    </Link>
                                    <Link
                                        href={login()}
                                        className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-[#FF2D20] transition-colors"
                                    >
                                        Já tenho conta <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="mt-12 sm:mt-16 lg:mt-24 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full">
                                <div className="group relative rounded-2xl bg-white/5 p-8 transition-all hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-[#FF2D20]/50 dark:hover:border-[#FF2D20]/50">
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF2D20]/10 text-[#FF2D20]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Painel Intuitivo</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Visualize seus dados financeiros de forma clara e objetiva com gráficos interativos.</p>
                                </div>

                                <div className="group relative rounded-2xl bg-white/5 p-8 transition-all hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-[#FF2D20]/50 dark:hover:border-[#FF2D20]/50">
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF2D20]/10 text-[#FF2D20]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Histórico Detalhado</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Acompanhe cada movimentação e entenda seus hábitos de consumo ao longo do tempo.</p>
                                </div>

                                <div className="group relative rounded-2xl bg-white/5 p-8 transition-all hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-[#FF2D20]/50 dark:hover:border-[#FF2D20]/50">
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF2D20]/10 text-[#FF2D20]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Multiusuário</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Gerencie finanças em conjunto, ideal para famílias ou pequenas equipes.</p>
                                </div>
                            </div>
                        </main>

                        <footer className="py-10 lg:py-16 text-center text-sm text-black dark:text-white/70">
                            Business Finance &copy; {new Date().getFullYear()}. Todos os direitos reservados.
                        </footer>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute top-0 -left-20 w-72 h-72 bg-[#FF2D20] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                    <div className="absolute top-0 -right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}
