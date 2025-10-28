import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-white/80">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Giới thiệu</h2>
        <p className="mt-4 text-gray-600 max-w-3xl">
          DocGO là nền tảng giúp doanh nghiệp quản lý tài liệu và hợp đồng hiệu quả, tích hợp các công cụ AI để tự động hóa quy trình xử lý và phân tích.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
