import Image from "next/image";
import { delay } from "./ui";

const LINKS = ["Jobs", "Kontakt", "Impressum", "Datenschutz"];

export default function SiteFooter() {
  return (
    <footer className="halftone px-3 py-5 sm:px-6 sm:py-[30px]">
      <div className="relative mx-auto max-w-[1396px] overflow-hidden rounded-[24px] bg-teal-deep px-5 pb-6 pt-8 text-burgundy sm:px-8 lg:px-[30px] lg:pb-8">
        <div data-reveal="up" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-[218px_218px_218px_218px_1fr] lg:gap-x-0 lg:pl-[123px]">
          <ul className="col-span-2 flex flex-col gap-1 pt-1 font-display text-[22px] font-semibold leading-[1.3] sm:col-span-1 lg:gap-0 lg:text-[24px] lg:leading-[1.52]">
            {LINKS.map((l) => (
              <li key={l}>
                <a href="#" className="transition-opacity hover:opacity-70">
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <div>
            <p className="font-display text-[26px] font-semibold leading-tight">Telefon</p>
            <a href="tel:+491743091282" className="mt-1 block text-[13px] font-medium hover:underline">
              +491743091282
            </a>
          </div>
          <div>
            <p className="font-display text-[26px] font-semibold leading-tight">eMail</p>
            <a href="mailto:info@ohmygreece.de" className="mt-1 block text-[13px] font-medium hover:underline">
              info@ohmygreece.de
            </a>
          </div>
          <div>
            <p className="font-display text-[26px] font-semibold leading-tight">Adresse</p>
            <address className="mt-1 text-[13px] font-medium not-italic leading-[1.45]">
              Oh My Greece
              <br />
              Deutzer Freiheit 82
              <br />
              50679 Köln
            </address>
          </div>
          <div>
            <p className="font-display text-[20px] font-semibold leading-tight">Öffnungszeiten</p>
            <p className="mt-1.5 text-[13px] font-medium leading-[1.45] lg:pl-10">
              Dienstags - Sonntags:
              <br />
              11:00 bis 22:00 Uhr
            </p>
          </div>
        </div>
        <Image
          data-reveal="blur"
          style={delay(150)}
          src="/images/footer-wordmark.png"
          alt="Oh My Greece"
          width={1728}
          height={313}
          sizes="(min-width: 1440px) 1310px, 92vw"
          className="mx-auto mt-8 h-auto w-full max-w-[1310px] lg:mt-6"
        />
      </div>
    </footer>
  );
}
