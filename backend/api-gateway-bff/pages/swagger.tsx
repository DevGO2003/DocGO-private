import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Dynamic import để tránh SSR issues với Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div>Loading Swagger UI...</div>
});

// Import Swagger CSS cho phiên bản mới
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerPage() {
  const router = useRouter();
  
  const sources = useMemo(() => ([
    { key: 'gateway', name: 'API Gateway BFF', url: '/api/swagger.json' },
    { key: 'authentication', name: 'Authentication Service', url: '/api/docs/authentication' },
    { key: 'contract-management', name: 'Contract Management', url: '/api/docs/contract-management' },
    { key: 'user-management', name: 'User Management', url: '/api/docs/user-management' },
    { key: 'versioning-document-history', name: 'Versioning Document History', url: '/api/docs/versioning-document-history' },
    { key: 'commenting-collaboration', name: 'Commenting Collaboration', url: '/api/docs/commenting-collaboration' },
    { key: 'approval-workflow', name: 'Approval Workflow', url: '/api/docs/approval-workflow' },
    { key: 'reminder-scheduler', name: 'Reminder Scheduler', url: '/api/docs/reminder-scheduler' },
    { key: 'esignature-integration', name: 'E-Signature Integration', url: '/api/docs/esignature-integration' },
    { key: 'notification', name: 'Notification Service', url: '/api/docs/notification' },
    { key: 'reporting-analytics', name: 'Reporting Analytics', url: '/api/docs/reporting-analytics' },
    { key: 'ocr-document-extraction', name: 'OCR Document Extraction', url: '/api/docs/ocr-document-extraction' },
    { key: 'file-storage', name: 'File Storage Asset', url: '/api/docs/file-storage' },
    { key: 'audit-activity-log', name: 'Audit Activity Log', url: '/api/docs/audit-activity-log' },
    { key: 'integration-connectors', name: 'Integration Connectors', url: '/api/docs/integration-connectors' },
    { key: 'batch-etl', name: 'Batch ETL', url: '/api/docs/batch-etl' },
    { key: 'health-monitoring-agent', name: 'Health Monitoring Agent', url: '/api/docs/health-monitoring-agent' },
    { key: 'ai-processing', name: 'AI Processing', url: '/api/docs/ai-processing' },
    { key: 'general-file-management', name: 'General File Management', url: '/api/docs/general-file-management' }
  ]), []);

  // Mapping giữa tên dịch vụ và thông tin kết nối
  const serviceConnectionMapping = useMemo(() => ({
    'Authentication Identity Service': {
      port: 8001,
      container: 'authentication-identity-service',
      description: 'Xác thực, phân quyền, JWT token management'
    },
    'User Management Service': {
      port: 8002,
      container: 'user-management-service',
      description: 'Quản lý user, profile, approvals, permissions'
    },
    'Contract Management Service': {
      port: 8003,
      container: 'contract-management-service',
      description: 'Quản lý hợp đồng, workflow, approval processes'
    },
    'Versioning Document History': {
      port: 8004,
      container: 'versioning-document-history-service',
      description: 'Quản lý phiên bản tài liệu, lịch sử thay đổi'
    },
    'General File Management': {
      port: 8018,
      container: 'general-file-management-service',
      description: 'Quản lý file tổng quát, metadata, organization'
    },
    'Commenting Collaboration': {
      port: 8005,
      container: 'commenting-collaboration-service',
      description: 'Bình luận, cộng tác, thảo luận, teamwork'
    },
    'Notification Service': {
      port: 8009,
      container: 'notification-service',
      description: 'Email, SMS, push notifications, alerts'
    },
    'Approval Workflow': {
      port: 8006,
      container: 'approval-workflow-service',
      description: 'Quy trình phê duyệt, workflow management'
    },
    'E-Signature Integration': {
      port: 8008,
      container: 'esignature-integration-service',
      description: 'Chữ ký điện tử, digital signature, verification'
    },
    'Reminder Scheduler': {
      port: 8007,
      container: 'reminder-scheduler-service',
      description: 'Lập lịch nhắc nhở, notification scheduling'
    },
    'Reporting Analytics': {
      port: 8010,
      container: 'reporting-analytics-service',
      description: 'Báo cáo, phân tích dữ liệu, dashboard, insights'
    },
    'OCR Document Extraction': {
      port: 8011,
      container: 'ocr-document-extraction-service',
      description: 'OCR, trích xuất text từ hình ảnh/tài liệu'
    },
    'AI Processing Service': {
      port: 8017,
      container: 'ai-processing-service',
      description: 'Xử lý AI, machine learning, NLP, automation'
    },
    'File Storage Asset': {
      port: 8012,
      container: 'file-storage-asset-service',
      description: 'Lưu trữ file, quản lý tài sản, malware scan'
    },
    'Audit Activity Log': {
      port: 8013,
      container: 'audit-activity-log-service',
      description: 'Ghi log hoạt động, audit trail, compliance'
    },
    'Health Monitoring Agent': {
      port: 8016,
      container: 'health-monitoring-agent',
      description: 'Giám sát sức khỏe hệ thống, metrics collection'
    },
    'Integration Connectors': {
      port: 8014,
      container: 'integration-connectors-service',
      description: 'Kết nối hệ thống bên ngoài, API integration'
    },
    'Batch ETL Service': {
      port: 8015,
      container: 'batch-etl-service',
      description: 'Xử lý dữ liệu hàng loạt, ETL pipeline, data transformation'
    }
  }), []);

  const [selectedKey, setSelectedKey] = useState<string>('gateway');
  const [spec, setSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Hàm xử lý click vào service item
  const handleServiceClick = (serviceName: string) => {
    const serviceInfo = serviceConnectionMapping[serviceName as keyof typeof serviceConnectionMapping];
    if (serviceInfo) {
      // Kiểm tra xem có đang chạy trên Docker không
      const isDocker = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      let targetUrl: string;
      
      if (isDocker) {
        // Nếu chạy trên Docker, sử dụng tên container
        targetUrl = `http://${serviceInfo.container}/docs`;
      } else {
        // Nếu chạy trên localhost, sử dụng port
        targetUrl = `http://localhost:${serviceInfo.port}/docs`;
      }
      
      // Mở trong tab mới
      window.open(targetUrl, '_blank');
    }
  };

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
            <h3>📋 Tổng quan 19 Microservices</h3>
            <p style={{ textAlign: 'center', marginBottom: 20, opacity: 0.9 }}>
              💡 <strong>Click vào các box dịch vụ để mở tài liệu API trực tiếp từ service!</strong>
            </p>
            <p style={{ textAlign: 'center', marginBottom: 20, opacity: 0.8, fontSize: '0.9rem' }}>
              🚀 <strong>Localhost:</strong> http://localhost:8001/docs | <strong>Docker:</strong> http://container-name/docs
            </p>
            
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
                  <span className="tech-count">16 services</span>
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
                                     <div 
                     className="service-item clickable"
                     onClick={() => handleServiceClick('Authentication Identity Service')}
                     title="Click để mở http://localhost:8001/docs (Localhost) hoặc http://authentication-identity-service/docs (Docker)"
                   >
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
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('User Management Service')}
                    title="Click để mở http://localhost:8002/docs (Localhost) hoặc http://user-management-service/docs (Docker)"
                  >
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
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Contract Management Service')}
                    title="Click để mở http://localhost:8003/docs (Localhost) hoặc http://contract-management-service/docs (Docker)"
                  >
                    <span className="service-icon">📋</span>
                    <div className="service-info">
                      <h5>Contract Management Service</h5>
                      <p>Port 8003 - Spring Boot</p>
                      <p>Quản lý hợp đồng, workflow, approval processes</p>
                    </div>
                  </div>
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Versioning Document History')}
                    title="Click để mở http://localhost:8004/docs (Localhost) hoặc http://versioning-document-history-service/docs (Docker)"
                  >
                    <span className="service-icon">📚</span>
                    <div className="service-info">
                      <h5>Versioning Document History</h5>
                      <p>Port 8004 - FastAPI</p>
                      <p>Quản lý phiên bản tài liệu, lịch sử thay đổi</p>
                    </div>
                  </div>
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('General File Management')}
                    title="Click để mở http://localhost:8018/docs (Localhost) hoặc http://general-file-management-service/docs (Docker)"
                  >
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
                <h4>💬 Collaboration & Communication</h4>
                <div className="service-list">
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Commenting Collaboration')}
                    title="Click để mở http://localhost:8005/docs (Localhost) hoặc http://commenting-collaboration-service/docs (Docker)"
                  >
                    <span className="service-icon">💬</span>
                    <div className="service-info">
                      <h5>Commenting Collaboration</h5>
                      <p>Port 8005 - FastAPI</p>
                      <p>Bình luận, cộng tác, thảo luận, teamwork</p>
                    </div>
                  </div>
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Notification Service')}
                    title="Click để mở http://localhost:8009/docs (Localhost) hoặc http://notification-service/docs (Docker)"
                  >
                    <span className="service-icon">🔔</span>
                    <div className="service-info">
                      <h5>Notification Service</h5>
                      <p>Port 8009 - FastAPI</p>
                      <p>Email, SMS, push notifications, alerts</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>✅ Workflow & Approval</h4>
                <div className="service-list">
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Approval Workflow')}
                    title="Click để mở http://localhost:8006/docs (Localhost) hoặc http://approval-workflow-service/docs (Docker)"
                  >
                    <span className="service-icon">✅</span>
                    <div className="service-info">
                      <h5>Approval Workflow</h5>
                      <p>Port 8006 - FastAPI</p>
                      <p>Quy trình phê duyệt, workflow management</p>
                    </div>
                  </div>
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('E-Signature Integration')}
                    title="Click để mở http://localhost:8008/docs (Localhost) hoặc http://esignature-integration-service/docs (Docker)"
                  >
                    <span className="service-icon">✍️</span>
                    <div className="service-info">
                      <h5>E-Signature Integration</h5>
                      <p>Port 8008 - FastAPI</p>
                      <p>Chữ ký điện tử, digital signature, verification</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>⏰ Scheduling & Reminders</h4>
                <div className="service-list">
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Reminder Scheduler')}
                    title="Click để mở http://localhost:8007/docs (Localhost) hoặc http://reminder-scheduler-service/docs (Docker)"
                  >
                    <span className="service-icon">⏰</span>
                    <div className="service-info">
                      <h5>Reminder Scheduler</h5>
                      <p>Port 8007 - FastAPI</p>
                      <p>Lập lịch nhắc nhở, notification scheduling</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>📊 Analytics & Reporting</h4>
                <div className="service-list">
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Reporting Analytics')}
                    title="Click để mở http://localhost:8010/docs (Localhost) hoặc http://reporting-analytics-service/docs (Docker)"
                  >
                    <span className="service-icon">📊</span>
                    <div className="service-info">
                      <h5>Reporting Analytics</h5>
                      <p>Port 8010 - FastAPI</p>
                      <p>Báo cáo, phân tích dữ liệu, dashboard, insights</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>🔍 Document Processing & AI</h4>
                <div className="service-list">
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('OCR Document Extraction')}
                    title="Click để mở http://localhost:8011/docs (Localhost) hoặc http://ocr-document-extraction-service/docs (Docker)"
                  >
                    <span className="service-icon">🔍</span>
                    <div className="service-info">
                      <h5>OCR Document Extraction</h5>
                      <p>Port 8011 - FastAPI</p>
                      <p>OCR, trích xuất text từ hình ảnh/tài liệu</p>
                    </div>
                  </div>
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('AI Processing Service')}
                    title="Click để mở http://localhost:8017/docs (Localhost) hoặc http://ai-processing-service/docs (Docker)"
                  >
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
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('File Storage Asset')}
                    title="Click để mở http://localhost:8012/docs (Localhost) hoặc http://file-storage-asset-service/docs (Docker)"
                  >
                    <span className="service-icon">💾</span>
                    <div className="service-info">
                      <h5>File Storage Asset</h5>
                      <p>Port 8012 - FastAPI</p>
                      <p>Lưu trữ file, quản lý tài sản, malware scan</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>📝 Audit & Monitoring</h4>
                <div className="service-list">
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Audit Activity Log')}
                    title="Click để mở http://localhost:8013/docs (Localhost) hoặc http://audit-activity-log-service/docs (Docker)"
                  >
                    <span className="service-icon">📝</span>
                    <div className="service-info">
                      <h5>Audit Activity Log</h5>
                      <p>Port 8013 - FastAPI</p>
                      <p>Ghi log hoạt động, audit trail, compliance</p>
                    </div>
                  </div>
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Health Monitoring Agent')}
                    title="Click để mở http://localhost:8016/docs (Localhost) hoặc http://health-monitoring-agent/docs (Docker)"
                  >
                    <span className="service-icon">🏥</span>
                    <div className="service-info">
                      <h5>Health Monitoring Agent</h5>
                      <p>Port 8016 - FastAPI</p>
                      <p>Giám sát sức khỏe hệ thống, metrics collection</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="service-category">
                <h4>🔗 Integration & Data</h4>
                <div className="service-list">
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Integration Connectors')}
                    title="Click để mở http://localhost:8014/docs (Localhost) hoặc http://integration-connectors-service/docs (Docker)"
                  >
                    <span className="service-icon">🔗</span>
                    <div className="service-info">
                      <h5>Integration Connectors</h5>
                      <p>Port 8014 - FastAPI</p>
                      <p>Kết nối hệ thống bên ngoài, API integration</p>
                    </div>
                  </div>
                  <div 
                    className="service-item clickable"
                    onClick={() => handleServiceClick('Batch ETL Service')}
                    title="Click để mở http://localhost:8015/docs (Localhost) hoặc http://batch-etl-service/docs (Docker)"
                  >
                    <span className="service-icon">⚙️</span>
                    <div className="service-info">
                      <h5>Batch ETL Service</h5>
                      <p>Port 8015 - FastAPI</p>
                      <p>Xử lý dữ liệu hàng loạt, ETL pipeline, data transformation</p>
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
            // Không ép Content-Type; để Swagger tự đặt đúng (vd: multipart/form-data)
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
        
        .service-item.clickable {
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .service-item.clickable::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }
        
        .service-item.clickable:hover::before {
          left: 100%;
        }
        
        .service-item.clickable:hover {
          background: rgba(255,255,255,0.15);
          transform: translateX(8px) scale(1.02);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .service-item.clickable:active {
          transform: translateX(8px) scale(0.98);
        }
        
        .service-item:not(.clickable):hover {
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
