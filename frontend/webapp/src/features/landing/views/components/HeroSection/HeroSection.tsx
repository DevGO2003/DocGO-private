import React from 'react';
import { CommonText } from '@shared/components';

const HeroSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <CommonText as="h1" className="text-3xl md:text-5xl font-bold leading-tight text-gray-900">
            Nền tảng quản lý tài liệu và hợp đồng thông minh
          </CommonText>
          <CommonText as="p" className="mt-4 text-gray-600 text-base md:text-lg">
            Tổ chức, tìm kiếm và xử lý tài liệu nhanh chóng với các công cụ tự động hóa và phân tích.
          </CommonText>
          <div className="mt-8 flex gap-3">
            <a href="/login" className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Bắt đầu ngay</a>
            <a href="#demo" className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Xem demo</a>
          </div>
        </div>
        <div className="bg-white/60 rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="aspect-video w-full rounded-xl flex items-center justify-center text-indigo-600" style={{ background: 'linear-gradient(to bottom right, #eef2ff, #faf5ff)' }}>
            Xem trước giao diện
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
