import { Document } from "mongoose";

// User Management Response DTOs
export interface UserManagementResponse {
  status: boolean;
  message: string;
  response?: any;
  error?: string;
}

// User Statistics DTO
export interface UserStatistics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    recentRegistrations: number;
  };
  breakdown: {
    byRole: Array<{ _id: string; count: number }>;
    byStatus: Array<{ _id: string; count: number }>;
    monthlyRegistrations: Array<{ _id: { year: number; month: number }; count: number }>;
  };
}

// Pagination DTO
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// User List Response DTO
export interface UserListResponse {
  users: any[];
  pagination: PaginationInfo;
}

// Search Response DTO
export interface SearchResponse {
  users: any[];
  pagination: PaginationInfo;
  searchQuery: string;
}

// Query Parameters DTO
export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  q?: string;
}

// Update User DTO
export interface UpdateUserDto {
  firstname?: string;
  lastname?: string;
  email?: string;
  countryOfOrigin?: string;
  countryOfResidence?: string;
  cityOfResidence?: string;
  gender?: string;
  ageRange?: string;
  levelOfStudy?: string;
  academicProgramInterest?: string;
  graduateRecruitmentInterest?: string;
  qualificationType?: string;
  organisationName?: string;
  fullname?: string;
  website?: string;
  extraEmail?: string;
  accreditation?: string;
  eventTypes?: string[];
  status?: string;
}
