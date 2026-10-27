import { ApplicationSection } from "@/components/ApplicationForm";
import Benefits from "@/components/Benefits";
import DreamStatement from "@/components/DreamStatement";
import FamilyPartnership from "@/components/FamilyPartnership";
import Faq from "@/components/Faq";
import Hero from "@/components/Hero";
import Motion from "@/components/Motion";
import Process from "@/components/Process";
import Quality from "@/components/Quality";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function FranchisePage() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip">
        <Hero />
        <DreamStatement />
        <Benefits />
        <Quality />
        <FamilyPartnership />
        <Process />
        <ApplicationSection />
        <Faq />
      </main>
      <SiteFooter />
      {/* Last, inside the page segment: its effect must run only after this content has hydrated,
          otherwise adding reveal classes to server HTML causes a hydration mismatch. */}
      <Motion />
    </>
  );
}
