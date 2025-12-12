import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import anime from 'animejs';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CommonFont } from '@shared/components';
import { useAuthFormController } from '../../controllers/useAuthFormController';
import { useResetPassword } from '../../models/api/authApi';
import { LOGIN_PATH } from '@constants';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { values, errors, handleChange, handleBlur, handleSubmit } = useAuthFormController({
    password: '',
    confirmPassword: '',
  });

  const resetPasswordMutation = useResetPassword();

  const handleResetPassword = async (data: { password: string; confirmPassword: string }) => {
    setErrorMessage('');
    
    if (!token) {
      setErrorMessage('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword: data.password });
      setIsSuccess(true);
    } catch (error: any) {
      const message = error?.response?.data?.description 
        || error?.response?.data?.message 
        || error?.message 
        || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setErrorMessage(message);
    }
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

  // Redirect to login after 3 seconds on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate(LOGIN_PATH);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  // Invalid token
  if (!token) {
    return (
      <CommonFont className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #faf5ff)' }}>
        <div ref={containerRef} className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Link không hợp lệ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-600">
                  Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                  Vui lòng yêu cầu gửi lại link mới.
                </p>
                <Link
                  to="/forgot-password"
                  className="inline-block text-sm font-medium hover:underline"
                  style={{ color: '#2563eb' }}
                >
                  Yêu cầu link mới
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </CommonFont>
    );
  }

  return (
    <CommonFont className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #faf5ff)' }}>
      <div ref={containerRef} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isSuccess ? 'Đặt lại mật khẩu thành công!' : 'Đặt mật khẩu mới'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              // Success state
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Mật khẩu của bạn đã được đặt lại thành công.
                  </p>
                  <p className="text-sm text-gray-500">
                    Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(LOGIN_PATH)}
                >
                  Đăng nhập ngay
                </Button>
              </div>
            ) : (
              // Form state
              <>
                <p className="text-gray-600 text-center mb-6">
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </p>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    label="Mật khẩu mới"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.password}
                    placeholder="Nhập mật khẩu mới"
                    disabled={resetPasswordMutation.isPending}
                  />

                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Xác nhận mật khẩu"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.confirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={resetPasswordMutation.isPending}
                  />

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Mật khẩu phải có:</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Ít nhất 8 ký tự</li>
                      <li>Ít nhất 1 chữ hoa</li>
                      <li>Ít nhất 1 chữ thường</li>
                      <li>Ít nhất 1 số</li>
                      <li>Ít nhất 1 ký tự đặc biệt (!@#$%^&*)</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? 'Đang xử lý...' : 'Đặt mật khẩu mới'}
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
