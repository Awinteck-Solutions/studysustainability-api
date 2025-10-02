export interface OverallStatsDto {
  totalUsers: number;
  adsCampaigns: number;
  adsRequests: number;
  websiteFeedbacks: number;
  pdfDownloads: number;
  emailCampaigns: number;
  emailRequests: number;
}

export interface UserRegistrationDataDto {
  date: string;
  students: number;
  universities: number;
  providers: number;
  eventOrganisers: number;
  total: number;
}

export interface AdsCampaignDataDto {
  date: string;
  count: number;
  active: number;
  paused: number;
  completed: number;
}

export interface AdsRequestDataDto {
  date: string;
  count: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface WebsiteFeedbackDataDto {
  date: string;
  count: number;
  averageRating: number;
  positive: number;
  negative: number;
}

export interface PdfDownloadDataDto {
  date: string;
  count: number;
  uniqueDownloads: number;
  totalDownloads: number;
}

export interface EmailCampaignDataDto {
  date: string;
  count: number;
  sent: number;
  scheduled: number;
  draft: number;
}

export interface EmailRequestDataDto {
  date: string;
  count: number;
  pending: number;
  processed: number;
}

export interface DashboardStatisticsResponseDto {
  status: "success" | "error";
  message: string;
  response: OverallStatsDto;
}

export interface UserRegistrationsResponseDto {
  status: "success" | "error";
  message: string;
  response: UserRegistrationDataDto[];
}

export interface IndividualMetricResponseDto {
  status: "success" | "error";
  message: string;
  response: AdsCampaignDataDto[] | AdsRequestDataDto[] | WebsiteFeedbackDataDto[] | PdfDownloadDataDto[] | EmailCampaignDataDto[] | EmailRequestDataDto[];
}

export interface DashboardQueryDto {
  period?: "7d" | "30d" | "90d" | "1y" | "custom";
  startDate?: string; // YYYY-MM-DD format
  endDate?: string;   // YYYY-MM-DD format
}

export interface ErrorResponseDto {
  status: "error";
  message: string;
  error_code?: string;
  details?: string;
}

export interface CacheInfoDto {
  lastUpdated: Date;
  cacheExpiry?: Date;
  isCached: boolean;
}

export interface DashboardAnalyticsDto {
  _id: string;
  resourceId: string;
  author?: string;
  analyticsType: "OVERALL_STATS" | "USER_REGISTRATIONS" | "ADS_CAMPAIGNS" | "ADS_REQUESTS" | "WEBSITE_FEEDBACKS" | "PDF_DOWNLOADS" | "EMAIL_CAMPAIGNS" | "EMAIL_REQUESTS";
  period: "7d" | "30d" | "90d" | "1y" | "custom";
  startDate?: Date;
  endDate?: Date;
  overallStats?: OverallStatsDto;
  userRegistrations?: UserRegistrationDataDto[];
  individualMetrics?: {
    adsCampaigns?: AdsCampaignDataDto[];
    adsRequests?: AdsRequestDataDto[];
    websiteFeedbacks?: WebsiteFeedbackDataDto[];
    pdfDownloads?: PdfDownloadDataDto[];
    emailCampaigns?: EmailCampaignDataDto[];
    emailRequests?: EmailRequestDataDto[];
  };
  lastUpdated: Date;
  cacheExpiry?: Date;
  status: "ACTIVE" | "INACTIVE" | "REJECTED" | "DELETED";
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}
