import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import anime from 'animejs';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CommonFont, Checkbox, Label } from '@shared/components';
import { useAuthFormController } from '../../../controllers/useAuthFormController';
import { useLoginController } from '../../../controllers/useLoginController';
import { useGoogleLogin } from '../../../controllers/useGoogleLogin';
import { useAutoLogin } from '../../../controllers/useAutoLogin';
import { useAppSelector } from '@store/hooks';
import { REGISTER_PATH, FORGOT_PASSWORD_PATH } from '@constants';

export const Login = () => {
  // Auto-login từ account.txt nếu file tồn tại
  useAutoLogin();

  const { handleLogin, isLoading } = useLoginController();
  const { handleGoogleLogin, isLoading: isGoogleLoading } = useGoogleLogin();
  const { error } = useAppSelector((state) => state.auth); // Get error from Redux
  const { values, errors, handleChange, handleBlur, handleSubmit } = useAuthFormController({
    username: '',
    password: '',
    rememberMe: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (error && errorRef.current) {
      anime({
        targets: errorRef.current,
        opacity: [0, 1],
        maxHeight: [0, 100],
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  }, [error]);

  return (
    <CommonFont className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #faf5ff)' }}>
      <div ref={containerRef} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Đăng nhập tài khoản
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <div ref={errorRef} className="mb-4 p-3 border-2 rounded text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }} >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              <Input
                id="username"
                name="username"
                type="text"
                label="Tên đăng nhập"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.username}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Mật khẩu"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={values.rememberMe}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'rememberMe', type: 'checkbox', checked } } as any)}
                />
                <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                  Ghi nhớ đăng nhập
                </Label>
              </div>

              <Button
                type="submit"
                variant="outline"
                isLoading={isLoading}
                disabled={isLoading || isGoogleLoading}
                className="w-full"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2" style={{ borderColor: '#d1d5db' }} ></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 font-medium" style={{ backgroundColor: '#ffffff', color: '#6b7280' }} >Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              isLoading={isGoogleLoading}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isGoogleLoading ? 'Đang kết nối...' : 'Đăng nhập với Google'}
            </Button>

            <div className="mt-6 text-center space-y-3">
              <Link
                to={FORGOT_PASSWORD_PATH}
                className="block text-sm hover: hover:underline" style={{ color: '#2563eb' }} >
                Quên mật khẩu?
              </Link>
              <div className="text-sm" style={{ color: '#4b5563' }} >
                Chưa có tài khoản?{' '}
                <Link
                  to={REGISTER_PATH}
                  className="font-medium hover: hover:underline" style={{ color: '#2563eb' }} >
                  Đăng ký
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CommonFont>
  );
};
