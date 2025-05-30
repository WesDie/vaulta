export function LoadingState() {
  return (
    <div className="p-2">
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center h-16 p-4 space-x-4 rounded bg-muted-foreground/20 animate-pulse"
          >
            <div className="w-12 h-12 rounded bg-muted-foreground/20"></div>
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-3 rounded bg-muted-foreground/20"></div>
              <div className="w-1/2 h-2 rounded bg-muted-foreground/20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
