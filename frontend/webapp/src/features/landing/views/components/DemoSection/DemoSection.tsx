import React from 'react';

const DemoSection: React.FC = () => {
  return (
    <section id="demo" className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Demo</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-5 bg-white">Quy trình upload và xử lý tài liệu</div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">Tra cứu và xem chi tiết hợp đồng</div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
