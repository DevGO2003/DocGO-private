import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@shared/components';
import { AuthFormProps } from './AuthForm.types';
import { authFormStyles } from './AuthForm.styles';

export const AuthForm = ({
  title,
  onSubmit,
  children,
  isLoading,
  error,
  footer,
}: AuthFormProps) => {
  return (
    <div className={authFormStyles.container}>
      <Card className={authFormStyles.wrapper}>
        <CardHeader>
          <CardTitle className={authFormStyles.title}>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className={authFormStyles.form}>
            {error && (
              <div className={authFormStyles.errorContainer}>
                <p className={authFormStyles.errorText}>{error}</p>
              </div>
            )}
            <div className={authFormStyles.fieldsContainer}>{children}</div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              {isLoading ? 'Processing...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
        {footer && <CardFooter className={authFormStyles.footer}>{footer}</CardFooter>}
      </Card>
    </div>
  );
};
