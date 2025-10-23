import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Project {
  id: string;
  name: string;
  description?: string;
  project_type?: string;
  price_min?: number;
  price_max?: number;
  delivery_date?: string;
  dynamic_data?: any;
  developer?: {
    name: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  area?: {
    name: string;
    city: string;
  };
  images?: string[];
}

interface Unit {
  id: string;
  unit_type: string;
  area_sqm: number | null;
  bedrooms: number;
  bathrooms: number;
  price: number;
  down_payment: number | null;
  monthly_installment: number | null;
  quarterly_installment: number | null;
  semi_annual_installment: number | null;
  annual_installment: number | null;
  installment_years: number;
  floor_number: number | null;
  unit_number: string | null;
  status: string;
  dynamic_data?: any;
  projects: {
    name: string;
    developers: {
      name: string;
      phone?: string;
      email?: string;
    };
    area: {
      name: string;
      city: string;
    };
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return 'متاحة';
    case 'reserved':
      return 'محجوزة';
    case 'sold':
      return 'مباعة';
    default:
      return status;
  }
};

const generateProjectHTML = (project: Project): string => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مشروع ${project.name}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8fafc;
                direction: rtl;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #3B619F 0%, #2563eb 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .header .subtitle {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .content {
                padding: 30px;
            }
            
            .section {
                margin-bottom: 30px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 12px;
                border-right: 4px solid #3B619F;
            }
            
            .section-title {
                font-size: 1.5em;
                color: #3B619F;
                margin-bottom: 15px;
                font-weight: bold;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .info-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .info-label {
                font-weight: bold;
                color: #6b7280;
                font-size: 0.9em;
                margin-bottom: 5px;
            }
            
            .info-value {
                color: #1f2937;
                font-size: 1.1em;
            }
            
            .price-section {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 2px solid #bbf7d0;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 20px 0;
            }
            
            .price-title {
                font-size: 1.3em;
                color: #059669;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .price-value {
                font-size: 2em;
                color: #059669;
                font-weight: bold;
            }
            
            .dynamic-fields {
                display: grid;
                gap: 10px;
            }
            
            .dynamic-field {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .dynamic-field-label {
                font-weight: 600;
                color: #6b7280;
            }
            
            .dynamic-field-value {
                color: #1f2937;
                font-weight: 500;
            }
            
            .description {
                background: white;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                line-height: 1.8;
                font-size: 1.1em;
            }
            
            .contact-info {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 2px solid #bfdbfe;
                border-radius: 12px;
                padding: 20px;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            
            .contact-icon {
                width: 20px;
                height: 20px;
                margin-left: 10px;
                color: #3B619F;
            }
            
            .footer {
                background: #1f2937;
                color: white;
                text-align: center;
                padding: 20px;
                font-size: 0.9em;
            }
            
            @media print {
                body { background: white; }
                .container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${project.name}</h1>
                <div class="subtitle">تفاصيل المشروع العقاري</div>
            </div>
            
            <div class="content">
                <!-- معلومات أساسية -->
                <div class="section">
                    <h2 class="section-title">المعلومات الأساسية</h2>
                    <div class="info-grid">
                        ${project.developer ? `
                        <div class="info-item">
                            <div class="info-label">المطور</div>
                            <div class="info-value">${project.developer.name}</div>
                        </div>
                        ` : ''}
                        
                        ${project.area ? `
                        <div class="info-item">
                            <div class="info-label">الموقع</div>
                            <div class="info-value">${project.area.name}, ${project.area.city}</div>
                        </div>
                        ` : ''}
                        
                        ${project.project_type ? `
                        <div class="info-item">
                            <div class="info-label">نوع المشروع</div>
                            <div class="info-value">${project.project_type}</div>
                        </div>
                        ` : ''}
                        
                        ${project.delivery_date ? `
                        <div class="info-item">
                            <div class="info-label">تاريخ التسليم</div>
                            <div class="info-value">${project.delivery_date}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- الأسعار -->
                ${(project.price_min || project.price_max) ? `
                <div class="section">
                    <h2 class="section-title">نطاق الأسعار</h2>
                    <div class="price-section">
                        <div class="price-title">الأسعار تبدأ من</div>
                        <div class="price-value">
                            ${project.price_min && project.price_max
                              ? `${formatPrice(project.price_min)} - ${formatPrice(project.price_max)} ج.م`
                              : formatPrice(project.price_min || project.price_max || 0) + ' ج.م'}
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- الحقول الديناميكية -->
                ${project.dynamic_data && Object.keys(project.dynamic_data).length > 0 ? `
                <div class="section">
                    <h2 class="section-title">تفاصيل إضافية</h2>
                    <div class="dynamic-fields">
                        ${Object.entries(project.dynamic_data).map(([key, value]) => `
                        <div class="dynamic-field">
                            <span class="dynamic-field-label">${key}</span>
                            <span class="dynamic-field-value">
                                ${typeof value === 'boolean' ? (value ? 'نعم' : 'لا') : String(value)}
                            </span>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- الوصف -->
                ${project.description ? `
                <div class="section">
                    <h2 class="section-title">وصف المشروع</h2>
                    <div class="description">
                        ${project.description}
                    </div>
                </div>
                ` : ''}
                
                <!-- معلومات التواصل -->
                ${project.developer ? `
                <div class="section">
                    <h2 class="section-title">معلومات التواصل</h2>
                    <div class="contact-info">
                        ${project.developer.phone ? `
                        <div class="contact-item">
                            📞 ${project.developer.phone}
                        </div>
                        ` : ''}
                        
                        ${project.developer.email ? `
                        <div class="contact-item">
                            ✉️ ${project.developer.email}
                        </div>
                        ` : ''}
                        
                        ${project.developer.website ? `
                        <div class="contact-item">
                            🌐 ${project.developer.website}
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                تم إنشاء هذا التقرير في ${new Date().toLocaleDateString('ar-EG')}
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateUnitHTML = (unit: Unit): string => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>وحدة ${unit.unit_type} - ${unit.projects.name}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8fafc;
                direction: rtl;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #3B619F 0%, #2563eb 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .header .subtitle {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                margin-top: 10px;
                ${unit.status === 'available' ? 'background: #10B981; color: white;' :
                  unit.status === 'reserved' ? 'background: #F59E0B; color: white;' :
                  'background: #EF4444; color: white;'}
            }
            
            .content {
                padding: 30px;
            }
            
            .section {
                margin-bottom: 30px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 12px;
                border-right: 4px solid #3B619F;
            }
            
            .section-title {
                font-size: 1.5em;
                color: #3B619F;
                margin-bottom: 15px;
                font-weight: bold;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
            }
            
            .specs-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .spec-item {
                background: white;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 2px solid #e5e7eb;
                transition: all 0.3s ease;
            }
            
            .spec-icon {
                font-size: 2em;
                margin-bottom: 10px;
            }
            
            .spec-value {
                font-size: 1.8em;
                font-weight: bold;
                color: #3B619F;
                margin-bottom: 5px;
            }
            
            .spec-label {
                color: #6b7280;
                font-weight: 600;
            }
            
            .price-section {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 2px solid #bbf7d0;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 20px 0;
            }
            
            .main-price {
                font-size: 2.5em;
                color: #059669;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .price-per-meter {
                font-size: 1.1em;
                color: #6b7280;
                margin-bottom: 20px;
            }
            
            .payment-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .payment-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #bbf7d0;
                text-align: center;
            }
            
            .payment-label {
                font-size: 0.9em;
                color: #6b7280;
                margin-bottom: 5px;
            }
            
            .payment-value {
                font-size: 1.2em;
                font-weight: bold;
                color: #059669;
            }
            
            .installment-section {
                background: white;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
            }
            
            .installment-title {
                font-size: 1.2em;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .installment-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .installment-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: #f8fafc;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
            }
            
            .installment-period {
                font-weight: 600;
                color: #6b7280;
            }
            
            .installment-amount {
                font-weight: bold;
                color: #1f2937;
            }
            
            .dynamic-fields {
                display: grid;
                gap: 10px;
            }
            
            .dynamic-field {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .dynamic-field-label {
                font-weight: 600;
                color: #6b7280;
            }
            
            .dynamic-field-value {
                color: #1f2937;
                font-weight: 500;
            }
            
            .project-info {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 2px solid #bfdbfe;
                border-radius: 12px;
                padding: 20px;
            }
            
            .project-name {
                font-size: 1.3em;
                font-weight: bold;
                color: #3B619F;
                margin-bottom: 10px;
            }
            
            .project-details {
                display: grid;
                gap: 10px;
            }
            
            .project-detail {
                display: flex;
                align-items: center;
                font-size: 1.1em;
            }
            
            .footer {
                background: #1f2937;
                color: white;
                text-align: center;
                padding: 20px;
                font-size: 0.9em;
            }
            
            @media print {
                body { background: white; }
                .container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${unit.unit_type}</h1>
                <div class="subtitle">${unit.projects.name}</div>
                <div class="status-badge">${getStatusText(unit.status)}</div>
            </div>
            
            <div class="content">
                <!-- مواصفات الوحدة -->
                <div class="section">
                    <h2 class="section-title">مواصفات الوحدة</h2>
                    <div class="specs-grid">
                        ${unit.area_sqm ? `
                        <div class="spec-item">
                            <div class="spec-icon">📐</div>
                            <div class="spec-value">${unit.area_sqm}</div>
                            <div class="spec-label">متر مربع</div>
                        </div>
                        ` : ''}
                        
                        <div class="spec-item">
                            <div class="spec-icon">🛏️</div>
                            <div class="spec-value">${unit.bedrooms}</div>
                            <div class="spec-label">غرف نوم</div>
                        </div>
                        
                        <div class="spec-item">
                            <div class="spec-icon">🚿</div>
                            <div class="spec-value">${unit.bathrooms}</div>
                            <div class="spec-label">حمام</div>
                        </div>
                        
                        ${unit.floor_number ? `
                        <div class="spec-item">
                            <div class="spec-icon">🏢</div>
                            <div class="spec-value">${unit.floor_number}</div>
                            <div class="spec-label">الطابق</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${unit.unit_number ? `
                    <div style="text-align: center; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <strong>رقم الوحدة: ${unit.unit_number}</strong>
                    </div>
                    ` : ''}
                </div>
                
                <!-- تفاصيل السعر -->
                <div class="section">
                    <h2 class="section-title">تفاصيل السعر</h2>
                    <div class="price-section">
                        <div class="main-price">${formatPrice(unit.price)} ج.م</div>
                        ${unit.area_sqm ? `
                        <div class="price-per-meter">
                            ${formatPrice(Math.round(unit.price / unit.area_sqm))} ج.م لكل متر مربع
                        </div>
                        ` : ''}
                        
                        <div class="payment-info">
                            ${unit.down_payment ? `
                            <div class="payment-item">
                                <div class="payment-label">المقدم</div>
                                <div class="payment-value">${formatPrice(unit.down_payment)} ج.م</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${unit.monthly_installment ? `
                    <div class="installment-section">
                        <div class="installment-title">خيارات التقسيط (${unit.installment_years} سنوات)</div>
                        <div class="installment-grid">
                            <div class="installment-item">
                                <span class="installment-period">شهري</span>
                                <span class="installment-amount">${formatPrice(unit.monthly_installment)} ج.م</span>
                            </div>
                            
                            ${unit.quarterly_installment ? `
                            <div class="installment-item">
                                <span class="installment-period">ربع سنوي</span>
                                <span class="installment-amount">${formatPrice(unit.quarterly_installment)} ج.م</span>
                            </div>
                            ` : ''}
                            
                            ${unit.semi_annual_installment ? `
                            <div class="installment-item">
                                <span class="installment-period">نصف سنوي</span>
                                <span class="installment-amount">${formatPrice(unit.semi_annual_installment)} ج.م</span>
                            </div>
                            ` : ''}
                            
                            ${unit.annual_installment ? `
                            <div class="installment-item">
                                <span class="installment-period">سنوي</span>
                                <span class="installment-amount">${formatPrice(unit.annual_installment)} ج.م</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <!-- الحقول الديناميكية -->
                ${unit.dynamic_data && Object.keys(unit.dynamic_data).length > 0 ? `
                <div class="section">
                    <h2 class="section-title">تفاصيل إضافية</h2>
                    <div class="dynamic-fields">
                        ${Object.entries(unit.dynamic_data).map(([key, value]) => `
                        <div class="dynamic-field">
                            <span class="dynamic-field-label">${key}</span>
                            <span class="dynamic-field-value">
                                ${typeof value === 'boolean' ? (value ? 'نعم' : 'لا') : String(value)}
                            </span>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- معلومات المشروع والمطور -->
                <div class="section">
                    <h2 class="section-title">معلومات المشروع</h2>
                    <div class="project-info">
                        <div class="project-name">${unit.projects.name}</div>
                        <div class="project-details">
                            <div class="project-detail">
                                🏗️ المطور: ${unit.projects.developers.name}
                            </div>
                            <div class="project-detail">
                                📍 الموقع: ${unit.projects.area.name}, ${unit.projects.area.city}
                            </div>
                            ${unit.projects.developers.phone ? `
                            <div class="project-detail">
                                📞 الهاتف: ${unit.projects.developers.phone}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                تم إنشاء هذا التقرير في ${new Date().toLocaleDateString('ar-EG')}
            </div>
        </div>
    </body>
    </html>
  `;
};

export const generateProjectPDF = async (project: Project): Promise<string> => {
  try {
    const html = generateProjectHTML(project);
    
    const { uri } = await Print.printToFileAsync({
      html,
      width: 595,
      height: 842,
      margins: {
        left: 20,
        top: 20,
        right: 20,
        bottom: 20,
      },
    });
    
    return uri;
  } catch (error) {
    console.error('Error generating project PDF:', error);
    throw error;
  }
};

export const generateUnitPDF = async (unit: Unit): Promise<string> => {
  try {
    const html = generateUnitHTML(unit);
    
    const { uri } = await Print.printToFileAsync({
      html,
      width: 595,
      height: 842,
      margins: {
        left: 20,
        top: 20,
        right: 20,
        bottom: 20,
      },
    });
    
    return uri;
  } catch (error) {
    console.error('Error generating unit PDF:', error);
    throw error;
  }
};

export const sharePDF = async (filePath: string, title: string): Promise<void> => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: title,
      });
    } else {
      console.log(`PDF generated at: ${filePath}`);
      console.log(`Title: ${title}`);
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
};