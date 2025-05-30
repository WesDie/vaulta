export function ErrorState() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            className="w-full h-full"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-primary">
          Something went wrong
        </h3>
        <p className="mb-4 text-muted-foreground">
          We couldn't load your media files.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm text-white bg-black rounded hover:bg-muted-foreground/20"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
