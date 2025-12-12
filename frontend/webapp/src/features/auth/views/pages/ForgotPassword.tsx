import { Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import anime from 'animejs';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CommonFont } from '@shared/components';
import { useAuthFormController } from '../../controllers/useAuthFormController';
import { useForgotPassword } from '../../models/api/authApi';
import { LOGIN_PATH } from '@constants';

export const ForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { values, errors, handleChange, handleBlur, handleSubmit, reset } = useAuthFormController({
    email: '',
  });

  const forgotPasswordMutation = useForgotPassword();

  const handleForgotPassword = async (data: { email: string }) => {
    setErrorMessage('');
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setIsEmailSent(true);
    } catch (error: any) {
      const message = error?.response?.data?.description 
        || error?.response?.data?.message 
        || error?.message 
        || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setErrorMessage(message);
    }
  };

  const handleResend = () => {
    setIsEmailSent(false);
    reset();
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  return (
    <CommonFont className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #faf5ff)' }}>
      <div ref={containerRef} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isEmailSent ? 'Kiểm tra email của bạn' : 'Quên mật khẩu'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isEmailSent ? (
              // Success state - Email sent
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Chúng tôi đã gửi link đặt lại mật khẩu đến:
                  </p>
                  <p className="font-semibold text-gray-900 mb-4">
                    {values.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Vui lòng kiểm tra hộp thư (bao gồm thư rác) và nhấn vào link để đặt lại mật khẩu.
                    Link có hiệu lực trong 24 giờ.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                  >
                    Gửi lại email
                  </Button>
                  
                  <div className="text-center">
                    <Link
                      to={LOGIN_PATH}
                      className="text-sm font-medium hover:underline"
                      style={{ color: '#2563eb' }}
                    >
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              // Form state
              <>
                <p className="text-gray-600 text-center mb-6">
                  Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
                </p>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-6">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Địa chỉ email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    placeholder="Nhập email của bạn"
                    disabled={forgotPasswordMutation.isPending}
                  />

                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to={LOGIN_PATH}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#2563eb' }}
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </CommonFont>
  );
};
