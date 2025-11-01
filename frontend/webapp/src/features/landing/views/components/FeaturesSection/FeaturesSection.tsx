import React from 'react';
import { CommonText } from '@shared/components';

const features = [
  { title: 'Quản lý kho tài liệu', desc: 'Tổ chức tài liệu theo repository, thẻ và phân quyền.' },
  { title: 'Tìm kiếm thông minh', desc: 'Tìm kiếm nhanh theo nội dung, tags và metadata.' },
  { title: 'Tự động hóa', desc: 'Trích xuất, tóm tắt và xử lý tài liệu bằng AI.' },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 bg-white/80">
      <div className="max-w-7xl mx-auto px-6">
        <CommonText as="h2" className="text-2xl md:text-3xl font-semibold text-gray-900">Tính năng nổi bật</CommonText>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="border border-gray-200 rounded-xl p-5 bg-white">
              <CommonText className="text-lg font-medium text-gray-900">{f.title}</CommonText>
              <CommonText className="mt-2 text-gray-600 text-sm">{f.desc}</CommonText>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
