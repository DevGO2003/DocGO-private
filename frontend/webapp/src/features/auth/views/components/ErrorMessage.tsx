interface ErrorMessageProps {
  message?: string | null;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className="rounded-md bg-red-50 p-4">
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
};
