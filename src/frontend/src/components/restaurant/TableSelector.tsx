import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";

interface TableSelectorProps {
  onTableSelect: (tableNumber: number) => void;
}

export default function TableSelector({ onTableSelect }: TableSelectorProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero image */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src="/assets/generated/restaurant-hero.dim_1200x400.jpg"
          alt="TableServe restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 to-foreground/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <UtensilsCrossed className="w-8 h-8 text-white" />
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white">
                TableServe
              </h1>
            </div>
            <p className="text-white/90 text-lg font-ui">
              Fine dining, effortlessly ordered
            </p>
          </motion.div>
        </div>
      </div>

      {/* Table selector */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">
              Welcome!
            </h2>
            <p className="text-muted-foreground font-ui text-base">
              Please tap your table number to get started
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((tableNum) => (
              <motion.div
                key={tableNum}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: tableNum * 0.03, duration: 0.3 }}
              >
                <Button
                  data-ocid={`table.item.${tableNum}`}
                  onClick={() => onTableSelect(tableNum)}
                  className="w-full h-16 sm:h-20 text-lg sm:text-xl font-display font-bold
                    bg-card hover:bg-primary hover:text-primary-foreground
                    text-foreground border-2 border-border hover:border-primary
                    rounded-xl shadow-xs transition-all duration-200"
                  variant="outline"
                >
                  {tableNum}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground font-ui">
              Each table has a unique ordering experience
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
