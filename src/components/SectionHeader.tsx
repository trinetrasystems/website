import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** Short uppercase label shown above the title. */
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  inView: boolean;
  /** Short gradient bar between the title and the description. */
  accent?: boolean;
  className?: string;
};

const SectionHeader = ({ eyebrow, title, description, inView, accent = false, className }: SectionHeaderProps) => (
  <motion.div {...fadeUp(inView)} className={cn("text-center mb-12 md:mb-16", className)}>
    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-accent">{eyebrow}</p>
    <h2 className="text-3xl md:text-5xl font-bold">{title}</h2>
    {accent && <span aria-hidden className="mx-auto mt-6 block h-0.5 w-12 rounded-full bg-gradient-to-r from-primary to-accent" />}
    {description && <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
  </motion.div>
);

export default SectionHeader;
