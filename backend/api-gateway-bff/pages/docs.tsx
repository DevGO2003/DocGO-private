import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useState } from 'react';

// Dynamic import để tránh SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

// Import CSS của Swagger UI
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState(null);

  useEffect(() => {
    // Fetch Swagger spec từ API endpoint
    fetch('/api/swagger.json')
      .then(response => response.json())
      .then(spec => setSwaggerSpec(spec))
      .catch(error => console.error('Error loading Swagger spec:', error));
  }, []);

  return (
    <div>
      <Head>
        <title>API Documentation - DocGO API Gateway BFF</title>
        <meta name="description" content="API Gateway BFF Documentation" />
      </Head>
      
      <div style={{ height: '100vh' }}>
        {swaggerSpec ? (
          <SwaggerUI 
            spec={swaggerSpec}
            docExpansion="list"
            defaultModelsExpandDepth={2}
            displayRequestDuration={true}
            requestInterceptor={(request) => {
              // Thêm headers mặc định nếu cần
              request.headers['Content-Type'] = 'application/json';
              return request;
            }}
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '18px'
          }}>
            📚 Đang tải API Documentation...
          </div>
        )}
      </div>
    </div>
  );
}
