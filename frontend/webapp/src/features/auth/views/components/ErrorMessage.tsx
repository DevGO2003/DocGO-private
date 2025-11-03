interface ErrorMessageProps {
  message?: string | null;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className="rounded-md p-4" style={{ backgroundColor: '#fef2f2' }} >
      <p className="text-sm" style={{ color: '#991b1b' }} >{message}</p>
    </div>
  );
};
