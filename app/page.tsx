import Link from "next/link";
export default function Home() { return <main className="flex min-h-screen items-center bg-slate-950 p-8 text-white"><section className="mx-auto max-w-3xl"><p className="font-semibold text-indigo-300">LINK OFFICE · IQRH</p><h1 className="mt-4 text-5xl font-bold">Comprendre la qualité de vos relations.</h1><p className="mt-6 max-w-xl text-lg text-slate-300">Un questionnaire scientifique pour visualiser vos cinq dimensions relationnelles.</p><Link href="/questionnaire" className="mt-8 inline-block rounded-xl bg-indigo-500 px-6 py-4 font-semibold">Commencer mon IQRH</Link></section>
<div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
           
            Deploy Now
          </a></div></main>; }
