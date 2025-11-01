import React, { useEffect, useRef } from 'react';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';
import { CommonText } from '../Text/CommonText';
import { CommonIcon } from '../Icon/CommonIcon';
import anime from 'animejs';

interface HeaderPanelProps {
  title: string;
  subtitle: string; // ✅ REQUIRED - không optional
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  children?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  maxHeightDesktop?: number;
  maxHeightTablet?: number;
  maxHeightMobile?: number;
}

function HeaderPanel({
  title,
  subtitle, // ✅ Required
  breadcrumbs,
  children,
  right,
  className = '',
  maxHeightDesktop = 300,
  maxHeightTablet = 240,
  maxHeightMobile = 200,
}: HeaderPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const el = containerRef.current;
    const canvas = canvasRef.current;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (width === 0 || height === 0) return;
    canvas.width = width;
    canvas.height = height;
    const rc = createRoughCanvas(canvas);
    drawRoughRect(rc, 8, 8, width - 16, height - 16, {
      stroke: '#94a3b8',
      strokeWidth: 2,
      roughness: 1.5,
    });
  };

  useEffect(() => {
    drawCanvas();
    const t = setTimeout(drawCanvas, 100);
    
    // Animate container entry
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 400,
        easing: 'easeOutQuad',
      });
    }
    
    return () => clearTimeout(t);
  }, [title, subtitle, className]);

  return (
    <CommonFont
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        maxHeight: '300px',
        background: 'linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />

      <div className="relative z-10 px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            {/* Breadcrumbs với CommonIcon */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-sm">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <CommonIcon name="chevron-right" size={16} className="mx-1 text-gray-400" />
                      )}
                      <CommonText 
                        as="span" 
                        className={breadcrumb.current ? 'text-gray-500 font-medium' : 'text-indigo-600 hover:text-indigo-700 font-medium'}
                      >
                        {breadcrumb.href ? (
                          <a href={breadcrumb.href}>{breadcrumb.label}</a>
                        ) : (
                          breadcrumb.label
                        )}
                      </CommonText>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Title với CommonText */}
            <CommonText as="h1" className="text-2xl md:text-3xl font-extrabold mb-1">
              {title}
            </CommonText>
            
            {/* Subtitle - REQUIRED */}
            <CommonText as="p" className="text-gray-600 text-sm mb-2">
              {subtitle}
            </CommonText>

            {children && <div className="mt-2">{children}</div>}
          </div>

          {right && <div className="flex gap-2">{right}</div>}
        </div>
      </div>

      <style>{`
        @media (min-width: 1280px) {
          div[class*='rounded-2xl'] {
            max-height: ${maxHeightDesktop}px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1279px) {
          div[class*='rounded-2xl'] {
            max-height: ${maxHeightTablet}px !important;
          }
        }
        @media (max-width: 767px) {
          div[class*='rounded-2xl'] {
            max-height: ${maxHeightMobile}px !important;
          }
        }
      `}</style>
    </CommonFont>
  );
}

export default HeaderPanel;
