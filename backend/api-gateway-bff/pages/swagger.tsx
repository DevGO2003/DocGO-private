import React from 'react';
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
        </div>
        
        <SwaggerUI 
          url="/api/swagger.json"
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
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
        }
        
        .swagger-header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5rem;
          font-weight: bold;
        }
        
        .swagger-header p {
          margin: 0;
          font-size: 1.2rem;
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .swagger-header h1 {
            font-size: 2rem;
          }
          
          .swagger-header p {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
