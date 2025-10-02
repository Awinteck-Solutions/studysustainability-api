export interface EmailRecipient {
  email: string;
  name?: string;
  status?: "PENDING" | "SENT" | "DELIVERED" | "OPENED" | "CLICKED" | "BOUNCED" | "FAILED";
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bounceReason?: string;
  errorMessage?: string;
}

export interface CreateEmailerDto {
  campaignName: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
  recipientType?: "INDIVIDUAL" | "LIST" | "SEGMENT" | "ALL_SUBSCRIBERS";
  recipients: EmailRecipient[];
  scheduleType?: "IMMEDIATE" | "SCHEDULED" | "RECURRING";
  scheduledAt?: Date;
  recurringPattern?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  recurringEndDate?: Date;
  trackOpens?: boolean;
  trackClicks?: boolean;
  trackUnsubscribes?: boolean;
  emailService?: "SENDGRID" | "MAILGUN" | "SES" | "MAILCHIMP" | "CONSTANT_CONTACT";
  tags?: string[];
  description?: string;
  notes?: string;
}

export interface UpdateEmailerDto {
  campaignName?: string;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  recipientType?: "INDIVIDUAL" | "LIST" | "SEGMENT" | "ALL_SUBSCRIBERS";
  recipients?: EmailRecipient[];
  scheduleType?: "IMMEDIATE" | "SCHEDULED" | "RECURRING";
  scheduledAt?: Date;
  recurringPattern?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  recurringEndDate?: Date;
  trackOpens?: boolean;
  trackClicks?: boolean;
  trackUnsubscribes?: boolean;
  emailService?: "SENDGRID" | "MAILGUN" | "SES" | "MAILCHIMP" | "CONSTANT_CONTACT";
  tags?: string[];
  description?: string;
  notes?: string;
  status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "PAUSED" | "CANCELLED" | "FAILED";
}

export interface EmailerResponseDto {
  _id: string;
  resourceId: string;
  author?: string;
  campaignName: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
  recipientType: "INDIVIDUAL" | "LIST" | "SEGMENT" | "ALL_SUBSCRIBERS";
  recipients: EmailRecipient[];
  scheduleType: "IMMEDIATE" | "SCHEDULED" | "RECURRING";
  scheduledAt?: Date;
  recurringPattern?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  recurringEndDate?: Date;
  trackOpens: boolean;
  trackClicks: boolean;
  trackUnsubscribes: boolean;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  totalUnsubscribed: number;
  emailService: "SENDGRID" | "MAILGUN" | "SES" | "MAILCHIMP" | "CONSTANT_CONTACT";
  serviceCampaignId?: string;
  serviceMessageId?: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "PAUSED" | "CANCELLED" | "FAILED";
  tags: string[];
  description?: string;
  notes?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendEmailDto {
  campaignId: string;
  recipients?: EmailRecipient[];
  scheduleType?: "IMMEDIATE" | "SCHEDULED";
  scheduledAt?: Date;
}

export interface EmailStatsDto {
  campaignId: string;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

export interface BulkEmailDto {
  emails: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
}
