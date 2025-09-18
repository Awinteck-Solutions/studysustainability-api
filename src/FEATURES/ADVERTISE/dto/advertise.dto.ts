export interface CreateAdvertiseDto {
  title: string;
  description?: string;
  category: string;
  advertType?: 'landscape' | 'portrait' | 'square' | 'strip';
  placement?: 'homepage' | 'sidebar' | 'footer' | 'header' | 'content' | 'popup' | 'banner' | 'newsletter' | 'social' | 'mobile';
  targetAudience?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  externalLink?: string;
  metadata?: any;
}

export interface UpdateAdvertiseDto {
  title?: string;
  description?: string;
  category?: string;
  advertType?: 'landscape' | 'portrait' | 'square' | 'strip';
  placement?: 'homepage' | 'sidebar' | 'footer' | 'header' | 'content' | 'popup' | 'banner' | 'newsletter' | 'social' | 'mobile';
  targetAudience?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  externalLink?: string;
  metadata?: any;
}

export interface AdvertiseResponseDto {
  _id: string;
  resourceId: string;
  author?: string;
  title: string;
  description?: string;
  category: string;
  advertType: 'landscape' | 'portrait' | 'square' | 'strip';
  placement: 'homepage' | 'sidebar' | 'footer' | 'header' | 'content' | 'popup' | 'banner' | 'newsletter' | 'social' | 'mobile';
  targetAudience?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  displayImage?: string;
  pdfFile?: string;
  externalLink?: string;
  metadata?: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
