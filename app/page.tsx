'use client';

import Image from 'next/image';
import Link from 'next/link';

const brand = {
  pine: '#1F5550',
  sand: '#C2964C',
  ivory: '#F5F1EA',
  slate: '#143536',
};

const highlights = [
  {
    title: 'منصة تكليفي الجامعية',
    description:
      'إدارة التخصصات، الأساتذة، والمقاييس في تجربة واحدة مرنة مصممة خصيصًا لجامعة الوادي.',
  },
  {
    title: 'لوحة تحكم ذكية',
    description:
      'تتبّع الأنشطة، التحليلات، وتوزيع الأعباء البيداغوجية برؤية موحدة وسهلة القراءة.',
  },
  {
    title: 'تكامل مع البريد المؤسسي',
    description:
      'دخول آمن عبر حسابات @univ-eloued.dz يضمن خصوصية البيانات واعتمادها رسميا.',
  },
];


function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-24 -left-32 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: `${brand.sand}33` }}
      />
      <div
        className="absolute top-32 -right-24 h-80 w-80 rounded-full blur-[100px]"
        style={{ backgroundColor: `${brand.pine}3d` }}
      />
      <div
        className="absolute bottom-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-[120px]"
        style={{ backgroundColor: `${brand.ivory}40` }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,237,227,0.85),_rgba(255,255,255,0.6))] dark:bg-[#0c1210] text-gray-900 dark:text-gray-100"
      style={{ backgroundColor: brand.ivory }}
    >
      <FloatingOrbs />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center space-x-3">
          <Image
            src="/university-logo.png"
            alt="شعار جامعة الوادي"
            width={56}
            height={56}
            className="hidden h-14 w-14 shrink-0 drop-shadow-lg sm:block"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand-slate,#314e4c)]">
              University of El Oued
            </p>
            <h1 className="text-xl font-bold text-[color:var(--brand-pine,#1f5550)]">
              منصة تكليفي الجامعية
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/signin"
            className="rounded-full border border-[color:var(--brand-pine,#1f5550)] px-5 py-2 text-sm font-semibold text-[color:var(--brand-pine,#1f5550)] transition hover:bg-[color:var(--brand-pine,#1f5550)] hover:text-white"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-[color:var(--brand-pine,#1f5550)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(31,85,80,0.25)] transition hover:bg-[color:var(--brand-slate,#143536)] sm:block"
          >
            إنشاء حساب
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 lg:pb-28">
        <div className="grid gap-16 pt-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center">
          <section className="space-y-8">
            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--brand-slate,#143536)] shadow-sm backdrop-blur">
              مستقبل الإدارة البيداغوجية
            </span>

            <div className="space-y-4">
              <h2 className="text-4xl font-black leading-tight text-[color:var(--brand-pine,#1f5550)] sm:text-5xl">
                جسر رقمي يربط الإدارة الجامعية
                <br className="hidden sm:block" /> والأستاذ في تجربة واحدة
              </h2>
              <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                تجمع منصة تكليفي خدمات جامعة الشهيد حمه لخضر الوادي في لوحة تحكم غامرة مستوحاة من الهوية البصرية للجامعة. من توزيع المقاييس إلى تتبع الأداء، كل شيء مرتب بدقة وبالعربية الفصحى.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-[color:var(--brand-pine,#1f5550)] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-[rgba(26,68,64,0.25)] transition hover:bg-[color:var(--brand-slate,#143536)]"
              >
                ابدأ الآن
              </Link>
              <Link
                href="/signin"
                className="rounded-full border border-transparent bg-white/80 px-6 py-3 text-sm font-semibold text-[color:var(--brand-pine,#1f5550)] shadow hover:border-[color:var(--brand-sand,#c2964c)] hover:bg-white"
              >
                لدي حساب مسبقًا
              </Link>
              <div className="flex items-center space-x-2 rounded-full bg-white/70 px-3 py-2 text-xs font-semibold text-[color:var(--brand-slate,#143536)] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[color:var(--brand-sand,#c2964c)]" />
                خدمة موثوقة تعتمد البريد المؤسسي
              </div>
            </div>
          </section>

          <aside className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-white/60 blur-xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/50 bg-white/80 shadow-2xl shadow-[rgba(20,53,54,0.15)] backdrop-blur">
              <div className="flex flex-col items-center space-y-6 px-10 pb-12 pt-12 text-center">
                <Image
                  src="/university-logo.png"
                  alt="شعار جامعة الوادي"
                  width={200}
                  height={200}
                  className="h-40 w-40 object-contain"
                />
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-[color:var(--brand-pine,#1f5550)]">
                    جامعة الشهيد حمه لخضر – الوادي
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    ألوان مستوحاة من صحراء الوادي وواحاتها، تحيط بها دوائر المعرفة المفتوحة. تجربة واجهة تنبض بهوية الجامعة وتستقبل المستخدم بحفاوة أكاديمية.
                  </p>
                </div>
              </div>
              <div className="border-t border-white/60 bg-[color:var(--brand-pine,#1f5550)]/10 px-10 py-6 text-sm text-[color:var(--brand-slate,#143536)]">
                يوفر التصميم الخلفي تدرجات رملية ونخيلًا مجردًا يرمز إلى الامتداد العلمي والبيئي للمنطقة.
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-20 flex flex-col gap-8 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-[rgba(201,150,76,0.15)] backdrop-blur lg:mt-24 lg:p-12">
          <h3 className="text-center text-2xl font-bold text-[color:var(--brand-pine,#1f5550)]">
            لماذا تختار تكليف لإدارة مهامك الجامعية؟
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl bg-white/90 p-6 shadow-md shadow-[rgba(20,53,54,0.08)] transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 h-1 w-14 rounded-full bg-[color:var(--brand-sand,#c2964c)] transition-all group-hover:w-20 group-hover:bg-[color:var(--brand-pine,#1f5550)]" />
                <h4 className="text-lg font-semibold text-[color:var(--brand-pine,#1f5550)]" dir="rtl">
                  {item.title}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400" dir="rtl">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/40 bg-white/60 px-6 py-6 text-center text-xs text-[color:var(--brand-slate,#143536)] backdrop-blur space-y-2">
        <p>© {new Date().getFullYear()} جامعة الشهيد حمه لخضر – الوادي. جميع الحقوق محفوظة.</p>
        <p className="text-[0.75rem] text-[color:var(--brand-slate,#143536)]">
          منصة من برمجة وتصميم د. علي حسين – <a href="mailto:hussain-ali@univ-eloued.dz" className="underline hover:text-[color:var(--brand-pine,#1f5550)]">hussain-ali@univ-eloued.dz</a>
        </p>
      </footer>
    </div>
  );
}
