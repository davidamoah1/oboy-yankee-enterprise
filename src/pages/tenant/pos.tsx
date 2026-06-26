import { POSTerminal } from "@/features/pos/components/pos-terminal";

export default function POSPage() {
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-1000">
      <POSTerminal />
    </div>
  );
}

