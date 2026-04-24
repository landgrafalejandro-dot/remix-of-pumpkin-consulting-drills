const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/[0.08] bg-[#101013] px-4 py-3">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
    </div>
  </div>
);

export default TypingIndicator;
