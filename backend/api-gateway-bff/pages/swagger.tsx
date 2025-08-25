import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamic import để tránh SSR issues với Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div>Loading Swagger UI...</div>
});

// Import Swagger CSS
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerPage() {
  const sources = useMemo(() => ([
    { key: 'gateway', name: 'API Gateway BFF', url: '/api/swagger.json' },
    { key: 'authentication', name: 'Authentication Service', url: '/api/docs/authentication' },
    { key: 'user-management', name: 'User Management', url: '/api/docs/user-management' },
    { key: 'contract-management', name: 'Contract Management', url: '/api/docs/contract-management' },
    { key: 'ai-processing', name: 'AI Processing Service', url: '/api/docs/ai-processing' },
    { key: 'file-storage', name: 'File Storage Asset', url: '/api/docs/file-storage' },
    { key: 'general-file-management', name: 'General File Management', url: '/api/docs/general-file-management' }
  ]), []);

  const [selectedKey, setSelectedKey] = useState<string>('gateway');
  const [spec, setSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const src = sources.find(s => s.key === selectedKey) || sources[0];
    setError(null);
    setSpec(null);
    fetch(src.url)
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => setSpec(json))
      .catch(e => setError(`Không tải được spec từ ${src.name}: ${e.message}`));
  }, [selectedKey, sources]);

  return (
    <>
      <Head>
        <title>DocGO - API Gateway BFF Documentation</title>
        <meta name="description" content="Swagger/OpenAPI documentation cho API Gateway BFF" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="swagger-container">
        <div className="swagger-header">
          <h1>🚀 DocGO - API Gateway BFF Documentation</h1>
          <p>Swagger/OpenAPI documentation cho API Gateway Backend for Frontend</p>
          
          <div style={{ marginTop: 20 }}>
            <label htmlFor="spec-select" style={{ fontWeight: 600, marginRight: 8 }}>Chọn service:</label>
            <select
              id="spec-select"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6 }}
            >
              {sources.map(s => (
                <option key={s.key} value={s.key}>{s.name}</option>
              ))}
            </select>
            {error && (
              <div style={{ marginTop: 10, color: '#ffdddd', fontWeight: 600 }}>{error}</div>
            )}
          </div>
          
          {/* Microservices Overview */}
          <div className="microservices-overview">
            <h3>📋 Tổng quan 7 Microservices đang chạy</h3>
            
            {/* Technology Summary */}
            <div className="tech-summary">
              <div className="tech-card">
                <div className="tech-icon">☕</div>
                <div className="tech-info">
                  <h4>Spring Boot (Java)</h4>
                  <span className="tech-count">2 services</span>
                </div>
              </div>
              <div className="tech-card">
                <div className="tech-icon">🐍</div>
                <div className="tech-info">
                  <h4>FastAPI (Python)</h4>
                  <span className="tech-count">4 services</span>
                </div>
              </div>
              <div className="tech-card">
                <div className="tech-icon">⚛️</div>
                <div className="tech-info">
                  <h4>Next.js (Node.js)</h4>
                  <span className="tech-count">1 service</span>
                </div>
              </div>
            </div>
            
            {/* Detailed Services List */}
            <div className="services-detail">
              <div className="service-category">
                <h4>🔐 Authentication & Identity Services</h4>
                <div className="service-list">
                  <div className="service-item">
                    <span className="service-icon">🔐</span>
                    <div className="service-info">
                      <h5>Authentication Identity Service</h5>
                      <p>Port 8001 - Spring Boot</p>
                      <p>Xác thực, phân quyền, JWT token management</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>👥 User & Profile Management</h4>
                <div className="service-list">
                  <div className="service-item">
                    <span className="service-icon">👥</span>
                    <div className="service-info">
                      <h5>User Management Service</h5>
                      <p>Port 8002 - FastAPI</p>
                      <p>Quản lý user, profile, approvals, permissions</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>📋 Contract & Document Management</h4>
                <div className="service-list">
                  <div className="service-item">
                    <span className="service-icon">📋</span>
                    <div className="service-info">
                      <h5>Contract Management Service</h5>
                      <p>Port 8003 - Spring Boot</p>
                      <p>Quản lý hợp đồng, workflow, approval processes</p>
                    </div>
                  </div>

                  <div className="service-item">
                    <span className="service-icon">📁</span>
                    <div className="service-info">
                      <h5>General File Management</h5>
                      <p>Port 8018 - FastAPI</p>
                      <p>Quản lý file tổng quát, metadata, organization</p>
                    </div>
                  </div>
                </div>
              </div>
              

              

              

              
              <div className="service-category">
                <h4>🔍 Document Processing & AI</h4>
                <div className="service-list">
                  <div className="service-item">
                    <span className="service-icon">🤖</span>
                    <div className="service-info">
                      <h5>AI Processing Service</h5>
                      <p>Port 8017 - FastAPI</p>
                      <p>Xử lý AI, machine learning, NLP, automation</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>💾 Storage & Infrastructure</h4>
                <div className="service-list">
                  <div className="service-item">
                    <span className="service-icon">💾</span>
                    <div className="service-info">
                      <h5>File Storage Asset</h5>
                      <p>Port 8012 - FastAPI</p>
                      <p>Lưu trữ file, quản lý tài sản, malware scan</p>
                    </div>
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
        
        <SwaggerUI 
          spec={spec || { openapi: '3.0.3', info: { title: 'Loading...', version: '1.0.0' } }}
          docExpansion="list"
          defaultModelsExpandDepth={2}
          defaultModelExpandDepth={2}
          displayOperationId={false}
          displayRequestDuration={true}
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
          tryItOutEnabled={true}
          requestInterceptor={(request: any) => {
            // Thêm headers cần thiết
            request.headers['Content-Type'] = 'application/json';
            return request;
          }}
          responseInterceptor={(response: any) => {
            // Log response để debug
            console.log('Swagger Response:', response);
            return response;
          }}
        />
      </div>
      
      <style jsx>{`
        .swagger-container {
          padding: 20px;
          max-width: 100%;
        }
        
        .swagger-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .swagger-header h1 {
          margin: 0 0 15px 0;
          font-size: 2.5rem;
          font-weight: bold;
        }
        
        .swagger-header p {
          margin: 0 0 25px 0;
          font-size: 1.2rem;
          opacity: 0.9;
        }
        
        .microservices-overview {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 25px;
          margin-top: 20px;
        }
        
        .microservices-overview h3 {
          margin: 0 0 25px 0;
          font-size: 1.8rem;
          color: #fff;
          text-align: center;
        }
        
        .tech-summary {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .tech-card {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 20px;
          min-width: 180px;
          transition: all 0.3s ease;
        }
        
        .tech-card:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
        
        .tech-icon {
          font-size: 2.5rem;
          margin-right: 15px;
        }
        
        .tech-info h4 {
          margin: 0 0 5px 0;
          font-size: 1.1rem;
          color: #fff;
        }
        
        .tech-count {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .services-detail {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
          text-align: left;
        }
        
        .service-category {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid rgba(255,255,255,0.3);
        }
        
        .service-category h4 {
          margin: 0 0 15px 0;
          font-size: 1.2rem;
          color: #fff;
          border-bottom: 2px solid rgba(255,255,255,0.3);
          padding-bottom: 8px;
        }
        
        .service-list {
          space-y: 15px;
        }
        
        .service-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 15px;
          padding: 15px;
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .service-item:hover {
          background: rgba(255,255,255,0.12);
          transform: translateX(5px);
        }
        
        .service-icon {
          font-size: 1.5rem;
          margin-right: 12px;
          margin-top: 2px;
        }
        
        .service-info h5 {
          margin: 0 0 5px 0;
          font-size: 1rem;
          color: #fff;
          font-weight: 600;
        }
        
        .service-info p {
          margin: 0 0 3px 0;
          font-size: 0.85rem;
          opacity: 0.8;
          line-height: 1.4;
        }
        
        .service-info p:first-of-type {
          font-weight: 500;
          color: #fff;
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .swagger-header h1 {
            font-size: 2rem;
          }
          
          .swagger-header p {
            font-size: 1rem;
          }
          
          .tech-summary {
            gap: 15px;
          }
          
          .tech-card {
            min-width: 150px;
            padding: 15px;
          }
          
          .services-detail {
            grid-template-columns: 1fr;
          }
          
          .service-category {
            padding: 15px;
          }
        }
      `}</style>
    </>
  );
}
