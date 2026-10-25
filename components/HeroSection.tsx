import Image from 'next/image';
import Link from 'next/link';

// Static campaign markup makes the hero and its image discoverable in the first HTML.
// Import HeroSlider instead when returning to the admin-managed rotating campaign.
export default function HeroSection() {
  return (
    <section className="relative w-full group heroContainer">
      <Link href="/products" className="relative block h-[550px] w-full overflow-hidden bg-[#FDF8F3] sm:h-[650px] md:h-[485px] lg:h-[550px]">
                  <div className="absolute inset-0 overflow-hidden bg-[#fff7ea] text-[#3d2118]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_50%,rgba(250,220,167,0.42),transparent_52%)]" />
                    <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full border border-[#d7ae68]/30 md:h-96 md:w-96" />
                    <div className="absolute -left-10 -top-16 h-60 w-60 rounded-full border border-[#d7ae68]/20 md:h-80 md:w-80" />

                    <div className="absolute inset-x-0 bottom-0 h-[48%] overflow-hidden md:inset-x-auto md:bottom-auto md:right-[5%] md:top-[5%] md:h-[90%] md:w-[36%] md:rounded-[2rem] md:bg-[#f6e9db] md:shadow-[0_24px_70px_rgba(87,40,21,0.18)] lg:right-[8%] lg:w-[34%]">
                      <Image
                        src="/hero/diwali-sangam-barfi.jpg"
                        alt="Festive Sangam Barfi from Gopi Misthan Bhandar"
                        fill
                        priority
                        fetchPriority="high"
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 36vw, 34vw"
                        className="object-cover object-[50%_58%] md:object-contain md:object-center"
                      />
                      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fff7ea] to-transparent md:hidden" />
                    </div>

                    <div className="relative z-10 flex h-full items-start px-6 pb-[53%] pt-10 sm:px-12 sm:pt-14 md:items-center md:px-[9%] md:pb-0 md:pt-0">
                      <div className="max-w-[640px] md:max-w-[50%]">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a5b22] sm:text-xs">
                          Shubh Diwali · Since 1968
                        </p>
                        <h1 className="whitespace-pre-line font-serif text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#53231f] sm:text-5xl md:text-5xl lg:text-6xl">
                          {'Diwali ki mithaas,\nGopi ke saath.'}
                        </h1>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-[#694a3a] sm:mt-5 sm:text-base sm:leading-7 md:text-lg">
                          Traditional mithai, namkeen and festive gift boxes — lovingly crafted in Neemuch since 1968.
                        </p>
                        <span className="mt-5 inline-flex items-center gap-3 rounded-sm bg-[#7a1f2b] px-5 py-3 text-[11px] font-semibold tracking-[0.14em] text-white shadow-lg shadow-[#7a1f2b]/20 transition-colors group-hover:bg-[#5e1721] sm:mt-7 sm:px-7 sm:py-4 sm:text-xs">
                          VIEW FESTIVE COLLECTION <span aria-hidden="true" className="text-base">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
      </Link>
    </section>
  );
}
